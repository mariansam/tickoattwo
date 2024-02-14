export type GameProps = {
    slug: string,
};

export type PlayerInfo = {
    role: 'player1' | 'player2',
    playerId: string,
} | {
    role: 'spectator',
    playerId: undefined,
}

export type LocalData = Record<string, PlayerInfo>;
