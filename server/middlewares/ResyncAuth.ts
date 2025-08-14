import type { Context } from "hono";

import { setCookie } from "hono/cookie";
import { eq } from "drizzle-orm";

import jwt from "jsonwebtoken";

import db from "../database/pool";
import { users } from "../database/schema";

import HTTPStatus from "../utilities/HTTPStatus";

const ResyncAuth = async (c: Context) => {
    const user = c.get('user');
    if (!user)
        return c.json({ message: "Forbidden." }, HTTPStatus.FORBIDDEN);

    const userRecord = await db.query.users.findFirst({ where: eq(users.id, +user.id) });
    if (!userRecord)
        return c.json({ message: "Forbidden." }, HTTPStatus.FORBIDDEN);

    const userData = {
        id: userRecord.id,
        username: userRecord.username,
        full_name: userRecord.full_name,
        role_id: userRecord.role_id,
        email_verified: userRecord.email_verified,
        createdAt: userRecord.createdAt,
    };

    const token = jwt.sign(userData, process.env.JWT_SECRET!, { expiresIn: '1h' });

    setCookie(c, 'token', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
        path: '/',
        expires: new Date(Date.now() + 1 * 60 * 60 * 1000),
        maxAge: 1 * 60 * 60 * 1000
    });

    return c.json({ user: userData });
}

export default ResyncAuth;