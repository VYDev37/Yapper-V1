import argon2 from "argon2";

import type { Context } from "hono";
import { eq } from "drizzle-orm";

import HTTPStatus from "../../../utilities/HTTPStatus";
import SendMail from "../../../utilities/MailSender";

import db from "../../../database/pool";
import { users } from "../../../database/schema";

interface PasswordResetBody {
    username: string;
    new_password: string;
}

interface PasswordChangeBody {
    old_password: string;
    new_password: string;
    security_code: string;
}

const OnPasswordChange = async (c: Context, body: PasswordChangeBody, userId: number) => {
    const { old_password, new_password, security_code }: PasswordChangeBody = body;

    const oldPassword: string = old_password?.trim();
    const newPassword: string = new_password?.trim();

    if (!oldPassword || !newPassword)
        return c.json({ message: "All fields are required." }, HTTPStatus.CONFLICT);

    if (newPassword.length < 5 || newPassword.length > 25)
        return c.json({ message: 'New password must be at least 5 characters long and 25 characters at maximum.' }, HTTPStatus.CONFLICT);

    const userRecord = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!userRecord || !userRecord.email_verified || (userRecord.security_code && userRecord.security_code !== security_code.trim()))
        return c.json({ message: "Something went wrong while loading your account." }, HTTPStatus.CONFLICT);

    const verifyPassword: boolean = await argon2.verify(userRecord.password, oldPassword);
    if (!verifyPassword)
        return c.json({ message: "The current password is incorrect." }, HTTPStatus.UNAUTHORIZED);

    const password = await argon2.hash(newPassword);

    await db.update(users).set({ password, password_length: newPassword.length }).where(eq(users.id, userRecord.id));
    await SendMail({ targetMail: userRecord.email, subject: "Password Changed.", content: "Your account password has been changed." });

    return c.json({ message: 'Password changed successfully.' }, HTTPStatus.OK);
}

export default OnPasswordChange;