import type { Context } from "hono";
import { IsImage } from "../utilities/FileReader";

import fs from "fs";
import path from "path";

import HTTPStatus from "../utilities/HTTPStatus";

export default class FileController {
    static async Post(c: Context) {
        try {
            const formData = await c.req.formData();
            const file = formData.get('file') as File;

            const type: string = c.req.param('type') || '';
            const isProfile: boolean = type === 'profilePic';

            if (!file || !IsImage(file.name))
                return c.json({ message: "No file uploaded." }, HTTPStatus.BAD_REQUEST);

            const buffer = await file.arrayBuffer();

            const fileName: string = `${Date.now()}-${file.name}`;
            const filePath: string = path.join('public/' + (isProfile ? 'profile-pics' : ''), fileName);

            await fs.writeFile(filePath, Buffer.from(buffer), (err) => {
                if (err)
                    console.error(err);
            });

            return c.json({ fileName }, HTTPStatus.OK);
        } catch (err) {
            console.error(err);
            return c.json({ message: "Internal server error." }, HTTPStatus.INTERNAL_SERVER_ERROR);
        }
    }
}