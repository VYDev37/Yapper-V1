import type { Context } from 'hono';
import { and, eq, inArray, ilike, desc, sql } from 'drizzle-orm';

import { posts, users, postLikes, postComments, postCommentLikes } from '../database/schema';
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

            let likedPosts: number[] = [];
            let likedComments: number[] = [];

            const result = await db.select({
                postId: posts.id,
                ownerId: posts.ownerId,
                description: posts.description,
                imageUrl: posts.imageUrl,
                likeCount: posts.likeCount,
                commentCount: posts.commentCount,
                createdAt: posts.createdAt,
                full_name: users.full_name,
                username: users.username,
                role_id: users.role_id,
                verified: users.verified,
                profileUrl: users.profileUrl
            }).from(posts).leftJoin(users, eq(posts.ownerId, users.id)).where(where);

            const isLiked = await db.select({ postId: postLikes.postId }).from(postLikes).where(
                and(
                    inArray(postLikes.postId, result.map(p => p.postId)),
                    eq(postLikes.userId, +user.id)
                ));
            likedPosts = isLiked.map(p => p.postId);

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

            likedComments = commentLiked.map(c => c.commentId);

            const repliesMap: Record<number, any[]> = {};
            for (const c of comments) {
                if (c.parentId) {
                    if (!repliesMap[c.parentId]) 
                        repliesMap[c.parentId] = [];

                    repliesMap[c.parentId].push({ ...c, liked: likedComments.includes(c.id) });
                }
            }

            const packedPosts = result.map(post => ({
                ...post,
                comments: comments.filter(c => c.postId === post.postId && !c.parentId)
                    .map(c => ({ ...c, liked: likedComments.includes(c.id), replies: repliesMap[c.id] })),
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

            const where = and(
                eq(postLikes.postId, post_id),
                eq(postLikes.userId, user.id)
            );

            const findPostLike = await db.query.postLikes.findFirst({ where });

            const liked: boolean = !findPostLike;
            const likeCount: number = (postRef.likeCount || 0) + (liked ? 1 : -1);

            await db.update(posts).set({ likeCount }).where(eq(posts.id, post_id));

            if (liked)
                await db.insert(postLikes).values({ postId: post_id, userId: +user.id });
            else
                await db.delete(postLikes).where(where);

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

            if (liked)
                await db.insert(postCommentLikes).values({ postId: postRef.id, commentId: commentRef.id, userId: +user.id });
            else
                await db.delete(postCommentLikes).where(where);

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
                await db.update(postComments).set({ replyCount: sql`${postComments.replyCount} + 1` }).where(eq(postComments.id, parId));
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

            if (!user)
                return c.json({ message: "Forbidden access." }, HTTPStatus.FORBIDDEN);

            const post = await db.query.posts.findFirst({ where: eq(posts.id, +postId) });
            if (!post)
                return c.json({ message: "Post not found." }, HTTPStatus.NOT_FOUND);

            const postComment = await db.query.postComments.findFirst({ where: and(eq(postComments.id, +commentId), eq(postComments.userId, +user.id), eq(postComments.postId, +postId)) });
            if (!postComment)
                return c.json({ message: "Comment not found." }, HTTPStatus.NOT_FOUND);

            if (postComment.userId !== +user.id && user.role_id < 2 && post.ownerId !== +user.id)
                return c.json({ message: "You are not allowed to do this." }, HTTPStatus.FORBIDDEN);

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

            if (!user)
                return c.json({ message: "Forbidden access." }, HTTPStatus.FORBIDDEN);

            const post = await db.query.posts.findFirst({ where: eq(posts.id, postId) });
            if (!post)
                return c.json({ message: "Post not found." }, HTTPStatus.NOT_FOUND);

            if (post.ownerId !== user.id && user.role_id < 2)
                return c.json({ message: "You are not allowed to do this." }, HTTPStatus.FORBIDDEN);

            await db.delete(posts).where(eq(posts.id, post.id));

            return c.json({ message: "Post successfully deleted." }, HTTPStatus.OK);
        } catch (error) {
            console.log(error);
            return c.json({ message: "The post does not exist or deleted." }, HTTPStatus.INTERNAL_SERVER_ERROR);
        }
    }
}