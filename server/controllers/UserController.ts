import type { Context } from 'hono';
import { deleteCookie, getCookie } from 'hono/cookie';

import { eq, desc, and, inArray } from 'drizzle-orm';
import { users, posts, postLikes, followingLogs } from '../database/schema';

import { IsImage, FileExist } from '../utilities/FileReader';
import { OnProfileChange, OnUsernameChange, OnNameChange } from './helpers/user';

import db from '../database/pool';
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
                Object.assign(packedData, {
                    email_verified: userDB.email_verified,
                    email: userDB.email,
                    secret: userDB.password_length
                });
            }

            const followedData = await db.query.followingLogs.findFirst({ where: 
                and(eq(followingLogs.followedId, userDB.id), eq(followingLogs.userId, +user.id))
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
            const body = await c.req.json();

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
                default: {
                    return c.json({ message: "Nothing to be updated." }, HTTPStatus.OK);
                }
            }
        } catch (error) {
            console.error("Error during registration: ", error);
            return c.json({ message: 'Internal server error.' }, HTTPStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Still error for now
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
}