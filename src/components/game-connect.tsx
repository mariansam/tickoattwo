import React, { useEffect, useState } from 'react';
import { type LocalData } from '~/types';
import { api } from '~/utils/api';
import { useLocalStorage } from '~/utils/utils';
import { Game } from './game';

type GameConnectProps = {
    slug: string,
};

const GameConnect: React.FC<GameConnectProps> = (props) => {
    const {
        slug,
    } = props;

    const connectPlayerMutation = api.example.connectPlayer.useMutation();

    const [localData, setLocalData] = useLocalStorage<LocalData>('tickoattwo', { });
    const defaultPlayerInfo = localData[slug];

    const [playerRole, setPlayerRole] = useState(defaultPlayerInfo?.role);
    const [playerId, setPlayerId] = useState(defaultPlayerInfo?.role !== 'spectator' ? defaultPlayerInfo?.playerId : undefined);

    useEffect(() => {
        if (playerId && playerRole)
            return;  // we were already connected

        void (async () => {
            const playerInfo = await connectPlayerMutation.mutateAsync({ slug });
            if (!playerInfo)
                return;  // something went wrong

            setLocalData({ ...localData, [slug]: playerInfo });
            setPlayerRole(playerInfo.role);
            setPlayerId(playerInfo.playerId);
        })();
    }, []);

    if (!playerRole || (!playerId && playerRole !== 'spectator'))
        return null;

    return (
        <Game slug={slug} role={playerRole} playerId={playerId} />
    );
};

export default GameConnect;
