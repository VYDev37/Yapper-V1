import argon2 from "argon2";
import jwt from "jsonwebtoken";
import type { Context } from "hono";
import { eq, sql, and, gt, or } from "drizzle-orm";

import GetToken from "../middlewares/GetToken";
import HTTPStatus from "../utilities/HTTPStatus";
import SendMail from "../utilities/MailSender";

import db from "../database/pool";
import { serverToken, users } from "../database/schema";

export default class MailController {
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

            const token = jwt.sign({ id: userRecord.id }, Bun.env.JWT_SECRET!, { expiresIn: '5m' });

            await db.insert(serverToken).values({
                userId: userRecord.id,
                token: `${token}|forget_password`,
                expiresAt: new Date(Date.now() + 1 * 5 * 60 * 1000)
            });
            await SendMail({
                targetMail: userRecord.email, subject: 'Reset Password', content: `
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