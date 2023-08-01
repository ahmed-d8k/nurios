import asyncio
import shutil
import time
import uuid
from dataclasses import asdict, dataclass
from typing import List, Optional, Annotated, Union, Dict

import cv2
import numpy as np
import pydantic
from fastapi import FastAPI, HTTPException, UploadFile, Form, Depends, File
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel, ValidationError
from dotenv import load_dotenv
from starlette import status

from azure.cosmos import PartitionKey
from azure.cosmos.aio import CosmosClient
import os

from starlette.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles
from starlette.websockets import WebSocket

from min_sam import BackendSAM

load_dotenv()

COSMOS_ENDPOINT = os.getenv("COSMOS_ENDPOINT")
COSMOS_KEY = os.getenv("COSMOS_KEY")
DATABASE_NAME = "devdb"
CONTAINER_NAME = "submissions"
PARTITION_KEY = PartitionKey(path="/id")
MAX_IMAGE_SIZE_BYTES = 1000000 * 15

if COSMOS_KEY is None or COSMOS_ENDPOINT is None:
    raise Exception("One or more env variables missing")


async def get_container():
    async with CosmosClient(url=COSMOS_ENDPOINT, credential=COSMOS_KEY) as client:
        database = await client.create_database_if_not_exists(id=DATABASE_NAME)
        container = await database.create_container_if_not_exists(id=CONTAINER_NAME, partition_key=PARTITION_KEY)
        return container.id


async def add_item(data):
    async with CosmosClient(url=COSMOS_ENDPOINT, credential=COSMOS_KEY) as client:
        database = await client.create_database_if_not_exists(id=DATABASE_NAME)
        container = await database.create_container_if_not_exists(id=CONTAINER_NAME, partition_key=PARTITION_KEY)

        item = data
        return await container.create_item(body=item)


async def get_item_by_id(item_id: str):
    async with CosmosClient(url=COSMOS_ENDPOINT, credential=COSMOS_KEY) as client:
        database = await client.create_database_if_not_exists(id=DATABASE_NAME)
        container = await database.create_container_if_not_exists(id=CONTAINER_NAME, partition_key=PARTITION_KEY)
        return await container.read_item(item=item_id, partition_key=item_id)


class QueueDataStore:
    def __init__(self):
        self.queue = []

    def add_item(self, item):
        self.queue.append(item)

    def get_all_items(self):
        return self.queue

    def item_exists(self, item):
        return item in self.queue

    def pos_in_queue(self, item):
        return self.queue.index(item) + 1

    def remove_item(self, item):
        self.queue.remove(item)


# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     # start up
#     await manage_cosmos(test_create)
#     yield
# clean up

# app = FastAPI(lifespan=lifespan)
queue_store_instance = QueueDataStore()
app = FastAPI()
sam = BackendSAM()


def get_queue_store():
    return queue_store_instance


app.mount("/static", StaticFiles(directory="static"), name="static")

origins = [
    "https://ahmed-d8k.github.io",
    "http://localhost",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/ping")
async def root():
    return "pong"


@dataclass
class Box:
    startX: int
    startY: int
    width: int
    height: int



class Model(BaseModel):
    intro: str
    boxes: List[Box] = []


class Base(BaseModel):
    intro: Optional[str] = None
    boxes: List[Box]


def checker(data: str = Form(...)):
    try:
        model = Base.parse_raw(data)
    except ValidationError as e:
        raise HTTPException(
            detail=jsonable_encoder(e.errors()),
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        )
    return model


class BoxData(BaseModel):
    boxes: List[Box]


@app.post("/submit")
async def submit_endpoint(file: UploadFile = File(...),
                          intro: str = Form(...),
                          box_data: str = Form(...)):
    try:
        box_input = Base.parse_raw(box_data)
    except pydantic.ValidationError as e:
        raise HTTPException(
            detail=jsonable_encoder(e.errors()),
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY
        ) from e

    if box_input is None:
        return {"msg": "bad"}
    if file is None:
        return {"msg": "bad"}
    if intro is None:
        return {"msg": "bad"}
    if len(box_input.boxes) < 1:
        raise HTTPException(status_code=status.HTTP_411_LENGTH_REQUIRED, detail="Need at least 1 box to work with")
    if file.content_type not in ["image/jpeg", "image/png", "image/webp"]:
        raise HTTPException(status_code=422, detail="Bad image format")
    size = await file.read()
    if len(size) > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size is too big. Limit is 15mb"
        )
    await file.seek(0)

    transformed_boxes = transform_boxes(box_input.boxes)
    img_id = str(uuid.uuid4())
    file_r = await file.read()
    image_array = np.frombuffer(file_r, np.uint8)
    image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
    input_image = np.asarray(image)

    while sam.is_in_use():
        pass
    seg_image, outline_image = sam.process(transformed_boxes, input_image)
    sam.set_not_in_use()

    seg_img_path = f"static/{img_id}_seg.jpg"
    outline_img_path = f"static/{img_id}_outline.jpg"

    cv2.imwrite(seg_img_path, seg_image)
    cv2.imwrite(outline_img_path, outline_image)

    return {
        "file_name": file.filename,
        "intro": box_input.intro,
        "boxes": box_input.boxes,
        "transformed_boxes": transformed_boxes,
        "img_id": img_id,
        "seg_img_path": seg_img_path,
        "outline_img_path": outline_img_path
    }


@app.post("/process")
async def process_endpoint(file: UploadFile = File(...),
                           intro: str = Form(...),
                           box_data: str = Form(...),
                           queue_store: QueueDataStore = Depends(get_queue_store)):
    try:
        box_input = Base.parse_raw(box_data)
    except pydantic.ValidationError as e:
        raise HTTPException(
            detail=jsonable_encoder(e.errors()),
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY
        ) from e

    # TODO: fix this error handling
    if box_input is None:
        return {"msg": "bad"}
    if file is None:
        return {"msg": "bad"}
    if intro is None:
        return {"msg": "bad"}
    if len(box_input.boxes) < 1:
        raise HTTPException(status_code=status.HTTP_411_LENGTH_REQUIRED, detail="Need at least 1 box to work with")
    if file.content_type not in ["image/jpeg", "image/png", "image/webp"]:
        raise HTTPException(status_code=422, detail="Bad image format")
    size = await file.read()
    if len(size) > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size is too big. Limit is 15mb"
        )
    await file.seek(0)

    transformed_boxes = transform_boxes(box_input.boxes)
    queue_id = str(uuid.uuid4())

    og_img_path = f"static/{queue_id}_og.jpg"
    seg_img_path = f"static/{queue_id}_seg.jpg"
    outline_img_path = f"static/{queue_id}_outline.jpg"
    with open(og_img_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    data = {
        "id": queue_id,
        "input_boxes": [asdict(box) for box in box_input.boxes],
        "transformed_boxes": transformed_boxes,
        "og_img_path": og_img_path,
        "seg_img_path": seg_img_path,
        "outline_img_path": outline_img_path
    }
    queue_store.add_item(queue_id)
    await add_item(data)
    return data


@app.get("/items")
async def items_endpoint(queue_store: QueueDataStore = Depends(get_queue_store)):
    return queue_store.get_all_items()


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket,
                             queue_id: str or None,
                             queue_store: QueueDataStore = Depends(get_queue_store)):
    if queue_id is None:
        return await websocket.close()
    if queue_store.item_exists(queue_id) is False:
        return await websocket.close()

    await websocket.accept()
    await wait_for_queue(websocket, queue_id, queue_store)

    await websocket.send_text("processing")

    og_img_path = f"static/{queue_id}_og.jpg"
    seg_img_path = f"static/{queue_id}_seg.jpg"
    outline_img_path = f"static/{queue_id}_outline.jpg"

    # query to find the transformed boxes from database
    db_item = await get_item_by_id(queue_id)
    transformed_boxes = db_item.get("transformed_boxes")

    # read from file system and then
    file_r = cv2.imread(og_img_path)

    seg_image, outline_image = sam.process(transformed_boxes, file_r)
    #
    cv2.imwrite(seg_img_path, seg_image)
    cv2.imwrite(outline_img_path, outline_image)

    await websocket.send_text("complete")
    queue_store.remove_item(queue_id)


def transform_boxes(boxes):
    transformed_boxes = []
    for box in boxes:
        x1, y1 = box.startX, box.startY
        x2, y2 = x1 + box.width, y1 + box.height

        min_x, max_x = min(x1, x2), max(x1, x2)
        min_y, max_y = min(y1, y2), max(y1, y2)

        transformed_boxes.append([min_x, min_y, max_x, max_y])

    return transformed_boxes



async def wait_for_queue(ws: WebSocket,
                         queue_id: str,
                         queue_store: QueueDataStore):
    while True:
        pos = queue_store.pos_in_queue(queue_id)
        if pos == 1:
            return True

        await ws.send_text(pos.__str__())
        await asyncio.sleep(5)

# TODO: custom exception handlers
# TODO: wrap db connection functions with try/catch
