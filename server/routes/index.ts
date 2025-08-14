import { Hono } from 'hono';

import LoginRouter from './account/Login';
import RegisterRouter from './account/Register';
import UserRouter from './user/User';
import PostRouter from './user/Post';
import FileRouter from './file/File';

const APIRouters: Hono = new Hono();

APIRouters.route('/', LoginRouter);
APIRouters.route('/', RegisterRouter);
APIRouters.route('/', UserRouter);
APIRouters.route('/', PostRouter);
APIRouters.route('/', FileRouter);

export default APIRouters;