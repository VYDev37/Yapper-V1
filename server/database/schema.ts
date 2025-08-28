import { like } from 'drizzle-orm';
import { pgTable, text, integer, varchar, timestamp, boolean, smallint, bigint, AnyPgColumn } from 'drizzle-orm/pg-core';

export const users = pgTable("users", {
    id: bigint('id', { mode: 'number' }).primaryKey().notNull().generatedAlwaysAsIdentity(),
    full_name: varchar('full_name', { length: 255 }).notNull(),
    username: varchar('username', { length: 255 }).notNull().unique(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    verified: boolean('verified').default(false),
    email_verified: boolean('email_verified').default(false),
    password: varchar('password', { length: 255 }).notNull(),
    password_length: smallint('password_length').notNull().default(0),
    profileUrl: varchar('profile_url', { length: 255 }).notNull().default('profile-icon-default.png'),
    role_id: smallint('role_id').notNull().default(0),
    security_code: text('security_code'),
    followers: integer('followers').default(0),
    following: integer('following').default(0),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().$onUpdate(() => new Date())
});

export const posts = pgTable('posts', {
  id: bigint('id', { mode: 'number' }).primaryKey().notNull().generatedAlwaysAsIdentity(),
  ownerId: bigint('owner_id', { mode: 'number' }).references(() => users.id),
  description: text('description'),
  imageUrl: text('image_url'),
  likeCount: integer('like_count').default(0),
  commentCount: integer('comment_count').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

export const postLikes = pgTable('post_likes', {
  id: bigint('id', { mode: 'number' }).primaryKey().notNull().generatedAlwaysAsIdentity(),
  postId: bigint('post_id', { mode: 'number' }).notNull().references(() => posts.id, { onDelete: 'cascade' }),
  userId: bigint('user_id', { mode: 'number' }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

export const postComments = pgTable('post_comments', {
  id: bigint('id', { mode: 'number' }).primaryKey().notNull().generatedAlwaysAsIdentity(),
  postId: bigint('post_id', { mode: 'number' }).notNull().references(() => posts.id, { onDelete: 'cascade' }),
  userId: bigint('user_id', { mode: 'number' }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  parentId: bigint('parent_id', { mode: 'number' }).references((): AnyPgColumn => postComments.id, { onDelete: 'cascade' }), // NULL = top-level comment
  comment: text('comment').notNull(), // works for both comment/reply
  likeCount: integer('like_count').default(0),
  replyCount: integer('reply_count').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

export const postCommentLikes = pgTable('post_comment_likes', {
  id: bigint('id', { mode: 'number' }).primaryKey().notNull().generatedAlwaysAsIdentity(),
  postId: bigint('post_id', { mode: 'number' }).notNull().references(() => posts.id, { onDelete: 'cascade' }),
  userId: bigint('user_id', { mode: 'number' }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  commentId: bigint('comment_id', { mode: 'number' }).notNull().references(() => postComments.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

export const followingLogs = pgTable('following_logs', {
  id: bigint('id', { mode: 'number' }).primaryKey().notNull().generatedAlwaysAsIdentity(),
  followedId: bigint('followed_id', { mode: 'number' }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  userId: bigint('user_id', { mode: 'number' }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

export const serverToken = pgTable('server_token', {
  id: bigint('id', { mode: 'number' }).primaryKey().notNull().generatedAlwaysAsIdentity(),
  userId: bigint('user_id', { mode: 'number' }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull()
});