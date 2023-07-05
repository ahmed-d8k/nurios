import {A} from "solid-start";
import {AppCanvas} from "~/components/AppCanvas";

export default function Home() {
  return (
    <div class="text-center flex flex-col items-center flex-auto">
      <main class={"flex flex-col"}>
        <h1 class="max-6-xs text-6xl text-sky-700 font-thin uppercase my-4">
          Capstone
        </h1>
        <p class={"text-md text-neutral-500"}>
          Tips
        </p>
        <ul class={"mb-8"}>
          <li class={"basic-text"}>- Press ctrl + Z to undo last box</li>
          <li class={"basic-text"}>- Press Esc to stop drawing</li>
        </ul>
        <AppCanvas/>
      </main>
    </div>
  );
}