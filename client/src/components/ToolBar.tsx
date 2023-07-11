import {DEFAULT_BOX_COLOR, DEFAULT_DRAWING_COLOR, noBoxesDrawn, setBoxColor, setDrawingColor} from "~/shared/state";
import {handleChangeImageButton, handleResetButton, handleUndoButton} from "~/components/AppCanvas";
import {createEffect, createResource, createSignal, JSXElement, onMount} from "solid-js";
import {submit} from "~/shared/resources";
import {ResetIcon, SubmitIcon, UndoIcon} from "~/components/Icons";


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

const ToolBarButton = ({icon, label, onClick}: {
  icon: JSXElement,
  label: string,
  onClick: Function
}) => {
  return (
    <button class={"tool-button cursor-pointer"} onclick={onClick}>
      {icon}
      <label class={"text-neutral-500 hover:text-sky-600 cursor-pointer"}>{label}</label>
    </button>
  )
}

const SubmitButton = () =>
  (
    <button
      class={"flex items-center gap-2 bg-green-600 disabled:bg-neutral-700 rounded-sm p-2 duration-300"}
      onclick={_ => submit()}
      disabled={noBoxesDrawn()}
    >
      <span>Submit</span>
      <SubmitIcon/>
    </button>
  )

export const ToolBar = () => {


  return (
    <div class={"text-white text-md flex justify-center gap-4 items-start"}>
      <ColorButton
        id={"drawing-color"}
        label={"Drawing"}
        defaultColor={DEFAULT_DRAWING_COLOR}
        onChange={(e) => setDrawingColor(e.target.value)}
      />
      <ColorButton
        id={"box-color"}
        label={"Box"}
        defaultColor={DEFAULT_BOX_COLOR}
        onChange={(e) => setBoxColor(e.target.value)}
      />
      <div class={"mt-4 gap-4 flex text-center"}>
        <input
          onclick={handleChangeImageButton}
          type={"file"}
          accept={"image/*"}
          id={"upload-input"}
          class={"w-32"}
        >
          Change Image
        </input>
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