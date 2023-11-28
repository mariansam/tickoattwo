import React from 'react';
import { GameState, GridFieldState } from '@prisma/client';
import { useEffect, useRef, useState } from 'react';
import { PlayerInfo } from '~/types';
import { api } from '~/utils/api';
import { useLocalStorage } from '~/utils/utils';
import { GameBoard } from './game-board';

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
                    };
                });
            }
        },
        onStarted: () => {
            setSubscribed(true);
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

    return (
        <div className="flex flex-col items-center">
            <p>Hraješ hru: {slug}</p>
            <p>Role: {role}</p>
            <p>State: {gameData.data?.state}</p>
            <p>ID: {playerId}</p>
            <div>
                {gameData.data && (
                    <GameBoard onButtonClick={(buttonIndex) => void makeMove(buttonIndex)} grid={gameData.data.grid} />
                )}
            </div>
        </div>
    );
};
