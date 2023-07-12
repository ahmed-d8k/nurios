import {createSignal} from "solid-js";

export enum ErrorHumanMessageEnum {
  ServerDown = "Server seems to be down currently. You can still play around with the application, but the server won't be able to process your submission. Please try again later and if it persists please submit an issue on GitHub.",
  BadInput = "Server received invalid input, but this is unexpected. You can try to refresh the page and try again. ",
  UncaughtError = "An unexpected unknown error occured. "
}

export interface ErrorData {
  msg: ErrorHumanMessageEnum;
  additionalDataStr?: string;
}

export const [lastError, setLastError] = createSignal<ErrorData | null>(null);