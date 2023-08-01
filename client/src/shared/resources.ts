import wretch, {WretchError} from "wretch";
import {ErrorHumanMessageEnum, setLastError} from "~/shared/error-state";
import {appConfig} from "~/shared/config";
import {BoxDrawing} from "~/shared/drawing-state";
import {
  setQueuePosition,
  setSubmissionLoading,
  setSubmissionResponseImages,
  setSubmissionStatus,
  SubmissionStatusEnum
} from "~/shared/response-state";

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

export interface ProcessResponse {
  id: string
  og_img_path: string,
  seg_img_path: string,
  outline_img_path: string
}


let ws: WebSocket | undefined;
export const submitRequest = async (model: SAMSubmitInput) => {
  try {
    setSubmissionStatus(SubmissionStatusEnum.Initializing);

    const url = `${baseUrl}${EndpointEnum.Process}`;

    const formData = new FormData();

    formData.append("file", model.file)
    formData.append("box_data", JSON.stringify({
      boxes: model.boxes
    }));
    formData.append("intro", "hello testing");

    const response = await fetch(url, {
      method: 'POST',
      body: formData
    });

    const {id, outline_img_path, seg_img_path, og_img_path}: ProcessResponse = await response.json();

    if (!id) return console.error("Missing id property on data response object.") /* FIXME: (ncn) improve this error handling */

    setSubmissionStatus(SubmissionStatusEnum.InQueue)

    ws = new WebSocket(`ws://localhost:8080/ws?queue_id=${id}`);
    ws.onmessage = (event) => {
      if (event.data === "processing") {
        setSubmissionStatus(SubmissionStatusEnum.Processing);
      }
      if (event.data === "complete") {
        setSubmissionStatus(SubmissionStatusEnum.Complete)
        setSubmissionResponseImages({
          seg: `${baseUrl}${seg_img_path}`,
          outline: `${baseUrl}${outline_img_path}`,
          og: `${baseUrl}${og_img_path}`
        })
      }
      setQueuePosition(Number(event.data))
    };

  } catch (e) {
    setSubmissionLoading(false);
    setLastError({msg: ErrorHumanMessageEnum.UncaughtError})
    console.error(e)
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