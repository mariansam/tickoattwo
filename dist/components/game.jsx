"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const react_1 = require("react");
const api_1 = require("~/utils/api");
const Game = (props) => {
    var _a, _b;
    const { slug, role, } = props;
    const playerId = role !== 'spectator' ? props.playerId : undefined;
    // const [gameState, setGameState] = useState<GameState>();
    // const [gameGrid, setGameGrid] = useState<GridFieldState[]>();
    const trpcContext = api_1.api.useContext();
    const gameData = api_1.api.example.getGameData.useQuery({
        slug,
    });
    const makeMoveMutation = api_1.api.example.makeMove.useMutation();
    const [subscribed, setSubscribed] = (0, react_1.useState)(false);
    api_1.api.example.newThingSubscription.useSubscription({
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
    const makeMove = async (buttonIndex) => {
        if (!playerId)
            return;
        await makeMoveMutation.mutateAsync({
            slug,
            playerId,
            buttonIndex,
        });
    };
    return (<div>
            <p>Hraješ hru: {slug}</p>
            <p>Role: {role}</p>
            <p>State: {(_a = gameData.data) === null || _a === void 0 ? void 0 : _a.state}</p>
            <p>ID: {playerId}</p>
            <div>
                <div className="grid gap-4 grid-cols-3 w-fit">
                    {(_b = gameData.data) === null || _b === void 0 ? void 0 : _b.grid.map((state, index) => (<GameButton key={index} buttonIndex={index} state={state} onClick={() => void makeMove(index)}/>))}
                </div>
            </div>
        </div>);
};
exports.Game = Game;
const GameButton = (props) => {
    const { buttonIndex, state, onClick, } = props;
    return (<button className="flex flex-col justify-center align-center w-20 h-20 text-xl bg-slate-300" onClick={onClick}>
            <div>{buttonIndex}</div>
            <div>{state}</div>
        </button>);
};
