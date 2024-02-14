import { observable } from "@trpc/server/observable";
import EventEmitter from "events";
import { z } from "zod";
import { createId as cuid } from '@paralleldrive/cuid2';

import {
    createTRPCRouter,
    publicProcedure,
    tRPCProcudure,
} from "~/server/api/trpc";
import { prisma } from "~/server/db";
import { makeId } from "~/utils/utils";
import { type GameState, type GridFieldState } from "@prisma/client";
import { isGameWon, isMoveValid, updateGrid } from "~/utils/game";

export type MessageType<T extends string> = {
    type: T;
    /** game slug as stored in the database, use undefined for all games */
    slug?: string | undefined;
    /** cuid as stored in the database, use undefined for all players in the game */
    receiver?: string | undefined;
};

export type GameUpdatedMessage = MessageType<'GameUpdated'> & {
    grid: GridFieldState[],
    state: GameState,
    lastPos: number,
};

export type RenewGameMessage = MessageType<'RenewGame'> & {
    newSlug: string,
};

export type GameMessage = RenewGameMessage | GameUpdatedMessage;

const SLUG_LENGTH = 8;

const zodSlug = () => z.string().length(SLUG_LENGTH);

const ee = new EventEmitter();

const sendEvent = (data: GameMessage) => ee.emit('add', data);

export const getGame = async (slug: string) => await prisma.gameSession.findFirst({
    where: {
        slug,
    },
});

export const exampleRouter = createTRPCRouter({
    createNewGame: publicProcedure
        .mutation(async ({ ctx }) => {
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
        .mutation(async ({ input: { slug, playerId, buttonIndex } }) => {
            const game = await getGame(slug);
            if (!game)
                return;
            if (playerId !== game.player1 && playerId !== game.player2)
                return;
            const player = playerId === game.player1 ? 'player1' : 'player2';
            if (game.state !== `${player}plays`)
                return;
            const oppositePlayer = playerId === game.player1 ? 'player2' : 'player1';
            const isValid = isMoveValid(game.grid, buttonIndex, player, game.lastPos);
            if (!isValid)
                return;
            const newGrid = updateGrid(game.grid, buttonIndex, player);
            const hasWon = isGameWon(newGrid);
            const newState: GameState = hasWon ? `${player}won` : `${oppositePlayer}plays`;
            console.log({hasWon, newState})
            sendEvent({
                type: 'GameUpdated',
                slug: game.slug,
                grid: newGrid,
                state: newState,
                lastPos: buttonIndex,
            });
            await prisma.gameSession.update({
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
                lastPos: game.lastPos,
            };
        }),

    newGameDataSubscription: tRPCProcudure
        .input(z.object({
            slug: z.string(),
        }))
        .subscription(({ input }) => {
            return observable<GameMessage>((emit) => {
                console.log('setting up the observable');

                const onNewEvent = (event: GameMessage) => {
                    if (event.slug && event.slug !== input.slug)
                        return;

                    emit.next(event);
                }

                ee.on('add', onNewEvent);

                return () => {
                    ee.off('add', onNewEvent);
                };
            });
        }),

    connectPlayer: publicProcedure
        .input(
            z.object({
                slug: zodSlug(),
            }))
        .mutation(async ({ input: { slug } } ) => {
            console.log('connecting', slug);

            const game = await getGame(slug);
            if (!game)
                return;
            console.log('game', game.id)

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
                        state: 'player1plays',
                    },
                });

                sendEvent({
                    type: 'GameUpdated',
                    slug: game.slug,
                    grid: game.grid,
                    state: 'player1plays',
                    lastPos: -1,
                });

                return { role: 'player2' as const, playerId: newPlayerId };
            } else {
                console.log('as spectator')
                return { role: 'spectator' as const };
            }
        }),

    renewGame: publicProcedure
        .input(
            z.object({
                slug: zodSlug(),
            }))
        .mutation(async ({ ctx, input: { slug } }) => {
            const newSlug = makeId(SLUG_LENGTH);

            await ctx.prisma.gameSession.create({
                data: {
                    slug: newSlug,
                    visible: true,
                },
            });

            sendEvent({
                type: 'RenewGame',
                slug,
                newSlug,
            });
        }),
});
