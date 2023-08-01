import {
  ImageSelectionOption,
  inferSelectedImage,
  queuePosition,
  resetResponseState,
  selectedImage,
  setSelectedImage,
  submissionResponseImages,
  submissionStatus,
  SubmissionStatusEnum
} from "~/shared/response-state";
import {CheckIcon} from "~/components/Icons";
import {Match, Switch} from "solid-js";

export const Modal = () => {
  return (
    <div class={"modal-container"}>
      <div class={"modal-blur"}></div>
      <div class={"modal"}>
        {<ModalContent/>}
      </div>
    </div>
  )
}

const ModalContent = () =>
  (
    <Switch fallback={<p>There was an error building the contents of this message. Please refresh and try again.</p>}>
      <Match when={submissionStatus() === SubmissionStatusEnum.Initializing}>
        <InitializingModalContent/>
      </Match>
      <Match when={submissionStatus() === SubmissionStatusEnum.InQueue}>
        <InQueueModalContent/>
      </Match>
      <Match when={submissionStatus() === SubmissionStatusEnum.Processing}>
        <ProcessingModalContent/>
      </Match>
      <Match when={submissionStatus() === SubmissionStatusEnum.Complete}>
        <ImagesModalContent/>
      </Match>

    </Switch>
  )

const ProcessingModalContent = () => {
  return (
    <>
      <p>Your submission is now processing in the AI model, this may take about 1-2 minutes.</p>
      <p>This page will automatically update.</p>
    </>
  )
}
const InQueueModalContent = () => {
  return (
    <>
      <p>Your position in queue is</p>
      <p>{queuePosition()}</p>
      <p>This page will automatically update.</p>
    </>
  )
}

const InitializingModalContent = () => {
  return (
    <>
      <p>Initializing your request, please wait.</p>
      <p>This page will automatically update.</p>
    </>
  )
}

const ImagesModalContent = () => {

  return (
    <div class={"images-modal"}>
      <div class={"images-modal-top"}>
        <div class={"images-selector-container"}>
          <button
            class={selectedImage() === ImageSelectionOption.Og ? "selected" : ""}
            style={{"background-image": `url("${submissionResponseImages()?.og}")`}}
            onClick={() => setSelectedImage(ImageSelectionOption.Og)}
          />
          <button
            class={selectedImage() === ImageSelectionOption.Seg ? "selected" : ""}
            style={{"background-image": `url("${submissionResponseImages()?.seg}")`}}
            onclick={() => setSelectedImage(ImageSelectionOption.Seg)}
          />
          <button
            class={selectedImage() === ImageSelectionOption.Outline ? "selected" : ""}
            style={{"background-image": `url("${submissionResponseImages()?.outline}")`}}
            onclick={() => setSelectedImage(ImageSelectionOption.Outline)}
          />
          <button class={"done-button"} onclick={() => resetResponseState()}>
            <span>Done</span>
            <CheckIcon/>
          </button>
        </div>
      </div>
      <img
        alt={"Selected image"}
        class="display-image"
        src={inferSelectedImage()}
      />
    </div>
  )
}