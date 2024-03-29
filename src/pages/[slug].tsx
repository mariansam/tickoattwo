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
        slug: string,
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
                slug: game.slug,
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
                <title>{props.seo?.slug ? `TickoaTTwo – ${props.seo.slug}` : 'TickoaTTwo'}</title>
                <meta name="description" content="Generated by create-t3-app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main>
                <GameConnectDynamic key={slug} slug={slug} />
            </main>
        </>
    );
};

export default GamePage;
