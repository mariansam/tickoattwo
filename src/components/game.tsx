import { GameState, GridFieldState } from '@prisma/client';
import type React from 'react';
import { useEffect, useState } from 'react';
import { PlayerInfo } from '~/types';
import { api } from '~/utils/api';
import { useLocalStorage } from '~/utils/utils';

type GameProps = PlayerInfo & {
    slug: string,
};

type LocalData = {
    [key: string]: {
        player1: string,
    },
};

export const Game: React.FC<GameProps> = (props) => {
    const {
        slug,
        role,
    } = props;
    const playerId = role !== 'spectator' ? props.playerId : undefined;

    // const [gameState, setGameState] = useState<GameState>();
    // const [gameGrid, setGameGrid] = useState<GridFieldState[]>();

    const trpcContext = api.useContext();
    const gameData = api.example.getGameData.useQuery({
        slug,
    });

    const makeMoveMutation = api.example.makeMove.useMutation();

    const [subscribed, setSubscribed] = useState(false);
    api.example.newThingSubscription.useSubscription({
        slug,
    }, {
        onData: (message) => {
            console.log('new data from server', message);
            if (message.type === 'GameUpdated') {
                trpcContext.example.getGameData.setData({ slug }, () => {
                    return {
                        grid: message.grid,
                        state: message.state,
                    };
                });
            }
        },
        onStarted: () => {
            setSubscribed(true);
        },
    });

    const makeMove = async (buttonIndex: number) => {
        if (!playerId)
            return;
        await makeMoveMutation.mutateAsync({
            slug,
            playerId,
            buttonIndex,
        });
    };

    return (
        <div>
            <p>Hraješ hru: {slug}</p>
            <p>Role: {role}</p>
            <p>State: {gameData.data?.state}</p>
            <p>ID: {playerId}</p>
            <div>
                <div className="grid gap-4 grid-cols-3 w-fit">
                    {gameData.data?.grid.map((state, index) => (
                        <GameButton
                            key={index}
                            buttonIndex={index}
                            state={state}
                            onClick={() => void makeMove(index)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

type GameButtonProps = {
    buttonIndex: number,
    state: GridFieldState,
    onClick: () => void;
};

const GameButton: React.FC<GameButtonProps> = (props) => {
    const {
        buttonIndex,
        state,
        onClick,
    } = props;

    return (
        <button
            className="flex flex-col justify-center align-center w-20 h-20 text-xl bg-slate-300"
            onClick={onClick}
        >
            <div>{buttonIndex}</div>
            <div>{state}</div>
        </button>
    )
}
