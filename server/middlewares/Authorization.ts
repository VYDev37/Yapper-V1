import { MiddlewareHandler } from 'hono';
import { getCookie } from 'hono/cookie';
import { eq } from 'drizzle-orm';

import { users } from '../database/schema';
import db from '../database/pool';

import jwt from 'jsonwebtoken';
import HTTPStatus from '../utilities/HTTPStatus';

const Authorization: MiddlewareHandler = async (c, next) => {
    const token = getCookie(c, 'token');

    if (!token)
        return c.json({ message: 'Unauthorized access. No token provided.' }, HTTPStatus.UNAUTHORIZED);

    try {
        const decoded = jwt.verify(token, Bun.env.JWT_SECRET!);
        if (typeof decoded !== 'object' || !decoded)
            return c.json({ message: 'Forbidden access. Invalid token.' }, HTTPStatus.FORBIDDEN);

        const userRecord = await db.query.users.findFirst({ where: eq(users.id, decoded.id) });
        if (userRecord?.banned_until && userRecord.banned_until > new Date())
            return c.json({ message: `You are banned until ${userRecord.banned_until.toISOString()}` }, HTTPStatus.FORBIDDEN);

        c.set('user', decoded); // Attach user data to request object
        await next();
    } catch (error) {
        return c.json({ message: 'Forbidden access. Invalid token.' }, HTTPStatus.FORBIDDEN);
    }
}

export default Authorization;