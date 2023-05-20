import {createSignal, onMount} from "solid-js";

const canvasId = "main-canvas";

const canvasWidth = 300;
const canvasHeight = 300;
type BoxDrawing = {startX: number, startY: number, width: number, height: number};
const getUsefulDataFromEvent = (e: MouseEvent) => ({
    mouseX: e.offsetX,
    mouseY: e.offsetY
})

const [firstPoint, setFirstPoint] = createSignal<[number, number] | null>(null)
const firstPointExists = () => firstPoint() !== null;
const [boxes, setBoxes] = createSignal<BoxDrawing[]>([]);

const [canvasCtx, setCanvasCtx] = createSignal(null);
const [canvasRect, setCanvasRect] = createSignal(null);

const setStrokeStyle = (color: string) => {
    const ctx = canvasCtx();
    if (!ctx) return;
    ctx.strokeStyle = color;
}
const setDrawStyle = () => setStrokeStyle("#000000");
const setDrawingStyle = () => setStrokeStyle("#FF0800");
const setUpDrawing = () => {
    const canvas = document.getElementById<HTMLCanvasElement>(canvasId);
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas?.getContext("2d");
    setCanvasCtx(ctx);
    setCanvasRect(rect);
    // canvas.style.cursor = "crosshair"y

    if (canvas?.getContext) {
        ctx.fillStyle = "rgb(200, 0, 0)";
        ctx.fillRect(10, 10, 50, 50);

        ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
        ctx.fillRect(30, 30, 50, 50);

        ctx.strokeRect(45, 45, 60, 60);
    }

    const handleMouseDown = (e: MouseEvent) => {
        if (e.target.id !== canvasId) return;
        const {mouseX, mouseY} = getUsefulDataFromEvent(e);

        setFirstPoint([mouseX, mouseY]);
        canvas.style.cursor = "crosshair";
    }

    const handleMouseUp = (e: MouseEvent) => {
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

    const handleMouseMove = (e: MouseEvent) => {
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

/* instead of drawing rectangles on top of the canvas, we redraw after every submitted action
* this allows us to do things like undo, show drawing rectangle, change color, change dimensions, etc. more easily by just manipulating state
* */
const redrawAllBoxes = () => {
    const ctx = canvasCtx();
    const rect = canvasRect();
    if (!ctx || !rect) return;

    ctx.clearRect(0, 0, rect.width, rect.height);
    boxes().forEach(box => {
        ctx.beginPath();
        ctx.rect(box.startX, box.startY, box.width, box.height);
        setDrawStyle();
        ctx.stroke();
    })
}

const handleResetButton = () => {
    if (!canvasCtx()) return;

    canvasCtx().reset();
    setBoxes([]);
}

const handleUndoButton = () => {
    if (!canvasCtx()) return;

    setBoxes(p => p.slice(0, p.length - 1))
    redrawAllBoxes();
}

export const AppCanvas = () => {
    onMount(() => setUpDrawing());

    return (
        <>
            <canvas id={canvasId} width={canvasWidth} height={canvasHeight} class={"bg-red-400 relative"} >
                Image canvas not loaded
            </canvas>
            <div class={"my-4 gap-4 flex"}>
                <button class="btn-action" onclick={handleResetButton}>Reset</button>
                <button class="btn-action" onclick={handleUndoButton}>Undo</button>
            </div>
        </>
    )
}