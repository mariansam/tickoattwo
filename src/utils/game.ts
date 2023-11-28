import { type GridFieldState } from "@prisma/client";

/** @param lastPos use -1 for initial move */
export const isMoveValid = (grid: GridFieldState[], buttonIndex: number, player: 'player1' | 'player2', lastPos: number) => {
    if (buttonIndex < 0 || buttonIndex > 8)
        return false;
    if (buttonIndex === lastPos)
        return false;
    const currentValue = grid[buttonIndex];
    if (currentValue === `${player}in` || currentValue === 'both')
        return false;
    return true;
};

/** assumes isMoveValid === true */
export const updateGrid = (grid: GridFieldState[], buttonIndex: number, player: 'player1' | 'player2') => {
    const currentValue = grid[buttonIndex]!;
    const newValue = currentValue === 'empty' ? `${player}in` as const : 'both';
    const newGrid = [...grid];
    newGrid[buttonIndex] = newValue;
    return newGrid;
};

/** call after updateGrid */
export const isGameWon = (grid: GridFieldState[]) => {
    const allBoth = (a: number, b: number, c: number) =>
        grid[a] === 'both' && grid[b] === 'both' && grid[c] === 'both';

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
    if (allBoth(0, 4, 8))
        return true;
    if (allBoth(2, 4, 6))
        return true;

    // :(
    return false;
};
