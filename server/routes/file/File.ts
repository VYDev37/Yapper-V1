import { Hono } from "hono";

import Authorization from "../../middlewares/Authorization";
import FileController from "../../controllers/FileController";

const FileRouter = new Hono();
FileRouter.post('/upload-file/:type?', Authorization, FileController.Post);

export default FileRouter;