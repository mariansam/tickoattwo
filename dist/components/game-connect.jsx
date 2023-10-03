"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const api_1 = require("~/utils/api");
const utils_1 = require("~/utils/utils");
const game_1 = require("./game");
const GameConnect = (props) => {
    const { slug, } = props;
    const connectPlayerMutation = api_1.api.example.connectPlayer.useMutation();
    const [localData, setLocalData] = (0, utils_1.useLocalStorage)('tickoattwo', {});
    const defaultPlayerInfo = localData[slug];
    const [playerRole, setPlayerRole] = (0, react_1.useState)(defaultPlayerInfo === null || defaultPlayerInfo === void 0 ? void 0 : defaultPlayerInfo.role);
    const [playerId, setPlayerId] = (0, react_1.useState)((defaultPlayerInfo === null || defaultPlayerInfo === void 0 ? void 0 : defaultPlayerInfo.role) !== 'spectator' ? defaultPlayerInfo === null || defaultPlayerInfo === void 0 ? void 0 : defaultPlayerInfo.playerId : undefined);
    (0, react_1.useEffect)(() => {
        if (playerId && playerRole)
            return; // we were already connected
        void (async () => {
            const playerInfo = await connectPlayerMutation.mutateAsync({ slug });
            if (!playerInfo)
                return; // you're a spectator or something went wrong :D
            setLocalData({ ...localData, [slug]: playerInfo });
            setPlayerRole(playerInfo.role);
            setPlayerId(playerInfo.playerId);
        })();
    }, []);
    if (!playerRole || !playerId)
        return null;
    return (<game_1.Game slug={slug} role={playerRole} playerId={playerId}/>);
};
exports.default = GameConnect;
