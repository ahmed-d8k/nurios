import wretch, {WretchError} from "wretch";
import {ErrorHumanMessageEnum, setLastError} from "~/shared/error-state";
import {appConfig} from "~/shared/config";

interface SubmitResponse {
  msg: string;
}

interface SAMInputModelBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface SAMInputModel {
  intro?: string;
  boxes: SAMInputModelBox[]
}

enum EndpointEnum {
  Ping = "ping",
  Process = "process"
}


const mode = import.meta.env.MODE;
const baseUrl = appConfig.serverBaseUrl[mode];

const handle422Err = (err: WretchError) => setLastError({
  msg: ErrorHumanMessageEnum.BadInput,
  additionalDataStr: err.response.body ? JSON.stringify(err.message) : undefined
})

const handleGenericErr = (err: WretchError) => setLastError({
  msg: ErrorHumanMessageEnum.UncaughtError,
  additionalDataStr: err.response.body ? JSON.stringify(err.message) : undefined
});

const baseWretch =
  wretch(baseUrl)
    .resolve(_ => _.error(422, handle422Err))

export const submit = async (model: SAMInputModel) =>
  baseWretch
    .url(EndpointEnum.Process)
    .post(model)
    .json(res => {
      console.log(res);
      console.log("body", res);
      return res;
    })
    .catch(handleGenericErr)

export const pingRequest = () => {
  baseWretch
    .url(EndpointEnum.Ping)
    .get()
    .json(res => res)
    .catch(err => setLastError({
      msg: ErrorHumanMessageEnum.ServerDown
    }))
}