import {createEffect, createMemo, createSignal} from "solid-js";
import {canvasCtx} from "~/components/AppCanvas";

export const DEFAULT_DRAWING_COLOR = "#FF10F0";
export const DEFAULT_BOX_COLOR = "#39FF14";
export const [drawingColor, setDrawingColor] = createSignal<string>(DEFAULT_DRAWING_COLOR);
export const [boxColor, setBoxColor] = createSignal<string>(DEFAULT_BOX_COLOR);

export interface BoxDrawing {
  startX: number,
  startY: number,
  width: number,
  height: number
}

export const [boxes, setBoxes] = createSignal<BoxDrawing[]>([]);

export const noBoxesDrawn = () => boxes().length === 0;

const setStrokeStyle = (color: string) => {
  const ctx = canvasCtx();
  if (!ctx) return;
  ctx.strokeStyle = color;
}
export const applyCanvasBoxColor = (color: string | undefined = boxColor()) => setStrokeStyle(color);
export const applyCanvasDrawingColor = (color: string | undefined = drawingColor()) => setStrokeStyle(color);