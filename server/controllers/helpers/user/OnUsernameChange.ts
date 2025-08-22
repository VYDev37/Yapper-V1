import type { Context } from "hono";
import { eq } from "drizzle-orm";

import HTTPStatus from "../../../utilities/HTTPStatus";

import { NoSpecialChar } from "../../../utilities/Text";

import db from "../../../database/pool";
import { users } from "../../../database/schema";

interface UsernameChangeBody {
    username: string;
}

const OnUsernameChange = async (c: Context, body: UsernameChangeBody, userId: number) => {
    const username: string = body.username?.trim().toLowerCase();

    if (username.length < 3 || username.length > 18 || !NoSpecialChar(username))
        return c.json({ message: "Username must only consists of 3-18 characters and no special character." }, HTTPStatus.CONFLICT);

    const existingUser = await db.query.users.findFirst({ where: eq(users.username, username) });

    if (existingUser)
        return c.json({ message: 'Username or email already used.' }, HTTPStatus.CONFLICT);

    await db.update(users).set({ username: username }).where(eq(users.id, userId));

    return c.json({ message: 'Success.' }, HTTPStatus.OK);
}

export default OnUsernameChange;