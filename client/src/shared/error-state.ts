import {createSignal} from "solid-js";

export enum ErrorHumanMessageEnum {
  BadInput = "Server received invalid input, but this is unexpected. You can try to refresh the page and try again. ",
  UncaughtError = "An unexpected unknown error occured. "
}

export interface ErrorData {
  msg: ErrorHumanMessageEnum;
  additionalDataStr?: string;
}

export const [lastError, setLastError] = createSignal<ErrorData | null>(null);