"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServerAuthSession = exports.authOptions = void 0;
const next_auth_1 = require("next-auth");
const prisma_adapter_1 = require("@next-auth/prisma-adapter");
const db_1 = require("~/server/db");
/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
exports.authOptions = {
    callbacks: {
        session({ session, user }) {
            if (session.user) {
                session.user.id = user.id;
                // session.user.role = user.role; <-- put other properties on the session here
            }
            return session;
        },
    },
    adapter: (0, prisma_adapter_1.PrismaAdapter)(db_1.prisma),
    providers: [
    // DiscordProvider({
    //     clientId: env.DISCORD_CLIENT_ID,
    //     clientSecret: env.DISCORD_CLIENT_SECRET,
    // }),
    // CredentialsProvider({
    //     // The name to display on the sign in form (e.g. 'Sign in with...')
    //     name: 'Credentials',
    //     // The credentials is used to generate a suitable form on the sign in page.
    //     // You can specify whatever fields you are expecting to be submitted.
    //     // e.g. domain, username, password, 2FA token, etc.
    //     // You can pass any HTML attribute to the <input> tag through the object.
    //     credentials: {
    //         username: { label: "Username", type: "text", placeholder: "jsmith" },
    //     },
    //     async authorize(credentials, req) {
    //         // You need to provide your own logic here that takes the credentials
    //         // submitted and returns either a object representing a user or value
    //         // that is false/null if the credentials are invalid.
    //         // e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
    //         // You can also use the `req` object to obtain additional parameters
    //         // (i.e., the request IP address)
    //         let user: any;
    //         if (credentials?.username == 'test') {
    //             return { login: true };
    //         }
    //         return null;
    //     }
    // })
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
    ],
};
/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
const getServerAuthSession = (ctx) => {
    return (0, next_auth_1.getServerSession)(ctx.req, ctx.res, exports.authOptions);
};
exports.getServerAuthSession = getServerAuthSession;
