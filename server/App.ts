import { Hono } from 'hono';
import type { Server, ServerWebSocket } from 'bun';

import { connectedSockets } from './variables';

import { cors } from 'hono/cors';
import { serveStatic } from 'hono/bun';

import APIRouters from "./routes";
import AppConfig from './app.config';

import { SocketFetch } from './utilities/Socket';

const App: Hono = new Hono();

type WSData = {
  userId: number;
};

App.use('/public/*', serveStatic({ root: './' }));
App.use('*', cors({
    origin: AppConfig.allowed_origins,
    credentials: true
}));

App.route("/api", APIRouters);

Bun.serve({
    port: AppConfig.server_port,
    fetch: async (req: Request, server: Server) => {
        const res = await SocketFetch(req, server);
        if (res) 
            return res;

        return App.fetch(req);
    },
    websocket: {
        open(ws: ServerWebSocket<WSData>) {
            const userId = ws.data?.userId;
            connectedSockets.set(userId, ws);
            //console.log(`${userId} connected.`);
        },
        message(ws: ServerWebSocket<WSData>, message: string) {
            const userId = ws.data.userId;
            const data = JSON.parse(message.toString());

            console.log(`${userId} sent message: ${data.action} ${data.userId}`);
        },
        close(ws: ServerWebSocket<WSData>) {
            const userId = ws.data?.userId;
            connectedSockets.delete(userId);
            //console.log(`${userId} disconnected.`);
        }
    }
});

console.log(`${AppConfig.app_name} is running on port ${AppConfig.server_port}`);