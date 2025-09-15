import { Hono } from "hono";

import RegisterController from "../../controllers/RegisterController";

const RegisterRouter: Hono = new Hono();

RegisterRouter.post('/register', RegisterController.Post);

export default RegisterRouter;