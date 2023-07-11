import {createSignal} from "solid-js";

export enum ErrorHumanMessageEnum {
  std = "zxc555"
}

export interface ErrorData {
  msg: ErrorHumanMessageEnum;
}
export const [lastError, setLastError] = createSignal<ErrorData | null>(null);