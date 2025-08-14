import { MiddlewareHandler } from 'hono';
import { getCookie } from 'hono/cookie';

import jwt from 'jsonwebtoken';

const Authorization: MiddlewareHandler = async (c, next) => {
    const token = getCookie(c, 'token');

    if (!token)
        return c.json({ message: 'Unauthorized access. No token provided.' }, 401);

    try {
        const decoded = jwt.verify(token, Bun.env.JWT_SECRET!);
        if (typeof decoded !== 'object' || !decoded)
            return c.json({ message: 'Forbidden access. Invalid token.' }, 403);
        
        c.set('user', decoded); // Attach user data to request object
        await next();
    } catch (error) {
        return c.json({ message: 'Forbidden access. Invalid token.' }, 403);
    }
}

export default Authorization;