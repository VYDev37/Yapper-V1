import { Hono } from "hono";

import Authorization from "../../middlewares/Authorization";
import ModerationController from "../../controllers/ModerationController";

const ModerationRouter: Hono = new Hono();

ModerationRouter.get('/get-reports', Authorization, ModerationController.GetReports);

ModerationRouter.post('/add-block/:id', Authorization, ModerationController.BlockUser);
ModerationRouter.post('/add-follower/:id', Authorization, ModerationController.AddFollow);
ModerationRouter.post('/add-report/:type', Authorization, ModerationController.AddReport);
ModerationRouter.post('/add-ban', Authorization, ModerationController.BanUser);

ModerationRouter.patch('/approve-verification-request/:id', Authorization, ModerationController.ApproveRequest);

export default ModerationRouter;