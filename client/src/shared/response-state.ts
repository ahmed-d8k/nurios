import {createSignal} from "solid-js";

export const [submissionLoading, setSubmissionLoading] = createSignal<boolean>(false);

export enum SubmissionStatusEnum {
  InQueue = "in-queue",
  Initializing = "initializing",
  Processing = "processing",
  Complete = "complete"
}
export const [submissionStatus, setSubmissionStatus] = createSignal<SubmissionStatusEnum | null>(null);
export const [queuePosition, setQueuePosition] = createSignal<number | null>(null)

interface SubmissionResponse {
  seg: string;
  outline: string;
  og: string;
}

export enum ImageSelectionOption {
  Seg = "Seg",
  Outline = "Outline",
  Og = "Og"
}

/* images returned back from the server after the SAM pipeline has completed processing */
export const [submissionResponseImages, setSubmissionResponseImages] = createSignal<SubmissionResponse | null>(null)

/* what the user selects to see in the response window */
export const [selectedImage, setSelectedImage] = createSignal<ImageSelectionOption>(ImageSelectionOption.Seg)

export const inferSelectedImage  = () => {
  if (selectedImage() === ImageSelectionOption.Seg) return submissionResponseImages()?.seg;
  if (selectedImage() === ImageSelectionOption.Outline) return submissionResponseImages()?.outline;
  if (selectedImage() === ImageSelectionOption.Og) return submissionResponseImages()?.og;

  return "";
}

export const resetResponseState = () => {
  setSubmissionStatus(null);
  setQueuePosition(null);
  setSubmissionResponseImages(null);
  setSelectedImage(ImageSelectionOption.Seg);
}