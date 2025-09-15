import type { Context } from "hono";
import { eq, and } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import HTTPStatus from "../utilities/HTTPStatus";
import { Truncate } from "../utilities/Text";
import { TimeLengthToSecond } from "../utilities/Datetime";

import db from "../database/pool";
import { blockedList, posts, postComments, reportLogs, users, followingLogs, notifications } from "../database/schema";

import { connectedSockets } from "../variables";

export default class ModerationController {
    static async AddReport(c: Context) {
        try {
            const type: string = c.req.param("type");
            const user = c.get("user");

            if (!user)
                return c.json({ message: "Forbidden." }, HTTPStatus.FORBIDDEN);

            switch (type?.toLowerCase()?.trim()) {
                case "post": {
                    const { postId, commentId, reason } = await c.req.json();

                    if (!reason || reason.trim().length < 3)
                        return c.json({ message: "Reason must consist of at least 3 characters." }, HTTPStatus.CONFLICT);

                    const post = await db.query.posts.findFirst({ where: eq(posts.id, +postId) });
                    if (!post || post.ownerId === +user.id)
                        return c.json({ message: "Post not found" }, HTTPStatus.NOT_FOUND);

                    if (commentId) {
                        const comment = await db.query.postComments.findFirst({
                            where: and(eq(postComments.id, +commentId), eq(postComments.postId, post.id))
                        });

                        if (!comment || comment.userId === +user.id)
                            return c.json({ message: "Comment not found" }, HTTPStatus.NOT_FOUND);

                        await db.insert(reportLogs).values({
                            postId: post.id, commentId: comment.id, reason: Truncate(reason, 50),
                            reporterId: +user.id, userId: comment.userId
                        });
                    } else {
                        await db.insert(reportLogs).values({
                            postId: post.id, reason: Truncate(reason, 50),
                            reporterId: +user.id, userId: post.ownerId!
                        });
                    }
                    break;
                }
                case "user": {
                    const { userId, reason } = await c.req.json();
                    if (!reason || reason.trim().length < 3)
                        return c.json({ message: "Reason must consist at least 3 characters." }, HTTPStatus.CONFLICT);

                    const userDB = await db.query.users.findFirst({ where: eq(users.id, +userId) });
                    if (!userDB || userDB.id === +user.id)
                        return c.json({ message: "User not found" }, HTTPStatus.NOT_FOUND);

                    await db.insert(reportLogs).values({ reason: Truncate(reason, 50), reporterId: +user.id, userId: +userDB.id });
                    break;
                }
            }

            return c.json({ message: "Report submitted." }, HTTPStatus.OK);
        } catch (error) {
            console.error(error);
            return c.json({ message: "Internal server error." }, HTTPStatus.INTERNAL_SERVER_ERROR);
        }
    }

    static async GetReports(c: Context) {
        const user = c.get("user");
        const userDB = await db.query.users.findFirst({ where: eq(users.id, +user.id || 0) });
        if (!userDB || userDB.role_id < 2)
            return c.json({ message: "Forbidden access." }, HTTPStatus.FORBIDDEN);

        try {
            const reporters = alias(users, "reporters");
            const result = await db.select({
                id: reportLogs.id, reason: reportLogs.reason, createdAt: reportLogs.createdAt, logType: reportLogs.logType,
                postId: reportLogs.postId, commentId: reportLogs.commentId, duration: reportLogs.duration,
                postAttachment: posts.imageUrl, postDescription: posts.description, postOwner: posts.ownerId, reporter: reporters.username,
                username: users.username, verified: users.verified, profileUrl: users.profileUrl
            }).from(reportLogs)
                .leftJoin(users, eq(reportLogs.userId, users.id))
                .leftJoin(reporters, eq(reportLogs.reporterId, reporters.id))
                .leftJoin(posts, eq(reportLogs.postId, posts.id));

            return c.json({ reports: result }, HTTPStatus.OK);
        } catch (err) {
            console.log(err);
            return c.json({ message: "Internal server error." }, HTTPStatus.INTERNAL_SERVER_ERROR);
        }
    }

    static async BlockUser(c: Context) {
        try {
            const id = +(c.req.param('id') || 0);
            const user = c.get("user");

            const userDB = await db.query.users.findFirst({ where: eq(users.id, +user.id || 0) });
            const targetDB = await db.query.users.findFirst({ where: eq(users.id, +id) });

            if (!userDB)
                return c.json({ message: "Unauthorized." }, HTTPStatus.FORBIDDEN);

            if (!targetDB || targetDB.id === userDB.id)
                return c.json({ message: "User not found." }, HTTPStatus.NOT_FOUND);

            const where = and(eq(blockedList.userId, userDB.id), eq(blockedList.blockedId, targetDB.id));
            const userBlocked = await db.query.blockedList.findFirst({ where });

            const isBlocked = !!userBlocked;
            if (isBlocked) {
                await db.delete(blockedList).where(where);
            } else {
                await db.insert(blockedList).values({ blockedId: targetDB.id, userId: userDB.id });
            }

            return c.json({ blocked: isBlocked }, HTTPStatus.OK);
        } catch (error) {
            console.log(error);
            return c.json({ message: "Internal server error." }, HTTPStatus.INTERNAL_SERVER_ERROR);
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

            if (followed) {
                await db.insert(followingLogs).values({ followedId: targetDB.id, userId: userDB.id });
                await db.insert(notifications).values({ recipientId: targetDB.id, senderId: userDB.id, action: "followed your account." });
            }
            else {
                await db.delete(followingLogs).where(where);
            }

            return c.json({ message: followed ? "Follow added." : "Follow removed.", postData: { followers, following, followed } }, HTTPStatus.OK);
        } catch (err) {
            console.error(err);
            return c.json({ message: "Internal server error." }, HTTPStatus.INTERNAL_SERVER_ERROR);
        }
    }

    static async BanUser(c: Context) {
        try {
            const user = c.get('user');
            const { id, reason, duration, security_code } = await c.req.json();

            const userId = Number(id);
            if (!userId) 
                return c.json({ message: "Invalid user id." }, HTTPStatus.BAD_REQUEST);

            const admin = await db.query.users.findFirst({ where: eq(users.id, user.id) });
            if (!admin || admin.role_id < 2 || !security_code || admin.security_code !== security_code.trim())
                return c.json({ message: "Access forbidden." }, HTTPStatus.FORBIDDEN);

            if (!reason || reason.trim().length < 3)
                return c.json({ message: "Reason must consist of at least 3 characters." }, HTTPStatus.CONFLICT);

            const targetUser = await db.query.users.findFirst({ where: eq(users.id, userId) });
            if (!targetUser)
                return c.json({ message: "Target user not found." }, HTTPStatus.NOT_FOUND);

            if (targetUser.id === admin.id)
                return c.json({ message: "You cannot ban yourself." }, HTTPStatus.FORBIDDEN);
            
            if (targetUser.role_id >= admin.role_id) 
                return c.json({ message: "You cannot ban a user with equal or higher role." }, HTTPStatus.FORBIDDEN);

            let banned_until: Date | null = null;
            //console.log(duration);
            let fixedDuration: number = 0;
            if (duration) {
                fixedDuration = TimeLengthToSecond(duration) * 1000;
                //console.log(fixedDuration);
                if (fixedDuration === -1)
                    return c.json({ message: "Format doesn't match.\nFormat Examples: (1 mo/month, 2 y/years, 3d/days, 4m/minutes, 5s/seconds)" }, HTTPStatus.CONFLICT);
                if (fixedDuration === 0)
                    return c.json({ message: "Please enter value more than zero." }, HTTPStatus.CONFLICT);

                banned_until = new Date(Date.now() + fixedDuration);
            }
            
            if (targetUser.banned_until && targetUser.banned_until > new Date()) {
                await db.insert(reportLogs).values({ logType: "Unbanned", reason: Truncate(reason, 50), reporterId: admin.id, userId: targetUser.id });
                await db.update(users).set({ banned_until: null, ban_reason: null }).where(eq(users.id, targetUser.id));
                return c.json({ message: "User unbanned successfully." });
            } else {
                await db.insert(reportLogs).values({ duration: fixedDuration, logType: "Banned", reason: Truncate(reason, 50), reporterId: admin.id, userId: targetUser.id });
                await db.update(users).set({ banned_until, ban_reason: Truncate(reason.trim(), 50) }).where(eq(users.id, targetUser.id));
                // kick user if online
                const ws = connectedSockets.get(id);
                if (ws) {
                    ws.send(JSON.stringify({ action: "logout", reason }));
                    ws.close();
                }
                
                return c.json({ message: "User banned successfully." });
            }
        } catch (err) {
            console.error(err);
            return c.json({ message: "Internal server error." }, HTTPStatus.INTERNAL_SERVER_ERROR);
        }
    }

}