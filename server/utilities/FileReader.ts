import path from "path";
import { existsSync } from "fs";

export const IsImage = (filename: string) => filename.endsWith('.jpeg') || filename.endsWith('jpg') || filename.endsWith('png')

export const FileExist = (fileName: string) => existsSync(path.join('public/' + fileName));
