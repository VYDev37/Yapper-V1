import { Hono } from "hono";

import RegisterController from "../../controllers/RegisterController";

const RegisterRouter: Hono = new Hono();

RegisterRouter.get('/register', (c) => {
    return c.json({ message: "This is register data." });
});

RegisterRouter.post('/register', RegisterController.Post);

export default RegisterRouter;