import type { Server, ServerWebSocket } from 'bun';
import { eq } from 'drizzle-orm';

import jwt from "jsonwebtoken";
import HTTPStatus from './HTTPStatus';

import db from '../database/pool';
import { users } from '../database/schema';

const GetCookieFromHeader = (cookieHeader: string | null, name: string) => {
    if (!cookieHeader)
        return null;

    const cookies = cookieHeader.split(";").map(c => c.trim().split("="));
    const found = cookies.find(([key]) => key === name);

    return found ? decodeURIComponent(found[1]) : null;
}

export const SocketFetch = async (req: Request, server: Server) => {
    if (req.headers.get("upgrade") === "websocket") {
        const cookieHeader = req.headers.get("cookie");
        const token = GetCookieFromHeader(cookieHeader, "token");

        if (!token)
            return new Response("Unauthorized.", { status: HTTPStatus.UNAUTHORIZED });

        try {
            const decoded = jwt.verify(token, Bun.env.JWT_SECRET!) as { id: number };
            const userRecord = await db.query.users.findFirst({ where: eq(users.id, decoded.id) });

            if (userRecord?.banned_until && userRecord.banned_until > new Date()) 
                return new Response(`Banned until ${userRecord.banned_until.toISOString()}`, { status: HTTPStatus.FORBIDDEN });

            server.upgrade(req, { data: { userId: decoded.id } });
            return;
        } catch (err) {
            console.error(err);
            return new Response("Internal server error.", { status: HTTPStatus.INTERNAL_SERVER_ERROR });
        }
    }
}