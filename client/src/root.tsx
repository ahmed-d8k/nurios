// @refresh reload
import {Suspense} from "solid-js";
import {
  useLocation,
  A,
  Body,
  ErrorBoundary,
  FileRoutes,
  Head,
  Html,
  Meta,
  Routes,
  Scripts,
  Title, Link,
} from "solid-start";
import "./app-styles.css";
import {Modal} from "~/components/Modal";
import {submissionLoading, submissionResponseImages, submissionStatus} from "~/shared/response-state";

export default function Root() {
  const location = useLocation();
  const active = (path: string) =>
    path == location.pathname
      ? "border-sky-600"
      : "border-transparent hover:border-sky-600";
  return (
    <Html lang="en">
      <Head>
        <Title>Nurios - SAM Tool</Title>
        <Meta charset="utf-8"/>
        <Meta name="viewport" content="width=device-width, initial-scale=1"/>
      </Head>
      <Body class={"h-screen h-full text-gray-700 bg-neutral-800 flex flex-col justify-between item-center w-screen"}>
        <Suspense>
          <ErrorBoundary>
            {submissionStatus() !== null && <Modal/>}
            <nav class="bg-sky-800 flex space-between items-center w-full">
              <ul class="flex items-center p-3 text-gray-200">
                <li class={`border-b-2 ${active("/nurios/")} mx-1.5 sm:mx-6`}>
                  <A href="/">Home</A>
                </li>
                <li class={`border-b-2 ${active("/about")} mx-1.5 sm:mx-6`}>
                  <A href="/about">About</A>
                </li>
              </ul>
              <ul>
                <li class={"ml-3"}>
                  <a href={"https://github.com/ahmed-d8k/nurios"} target={"_blank"}>
                    <img
                      width="35"
                      height="35"
                      src={"https://upload.wikimedia.org/wikipedia/commons/c/c2/GitHub_Invertocat_Logo.svg"}
                      alt={"GitHub"}
                    />
                  </a>
                </li>
              </ul>
            </nav>
            <Routes>
              <FileRoutes/>
            </Routes>
            <footer class="mb-4 mt-8 flex gap-2 w-full justify-center">
              <span>Home</span>
              <span>{" - "}</span>
              <A href="/about" class="text-sky-600 hover:underline">
                About Page
              </A>
              <span>{" - "}</span>
              <a href={"https://github.com/ahmed-d8k/nurios"} target={"_blank"}>
                <img
                  width="25"
                  height="25"
                  src={"https://upload.wikimedia.org/wikipedia/commons/c/c2/GitHub_Invertocat_Logo.svg"}
                  alt={"GitHub"}
                />
              </a>
            </footer>
          </ErrorBoundary>
        </Suspense>
        <Scripts/>
      </Body>
    </Html>
  );
}