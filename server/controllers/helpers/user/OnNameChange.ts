import type { Context } from "hono";
import { eq } from "drizzle-orm";

import HTTPStatus from "../../../utilities/HTTPStatus";
import { NoSpecialChar } from "../../../utilities/Text";

import db from "../../../database/pool";
import { users } from "../../../database/schema";

const OnNameChange = async (c: Context, body: any, userId: number) => {
    const fullName: string = body.full_name;
    const fixedName = fullName?.trim().toLowerCase();

    if (fixedName.length < 1 || fixedName.length > 30 || !NoSpecialChar(fullName, true))
        return c.json({ message: "Full name must only consists of 1-30 characters and no special characters except space." }, HTTPStatus.CONFLICT);

    await db.update(users).set({ full_name: fullName }).where(eq(users.id, userId));

    return c.json({ message: 'Success.' }, HTTPStatus.OK);
}

export default OnNameChange;