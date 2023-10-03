"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const env_mjs_1 = require("~/env.mjs");
const globalForPrisma = globalThis;
exports.prisma = globalForPrisma.prisma ||
    new client_1.PrismaClient({
        log: env_mjs_1.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
if (env_mjs_1.env.NODE_ENV !== "production")
    globalForPrisma.prisma = exports.prisma;
