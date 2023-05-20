import {createEffect, createSignal, onMount} from "solid-js";

const canvasId = "main-canvas";

const getMousePos = (ele, evt) => {
    const rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    }
}

type asd = HTMLCanvasElement["getContext"];
const setupCanvas = () => {
    const canvas = document.getElementById<HTMLCanvasElement>(canvasId);
    const ctx = canvas?.getContext("2d");
    if (canvas?.getContext) {
        console.log("zxc")
        ctx.fillStyle = "rgb(200, 0, 0)";
        ctx.fillRect(10, 10, 50, 50);

        ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
        ctx.fillRect(30, 30, 50, 50);
    }
}

const canvasWidth = 300;
const canvasHeight = 300;
type BoxDrawing = {startX: number, startY: number, width: number, height: number};
const getUsefulDataFromEvent = (e: MouseEvent) => ({
    mouseX: e.offsetX,
    mouseY: e.offsetY
})
export const Canvas = () => {
    const [firstPoint, setFirstPoint] = createSignal<[number, number] | null>(null)
    const firstPointExists = () => firstPoint() !== null;
    const [tempRect, setTempRect] = createSignal<[number, number] | null>(null);
    const [boxes, setBoxes] = createSignal<BoxDrawing[]>([]);

    const [canvasCtx, setCanvasCtx] = createSignal(null);
    const [canvasLastMovePoint, setCanvasLastMovePoint] = createSignal(null);


    onMount(() => {
        const canvas = document.getElementById<HTMLCanvasElement>(canvasId);
        const rect = canvas.getBoundingClientRect();
        const ctx = canvas?.getContext("2d");
        setCanvasCtx(ctx);
        // canvas.style.cursor = "crosshair"y

        if (canvas?.getContext) {
            ctx.fillStyle = "rgb(200, 0, 0)";
            ctx.fillRect(10, 10, 50, 50);

            ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
            ctx.fillRect(30, 30, 50, 50);

            ctx.strokeRect(45, 45, 60, 60);
        }

        const drawRectOld = (e, isSecondStep = false) => {
            if (e.target.id != canvasId) return;

            if (isSecondStep && firstPoint() == null) return;

            const [mouseX, mouseY] = [e.offsetX, e.offsetY];

            if (firstPoint() === null) {
                console.log("setting first point", mouseX, mouseY)
                return setFirstPoint([mouseX, mouseY]);
            }
            // /* shouldn't normally reach here if isSecondStep is true */
            // if (isSecondStep) return;

            console.log("drawing from ", firstPoint(), "to", mouseX, mouseY)

            const [startX, startY] = firstPoint();
            ctx.fillStyle = "#000000";
            ctx.strokeRect(startX, startY, mouseX - startX, mouseY - startY);
            setFirstPoint(null);
            // setBoxes(prev => [...prev, []])
        }

        const drawTempRect = (e) => {
            if (firstPoint() === null) return;

            const [mouseX, mouseY] = [e.offsetX, e.offsetY];
            console.log("canvas", rect.top, rect.right, rect.bottom, rect.left);

            setTempRect([mouseX, mouseY]);
        }

        // ---------------------

        const drawRect = (e: MouseEvent) => {
            const {mouseX, mouseY} = getUsefulDataFromEvent(e);
            const [startX, startY] = firstPoint();

            // console.log("drawing rect from", [startX, startY], [mouseX, mouseY])
            // ctx.fillStyle = "#000000";
            // ctx.strokeRect(startX, startY, mouseX - startX, mouseY - startY);

            ctx.clearRect(0, 0, ctx.width, ctx.height);

        }


        /* should create an initial point for the box as long as there isnt one already */
        const handleMouseClick = (e: MouseEvent) => {
            const {mouseX, mouseY} = getUsefulDataFromEvent(e);
            if (e.target.id !== canvasId) return;

            if (firstPointExists()) {
                canvas.style.cursor = "default";
                drawRect(e);
                return setFirstPoint(null);
            }

            setFirstPoint([mouseX, mouseY]);
            canvas.style.cursor = "crosshair";
        }

        const handleDragStart = (e: MouseEvent) => {
            console.log("e", e)
            const {mouseX, mouseY} = getUsefulDataFromEvent(e);
            if (e.target.id !== canvasId) return;
            console.log("handling drag start");

            if (firstPointExists()) return;

            setFirstPoint([mouseX, mouseY]);
            canvas.style.cursor = "crosshair";
        }

        const handleDragEnd = (e: MouseEvent) => {
            console.log("e", e)
            if (e.target.id !== canvasId) return;
            console.log("ending drag")

            canvas.style.cursor = "default";
            drawRect(e);
            return setFirstPoint(null);
        }

        // const handleMouseMove = (e: MouseEvent) => {
        //     const {mouseX, mouseY} = getUsefulDataFromEvent(e);
        //     if (e.target.id !== canvasId) return;
        //
        //     if (!mouseMoved()) setMouseMoved(true);
        // }

        const deltaForMove = 5;

        const handleMouseDown = (e: MouseEvent) => {
            if (e.target.id !== canvasId) return;
            const {mouseX, mouseY} = getUsefulDataFromEvent(e);

            setFirstPoint([mouseX, mouseY]);
            // ctx.save();
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
            // drawRect(e);
            // setCanvasLastMovePoint(null);
            setBoxes(p => [...p, {
                startX,
                startY,
                width: mouseX - startX,
                height: mouseY - startY
            }]);
            redrawAllBoxes();

            return setFirstPoint(null);
        }

        /* instead of drawing rectangles on top of the canvas, we redraw after every submitted action
        * this allows us to do things like undo, show drawing rectangle, change color, change dimensions, etc. more easily by just manipulating state
        * */
        const redrawAllBoxes = () => {
            ctx.clearRect(0, 0, rect.width, rect.height);
            boxes().forEach(box => {
                ctx.beginPath();
                ctx.rect(box.startX, box.startY, box.width, box.height);
                ctx.strokeStyle = "#000000";
                ctx.stroke();
            })
        }

        const handleMouseMove = (e: MouseEvent) => {
            if (e.target.id != canvasId) return;
            if (!firstPointExists()) return;

            redrawAllBoxes();

            const {mouseX, mouseY} = getUsefulDataFromEvent(e);
            const [startX, startY] = firstPoint();

            ctx.beginPath();
            ctx.rect(startX, startY, mouseX - startX, mouseY - startY);
            ctx.strokeStyle = "#000000";
            ctx.stroke();
            // ctx.beginPath()
        }

        canvas.addEventListener("mousemove", handleMouseMove, false);
        canvas.addEventListener("mousedown", handleMouseDown, false);
        canvas.addEventListener("mouseup", handleMouseUp, false);
        // canvas.addEventListener("mousemove", handleMouseMove, false);
        // canvas.addEventListener('mousemove', draw, false);
        // canvas.addEventListener('click', handleMouseClick, false);
        // canvas.addEventListener('dragstart', handleDragStart, false);
        // canvas.addEventListener('dragend', handleDragEnd, false);
        // canvas.addEventListener('mousemove', drawTempRect, false);
    });

    const handleResetButton = () => {
        if (!canvasCtx()) return;

        canvasCtx().reset();
        setBoxes([]);
    }

    return (
        <>
            <canvas id={canvasId} width={canvasWidth} height={canvasHeight} class={"bg-red-400 relative"} >
                Image canvas not loaded
            </canvas>
            <button onclick={handleResetButton}>Reset</button>
            {/*<div class={"absolute bg-blue-400 w-48 h-48"}/>*/}

        </>
    )
}