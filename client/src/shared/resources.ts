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

export const submit = async (model: SAMInputModel) => {
  return wretch("http://localhost:8080/process")
    .post()
    .error(422, err => {
      setLastError({
        msg: ErrorHumanMessageEnum.BadInput,
        additionalDataStr: err.response.body ? JSON.stringify(err.message) : undefined
      })
    })
    .res(res => res.body);
  // try {
  //   const qwe = await axios.post<SubmitResponse>(`http://localhost:8080/process`);
  //   console.log(qwe.data);
  //   return qwe;
  // } catch (e: AxiosError<Error>) {
  //   e.toJSON()
  //   setLastError({msg: ErrorHumanMessageEnum.std})
  //
  //   // console.log(e.toJSON());
  //   // return e.toJSON();
  // }
}