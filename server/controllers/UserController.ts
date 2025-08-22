import argon2 from 'argon2';
import jwt from 'jsonwebtoken';

import type { Context } from 'hono';
import { deleteCookie, getCookie } from 'hono/cookie';

import { eq, and, sql, gt, or } from 'drizzle-orm';
import { users, followingLogs } from '../database/schema';

import { IsImage, FileExist } from '../utilities/FileReader';
import { OnProfileChange, OnUsernameChange, OnNameChange, OnEmailChange, OnPasswordChange, OnEnableSecurity } from './helpers/user';

import HTTPStatus from '../utilities/HTTPStatus';
import SendMail from '../utilities/MailSender';

import db from '../database/pool';
import { serverToken } from '../database/schema';

import GetToken from '../middlewares/GetToken';

export default class UserController {
    static async GetTokenBase(c: Context) {
        try {
            const user = c.get('user');
            //console.log(user);
            if (!user)
                return c.json({ error: 'Forbidden access.' }, HTTPStatus.FORBIDDEN);

            return c.json({ user: user }, HTTPStatus.OK);
        } catch (error) {
            console.error("Error during registration: ", error);
            return c.json({ message: 'Internal server error.' }, HTTPStatus.INTERNAL_SERVER_ERROR);
        }
    }

    static async Logout(c: Context) {
        try {
            if (getCookie(c, 'token') !== undefined)
                deleteCookie(c, 'token');
            if (c.get('user') !== undefined)
                c.set('user', null);

            return c.json({ message: 'Successfully logged out.' }, HTTPStatus.OK);
        } catch (error) {
            console.error("Error during registration: ", error);
            return c.json({ message: 'Internal server error.' }, HTTPStatus.INTERNAL_SERVER_ERROR);
        }
    }

    static async GetProfileDB(c: Context, self: boolean = false) {
        try {
            const user = c.get('user');
            const username: string = c.req.param('username')?.toLowerCase();

            if (!user)
                return c.json({ error: 'Forbidden access.' }, HTTPStatus.FORBIDDEN);

            const isSelf = !username || user.username === username || self;
            const targetId = isSelf ? user.username : username;

            const userDB = await db.query.users.findFirst({ where: eq(users.username, targetId) });

            if (!userDB)
                return c.json({ error: 'User not found.' }, HTTPStatus.NOT_FOUND);

            const hasAccess = user.role_id >= 2 || isSelf;

            const profileUrl: string = (FileExist(`profile-pics/${userDB.profileUrl}`) && IsImage(userDB.profileUrl))
                ? userDB.profileUrl
                : 'profile-icon-default.png';

            let packedData: any = {
                verified: userDB.verified,
                followers: userDB.followers,
                following: userDB.following,
                profileUrl
            };

            if (!isSelf) {
                Object.assign(packedData, {
                    full_name: userDB.full_name,
                    username: userDB.username,
                    role_id: userDB.role_id,
                    id: userDB.id
                });
            }

            if (hasAccess) {
                if (isSelf)
                    Object.assign(packedData, {
                        code: userDB.security_code
                    });

                Object.assign(packedData, {
                    email_verified: userDB.email_verified,
                    email: userDB.email,
                    secret: userDB.password_length
                });
            }

            const followedData = await db.query.followingLogs.findFirst({
                where: and(eq(followingLogs.followedId, userDB.id), eq(followingLogs.userId, +user.id))
            });
            const isFollowed = !!followedData;

            Object.assign(packedData, { followed: isFollowed });

            return c.json({ info: packedData }, HTTPStatus.OK);
        } catch (error) {
            console.error("Error fetching profile: ", error);
            return c.json({ message: 'Internal server error.' }, HTTPStatus.INTERNAL_SERVER_ERROR);
        }
    }

    static async UpdateUser(c: Context) {
        try {
            const user = c.get('user');
            const body: any = await c.req.json();

            const { type, id } = c.req.param();

            if (!user)
                return c.json({ error: 'Forbidden access.' }, HTTPStatus.FORBIDDEN);

            const userId = +id;

            if (user.role_id < 2 && userId !== +user.id)
                return c.json({ error: 'Forbidden access.' }, HTTPStatus.FORBIDDEN);

            switch (type.toLowerCase()) {
                case "profile": {
                    return await OnProfileChange(c, body, userId);
                }
                case "full_name": {
                    return await OnNameChange(c, body, userId);
                }
                case "username": {
                    return await OnUsernameChange(c, body, userId);
                }
                case "email": {
                    return await OnEmailChange(c, body, userId);
                }
                case "password": {
                    return await OnPasswordChange(c, body, userId);
                }
                case "security": {
                    return await OnEnableSecurity(c, body, userId);
                }
                default: {
                    return c.json({ message: "Nothing to be updated." }, HTTPStatus.OK);
                }
            }
        } catch (error) {
            console.error("Error during registration: ", error);
            return c.json({ message: 'Internal server error.' }, HTTPStatus.INTERNAL_SERVER_ERROR);
        }
    }

    static async AddFollow(c: Context) {
        try {
            const user = c.get('user');
            const id: number = +c.req.param('id');

            if (!user)
                return c.json({ message: "Access forbidden." }, HTTPStatus.FORBIDDEN);

            const userDB = await db.query.users.findFirst({ where: eq(users.id, +user.id) });
            if (!userDB)
                return c.json({ message: "Access forbidden." }, HTTPStatus.FORBIDDEN);

            const targetDB = await db.query.users.findFirst({ where: eq(users.id, id) });
            if (!targetDB || targetDB.id === userDB.id)
                return c.json({ message: "Access forbidden." }, HTTPStatus.FORBIDDEN);

            const where = and(eq(followingLogs.userId, userDB.id), eq(followingLogs.followedId, targetDB.id));
            const followLogs = await db.query.followingLogs.findFirst({ where });

            const followed: boolean = !followLogs; // check if the user hasn't followed before
            const followers: number = targetDB.followers! + (followed ? 1 : -1); // not followed before = add follower, the follow function
            const following: number = userDB.following! + (followed ? 1 : -1); // not followed before = add following count, the follow function

            await db.update(users).set({ followers }).where(eq(users.id, targetDB.id)); // update target's follower count 
            await db.update(users).set({ following }).where(eq(users.id, userDB.id)); // update follower's following count

            if (followed)
                await db.insert(followingLogs).values({ followedId: targetDB.id, userId: userDB.id });
            else
                await db.delete(followingLogs).where(where);

            return c.json({ message: followed ? "Follow added." : "Follow removed.", postData: { followers, following, followed } }, HTTPStatus.OK);
        } catch (err) {
            console.error(err);
            return c.json({ message: "Internal server error." }, HTTPStatus.INTERNAL_SERVER_ERROR);
        }
    }

    static async SendVerificationMail(c: Context) {
        try {
            const user = c.get('user');
            if (!user)
                return c.json({ error: 'Forbidden access.' }, HTTPStatus.FORBIDDEN);

            const tokenType = sql<string>`split_part(${serverToken.token}, '|', 2)`;

            const type: string = await c.req.param('type');
            const existing = await db.query.serverToken.findFirst({
                where: and(
                    eq(serverToken.userId, +user.id),
                    eq(tokenType, type),
                    gt(serverToken.expiresAt, new Date()) // not expired
                ),
            });

            const token: string = `${Math.floor(1000 + Math.random() * 9000)}`; // 4 digit

            const userDB = await db.query.users.findFirst({ where: eq(users.id, +user.id) });
            if (!userDB)
                return c.json({ error: 'User not found.' }, HTTPStatus.NOT_FOUND);

            if (existing) {
                await SendMail({ targetMail: userDB.email, subject: 'Verify Your Email', content: `Your OTP is ${existing.token.split('|')[0]}, use this to verify your email.\nThis code expires in 5 minutes.` });
                return c.json({ message: 'Mail resent.' }, HTTPStatus.OK);
            }

            // alur: generate random number -> send the mail -> return the code -> fetch in frontend?
            await db.insert(serverToken).values({
                userId: user.id,
                token: `${token}|${type}`,
                expiresAt: new Date(Date.now() + 1 * 5 * 60 * 1000)
            });

            await SendMail({ targetMail: userDB.email, subject: 'Verify Your Email', content: `Your OTP is ${token}, use this to verify your email.\nThis code expires in 5 minutes.` });
            return c.json({ message: 'Mail sent.' }, HTTPStatus.OK);
        } catch (err) {
            console.error(err);
            return c.json({ message: 'Internal server error.' }, HTTPStatus.INTERNAL_SERVER_ERROR);
        }
    }

    static async SendResetPassword(c: Context) {
        try {
            const { username } = await c.req.json();
            const verifiedUsername: string = username?.toLowerCase().trim();

            const userRecord = await db.query.users.findFirst({
                where: or(
                    eq(users.username, verifiedUsername),
                    eq(users.email, verifiedUsername)
                )
            });

            if (!userRecord || !verifiedUsername)
                return c.json({ message: 'That account does not exist. Did you typed wrong username or email?' }, HTTPStatus.UNAUTHORIZED);

            // TODO: Generate token to send it to email
            const token = jwt.sign({ id: userRecord.id }, Bun.env.JWT_SECRET!, { expiresIn: '5m' });

            await db.insert(serverToken).values({
                userId: userRecord.id,
                token: `${token}|forget_password`,
                expiresAt: new Date(Date.now() + 1 * 5 * 60 * 1000)
            });
            await SendMail({ targetMail: userRecord.email, subject: 'Reset Password', content: `
                Hello ${userRecord.username}, we've received your request for password reset.
                Please click this link to reset your password:\n
                http://localhost:5173/reset-password/${userRecord.id}/${token}

                If you didn't request this, ignore this email.
            ` });

            return c.json({ message: "Reset password verification has been sent, please check your mail to proceed." }, HTTPStatus.OK);
        } catch (err) {
            console.error(err);
            return c.json({ message: 'Internal server error.' }, HTTPStatus.INTERNAL_SERVER_ERROR);
        }
    }

    static async ResetPassword(c: Context) {
        try {
            const { id, token } = c.req.param();
            const { password } = await c.req.json();

            const newPassword: string = password?.trim();
            if (!newPassword)
                return c.json({ message: "All fields are required." }, HTTPStatus.CONFLICT);
            if (newPassword.length < 5 || newPassword.length > 25)
                return c.json({ message: 'New password must be at least 5 characters long and 25 characters at maximum.' }, HTTPStatus.CONFLICT);

            const tok = await GetToken(+id, token, "forget_password");
            if (!tok)
                return c.json({ message: "Request not found." }, HTTPStatus.NOT_FOUND);

            const pw = await argon2.hash(newPassword);
            await db.update(users).set({ password: pw, password_length: newPassword.length }).where(eq(users.id, +id));

            return c.json({ message: 'Password reset successful.' }, HTTPStatus.OK);
        } catch (err) {
            console.error(err);
            return c.json({ message: 'Internal server error.' }, HTTPStatus.INTERNAL_SERVER_ERROR);
        }
    }
}