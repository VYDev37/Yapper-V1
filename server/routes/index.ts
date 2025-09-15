import { Hono } from 'hono';

import { LoginRouter, RegisterRouter } from './account';
import { UserRouter, ModerationRouter, PostRouter } from './user';
import { FileRouter } from './file';
import { MailRouter } from './system';

const APIRouters: Hono = new Hono();

APIRouters.route('/', LoginRouter);
APIRouters.route('/', RegisterRouter);
APIRouters.route('/', UserRouter);
APIRouters.route('/', PostRouter);
APIRouters.route('/', FileRouter);
APIRouters.route('/', ModerationRouter);
APIRouters.route('/', MailRouter);

export default APIRouters;