import type { Context } from "hono";

import { IsImage } from "../../../utilities/FileReader";
import HTTPStatus from "../../../utilities/HTTPStatus";

import db from "../../../database/pool";
import { eq } from "drizzle-orm";
import { users } from "../../../database/schema";

const OnProfileChange = async (c: Context, body: any, userId: number) => {
    const profileUrl: string = body.profileUrl;
    const fixedName = profileUrl?.trim().toLowerCase();

    if (!IsImage(fixedName)) 
        return c.json({ message: "No file uploaded." }, HTTPStatus.BAD_REQUEST);

    await db.update(users).set({ profileUrl: fixedName }).where(eq(users.id, userId));

    return c.json({ message: 'Success.' }, HTTPStatus.OK);
}

export default OnProfileChange;