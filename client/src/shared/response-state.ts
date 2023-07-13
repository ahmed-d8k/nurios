import {createSignal} from "solid-js";

export const [submissionLoading, setSubmissionLoading] = createSignal<boolean>(false);

interface SubmissionResponse {
  seg: string;
  outline: string;
}

const fakeState = {
  seg: "http://localhost:8080/static/9f791da2-fe5a-4022-909b-dea9596648e4_seg.jpg",
  outline: "http://localhost:8080/static/9f791da2-fe5a-4022-909b-dea9596648e4_outline.jpg"
}

export enum ImageSelectionOption {
  Seg = "Seg",
  Outline = "Outline"
}

export const [submissionResponseImages, setSubmissionResponseImages] = createSignal<SubmissionResponse | null>(null)
export const [selectedImage, setSelectedImage] = createSignal<ImageSelectionOption>(ImageSelectionOption.Seg)

export const inferSelectedImage  = () => {
  if (ImageSelectionOption.Seg) return submissionResponseImages()?.seg;
  if (ImageSelectionOption.Outline) return submissionResponseImages()?.outline;

  return "";
}

export const resetResponseState = () => {
  setSubmissionLoading(false);
  setSubmissionResponseImages(null);
  setSelectedImage(ImageSelectionOption.Seg);
}