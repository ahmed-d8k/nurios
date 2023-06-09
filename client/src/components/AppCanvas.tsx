import {createSignal, onMount} from "solid-js";
import {applyCanvasDrawingColor, applyCanvasBoxColor, setBoxes, boxes} from "~/shared/drawing-state";

const canvasId = "main-canvas";

type HTMLElementEvent<T extends HTMLElement> = MouseEvent & {
  target: T;
}
type CanvasMouseEvent = HTMLElementEvent<HTMLCanvasElement>;

const getUsefulDataFromEvent = (e: CanvasMouseEvent) => ({
  mouseX: e.offsetX,
  mouseY: e.offsetY
})

const [firstPoint, setFirstPoint] = createSignal<[number, number] | null>(null)
const firstPointExists = () => firstPoint() !== null;

export const [canvasCtx, setCanvasCtx] = createSignal<CanvasRenderingContext2D | null>(null);
const [canvasRect, setCanvasRect] = createSignal<DOMRect | null>(null);

const setupDrawing = () => {
  const canvas = document.querySelector<HTMLCanvasElement>(`#${canvasId}`);
  const rect = canvas.getBoundingClientRect();
  const ctx = canvas?.getContext("2d");
  setCanvasCtx(ctx);
  setCanvasRect(rect);

  /* logo drawing */
  // if (ctx) {
  //   ctx.fillStyle = "rgb(200, 0, 0)";
  //   ctx.fillRect(10, 10, 50, 50);
  //
  //   ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
  //   ctx.fillRect(30, 30, 50, 50);
  //
  //   ctx.strokeRect(45, 45, 60, 60);
  // }

  const handleMouseDown = (e: CanvasMouseEvent) => {
    if (e.target.id !== canvasId) return;
    const {mouseX, mouseY} = getUsefulDataFromEvent(e);

    setFirstPoint([mouseX, mouseY]);
    canvas.style.cursor = "crosshair";
  }

  const handleMouseUp = (e: CanvasMouseEvent) => {
    if (e.target.id !== canvasId) return;

    /* if the first point doesn't exist, the user started the click outside the canvas */
    if (!firstPointExists()) return;

    const {mouseX, mouseY} = getUsefulDataFromEvent(e);
    const [startX, startY] = firstPoint();

    const diffX = Math.abs(mouseX - startX);
    const diffY = Math.abs(mouseY - startY);

    if (diffX <= 10 || diffY <= 10) return;

    canvas.style.cursor = "default";
    setBoxes(p => [...p, {
      startX,
      startY,
      width: mouseX - startX,
      height: mouseY - startY
    }]);
    redrawAllBoxes();

    return setFirstPoint(null);
  }

  const handleMouseMove = (e: CanvasMouseEvent) => {
    if (e.target.id != canvasId) return;
    if (!firstPointExists()) return;

    redrawAllBoxes();

    const {mouseX, mouseY} = getUsefulDataFromEvent(e);
    const [startX, startY] = firstPoint();

    /* draw a dashed line with set color while dragging, then reset back to original rectangle style */
    ctx.save();
    ctx.beginPath();
    applyCanvasDrawingColor();
    ctx.setLineDash([6]);
    ctx.strokeRect(startX, startY, mouseX - startX, mouseY - startY);
    ctx.restore();
  }

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.code === "Escape") {
      setFirstPoint(null);
      redrawAllBoxes();
      canvas.style.cursor = "default";
    }
  }

  canvas.addEventListener("mousemove", handleMouseMove, false);
  canvas.addEventListener("mousedown", handleMouseDown, false);
  canvas.addEventListener("mouseup", handleMouseUp, false);

  /* keypress doesn't fire when escape is pressed */
  window.addEventListener("keydown", handleKeyPress, false);
}

const defaultImageData = {
  width: 500,
  height: 300,
  imgData: null as HTMLImageElement | null,
  file: null as string | null
};

export const [imageData, setImageData] = createSignal(defaultImageData);
const setupUpload = () => {
  const inputEle = document.querySelector<HTMLInputElement>("#upload-input");

  const handleImageLoaded = (e) => {
    if (e.target.files.length === 0) return;
    const ctx = canvasCtx();
    if (!ctx) return;

    const file = e.target.files[0]; /* only allow 1 file uploaded */

    const img = new Image();
    img.onload = () => {
      setImageData({
        width: img.width,
        height: img.height,
        imgData: img,
        file: file
      });
      ctx.drawImage(img, 0, 0);
    }
    img.src = URL.createObjectURL(file);
  }

  inputEle.addEventListener("change", handleImageLoaded)
  /* TODO: handle err */
}

/* instead of drawing rectangles on top of the canvas, we redraw after every submitted action
* this allows us to do things like undo, show drawing rectangle, change color, change dimensions, etc. more easily by just manipulating state
* */
const redrawAllBoxes = () => {
  const ctx = canvasCtx();
  const rect = canvasRect();
  if (!ctx || !rect) return;
  const {imgData} = imageData();

  if (!imgData) return console.error("no image data in redrawAllBoxes")

  ctx.clearRect(0, 0, rect.width, rect.height);
  ctx.drawImage(imgData, 0, 0);
  boxes().forEach(box => {
    ctx.beginPath();
    ctx.rect(box.startX, box.startY, box.width, box.height);
    applyCanvasBoxColor();
    ctx.stroke();
  })
}

export const handleResetButton = () => {
  const ctx = canvasCtx();
  if (!ctx) return;

  // @ts-ignore
  ctx.reset();
  setBoxes([]);
}

export const handleUndoButton = () => {
  if (!canvasCtx()) return;

  setBoxes(p => p.slice(0, p.length - 1))
  redrawAllBoxes();
}

export const handleChangeImageButton = () => {
  if (!canvasCtx()) return;
}

export const AppCanvas = () => {
  onMount(() => setupDrawing());
  onMount(() => setupUpload())


  return (
    <>
      <div class={"relative flex justify-center"}>
        <div class={"absolute image-prompt"}>Upload an image to begin</div>
        <canvas
          id={canvasId}
          width={imageData().width}
          height={imageData().height}
          class={"relative rounded-md" + imageData().imgData ? "canvas-shadow-active" : "canvas-shadow-inactive"}
        >
          Image canvas not loaded
        </canvas>
      </div>
    </>
  )
}