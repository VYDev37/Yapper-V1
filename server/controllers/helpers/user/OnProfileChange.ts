import type { Context } from "hono";

import { IsImage } from "../../../utilities/FileReader";
import HTTPStatus from "../../../utilities/HTTPStatus";

import db from "../../../database/pool";
import { eq } from "drizzle-orm";
import { users } from "../../../database/schema";

interface ProfileChangeBody {
    profileUrl: string;
}

const OnProfileChange = async (c: Context, body: ProfileChangeBody, userId: number) => {
    const profileUrl: string = body.profileUrl?.trim().toLowerCase();

    if (!IsImage(profileUrl)) 
        return c.json({ message: "No file uploaded." }, HTTPStatus.BAD_REQUEST);

    await db.update(users).set({ profileUrl }).where(eq(users.id, userId));

    return c.json({ message: 'Success.' }, HTTPStatus.OK);
}

export default OnProfileChange;