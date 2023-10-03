import { observable } from "@trpc/server/observable";
import EventEmitter from "events";
import { z } from "zod";
import { createId as cuid } from '@paralleldrive/cuid2';

import {
    createTRPCRouter,
    publicProcedure,
    protectedProcedure,
    tRPCProcudure,
} from "~/server/api/trpc";
import { prisma } from "~/server/db";
import { makeId } from "~/utils/utils";
import { GameState, type GridFieldState } from "@prisma/client";

export type MessageType<T extends string> = {
    type: T;
    /** game slug as stored in the database, use undefined for all games */
    slug?: string | undefined;
    /** cuid as stored in the database, use undefined for all players in the game */
    receiver?: string | undefined;
};

export type PlayerConnectedMessage = MessageType<'PlayerConnected'> & {
    newPlayerId: string,
};

export type PingMessage = MessageType<'Ping'>;

export type GameUpdatedMessage = MessageType<'GameUpdated'> & {
    grid: GridFieldState[],
    state: GameState,
};

export type GameMessage = PlayerConnectedMessage | PingMessage | GameUpdatedMessage;

const SLUG_LENGTH = 8;

const zodSlug = () => z.string().length(SLUG_LENGTH);

const ee = new EventEmitter();

const sendEvent = (data: GameMessage) => ee.emit('add', data);

const getGame = async (slug: string) => await prisma.gameSession.findFirst({
    where: {
        slug,
    },
});

const isValidMove = (grid: GridFieldState[], buttonIndex: number, player: 'player1' | 'player2') => {
    if (buttonIndex < 0 || buttonIndex > 8)
        return false;
    const currentValue = grid[buttonIndex];
    if (currentValue === `${player}in` || currentValue === 'both')
        return false;
    return true;
};

/** assumes isValidMove === true */
const updateGrid = (grid: GridFieldState[], buttonIndex: number, player: 'player1' | 'player2') => {
    const currentValue = grid[buttonIndex]!;
    const newValue = currentValue === 'empty' ? `${player}in` as const : 'both';
    const newGrid = [...grid];
    newGrid[buttonIndex] = newValue;
    return newGrid;
};


export const exampleRouter = createTRPCRouter({
    createNewGame: publicProcedure
        .mutation(async ({ ctx, input }) => {
            console.log('creating new game');

            const slug = makeId(SLUG_LENGTH);

            const newGame = await ctx.prisma.gameSession.create({
                data: {
                    slug,
                    visible: true,
                },
            });

            return newGame;
        }),

    makeMove: publicProcedure
        .input(z.object({
            slug: zodSlug(),
            playerId: z.string(),
            buttonIndex: z.number().min(0).max(8),
        }))
        .mutation(async ({ ctx, input: { slug, playerId, buttonIndex } }) => {
            const game = await getGame(slug);
            if (!game)
                return;
            if (playerId !== game.player1 && playerId !== game.player2)
                return;
            const player = playerId === game.player1 ? 'player1' : 'player2';
            const isValid = isValidMove(game.grid, buttonIndex, player);
            if (!isValid)
                return;
            const newGrid = updateGrid(game.grid, buttonIndex, player);
            sendEvent({
                type: 'GameUpdated',
                slug: game.slug,
                grid: newGrid,
                state: game.state,
            });
            await prisma.gameSession.update({
                where: {
                    id: game.id,
                },
                data: {
                    grid: newGrid,
                },
            });
        }),

    getGameData: publicProcedure
        .input(z.object({
                slug: zodSlug(),
        }))
        .query(async ({ input: { slug }}) => {
            const game = await getGame(slug);
            if (!game)
                return;
            return {
                grid: game.grid,
                state: game.state,
            };
        }),

    newThingSubscription: tRPCProcudure
        .input(z.object({
            slug: z.string(),
        }))
        .subscription(({ ctx, input }) => {
            console.log('setting up a newThingSubscription maybe', input.slug);
            return observable<GameMessage>((emit) => {
                console.log('setting up the observable');

                const onNewEvent = (event: GameMessage) => {
                    if (event.slug && event.slug !== input.slug)
                        return;

                    // if (event.receiver && event.receiver !== input.)

                    if (event.slug === input.slug)
                        emit.next(event);
                }

                ee.on('add', onNewEvent);

                return () => {
                    ee.off('add', onNewEvent);
                };
            });
        }),

    hello: publicProcedure
        .input(z.object({ text: z.string() }))
        .query(({ input }) => {
            return {
                greeting: `Hello ${input.text}`,
            };
        }),

    getAll: publicProcedure.query(({ ctx }) => {
        return ctx.prisma.example.findMany();
    }),

    getSecretMessage: protectedProcedure.query(() => {
        return "you can now see this secret message!";
    }),

    connectPlayer: publicProcedure
        .input(
            z.object({
                slug: zodSlug(),
            }))
        .mutation(async ({input: { slug }}) => {
            console.log('connecting', slug);

            const game = await getGame(slug);
            if (!game)
                return;

            if (!game.player1) {
                const newPlayerId = cuid();

                await prisma.gameSession.update({
                    where: {
                        id: game.id,
                    },
                    data: {
                        player1: newPlayerId,
                    },
                });

                return { role: 'player1' as const, playerId: newPlayerId };
            } else if (!game.player2) {
                const newPlayerId = cuid();

                await prisma.gameSession.update({
                    where: {
                        id: game.id,
                    },
                    data: {
                        player2: newPlayerId,
                    },
                });

                sendEvent({ type: 'PlayerConnected', slug, newPlayerId });

                return { role: 'player2' as const, playerId: newPlayerId };
            } else {
                // visitor wants to connect
            }
        }),
});
