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

    const self = await db.query.users.findFirst({ where: eq(users.id, userId) });
    const existingUser = await db.query.users.findFirst({ where: eq(users.username, username) });

    //console.log(existingUser?.username, username, self?.username, username === self?.username?.trim().toLowerCase());

    if (existingUser && self?.username?.trim().toLowerCase() !== username)
        return c.json({ message: 'Username or email already used.' }, HTTPStatus.CONFLICT);

    await db.update(users).set({ username: username }).where(eq(users.id, userId));

    return c.json({ message: 'Success.' }, HTTPStatus.OK);
}

export default OnUsernameChange;