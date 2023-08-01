import {createSignal} from "solid-js";


const defaultImageData = {
  width: 500,
  height: 300,
  imgData: null as HTMLImageElement | null,
  file: null as string | null
};
export const [uploadedImageData, setUploadedImageData] = createSignal(defaultImageData);
export const resetImageData = () => {
  document.querySelector("#upload-input").value = "";
  setUploadedImageData(defaultImageData)
};

export const imageHasBeenUploaded = () => !!uploadedImageData().imgData