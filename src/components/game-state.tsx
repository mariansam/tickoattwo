import React from 'react';
import { type GameState } from '@prisma/client';

type GameStateProps = {
    role: 'player1' | 'player2' | 'spectator',
    state: GameState;
}

export const GameStateView: React.FC<GameStateProps> = (props) => {
    const {
        role,
        state,
    } = props;


    if (role !== 'spectator') {
        const oppositePlayer = role === 'player1' ? 'player2' : 'player1';

        switch (true) {
            case state === `${role}plays`:
                return <p className="text-3xl">It&apos;s your turn!</p>;
            case state === `${oppositePlayer}plays`:
                return <p className="text-3xl">Your opponent is playing.</p>;
            case state === `${role}won`:
                return <p className="text-3xl">You&apos;ve won!</p>;
            case state === `${oppositePlayer}won`:
                return <p className="text-3xl">You&apos;ve lost.</p>;
        }
    } else {
        switch (true) {
            case state === 'player1plays':
                return <p className="text-3xl">Red is playing!</p>;
            case state === 'player2plays':
                return <p className="text-3xl">Blue is playing</p>;
            case state === 'player1won':
                return <p className="text-3xl">Red won!</p>;
            case state === 'player2won':
                return <p className="text-3xl">Blue won!</p>;
        }
    }

    return null;
};
