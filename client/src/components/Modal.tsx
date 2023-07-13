import {
  ImageSelectionOption, resetResponseState,
  selectedImage,
  setSelectedImage,
  submissionLoading,
  submissionResponseImages
} from "~/shared/response-state";
import {createEffect} from "solid-js";
import {CheckIcon} from "~/components/Icons";

export enum ModalContentTypeEnum {
  Processing = "Processing",
  Images = "Images"
}

export const Modal = () => {
  const modalType = submissionLoading() ? ModalContentTypeEnum.Processing : submissionResponseImages() ? ModalContentTypeEnum.Images : null

  if (!modalType) return <></>;

  return (
    <div class={"modal-container"}>
      <div class={"modal-blur"}></div>
      <div class={"modal"}>
        {<ModalContent type={modalType}/>}
      </div>
    </div>
  )
}

const ModalContent = ({type}: { type: ModalContentTypeEnum }) => {
  if (type === ModalContentTypeEnum.Processing) return <ProcessingModalContent/>

  if (type === ModalContentTypeEnum.Images) return <ImagesModalContent/>
  return (
    <>
      <p>There was an error building the contents of this message. Please refresh and try again.</p>
    </>
  )
}

const ProcessingModalContent = () => {
  return (
    <>
      <p>Your request is processing, please wait. This may take 1-2 minutes.</p>
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
            <CheckIcon />
          </button>
        </div>
      </div>
      <img class="display-image"
           src={selectedImage() === ImageSelectionOption.Seg ? submissionResponseImages()?.seg : submissionResponseImages()?.outline}/>
    </div>
  )
}