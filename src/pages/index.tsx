import { type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { useRef } from "react";

const Home: NextPage = () => {
    const router = useRouter();

    const createNewGameMutation = api.example.createNewGame.useMutation();

    const sendMessage = async () => {
        const newGame = await createNewGameMutation.mutateAsync();
        await router.push(`/${newGame.slug}`);
    };

    const gameInputRef = useRef<HTMLInputElement | null>(null);

    const connectToGame = async () => {
        if (!gameInputRef.current)
            return;

        const gameInput = gameInputRef.current.value;
        const gameSlug = gameInput.replace(/.*\//g, '');
        console.log({gameInput, gameSlug})
        await router.push(`/${gameSlug}`);
    };

    return (
        <>
            <Head>
                <title>Create T3 App</title>
                <meta name="description" content="Generated by create-t3-app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className='flex flex-col items-center'>
                <div className='flex flex-col max-w-lg mx-5'>
                    <button className="bg-slate-300 border border-slate-500 m-4 p-2" onClick={() => void sendMessage()}>SEND</button>
                    <input ref={gameInputRef} type="text" className="bg-blue-200 border-5 text-xl rounded-xl border-red-500 px-4 py-2" />
                    <button className="bg-slate-300 border border-slate-500 m-4 p-2" onClick={() => void connectToGame()}>CONNECT</button>
                </div>
            </main>
        </>
    );
};

export default Home;
