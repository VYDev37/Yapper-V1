import { and, eq } from "drizzle-orm";

import db from "../database/pool";
import { serverToken } from "../database/schema";

const GetToken = async (userId: number, item: string, type: string) => {
    const formatted = `${item}|${type}`;

    const token = await db.query.serverToken.findFirst({
        where: and(
            eq(serverToken.userId, userId),
            eq(serverToken.token, formatted)
        )
    });

    if (!token) 
        return null;

    if (token.expiresAt < new Date()) {
        await db.delete(serverToken).where(eq(serverToken.id, token.id));
        return null;
    }

    await db.delete(serverToken).where(eq(serverToken.id, token.id));
    return token;
}

export default GetToken;