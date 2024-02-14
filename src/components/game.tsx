import React from 'react';
import { type PlayerInfo } from '~/types';
import { api } from '~/utils/api';
import { GameBoard } from './game-board';
import { useRouter } from 'next/router';
import { QRCodeSVG } from 'qrcode.react';
import { env } from "~/env.mjs";
import { GameStateView } from './game-state';

type GameProps = {
    slug: string,
    role: 'player1' | 'player2' | 'spectator',
    playerId: string | undefined,
};

export const Game: React.FC<GameProps> = (props) => {
    const {
        slug,
        role,
    } = props;
    const playerId = role !== 'spectator' ? props.playerId : undefined;

    const router = useRouter();

    const trpcContext = api.useContext();
    const gameData = api.example.getGameData.useQuery({
        slug,
    });

    const makeMoveMutation = api.example.makeMove.useMutation();
    const renewGameMutation = api.example.renewGame.useMutation();

    api.example.newGameDataSubscription.useSubscription({
        slug,
    }, {
        onData: (message) => {
            console.log('new data from server', message);
            if (message.type === 'GameUpdated') {
                trpcContext.example.getGameData.setData({ slug }, () => {
                    return {
                        grid: message.grid,
                        state: message.state,
                        lastPos: message.lastPos,
                    };
                });
            } else if (message.type === 'RenewGame') {
                void router.push(`${message.newSlug}`);
            }
        },
    });

    const makeMove = async (buttonIndex: number) => {
        console.log({buttonIndex})
        if (!playerId)
            return;
        await makeMoveMutation.mutateAsync({
            slug,
            playerId,
            buttonIndex,
        });
    };

    const renewGame = async () => {
        await renewGameMutation.mutateAsync({
            slug,
        });
    };

    if (!gameData.data)
        return null;

    return (
        <div className="flex flex-col items-center">
            {gameData.data.state === 'inviting' ? (
                <>
                    <p className="mt-4">Your game code is</p>
                    <p className="text-4xl">{slug}</p>
                    <p className="mt-3">Share it with your opponent to join the game!</p>
                    <p className="mt-1 mb-3">Or let them scan the QR code below</p>
                    <QRCodeSVG value={`${env.NEXT_PUBLIC_FRONTEND}${slug}`} size={240} />
                    <p className="mt-4 mb-1">Or send them this link</p>
                    <div className="flex flex-row align-center gap-1">
                        <p className="font-mono">{env.NEXT_PUBLIC_FRONTEND}{slug}</p>
                        {/*
                        <button type="button" onClick={console.log}>
                            <img src="/copy.svg" width={22} alt="Copy game link" />
                        </button>
                        <button type="button" onClick={console.log}>
                            <img src="/share.svg" width={22} alt="Share game link" />
                        </button>
                        */}
                    </div>
                </>
            ) : (
            <>
                <div className="pt-3 pb-4">
                    <GameStateView role={role} state={gameData.data.state} />
                </div>
                <GameBoard
                    onButtonClick={(buttonIndex) => void makeMove(buttonIndex)}
                    grid={gameData.data.grid}
                    lastPos={gameData.data.lastPos}
                    player={role}
                    state={gameData.data.state}
                />
            </>
            )}
            {gameData.data.state.endsWith('won') && role !== 'spectator' && (
                <button type="button" className="bg-slate-300 border-red-500 border-4 rounded-lg py-2 px-8 mt-3 " onClick={() => void renewGame()}>RENEW GAME</button>
            )}
        </div>
    );
};
