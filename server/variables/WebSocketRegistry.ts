import type { ServerWebSocket } from "bun";

export const connectedSockets = new Map<number, ServerWebSocket<any>>();