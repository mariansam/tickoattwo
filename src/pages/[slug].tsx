import { GetServerSideProps, type NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import dynamic from 'next/dynamic';
import { getGame } from "~/server/api/routers/example";
import { GameSession, GameState } from "@prisma/client";

const GameConnectDynamic = dynamic(() => {
    return import('../components/game-connect');
}, {
    ssr: false,
});

type GamePageProps = {
    seo?: {
        state: GameState,
    },
};

export const getServerSideProps: GetServerSideProps<GamePageProps> = async (context) => {
    const { slug } = context.query;
    if (typeof slug !== 'string') {
        return {
            props: { },
        };
    }

    const game = await getGame(slug);
    if (!game) {
        return {
            props: { },
        };
    }

    return {
        props: {
            seo: {
                state: game.state,
            },
        },
    };
};

const GamePage: NextPage<GamePageProps> = (props) => {
    const router = useRouter();
    const { slug } = router.query;

    if (!slug || typeof slug !== 'string')
        return null;

    return (
        <>
            <Head>
                <title>A game with state {props.seo?.state}</title>
                <meta name="description" content="Generated by create-t3-app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main>
                <GameConnectDynamic slug={slug} />
            </main>
        </>
    );
};

export default GamePage;
