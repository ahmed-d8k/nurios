import {createSignal} from "solid-js";

export enum ErrorHumanMessageEnum {
  BadInput = "Server received invalid input, but this is unexpected. Please open an issue on GitHub. You can try to refresh the page and try again. "
}

export interface ErrorData {
  msg: ErrorHumanMessageEnum;
  additionalDataStr?: string;
}
export const [lastError, setLastError] = createSignal<ErrorData | null>(null);