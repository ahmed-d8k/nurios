import axios from "axios";
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
  try {
    const qwe = await axios.post<SubmitResponse>(`http://localhost:8080/process`);
    console.log(qwe.data);
    return qwe;
  } catch (e) {
    setLastError({msg: ErrorHumanMessageEnum.std})

    // console.log(e.toJSON());
    // return e.toJSON();
  }
}