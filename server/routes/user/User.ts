import { Hono } from "hono";

import Authorization from "../../middlewares/Authorization";
import ResyncAuth from "../../middlewares/ResyncAuth";
import UserController from "../../controllers/UserController";

const UserRouter: Hono = new Hono();

UserRouter.get('/user', Authorization, (c) => {
    return c.json({ message: "This is user data." });
});

UserRouter.get('/resync-user', Authorization, ResyncAuth);

UserRouter.get('/get-users/:username?', Authorization, UserController.GetUsers);
UserRouter.get('/user-data', Authorization, UserController.GetTokenBase);
UserRouter.get('/user-info/', Authorization, (c) => UserController.GetProfileDB(c, true));
UserRouter.get('/user-info/:username', Authorization, (c) => UserController.GetProfileDB(c, false));

// Notifications
UserRouter.get('get-notifications', Authorization, UserController.GetNotifications);
UserRouter.put('/read-notification/:id', Authorization, UserController.SetNotificationRead);

UserRouter.patch('/update-data/:type/:id', Authorization, UserController.UpdateUser);

UserRouter.post('/send-verification-request', Authorization, UserController.RequestVerification);
UserRouter.post('/logout', UserController.Logout);

export default UserRouter;