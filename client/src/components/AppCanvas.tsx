import {createSignal, onMount, Show} from "solid-js";

const canvasId = "main-canvas";

type HTMLElementEvent<T extends HTMLElement> = MouseEvent & {
  target: T;
}
type CanvasMouseEvent = HTMLElementEvent<HTMLCanvasElement>;

type BoxDrawing = {
  startX: number,
  startY: number,
  width: number,
  height: number
};
const getUsefulDataFromEvent = (e: CanvasMouseEvent) => ({
  mouseX: e.offsetX,
  mouseY: e.offsetY
})

const [firstPoint, setFirstPoint] = createSignal<[number, number] | null>(null)
const firstPointExists = () => firstPoint() !== null;
const [boxes, setBoxes] = createSignal<BoxDrawing[]>([]);

const [canvasCtx, setCanvasCtx] = createSignal<CanvasRenderingContext2D | null>(null);
const [canvasRect, setCanvasRect] = createSignal<DOMRect | null>(null);

const setStrokeStyle = (color: string) => {
  const ctx = canvasCtx();
  if (!ctx) return;
  ctx.strokeStyle = color;
}
const setDrawStyle = () => setStrokeStyle("#000000");
const setDrawingStyle = () => setStrokeStyle("#FF0800");
const setupDrawing = () => {
  const canvas = document.querySelector<HTMLCanvasElement>(`#${canvasId}`);
  const rect = canvas.getBoundingClientRect();
  const ctx = canvas?.getContext("2d");
  setCanvasCtx(ctx);
  setCanvasRect(rect);

  if (ctx) {
    ctx.fillStyle = "rgb(200, 0, 0)";
    ctx.fillRect(10, 10, 50, 50);

    ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
    ctx.fillRect(30, 30, 50, 50);

    ctx.strokeRect(45, 45, 60, 60);
  }

  const handleMouseDown = (e: CanvasMouseEvent) => {
    if (e.target.id !== canvasId) return;
    const {mouseX, mouseY} = getUsefulDataFromEvent(e);

    setFirstPoint([mouseX, mouseY]);
    canvas.style.cursor = "crosshair";
  }

  const handleMouseUp = (e: CanvasMouseEvent) => {
    if (e.target.id !== canvasId) return;

    /* this means the user started the click outside the canvas */
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
    setDrawingStyle();
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
  width: 700,
  height: 400,
  src: null as string | null,
};
const [imageData, setImageData] = createSignal(defaultImageData);
const [fileUploadEle, setFileUploadEle] = createSignal<HTMLInputElement | null>(null)
const setupUpload = () => {
  const inputEle = document.querySelector<HTMLInputElement>("#upload-input");
  if (!inputEle) return;
  setFileUploadEle(inputEle);

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
        data: img
      });
      ctx.drawImage(img, 0, 0);
    }
    img.src = URL.createObjectURL(file);

    console.log("e", e);
    console.log("files", e.target.files)
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
  const {data: imgData} = imageData();

  ctx.clearRect(0, 0, rect.width, rect.height);
  ctx.drawImage(imgData, 0, 0);
  boxes().forEach(box => {
    ctx.beginPath();
    ctx.rect(box.startX, box.startY, box.width, box.height);
    setDrawStyle();
    ctx.stroke();
  })
}

const handleResetButton = () => {
  const ctx = canvasCtx();
  if (!ctx) return;

  // @ts-ignore
  ctx.reset();
  setBoxes([]);
}

const handleUndoButton = () => {
  if (!canvasCtx()) return;

  setBoxes(p => p.slice(0, p.length - 1))
  redrawAllBoxes();
}

const handleChangeImageButton = () => {
  if (!canvasCtx()) return;
}

const handleInitialUploadButton = () => {
  /* these should never matter but just in case */
  if (imageData().src) return;
  if (!fileUploadEle()) return;

  fileUploadEle()?.click()
}

const imageIsStaged = () => !!imageData()?.src;

export const AppCanvas = () => {
  onMount(() => setupDrawing());
  onMount(() => setupUpload())

  return (
    <>
      <div class={"flex gap-4 relative"}>
        <Show when={!imageIsStaged()}>
          <button
            onclick={handleInitialUploadButton}
            class={"canvas-overlay items-center flex justify-center flex-col"}
          >
            <p class={"text-neutral-300"}>Choose an image to begin</p>
            <a class={"text-sky-400"}>
              Upload
            </a>
          </button>
        </Show>
        <canvas
          id={canvasId}
          width={imageData().width}
          height={imageData().height}
          class={"canvas"}
        >
          Image canvas not loaded
        </canvas>
        {/*<div class={"h-48 w-52 bg-red-700"}>*/}

        {/*</div>*/}
      </div>
      <div class={"flex flex-col items-center"}>
        <div class={"mt-4 gap-4 flex w-full text-center"}>
          <input
            class="input"
            onclick={handleChangeImageButton}
            type={"file"}
            accept={"image/*"}
            id={"upload-input"}
            style={{display: !!imageData().src ? "flex" : "none"}}
          >
            Change Image
          </input>
        </div>
        {imageData().src && <div class={"mb-4 mt-2 gap-4 flex"}>
            <button class="btn-action" onclick={handleResetButton}>Reset</button>
            <button class="btn-action" onclick={handleUndoButton} disabled={boxes().length === 0}>Undo</button>
        </div>}
      </div>
    </>
  )
}