import wretch, {WretchError} from "wretch";
import {ErrorHumanMessageEnum, setLastError} from "~/shared/error-state";
import {appConfig} from "~/shared/config";
import {Base} from "@solidjs/meta";
import {BoxDrawing} from "~/shared/drawing-state";
import {setSubmissionLoading, setSubmissionResponseImages} from "~/shared/response-state";

interface SubmitResponse {
  msg: string;
}

interface SAMInputModelBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface SAMSubmitInput {
  file?: File;
  intro?: string;
  boxes: BoxDrawing[]
}

enum EndpointEnum {
  Ping = "ping", /* used to test to make sure server is alive */
  Process = "process", /* mostly used for testing submit process without file upload */
  Submit = "submit" /* actual submission endpoint */
}


const mode = import.meta.env.MODE;
// @ts-ignore
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

export const processRequest = async (model: SAMSubmitInput) =>
  baseWretch
    .url(EndpointEnum.Process)
    .post(model)
    .json(res => {
      console.log(res);
      console.log("body", res);
      return res;
    })
    .catch(handleGenericErr)

export interface SubmissionResponse {
  "seg_img_path": string,
  "outline_img_path": string
}
export const submitRequest = async (model: SAMSubmitInput) => {
  try {
    setSubmissionLoading(true);

    const url = `${baseUrl}${EndpointEnum.Submit}`;

    const formData = new FormData();

    formData.append("file", model.file)
    // formData.append("data", JSON.stringify({
    //   intro: model.intro,
    //   boxes: model.boxes
    // }));
    formData.append("box_data", JSON.stringify({
      boxes: model.boxes
    }));
    formData.append("intro", "hello testing");

    const response = await fetch(url, {
      method: 'POST',
      body: formData
    });

    const data: SubmissionResponse = await response.json()

    setSubmissionLoading(false);
    setSubmissionResponseImages({
      seg: `${baseUrl}${data.seg_img_path}`,
      outline: `${baseUrl}${data.outline_img_path}`,
    })
    console.log("response", data);
  } catch (e) {
    console.log(e)
  }

}

export const pingRequest = () => {
  baseWretch
    .url(EndpointEnum.Ping)
    .get()
    .json(res => res)
    .catch(err => setLastError({
      msg: ErrorHumanMessageEnum.ServerDown
    }))
}