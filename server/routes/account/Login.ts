import { Hono } from "hono";

import LoginController from "../../controllers/LoginController";

const LoginRouter: Hono = new Hono();

LoginRouter.post('/login', LoginController.Post);

export default LoginRouter;