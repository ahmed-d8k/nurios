import {createSignal} from "solid-js";

export const [submissionLoading, setSubmissionLoading] = createSignal<boolean>(false);

interface SubmissionResponse {
  seg: string;
  outline: string;
}

export enum ImageSelectionOption {
  Seg = "Seg",
  Outline = "Outline"
}

/* images returned back from the server after the SAM pipeline has completed processing */
export const [submissionResponseImages, setSubmissionResponseImages] = createSignal<SubmissionResponse | null>(null)

/* what the user selects to see in the response window */
export const [selectedImage, setSelectedImage] = createSignal<ImageSelectionOption>(ImageSelectionOption.Seg)

export const inferSelectedImage  = () => {
  if (selectedImage() === ImageSelectionOption.Seg) return submissionResponseImages()?.seg;
  if (selectedImage() === ImageSelectionOption.Outline) return submissionResponseImages()?.outline;

  return "";
}

export const resetResponseState = () => {
  setSubmissionLoading(false);
  setSubmissionResponseImages(null);
  setSelectedImage(ImageSelectionOption.Seg);
}