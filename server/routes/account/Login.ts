import { Hono } from "hono";

import LoginController from "../../controllers/LoginController";

const LoginRouter: Hono = new Hono();

LoginRouter.get('/login', (c) => {
    return c.json({ message: "This is login data." });
});

LoginRouter.post('/login', LoginController.Post);

export default LoginRouter;