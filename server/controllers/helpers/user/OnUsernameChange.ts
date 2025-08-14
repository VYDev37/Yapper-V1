import type { Context } from "hono";
import { eq } from "drizzle-orm";

import HTTPStatus from "../../../utilities/HTTPStatus";

import { NoSpecialChar } from "../../../utilities/Text";

import db from "../../../database/pool";
import { users } from "../../../database/schema";

const OnUsernameChange = async (c: Context, body: any, userId: number) => {
    const username: string = body.username;
    const fixedName = username?.trim().toLowerCase();

    if (fixedName.length < 3 || fixedName.length > 18 || !NoSpecialChar(fixedName))
        return c.json({ message: "Username must only consists of 3-18 characters and no special character." }, HTTPStatus.CONFLICT);

    const existingUser = await db.query.users.findFirst({ where: eq(users.username, fixedName) });

    if (existingUser)
        return c.json({ message: 'Username or email already used.' }, HTTPStatus.CONFLICT);

    await db.update(users).set({ username: fixedName }).where(eq(users.id, userId));

    return c.json({ message: 'Success.' }, HTTPStatus.OK);
}

export default OnUsernameChange;