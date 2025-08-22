import type { Context } from "hono";
import { eq } from "drizzle-orm";

import HTTPStatus from "../../../utilities/HTTPStatus";
import { IsValidEmail } from "../../../utilities/Text";

import db from "../../../database/pool";
import { users } from "../../../database/schema";

import GetToken from "../../../middlewares/GetToken";

interface EmailChangeBody {
    email: string;
    security_code: string;
    otp_code: string;
    email_verified: boolean;
}

const OnEmailChange = async (c: Context, body: EmailChangeBody, userId: number) => {
    const { email, email_verified, security_code, otp_code }: EmailChangeBody = body;

    const fixedName: string = email?.trim().toLowerCase();

    if (fixedName && !IsValidEmail(fixedName))
        return c.json({ message: 'Invalid email.' }, HTTPStatus.CONFLICT);

    const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!user)
        return c.json({ message: 'Unauthorized.' }, HTTPStatus.FORBIDDEN);

    const isSelf: boolean = fixedName === user?.email || !fixedName;
    const code: string = isSelf ? user?.security_code! : security_code;

    if (user.security_code && user.security_code !== code)
        return c.json({ message: 'Unauthorized 1.' }, HTTPStatus.CONFLICT);

    if (otp_code && user.email_verified) {
        const token = await GetToken(user.id, otp_code || "", isSelf ? "verify" : "email-changer");
        if (!token)
            return c.json({ message: 'Unauthorized 2.' }, HTTPStatus.NOT_FOUND);
    }

    let updatedEmail = user?.email;
    let emailVerified = email_verified;

    if (!isSelf) {
        const existingUser = await db.query.users.findFirst({ where: eq(users.email, fixedName) });
        if (existingUser)
            return c.json({ message: 'Email already used.' }, HTTPStatus.CONFLICT);

        emailVerified = false;
        updatedEmail = fixedName;
    } else {
        emailVerified = email_verified ?? user.email_verified;
    }

    await db.update(users).set({ email: updatedEmail, email_verified: emailVerified }).where(eq(users.id, userId));
    return c.json({ message: 'Success.' }, HTTPStatus.OK);
}

export default OnEmailChange;