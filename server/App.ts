import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/bun';

import APIRouters from "./routes";
import AppConfig from './app.config';

const App: Hono = new Hono();

App.use('/public/*', serveStatic({ root: './' }));
App.use('*', cors({
    origin: AppConfig.allowed_origins,
    credentials: true
}));

App.route("/api", APIRouters);

Bun.serve({
    port: AppConfig.server_port,
    fetch: App.fetch,
});

console.log(`${AppConfig.app_name} is running on port ${AppConfig.server_port}`);