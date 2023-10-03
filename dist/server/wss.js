"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("@trpc/server/adapters/ws");
const ws_2 = __importDefault(require("ws"));
const root_1 = require("./api/root");
const trpc_1 = require("./api/trpc");
const wss = new ws_2.default.Server({
    port: 3001,
});
const handler = (0, ws_1.applyWSSHandler)({ wss, router: root_1.appRouter, createContext: trpc_1.createTRPCContext });
wss.on('connection', (ws) => {
    console.log(`➕➕ Connection (${wss.clients.size})`);
    ws.once('close', () => {
        console.log(`➖➖ Connection (${wss.clients.size})`);
    });
});
console.log('✅ WebSocket Server listening on ws://localhost:3001');
process.on('SIGTERM', () => {
    console.log('SIGTERM');
    handler.broadcastReconnectNotification();
    wss.close();
});
