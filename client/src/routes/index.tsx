import {A} from "solid-start";
import {AppCanvas} from "~/components/AppCanvas";
import {ToolBar} from "~/components/ToolBar";
import {ErrorMenu} from "~/components/ErrorMenu";
import {lastError} from "~/shared/error-state";
import {pingRequest} from "~/shared/resources";
import {onMount} from "solid-js";

export default function Home() {
  onMount(() => pingRequest())


  return (
    <div class="text-center flex flex-col items-center flex-auto">
      <main class={"flex flex-col"}>
        <div class={"flex flex-col mb-24"}>
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
          {!!lastError() && <ErrorMenu />}
          <ToolBar />
        </div>
        <AppCanvas/>
      </main>
    </div>
  );
}