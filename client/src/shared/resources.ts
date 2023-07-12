import wretch from "wretch";
import {ErrorHumanMessageEnum, setLastError} from "~/shared/error-state";

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
  Process = "process"
}

const baseUrl = "http://localhost:8080"

export const submit = async (model: SAMInputModel) =>
  wretch(`${baseUrl}/${EndpointEnum.Process}`)
    .post(model)
    .error(422, err => setLastError({
      msg: ErrorHumanMessageEnum.BadInput,
      additionalDataStr: err.response.body ? JSON.stringify(err.message) : undefined
    }))
    // .res(res => {
    //   console.log(res);
    //   console.log("body", res.body.);
    //   return res.body
    // })
    .json(res => {
      console.log(res);
      console.log("body", res);
      return res;
    })
    .catch(err => setLastError({
      msg: ErrorHumanMessageEnum.UncaughtError,
      additionalDataStr: err.response.body ? JSON.stringify(err.message) : undefined
    }))