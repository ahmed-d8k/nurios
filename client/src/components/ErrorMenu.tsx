import {lastError} from "~/shared/error-state";

export const ErrorMenu = () => {
  return (
    <aside class={"error-menu"}>
      <p>Error!</p>
      <p>{lastError()?.msg}</p>
    </aside>
  )
}