import { Hono } from "hono";

import Authorization from "../../middlewares/Authorization";
import MailController from "../../controllers/MailController";

const MailRouter: Hono = new Hono();

// mailing
MailRouter.post('/send-otp-mail/:type', Authorization, MailController.SendVerificationMail);

// Forget Password
MailRouter.post('/send-reset-password', MailController.SendResetPassword);
MailRouter.post('/reset-password/:id/:token', MailController.ResetPassword);

export default MailRouter;