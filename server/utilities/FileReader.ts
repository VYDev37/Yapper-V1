import path from "path";
import { existsSync } from "fs";

export const IsImage = (filename: string): boolean => /\.(jpe?g|png)$/i.test(filename);

export const FileExist = (fileName: string): boolean => existsSync(path.join('public/' + fileName));
