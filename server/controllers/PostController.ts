import type { Context } from 'hono';
import { and, eq, inArray, ilike, desc, sql, notInArray } from 'drizzle-orm';

import { posts, postLikes, postComments, postCommentLikes, users, notifications, blockedList } from '../database/schema';
import db from '../database/pool';

import HTTPStatus from '../utilities/HTTPStatus';

export default class PostController {
    static async GetPosts(c: Context) {
        try {
            const user = c.get('user');
            const username: string = c.req.query('username')?.toLowerCase()?.trim() || '';
            const search: string = c.req.query('search')?.toLowerCase() || '';

            if (!user)
                return c.json({ error: 'Forbidden access.' }, HTTPStatus.FORBIDDEN);

            let where: any | undefined = undefined;
            if (username && search)
                where = and(eq(users.username, username), ilike(posts.description, `%${search}%`));
            else if (username)
                where = eq(users.username, username);
            else if (search)
                where = ilike(posts.description, `%${search}%`);

            const isBlocked = await db.select({ blockedId: blockedList.blockedId }).from(blockedList).where(eq(blockedList.userId, +user.id));
            const blockedUsers = isBlocked.map(p => p.blockedId);

            const result = await db.select({
                postId: posts.id, ownerId: posts.ownerId,
                description: posts.description, imageUrl: posts.imageUrl,
                likeCount: posts.likeCount, commentCount: posts.commentCount,
                createdAt: posts.createdAt, profileUrl: users.profileUrl,
                full_name: users.full_name, username: users.username,
                role_id: users.role_id, verified: users.verified,
            }).from(posts).leftJoin(users, eq(posts.ownerId, users.id)).where(and(where, blockedUsers.length > 0 ? notInArray(posts.ownerId, blockedUsers) : undefined));

            const isLiked = await db.select({ postId: postLikes.postId }).from(postLikes).where(
                and(inArray(postLikes.postId, result.map(p => p.postId)), eq(postLikes.userId, +user.id)));
            const likedPosts: number[] = isLiked.map(p => p.postId) || [];

            const comments = await db.select({
                id: postComments.id, postId: postComments.postId,
                userId: postComments.userId, parentId: postComments.parentId,
                comment: postComments.comment, createdAt: postComments.createdAt,
                likeCount: postComments.likeCount, replyCount: postComments.replyCount,
                full_name: users.full_name, username: users.username,
                profileUrl: users.profileUrl, verified: users.verified,
                role_id: users.role_id
            }).from(postComments).leftJoin(users, eq(postComments.userId, users.id))
                .where(inArray(postComments.postId, result.map(p => p.postId)))
                .orderBy(desc(postComments.createdAt));

            const commentLiked = await db.select({ commentId: postCommentLikes.commentId }).from(postCommentLikes).where(
                and(inArray(postCommentLikes.commentId, comments.map(c => c.id)), eq(postCommentLikes.userId, +user.id)));
            const likedComments: number[] = commentLiked.map(c => c.commentId) || [];

            const commentBlocked = await db.select({ blockedId: blockedList.blockedId }).from(blockedList).where(
                and(inArray(blockedList.blockedId, comments.map(c => c.userId)), eq(blockedList.userId, +user.id)));
            const blockedComments: number[] = commentBlocked.map(c => c.blockedId);

            const repliesMap: Record<number, any[]> = {};
            for (const c of comments) {
                if (c.parentId) {
                    if (!repliesMap[c.parentId])
                        repliesMap[c.parentId] = [];

                    const liked: boolean = likedComments.includes(c.id);
                    const blocked: boolean = blockedComments.includes(c.userId);

                    repliesMap[c.parentId].push({ ...c, liked, blocked });
                }
            }

            const packedPosts = result.map(post => ({
                ...post,
                comments: comments.filter(c => c.postId === post.postId && !c.parentId)
                    .map(c => ({ ...c, liked: likedComments.includes(c.id), blocked: blockedComments.includes(c.userId), replies: repliesMap[c.id] })),
                liked: likedPosts.includes(post.postId)
            }));

            return c.json({ posts: packedPosts }, HTTPStatus.OK);
        } catch (err) {
            console.error(err);
            return c.json({ message: "Internal server error." }, HTTPStatus.INTERNAL_SERVER_ERROR);
        }
    }

    static async AddPost(c: Context) {
        try {
            const user = c.get('user');
            const { description, image_url } = await c.req.json();

            if (!user)
                return c.json({ error: 'Forbidden access.' }, 403);

            await db.insert(posts).values({
                ownerId: +user.id,
                description,
                imageUrl: image_url
            });

            return c.json({ message: "Successfully added new post." }, 200);
        } catch (err) {
            console.error(err);
            return c.json({ message: "Internal server error." }, HTTPStatus.INTERNAL_SERVER_ERROR);
        }
    }

    static async AddLike(c: Context) {
        try {
            const post_id: number = +c.req.param('id');
            const user = c.get('user');

            if (!user)
                return c.json({ message: "Forbidden access." }, HTTPStatus.FORBIDDEN);

            const postRef = await db.query.posts.findFirst({ where: eq(posts.id, post_id) });

            if (!postRef)
                return c.json({ message: "Post doesn't exist." }, HTTPStatus.NOT_FOUND);

            const where = and(eq(postLikes.postId, postRef.id), eq(postLikes.userId, user.id));

            const findPostLike = await db.query.postLikes.findFirst({ where });

            const liked: boolean = !findPostLike;
            const likeCount: number = (postRef.likeCount || 0) + (liked ? 1 : -1);

            await db.update(posts).set({ likeCount }).where(eq(posts.id, postRef.id));

            if (liked) {
                await db.insert(postLikes).values({ postId: post_id, userId: +user.id });
                if (postRef.ownerId !== +user.id)
                    await db.insert(notifications).values({ recipientId: postRef.ownerId!, senderId: +user.id, action: "liked your post.", postId: postRef.id });
            }
            else {
                await db.delete(postLikes).where(where);
            }

            return c.json({ message: liked ? "Like added." : "Like removed.", postData: { likeCount, liked } }, HTTPStatus.OK);
        } catch (err) {
            console.error(err);
            return c.json({ message: "" }, HTTPStatus.INTERNAL_SERVER_ERROR);
        }
    }

    static async LikeComment(c: Context) {
        try {
            const { postId, commentId } = await c.req.json();
            const user = c.get('user');

            if (!user)
                return c.json({ message: "Forbidden access." }, HTTPStatus.FORBIDDEN);

            const postRef = await db.query.posts.findFirst({ where: eq(posts.id, +postId) });

            if (!postRef)
                return c.json({ message: "Post doesn't exist." }, HTTPStatus.NOT_FOUND);

            const where = and(eq(postCommentLikes.postId, postRef.id), eq(postCommentLikes.commentId, commentId));

            const findPostLike = await db.query.postCommentLikes.findFirst({ where });
            const commentRef = await db.query.postComments.findFirst({ where: and(eq(postComments.id, +commentId), eq(postComments.postId, postRef.id)) });
            if (!commentRef)
                return c.json({ message: "Comment doesn't exist." }, HTTPStatus.NOT_FOUND);

            const liked: boolean = !findPostLike;
            const likeCount: number = (commentRef.likeCount || 0) + (liked ? 1 : -1);

            await db.update(postComments).set({ likeCount }).where(eq(postComments.id, commentRef.id));

            if (liked) {
                await db.insert(postCommentLikes).values({ postId: postRef.id, commentId: commentRef.id, userId: +user.id });
                if (commentRef.userId !== +user.id)
                    await db.insert(notifications).values({ recipientId: commentRef.userId!, senderId: +user.id, action: "liked your comment.", postId: postRef.id, commentId: commentRef.id });
            }
            else {
                await db.delete(postCommentLikes).where(where);
            }

            return c.json({ message: liked ? "Like added." : "Like removed.", commentData: { likeCount, liked } }, HTTPStatus.OK);
        } catch (err) {
            console.error(err);
            return c.json({ message: "" }, HTTPStatus.INTERNAL_SERVER_ERROR);
        }
    }

    static async AddComment(c: Context) {
        try {
            const user = c.get('user');
            const { comment, postId, parentId } = await c.req.json();

            let parId = parentId ? +parentId : null;

            if (!user)
                return c.json({ message: "Forbidden access." }, HTTPStatus.FORBIDDEN);

            const post = await db.query.posts.findFirst({ where: eq(posts.id, +postId) });
            if (!post)
                return c.json({ message: "Post not found." }, HTTPStatus.NOT_FOUND);

            if (parId) {
                const comment = await db.query.postComments.findFirst({ where: eq(postComments.id, parId) });
                if (!comment)
                    return c.json({ message: "Comment not found." }, HTTPStatus.NOT_FOUND);

                parId = comment.parentId ?? comment.id;
                if (comment.userId !== +user.id)
                    await db.insert(notifications).values({ recipientId: comment.userId!, senderId: +user.id, action: "replied your comment.", postId: post.id, commentId: parId });

                await db.update(postComments).set({ replyCount: sql`${postComments.replyCount} + 1` }).where(eq(postComments.id, parId));
            } else {
                await db.insert(notifications).values({ recipientId: post.ownerId!, senderId: +user.id, action: "commented on your post.", postId: post.id, commentId: parId });
            }

            await db.insert(postComments).values({ userId: +user.id, postId: post.id, comment, parentId: parId });
            await db.update(posts).set({ commentCount: sql`${posts.commentCount} + 1` }).where(eq(posts.id, post.id));

            return c.json({ message: "Comment added." }, HTTPStatus.OK);
        } catch (err) {
            console.error(err);
            return c.json({ message: "Internal server error." }, HTTPStatus.INTERNAL_SERVER_ERROR);
        }
    }

    static async DeleteComment(c: Context) {
        try {
            const user = c.get("user");
            const { commentId, postId } = c.req.param();
            const { security_code } = await c.req.json();

            const userDB = await db.query.users.findFirst({ where: eq(users.id, +user.id || 0) });
            if (!userDB)
                return c.json({ message: "Forbidden access." }, HTTPStatus.FORBIDDEN);

            const post = await db.query.posts.findFirst({ where: eq(posts.id, +postId) });
            if (!post)
                return c.json({ message: "Post not found." }, HTTPStatus.NOT_FOUND);

            const postComment = await db.query.postComments.findFirst({ where: and(eq(postComments.id, +commentId), eq(postComments.userId, +user.id), eq(postComments.postId, +postId)) });
            if (!postComment)
                return c.json({ message: "Comment not found." }, HTTPStatus.NOT_FOUND);

            if (postComment.userId !== +user.id) {
                if (userDB.role_id < 2) {
                    if (postComment.userId !== +user.id && post.ownerId !== +user.id)
                        return c.json({ message: "You are not allowed to do this." }, HTTPStatus.FORBIDDEN);
                } else {
                    if (!security_code || !userDB.security_code || userDB.security_code !== security_code.trim())
                        return c.json({ message: "Security code doesn't match. If you don't have one, please create first." }, HTTPStatus.CONFLICT);
                }
            }

            const parentId: number = postComment.parentId!;
            if (parentId) {
                const comment = await db.query.postComments.findFirst({ where: eq(postComments.id, parentId) });
                if (!comment)
                    return c.json({ message: "Comment not found." }, HTTPStatus.NOT_FOUND);

                await db.update(postComments).set({ replyCount: (comment.replyCount || 0) - 1 }).where(eq(postComments.id, parentId));
            }

            await db.delete(postComments).where(eq(postComments.id, postComment.id));
            await db.update(posts).set({ commentCount: (post.commentCount || 0) - 1 }).where(eq(posts.id, post.id));

            return c.json({ message: "Comment successfully deleted." }, HTTPStatus.OK);
        } catch (error) {
            console.log(error);
            return c.json({ message: "The post is not exist or deleted." }, HTTPStatus.INTERNAL_SERVER_ERROR);
        }
    }

    static async DeletePost(c: Context) {
        try {
            const user = c.get("user");
            const postId: number = +(c.req.param("id") || 0);
            const { security_code } = await c.req.json();

            const userDB = await db.query.users.findFirst({ where: eq(users.id, +user.id || 0) });
            if (!userDB)
                return c.json({ message: "Forbidden access." }, HTTPStatus.FORBIDDEN);

            const post = await db.query.posts.findFirst({ where: eq(posts.id, postId) });
            if (!post)
                return c.json({ message: "Post not found." }, HTTPStatus.NOT_FOUND);

            if (post.ownerId !== userDB.id) {
                if (userDB.role_id < 2)
                    return c.json({ message: "You are not allowed to do this." }, HTTPStatus.FORBIDDEN);

                if (!security_code || !userDB.security_code || userDB.security_code !== security_code.trim())
                    return c.json({ message: "Security code doesn't match. If you don't have one, please create first." }, HTTPStatus.CONFLICT);
            }

            await db.delete(posts).where(eq(posts.id, post.id));

            return c.json({ message: "Post successfully deleted." }, HTTPStatus.OK);
        } catch (error) {
            console.log(error);
            return c.json({ message: "The post does not exist or deleted." }, HTTPStatus.INTERNAL_SERVER_ERROR);
        }
    }
}