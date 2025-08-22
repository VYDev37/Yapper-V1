import type { Context } from "hono";
import { eq } from "drizzle-orm";

import HTTPStatus from "../../../utilities/HTTPStatus";
import { OnlyNumbers } from '../../../utilities/Text';

import db from "../../../database/pool";
import { users } from "../../../database/schema";

interface EnableSecurityBody {
    security_code: string;
}

const OnEnableSecurity = async (c: Context, body: EnableSecurityBody, userId: number) => {
    const security_code: string = body.security_code?.toLowerCase().trim();

    const userDB = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!userDB || !userDB.email_verified)
        return c.json({ message: "Access forbidden." }, HTTPStatus.FORBIDDEN);
    
    if (userDB.security_code && userDB.security_code.trim() !== "")
        return c.json({ message: "You have already set an 2FA code before." }, HTTPStatus.BAD_REQUEST);

    if (!security_code || security_code.length !== 6 || !OnlyNumbers(security_code))
        return c.json({ message: "Security code must only consists of 6 digits number." }, HTTPStatus.CONFLICT);

    await db.update(users).set({ security_code }).where(eq(users.id, userId));
    return c.json({ message: "Two-Factor Authentication activation success." }, HTTPStatus.OK);
}

export default OnEnableSecurity;