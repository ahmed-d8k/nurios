import {
  boxColor,
  boxes,
  DEFAULT_BOX_COLOR,
  DEFAULT_DRAWING_COLOR, drawingColor,
  noBoxesDrawn,
  setBoxColor,
  setDrawingColor
} from "~/shared/drawing-state";
import {handleChangeImageButton, handleResetButton, handleUndoButton} from "~/components/AppCanvas";
import {createEffect, JSXElement, onMount} from "solid-js";
import {submitRequest} from "~/shared/resources";
import {ColorIcon, ResetIcon, SubmitIcon, UndoIcon, UploadIcon} from "~/components/Icons";
import {imageHasBeenUploaded, uploadedImageData} from "~/shared/upload-state";
import {JSX} from "solid-js/h/jsx-runtime";


const ColorButton = ({id, label, onChange, defaultColor}: {
  id: string,
  label: string,
  onChange: any,
  defaultColor: string
}) =>
  (
    <div class={"flex flex-col items-center"}>
      <input
        type="color"
        id={id}
        name={id}
        onchange={onChange}
        value={defaultColor}
      />
      <label for={id} class={"text-neutral-500"}>{label}</label>
    </div>
  )

const ToolBarButton = (props: {
  icon: JSXElement,
  label: string,
  onClick: Function,
  flexibleWidth?: boolean
  style?: string | JSX.CSSProperties | undefined;
}) => {
  return (
    <button classList={{
      "tool-button": true,
      "cursor-pointer": true,
      "flexible": props.flexibleWidth
    }} onclick={props.onClick} style={props.style}>
      {props.icon}
      <label class={"text-neutral-400 hover:text-sky-600 cursor-pointer mt-0.5"}>{props.label}</label>
    </button>
  )
}

const SubmitButton = () => {
  return (
    <button
      class={"flex items-center gap-2 bg-green-600 disabled:bg-neutral-700 rounded-sm p-2 duration-300"}
      onclick={_ => submitRequest({
        intro: "placeholder intro msg",
        boxes: boxes(),
        file: uploadedImageData().file
      })}
      // disabled={noBoxesDrawn()}
    >
      <span>Submit</span>
      <SubmitIcon/>
    </button>
  );
}

const UploadImageButton = () => {
  let inputEl: HTMLInputElement | undefined;

  const clickyclicky = () => {
    inputEl?.click();
  }

  return (
    <>
      <input
        ref={inputEl}
        onclick={handleChangeImageButton}
        type={"file"}
        accept={"image/*"}
        id={"upload-input"}
        class={"w-32 hidden"}
      />
      <ToolBarButton
        icon={<UploadIcon/>}
        label={imageHasBeenUploaded() ? "Change Image" : "Upload Image"}
        onClick={() => clickyclicky()}
        flexibleWidth={true}
      />
    </>
  );
}

export const ToolBar = () => {
  let drawingColorInputEl: HTMLInputElement | undefined;
  let boxColorInputEl: HTMLInputElement | undefined;


  return (
    <div class={"text-white text-md flex justify-center gap-4 items-center"}>
      <UploadImageButton/>
      <div class={"flex"}>
        <input
          type="color"
          id={"drawing-color"}
          name={"drawing-color-input"}
          onchange={e => setDrawingColor(e.target.value)}
          value={drawingColor()}
          class={"w-0 h-0 -z-50"}
          ref={drawingColorInputEl}
        />
        <ToolBarButton
          icon={<ColorIcon style={{"color": drawingColor()}}/>}
          label={"Drawing"}
          onClick={() => drawingColorInputEl?.click()}
          style={{"border-color": drawingColor()}}
        />
      </div>
      <div class={"flex"}>
        <input
          type="color"
          id={"box-color"}
          name={"box-color-input"}
          onchange={e => setBoxColor(e.target.value)}
          value={boxColor()}
          class={"w-0 h-0 -z-50"}
          ref={boxColorInputEl}
        />
        <ToolBarButton
          icon={<ColorIcon style={{"color": boxColor()}}/>}
          label={"Box"}
          onClick={() => boxColorInputEl?.click()}
          style={{"border-color": boxColor()}}
        />
      </div>
      <ToolBarButton
        icon={<UndoIcon/>}
        label={"Undo"}
        onClick={handleUndoButton}
      />
      <ToolBarButton
        icon={<ResetIcon cls={"text-lg"}/>}
        label={"Reset"}
        onClick={handleResetButton}
      />
      <SubmitButton/>
    </div>
  );
}