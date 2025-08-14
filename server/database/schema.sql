CREATE SEQUENCE users_id_seq;
CREATE SEQUENCE posts_id_seq;
CREATE SEQUENCE post_likes_id_seq;
CREATE SEQUENCE following_logs_id_seq;

CREATE TABLE "users" (
	"id" bigint PRIMARY KEY DEFAULT nextval('users_id_seq') NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"username" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"password_length" smallint NOT NULL DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"verified" boolean DEFAULT false,
	"email_verified" boolean DEFAULT false,
	"role_id" smallint DEFAULT 0 NOT NULL,
	"profile_url" varchar(255) DEFAULT 'profile-icon-default.png' NOT NULL,
	"followers" integer DEFAULT 0,
	"following" integer DEFAULT 0,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);

CREATE TABLE "posts" (
	"id" bigint PRIMARY KEY DEFAULT nextval('posts_id_seq') NOT NULL,
	"owner_id" bigint NOT NULL,
	"description" text,
	"image_url" text,
	"like_count" integer DEFAULT 0,
	"comment_count" integer DEFAULT 0,
	"owner_id" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE "post_likes" (
	"id" bigint PRIMARY KEY DEFAULT nextval('post_likes_id_seq') NOT NULL,
	"post_id" bigint NOT NULL,
	"user_id" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE "following_logs" (
	"id" bigint PRIMARY KEY DEFAULT nextval('following_logs_id_seq') NOT NULL,
	"followed_id" bigint NOT NULL,
	"user_id" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "following_logs" ADD CONSTRAINT "following_logs_followed_id_users_id_fk" FOREIGN KEY ("followed_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "following_logs" ADD CONSTRAINT "following_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;