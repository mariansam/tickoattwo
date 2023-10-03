"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exampleRouter = exports.getGame = void 0;
const observable_1 = require("@trpc/server/observable");
const events_1 = __importDefault(require("events"));
const zod_1 = require("zod");
const cuid2_1 = require("@paralleldrive/cuid2");
const trpc_1 = require("~/server/api/trpc");
const db_1 = require("~/server/db");
const utils_1 = require("~/utils/utils");
const SLUG_LENGTH = 8;
const zodSlug = () => zod_1.z.string().length(SLUG_LENGTH);
const ee = new events_1.default();
const sendEvent = (data) => ee.emit('add', data);
const getGame = async (slug) => await db_1.prisma.gameSession.findFirst({
    where: {
        slug,
    },
});
exports.getGame = getGame;
/** @param lastPos use -1 for initial move */
const isValidMove = (grid, buttonIndex, player, lastPos) => {
    if (buttonIndex < 0 || buttonIndex > 8)
        return false;
    if (buttonIndex === lastPos)
        return false;
    const currentValue = grid[buttonIndex];
    if (currentValue === `${player}in` || currentValue === 'both')
        return false;
    return true;
};
/** assumes isValidMove === true */
const updateGrid = (grid, buttonIndex, player) => {
    const currentValue = grid[buttonIndex];
    const newValue = currentValue === 'empty' ? `${player}in` : 'both';
    const newGrid = [...grid];
    newGrid[buttonIndex] = newValue;
    return newGrid;
};
/** call after updateGrid */
const isGameWon = (grid) => {
    const allBoth = (a, b, c) => grid[a] === 'both' && grid[b] === 'both' && grid[c] === 'both';
    // rows
    if (allBoth(0, 1, 2))
        return true;
    if (allBoth(3, 4, 5))
        return true;
    if (allBoth(6, 7, 8))
        return true;
    // columns
    if (allBoth(0, 3, 6))
        return true;
    if (allBoth(1, 4, 7))
        return true;
    if (allBoth(2, 5, 8))
        return true;
    // diagonals
    if (allBoth(0, 2, 4))
        return true;
    if (allBoth(2, 4, 6))
        return true;
    // :(
    return false;
};
exports.exampleRouter = (0, trpc_1.createTRPCRouter)({
    createNewGame: trpc_1.publicProcedure
        .mutation(async ({ ctx, input }) => {
        console.log('creating new game');
        const slug = (0, utils_1.makeId)(SLUG_LENGTH);
        const newGame = await ctx.prisma.gameSession.create({
            data: {
                slug,
                visible: true,
            },
        });
        return newGame;
    }),
    makeMove: trpc_1.publicProcedure
        .input(zod_1.z.object({
        slug: zodSlug(),
        playerId: zod_1.z.string(),
        buttonIndex: zod_1.z.number().min(0).max(8),
    }))
        .mutation(async ({ ctx, input: { slug, playerId, buttonIndex } }) => {
        const game = await (0, exports.getGame)(slug);
        if (!game)
            return;
        if (playerId !== game.player1 && playerId !== game.player2)
            return;
        const player = playerId === game.player1 ? 'player1' : 'player2';
        if (game.state !== `${player}plays`)
            return;
        const oppositePlayer = playerId === game.player1 ? 'player2' : 'player1';
        const isValid = isValidMove(game.grid, buttonIndex, player, game.lastPos);
        if (!isValid)
            return;
        const newGrid = updateGrid(game.grid, buttonIndex, player);
        const hasWon = isGameWon(newGrid);
        const newState = hasWon ? `${player}won` : `${oppositePlayer}plays`;
        console.log({ hasWon, newState });
        sendEvent({
            type: 'GameUpdated',
            slug: game.slug,
            grid: newGrid,
            state: newState,
            lastPos: buttonIndex,
        });
        await db_1.prisma.gameSession.update({
            where: {
                id: game.id,
            },
            data: {
                grid: newGrid,
                state: newState,
                lastPos: buttonIndex,
            },
        });
    }),
    getGameData: trpc_1.publicProcedure
        .input(zod_1.z.object({
        slug: zodSlug(),
    }))
        .query(async ({ input: { slug } }) => {
        const game = await (0, exports.getGame)(slug);
        if (!game)
            return;
        return {
            grid: game.grid,
            state: game.state,
        };
    }),
    newThingSubscription: trpc_1.tRPCProcudure
        .input(zod_1.z.object({
        slug: zod_1.z.string(),
    }))
        .subscription(({ ctx, input }) => {
        console.log('setting up a newThingSubscription maybe', input.slug);
        return (0, observable_1.observable)((emit) => {
            console.log('setting up the observable');
            const onNewEvent = (event) => {
                if (event.slug && event.slug !== input.slug)
                    return;
                // if (event.receiver && event.receiver !== input.)
                if (event.slug === input.slug)
                    emit.next(event);
            };
            ee.on('add', onNewEvent);
            return () => {
                ee.off('add', onNewEvent);
            };
        });
    }),
    hello: trpc_1.publicProcedure
        .input(zod_1.z.object({ text: zod_1.z.string() }))
        .query(({ input }) => {
        return {
            greeting: `Hello ${input.text}`,
        };
    }),
    getAll: trpc_1.publicProcedure.query(({ ctx }) => {
        return ctx.prisma.example.findMany();
    }),
    getSecretMessage: trpc_1.protectedProcedure.query(() => {
        return "you can now see this secret message!";
    }),
    connectPlayer: trpc_1.publicProcedure
        .input(zod_1.z.object({
        slug: zodSlug(),
    }))
        .mutation(async ({ input: { slug } }) => {
        console.log('connecting', slug);
        const game = await (0, exports.getGame)(slug);
        if (!game)
            return;
        if (!game.player1) {
            const newPlayerId = (0, cuid2_1.createId)();
            await db_1.prisma.gameSession.update({
                where: {
                    id: game.id,
                },
                data: {
                    player1: newPlayerId,
                },
            });
            return { role: 'player1', playerId: newPlayerId };
        }
        else if (!game.player2) {
            const newPlayerId = (0, cuid2_1.createId)();
            await db_1.prisma.gameSession.update({
                where: {
                    id: game.id,
                },
                data: {
                    player2: newPlayerId,
                    state: 'player1plays',
                },
            });
            // sendEvent({ type: 'PlayerConnected', slug, newPlayerId });
            sendEvent({
                type: 'GameUpdated',
                slug: game.slug,
                grid: game.grid,
                state: 'player1plays',
                lastPos: -1,
            });
            return { role: 'player2', playerId: newPlayerId };
        }
        else {
            // visitor wants to connect
        }
    }),
});
