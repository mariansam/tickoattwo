import React, { useState } from 'react';
import { GameState, GridFieldState } from '@prisma/client';


const PATHS = [
    'M 180 10 L 10 10 L 10 190 L 30 165 L 70 140 L 125 127 L 136 85 L 155 43 Z',
    'M 210 12 L 225 20 L 243 39 L 256 64 L 270 108 L 272 125 L 239 120 L 182 120 L 128 125 L 128 125 L 130 108 L 144 64 L 144 64 L 157 39 L 175 20 L 190 12 Z',
    'M 220 10 L 390 10 L 390 190 L 370 165 L 330 140 L 275 127 L 264 85 L 245 43 Z',

    'M 12 210 L 20 225 L 39 243 L 64 256 L 108 270 L 125 272 L 120 239 L 120 182 L 125 128 L 125 128 L 108 130 L 64 144 L 64 144 L 39 157 L 20 175 L 12 190 Z',
    'M 127 127 L 200 120 L 273 127 L 280 200 L 273 273 L 200 280 L 127 273 L 120 200 Z',
    'M 388 210 L 380 225 L 361 243 L 336 256 L 292 270 L 275 272 L 280 239 L 280 182 L 275 128 L 275 128 L 292 130 L 336 144 L 336 144 L 361 157 L 380 175 L 388 190 Z',

    'M 180 390 L 10 390 L 10 210 L 30 235 L 70 260 L 125 273 L 136 315 L 155 357 Z',
    'M 210 388 L 225 380 L 243 361 L 256 336 L 270 292 L 272 275 L 239 280 L 182 280 L 128 275 L 128 275 L 130 292 L 144 336 L 144 336 L 157 361 L 175 380 L 190 388 Z',
    'M 220 390 L 390 390 L 390 210 L 370 235 L 330 260 L 275 273 L 264 315 L 245 357 Z',
];

const CENTER_POINTS = [
    [72, 72],
    [200, 72],
    [400 - 73, 72],

    [72, 200],
    [200, 200],
    [400 - 72, 200],

    [72, 400 - 72],
    [200, 400 - 72],
    [400 - 72, 400 - 72],
];

type GameBoardProps = {
    onButtonClick: (buttonIndex: number) => void,
    grid: GridFieldState[],
};

export const GameBoard: React.FC<GameBoardProps> = (props) => {
    const {
        onButtonClick,
        grid,
    } = props;

    const [hoveredButton, setHoveredButton] = useState<number>();

    const handleClick = () => {
        console.log({hoveredButton})
        if (hoveredButton === undefined)
            return;
        onButtonClick(hoveredButton);
    };

    return (
        <svg
            viewBox="0 0 400 400"
            width={400}
            stroke="black"
            strokeWidth={16}
            fill="transparent"
            onClick={handleClick}
        >
            <g stroke="transparent" strokeWidth={0}>
                {PATHS.map((path, index) => (
                    <path
                        key={index}
                        fill={hoveredButton === index ? 'yellow' : 'transparent'}
                        d={path}
                    />
                ))}
            </g>

            <rect x={8} y={8} width={384} height={384} />
            {/* vertical | */}
            <ellipse cx={200} cy={200} ry={190} rx={80} />
            {/* horizontal -- */}
            <ellipse cx={200} cy={200} ry={80} rx={190} />

            {grid.map((state, index) => (
                <GridFieldIndicator state={state} index={index} key={index} />
            ))}

            <g stroke="transparent" strokeWidth={0} fill="transparent">
                {PATHS.map((path, index) => (
                    <path
                        key={index}
                        onMouseEnter={() => setHoveredButton(index)}
                        onMouseLeave={() => setHoveredButton(undefined)}
                        d={path}
                    />
                ))}
            </g>
        </svg>
    );
};

type GridFieldIndicatorProps = {
    state: GridFieldState,
    index: number,
};

const GridFieldIndicator: React.FC<GridFieldIndicatorProps> = (props) => {
    const {
        state,
        index,
    } = props;

    const coords = CENTER_POINTS[index];
    const [x, y] = coords!;
    const translate = `translate(${x!}, ${y!})`;

    if (state === 'player1in') {
        return (
            <g transform={translate}>
                <RedHorizontalLine />
            </g>
        );
    } else if (state === 'player2in') {
        return (
            <g transform={translate}>
                <BlueVerticalLine />
            </g>
        );
    } else if (state === 'both') {
        return (
            <g transform={translate}>
                <RedHorizontalLine />
                <BlueVerticalLine />
            </g>
        );
    } else {
        return null;
    }
};

const BlueVerticalLine: React.FC = () => {
    return (
        <line x1={0} y1={-34} x2={0} y2={34} stroke="blue" strokeWidth={10} strokeLinecap="round" />
    );
};

const RedHorizontalLine: React.FC = () => {
    return (
        <line x1={-34} y1={0} x2={34} y2={0} stroke="red" strokeWidth={10} strokeLinecap="round" />
    );
};
