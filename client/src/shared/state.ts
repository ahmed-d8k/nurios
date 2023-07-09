import {createEffect, createSignal} from "solid-js";
import {canvasCtx} from "~/components/AppCanvas";

const DEFAULT_DRAWING_COLOR = "#FF0800";
const DEFAULT_BOX_COLOR = "#000000";
export const [drawingColor, setDrawingColor] = createSignal<string>(DEFAULT_DRAWING_COLOR);
export const [boxColor, setBoxColor] = createSignal<string>(DEFAULT_BOX_COLOR);

const setStrokeStyle = (color: string) => {
  const ctx = canvasCtx();
  if (!ctx) return;
  ctx.strokeStyle = color;
}
export const applyCanvasBoxColor = (color: string | undefined = boxColor()) => setStrokeStyle(color);
export const applyCanvasDrawingColor = (color: string | undefined = drawingColor()) => setStrokeStyle(color);

createEffect(() => {
  console.log("The color is now", drawingColor());
});