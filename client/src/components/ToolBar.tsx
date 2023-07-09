import {
  setDrawingColor,
  applyCanvasDrawingColor,
  setBoxColor,
  DEFAULT_BOX_COLOR,
  DEFAULT_DRAWING_COLOR
} from "~/shared/state";

const ColorIcon = () => {
  return (
    <svg fill="none" stroke-width="2" xmlns="http://www.w3.org/2000/svg"
         class="icon icon-tabler icon-tabler-color-filter" width="1em" height="1em" viewBox="0 0 24 24"
         stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" style="overflow: visible;">
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path
        d="M13.58 13.79c.27 .68 .42 1.43 .42 2.21c0 1.77 -.77 3.37 -2 4.46a5.93 5.93 0 0 1 -4 1.54c-3.31 0 -6 -2.69 -6 -6c0 -2.76 1.88 -5.1 4.42 -5.79"></path>
      <path d="M17.58 10.21c2.54 .69 4.42 3.03 4.42 5.79c0 3.31 -2.69 6 -6 6a5.93 5.93 0 0 1 -4 -1.54"></path>
      <path d="M12 8m-6 0a6 6 0 1 0 12 0a6 6 0 1 0 -12 0"></path>
    </svg>
  );
}

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

export const ToolBar = () =>
  (
    <div class={"text-white text-md flex flex-start gap-4"}>
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
    </div>
  )