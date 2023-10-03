"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const next_1 = require("@trpc/server/adapters/next");
const env_mjs_1 = require("~/env.mjs");
const trpc_1 = require("~/server/api/trpc");
const root_1 = require("~/server/api/root");
// export API handler
exports.default = (0, next_1.createNextApiHandler)({
    router: root_1.appRouter,
    createContext: trpc_1.createTRPCContext,
    onError: env_mjs_1.env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(`❌ tRPC failed on ${path !== null && path !== void 0 ? path : "<no-path>"}: ${error.message}`);
        }
        : undefined,
});
