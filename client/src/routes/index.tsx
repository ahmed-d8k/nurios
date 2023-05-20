import {A} from "solid-start";
import Counter from "~/components/Counter";
import {AppCanvas} from "~/components/AppCanvas";

export default function Home() {
    return (
        <main class="text-center flex flex-col items-center text-gray-700 p-4 bg-neutral-800">
            <h1 class="max-6-xs text-6xl text-sky-700 font-thin uppercase my-4">
                Capstone
            </h1>
            <p class={"text-md text-neutral-500"}>
                Tips
            </p>
            <ul class={"mb-8"}>
                <li class={"text-sm text-neutral-500"}>- Press ctrl + Z to undo last box</li>
                <li class={"text-sm text-neutral-500"}>- Press Esc to stop drawing</li>
            </ul>
            <AppCanvas/>
            <p class="my-4 flex gap-2">
                <span>Home</span>
                <span>{" - "}</span>
                <A href="/about" class="text-sky-600 hover:underline">
                    About Page
                </A>
                <span>{" - "}</span>
                <img width="25" height="25"
                     src={"https://upload.wikimedia.org/wikipedia/commons/c/c2/GitHub_Invertocat_Logo.svg"}/>
            </p>
        </main>
    );
}