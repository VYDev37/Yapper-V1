import type { Context } from 'hono';
import { setCookie } from 'hono/cookie';

import { eq, ilike, or } from 'drizzle-orm';
import { users } from '../database/schema';

import db from '../database/pool';
import HTTPStatus from '../utilities/HTTPStatus';

import argon2 from 'argon2';
import jwt from 'jsonwebtoken';

export default class LoginController {
    static async Post(c: Context) {
        try {
            const { username, password } = await c.req.json();

            const verifiedUsername: string = username.trim().toLowerCase();
            const verifiedPassword: string = password.trim();

            const userRecord = await db.query.users.findFirst({
                where: or(
                    eq(users.username, verifiedUsername),
                    ilike(users.email, verifiedUsername)
                )
            });

            if (!userRecord || !verifiedUsername || !verifiedPassword)
                return c.json({ message: 'Invalid username or password.' }, HTTPStatus.UNAUTHORIZED);

            const verifyPassword: boolean = await argon2.verify(userRecord.password, verifiedPassword);

            if (verifyPassword) {
                const userData = {
                    id: userRecord.id,
                    username: userRecord.username,
                    full_name: userRecord.full_name,
                    role_id: userRecord.role_id,
                    email_verified: userRecord.email_verified,
                    createdAt: userRecord.createdAt
                };
                const token = jwt.sign(userData, Bun.env.JWT_SECRET!, { expiresIn: '1h' });
                setCookie(c, 'token', token, {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'Lax',
                    path: '/',
                    expires: new Date(Date.now() + 1 * 60 * 60 * 1000),
                    maxAge: 1 * 60 * 60 * 1000
                });

                return c.json({ message: 'Login successful' }, HTTPStatus.OK);
            } else {
                return c.json({ message: 'Invalid username or password.' }, HTTPStatus.UNAUTHORIZED);
            }
        } catch (err) {
            console.error(err);
            return c.json({ message: "Internal server error." }, HTTPStatus.INTERNAL_SERVER_ERROR);
        }
    }
}