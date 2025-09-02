import { Hono } from "hono";

import Authorization from "../../middlewares/Authorization";
import ResyncAuth from "../../middlewares/ResyncAuth";
import UserController from "../../controllers/UserController";

const UserRouter: Hono = new Hono();

UserRouter.get('/user', Authorization, (c) => {
    return c.json({ message: "This is user data." });
});

UserRouter.get('/resync-user', Authorization, ResyncAuth);

UserRouter.get('/user-data', Authorization, UserController.GetTokenBase);
UserRouter.get('/user-info/', Authorization, (c) => UserController.GetProfileDB(c, true));
UserRouter.get('/user-info/:username', Authorization, (c) => UserController.GetProfileDB(c, false));

UserRouter.post('/logout', UserController.Logout);

UserRouter.patch('/update-data/:type/:id', Authorization, UserController.UpdateUser);
UserRouter.post('/add-follower/:id', Authorization, UserController.AddFollow);

// mailing
//UserRouter.post('/verify-otp/:type/:otp', Authorization, UserController.VerifyOTP);
//UserRouter.post('/send-mail', Authorization, UserController.Mailer);
UserRouter.post('/send-otp-mail/:type', Authorization, UserController.SendVerificationMail);

// Forget Password
UserRouter.post('/send-reset-password', UserController.SendResetPassword);
UserRouter.post('/reset-password/:id/:token', UserController.ResetPassword);

// Notifications
UserRouter.get('get-notifications', Authorization, UserController.GetNotifications);

export default UserRouter;