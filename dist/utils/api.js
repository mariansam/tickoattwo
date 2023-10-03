"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
/**
 * This is the client-side entrypoint for your tRPC API. It is used to create the `api` object which
 * contains the Next.js App-wrapper, as well as your type-safe React Query hooks.
 *
 * We also create a few inference helpers for input and output types.
 */
const client_1 = require("@trpc/client");
const next_1 = require("@trpc/next");
const superjson_1 = __importDefault(require("superjson"));
const wsLink_1 = require("@trpc/client/links/wsLink");
const getBaseHttpUrl = () => {
    var _a;
    if (typeof window !== "undefined")
        return ""; // browser should use relative url
    if (process.env.VERCEL_URL)
        return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
    return `http://localhost:${(_a = process.env.PORT) !== null && _a !== void 0 ? _a : 3000}`; // dev SSR should use localhost
};
const getBaseWebsocketUrl = () => {
    // if (typeof window !== "undefined") return ""; // browser should use relative url
    // if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
    // return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
    return "ws://localhost:3001";
};
const getEndingLink = (ctx) => {
    if (typeof window === 'undefined') {
        return (0, client_1.httpBatchLink)({
            url: `${getBaseHttpUrl()}/api/trpc`,
            headers() {
                if (ctx === null || ctx === void 0 ? void 0 : ctx.req) {
                    // on ssr, forward client's headers to the server
                    return {
                        ...ctx.req.headers,
                        'x-ssr': '1',
                    };
                }
                return {};
            },
        });
    }
    const client = (0, wsLink_1.createWSClient)({
        url: getBaseWebsocketUrl(),
    });
    return (0, wsLink_1.wsLink)({
        client,
    });
};
/** A set of type-safe react-query hooks for your tRPC API. */
exports.api = (0, next_1.createTRPCNext)({
    config({ ctx }) {
        return {
            /**
             * Transformer used for data de-serialization from the server.
             *
             * @see https://trpc.io/docs/data-transformers
             */
            transformer: superjson_1.default,
            /**
             * Links used to determine request flow from client to server.
             *
             * @see https://trpc.io/docs/links
             */
            links: [
                (0, client_1.loggerLink)({
                    enabled: (opts) => process.env.NODE_ENV === "development" ||
                        (opts.direction === "down" && opts.result instanceof Error),
                }),
                getEndingLink(ctx),
                // httpBatchLink({
                //     url: `${getBaseUrl()}/api/trpc`,
                // }),
            ],
        };
    },
    /**
     * Whether tRPC should await queries when server rendering pages.
     *
     * @see https://trpc.io/docs/nextjs#ssr-boolean-default-false
     */
    ssr: false,
});
