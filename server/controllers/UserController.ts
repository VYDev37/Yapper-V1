import type { Context } from 'hono';
import { deleteCookie, getCookie } from 'hono/cookie';

import db from '../database/pool';
import { eq, and, ilike, desc } from 'drizzle-orm';
import { blockedList, users, followingLogs, notifications, posts, reportLogs } from '../database/schema';

import { IsImage, FileExist } from '../utilities/FileReader';
import { OnProfileChange, OnUsernameChange, OnNameChange, OnEmailChange, OnPasswordChange, OnEnableSecurity } from './helpers/user';

import HTTPStatus from '../utilities/HTTPStatus';

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

            const selfDB = await db.query.users.findFirst({ where: eq(users.id, +user.id || -1) });
            if (!selfDB)
                return c.json({ error: 'Forbidden access.' }, HTTPStatus.FORBIDDEN);

            const isSelf = !username || user.username === username || self;
            const targetId = isSelf ? user.username : username;

            const userDB = await db.query.users.findFirst({ where: eq(users.username, targetId) });
            if (!userDB)
                return c.json({ error: 'User not found.' }, HTTPStatus.NOT_FOUND);

            const hasAccess = selfDB.role_id >= 2 || isSelf;

            const profileUrl: string = (FileExist(`profile-pics/${userDB.profileUrl}`) && IsImage(userDB.profileUrl))
                ? userDB.profileUrl
                : 'profile-icon-default.png';

            let packedData: any = {
                verified: userDB.verified, profileUrl, ban_reason: userDB.ban_reason,
                followers: userDB.followers, following: userDB.following,
                role_id: userDB.role_id, banned_until: userDB.banned_until,
            };

            if (!isSelf || (isSelf && (user.full_name !== userDB.full_name || user.username !== userDB.username))) {
                Object.assign(packedData, {
                    full_name: userDB.full_name, username: userDB.username, id: userDB.id
                });
            }

            if (hasAccess) {
                if (isSelf)
                    Object.assign(packedData, { code: userDB.security_code });

                Object.assign(packedData, {
                    email_verified: userDB.email_verified, email: userDB.email,
                    secret: userDB.password_length
                });
            }

            const followedData = await db.query.followingLogs.findFirst({
                where: and(eq(followingLogs.followedId, userDB.id), eq(followingLogs.userId, +user.id))
            });
            const isFollowed = !!followedData;

            const userBlocked = await db.query.blockedList.findFirst({ 
                where: and(eq(blockedList.userId, +user.id), eq(blockedList.blockedId, userDB.id)) 
            });
            const isBlocked = !!userBlocked;

            Object.assign(packedData, { blocked: isBlocked });
            Object.assign(packedData, { followed: isFollowed });

            return c.json({ info: packedData }, HTTPStatus.OK);
        } catch (error) {
            console.error("Error fetching profile: ", error);
            return c.json({ message: 'Internal server error.' }, HTTPStatus.INTERNAL_SERVER_ERROR);
        }
    }

    static async GetUsers(c: Context) {
        try {
            const user = c.get('user');
            const username: string = c.req.param('username');

            if (!user)
                return c.json({ message: "Forbidden access." }, HTTPStatus.FORBIDDEN);

            const usn = username?.trim()?.toLowerCase();
            if (usn) {
                const data = await db.select({
                    id: users.id, role_id: users.role_id,
                    full_name: users.full_name, username: users.username,
                    profileUrl: users.profileUrl, verified: users.verified
                }).from(users).where(ilike(users.username, `%${usn}%`)).orderBy(desc(users.followers)).limit(20);

                return c.json({ users: data }, HTTPStatus.OK);
            } else {
                const data = await db.select({
                    full_name: users.full_name, username: users.username,
                    profileUrl: users.profileUrl, verified: users.verified
                }).from(users).orderBy(desc(users.followers)).limit(20);

                return c.json({ users: data }, HTTPStatus.OK);
            }
        } catch (err) {
            console.error(err);
            return c.json({ message: "Internal server error." }, HTTPStatus.INTERNAL_SERVER_ERROR);
        }
    }

    static async UpdateUser(c: Context) {
        try {
            const user = c.get('user');
            const body: any = await c.req.json();

            const { type, id } = c.req.param();

            if (!user)
                return c.json({ message: 'Forbidden access.' }, HTTPStatus.FORBIDDEN);

            const userId: number = +id;
            const security_code: string = body.security_code;

            const userDB = await db.query.users.findFirst({ where: eq(users.id, +user.id) });
            if (!userDB)
                return c.json({ error: 'Forbidden access.' }, HTTPStatus.FORBIDDEN);

            if (userId !== userDB.id) {
                if (userDB.role_id < 2)
                    return c.json({ message: "You are not allowed to do this." }, HTTPStatus.FORBIDDEN);
                 
                if (!security_code || !userDB.security_code || userDB.security_code !== security_code.trim()) 
                    return c.json({ message: "Security code doesn't match. If you don't have one, please create first." }, HTTPStatus.CONFLICT);    
            }

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

    static async GetNotifications(c: Context) {
        try {
            const user = c.get("user");
            if (!user)
                return c.json({ message: "Forbidden." }, HTTPStatus.FORBIDDEN);

            const result = await db.select({
                id: notifications.id, action: notifications.action, createdAt: notifications.createdAt,
                postId: notifications.postId, commentId: notifications.commentId, isRead: notifications.isRead,
                postAttachment: posts.imageUrl, postDescription: posts.description, postOwner: posts.ownerId,
                username: users.username, verified: users.verified, profileUrl: users.profileUrl
            }).from(notifications)
                .leftJoin(users, eq(notifications.senderId, users.id))
                .leftJoin(posts, eq(notifications.postId, posts.id))
                .where(eq(notifications.recipientId, +user.id));

            return c.json({ notifications: result }, HTTPStatus.OK);
        } catch (err) {
            console.log(err);
            return c.json({ message: "Internal server error." }, HTTPStatus.INTERNAL_SERVER_ERROR);
        }
    }

    static async RequestVerification(c: Context) {
        try {
            const user = c.get("user");
            const self = await db.query.users.findFirst({ where: eq(users.id, +user.id || -1) });
            if (!self)
                return c.json({ message: "Forbidden." }, HTTPStatus.FORBIDDEN);

            if (self.followers! >= 1000) {
                const where = and(eq(reportLogs.reporterId, self.id), eq(reportLogs.reporterId, self.id), eq(reportLogs.logType, "Verification requested"));
                const existingReport = await db.query.reportLogs.findFirst({ where });
                if (!existingReport) {
                    await db.delete(reportLogs).where(where);
                    await db.insert(reportLogs).values({ logType: "Verification requested", reporterId: self.id, userId: self.id, reason: "", approved: 0 });
                }
                else
                    await db.insert(reportLogs).values({ logType: "Verification requested", reporterId: self.id, userId: self.id, reason: "", approved: 0 });

                return c.json({ message: "Request sent." }, HTTPStatus.OK);
            } else {
                return c.json({ message: "You're not eligible to make a request." }, HTTPStatus.CONFLICT);
            }
        } catch (err) {
            console.log(err);
            return c.json({ message: "Internal server error." }, HTTPStatus.INTERNAL_SERVER_ERROR);
        }
    }
}