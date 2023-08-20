import {createSignal, JSX, onMount, Show} from "solid-js";
import {applyCanvasDrawingColor, applyCanvasBoxColor, setBoxes, getBoxes, transformBoxes} from "~/shared/drawing-state";
import {uploadedImageData, setUploadedImageData, imageHasBeenUploaded, resetImageData} from "~/shared/upload-state";

const canvasId = "main-canvas";

type HTMLElementEvent<T extends HTMLElement> = MouseEvent & {
  target: T;
}
type CanvasMouseEvent = HTMLElementEvent<HTMLCanvasElement>;

const [getFirstPoint, setFirstPoint] = createSignal<[number, number] | null>(null)

export const [canvasCtx, setCanvasCtx] = createSignal<CanvasRenderingContext2D | null>(null);
const [canvasRect, setCanvasRect] = createSignal<DOMRect | null>(null);

/* TODO: this function could use some restructuring. wrote it at the beginning of the project when i had no exp with solidjs */
const setupDrawing = () => {
  const canvas = document.querySelector<HTMLCanvasElement>(`#${canvasId}`);
  const rect = canvas!.getBoundingClientRect();
  const ctx = canvas?.getContext("2d");
  if (!ctx) return console.error("No canvas found.");
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

  const handleMouseDown = (e: MouseEvent) => {
    const target = e.target as HTMLCanvasElement;
    if (target.id !== canvasId) return;
    if (!uploadedImageData().imgData) return;

    const isRightClick = e.button === 2;
    if (isRightClick) return handleRightClick(e);

    const mouseX = e.offsetX;
    const mouseY = e.offsetY;

    setFirstPoint([mouseX, mouseY]);
    canvas!.style.cursor = "crosshair";
  }

  const handleRightClick = (e: MouseEvent) => {
    console.log("happening")
    e.preventDefault();
    const mouseX = e.offsetX;
    const mouseY = e.offsetY;
    const boxIndex = transformBoxes().findIndex(({minX, maxX, minY, maxY}) =>
      mouseX >= minX
      && mouseX <= maxX
      && mouseY >= minY
      && mouseY <= maxY)

    console.log(boxIndex);

    if (boxIndex === -1) return;

    setBoxes(prev => [
      ...prev.slice(0, boxIndex),
      ...prev.slice(boxIndex + 1)
    ])
    redrawAllBoxes();
  }

  const handleMouseUp = (e: MouseEvent) => {
    const target = e.target as HTMLCanvasElement;
    if (target.id !== canvasId) return;

    /* if the first point doesn't exist, the user started the click outside the canvas */
    const firstPoint = getFirstPoint();
    if (!firstPoint) return;

    const [startX, startY] = firstPoint;
    const mouseX = e.offsetX;
    const mouseY = e.offsetY;


    const diffX = Math.abs(mouseX - startX);
    const diffY = Math.abs(mouseY - startY);

    if (diffX <= 10 || diffY <= 10) {
      canvas!.style.cursor = "default";
      return setFirstPoint(null);
    }

    canvas!.style.cursor = "default";
    setBoxes(p => [...p, {
      startX,
      startY,
      width: mouseX - startX,
      height: mouseY - startY
    }]);
    redrawAllBoxes();

    return setFirstPoint(null);
  }

  const handleMouseMove = (e: MouseEvent) => {
    const target = e.target as HTMLCanvasElement;
    if (target.id != canvasId) return;

    const firstPoint = getFirstPoint();
    if (!firstPoint) return;

    redrawAllBoxes();

    const [startX, startY] = firstPoint;
    const mouseX = e.offsetX;
    const mouseY = e.offsetY;

    /* draw a dashed line with set color while dragging, then reset back to original rectangle style */
    ctx!.save();
    ctx!.beginPath();
    applyCanvasDrawingColor();
    ctx!.setLineDash([6]);
    ctx!.strokeRect(startX, startY, mouseX - startX, mouseY - startY);
    ctx!.restore();
  }

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.code === "Escape") {
      setFirstPoint(null);
      redrawAllBoxes();
      canvas!.style.cursor = "default";
    }
    if (e.ctrlKey && e.key === "z") {
      handleUndoButton()
    }
  }

  canvas!.addEventListener("mousemove", handleMouseMove, false);
  canvas!.addEventListener("mousedown", handleMouseDown, false);
  canvas!.addEventListener("mouseup", handleMouseUp, false);
  canvas!.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    return false;
  }, false)

  /* keypress doesn't fire when escape is pressed */
  window.addEventListener("keydown", handleKeyPress, false);
}

const setupUpload = () => {
  const inputEle = document.querySelector<HTMLInputElement>("#upload-input");

  const handleImageUploadSelected = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (!target.files || target.files?.length === 0) return;
    const ctx = canvasCtx();
    if (!ctx) return;

    const file = target.files[0]; /* only allow 1 file uploaded */

    const img = new Image();
    img.onload = () => {
      setUploadedImageData({
        width: img.width,
        height: img.height,
        imgData: img,
        file: file
      });
      ctx.drawImage(img, 0, 0);
    }
    img.src = URL.createObjectURL(file);
  }

  inputEle!.addEventListener("change", e => handleImageUploadSelected(e))
  /* TODO: handle err */
}

/* instead of drawing rectangles on top of the canvas, we redraw after every submitted action
* this allows us to do things like undo, show drawing rectangle, change color, change dimensions, etc. more easily by just manipulating state
* */
const redrawAllBoxes = () => {
  const ctx = canvasCtx();
  const rect = canvasRect();
  if (!ctx || !rect) return;
  const {imgData} = uploadedImageData();

  if (!imgData) return console.error("no image data in redrawAllBoxes")

  ctx.clearRect(0, 0, rect.width, rect.height);
  ctx.drawImage(imgData, 0, 0);
  getBoxes().forEach(box => {
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
  resetImageData();
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
        <Show when={!uploadedImageData().file}>
          <div class={"absolute image-prompt z-10"}>Upload an image to begin</div>
        </Show>
        <canvas
          id={canvasId}
          width={uploadedImageData().width}
          height={uploadedImageData().height}
          class={"canvas " + uploadedImageData().imgData ? "canvas-shadow-active" : "canvas-shadow-inactive"}
        >
          Image canvas not loaded
        </canvas>
      </div>
    </>
  )
}