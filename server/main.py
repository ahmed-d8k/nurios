import uuid
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

from min_sam import BackendSAM

load_dotenv()

COSMOS_ENDPOINT = os.getenv("COSMOS_ENDPOINT")
COSMOS_KEY = os.getenv("COSMOS_KEY")
DATABASE_NAME = "cosmicworks"
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

        item = {
                   "id": str(uuid.uuid4())
               } | data
        return await container.create_item(body=item)


async def get_item_by_id(item_id):
    async with CosmosClient(url=COSMOS_ENDPOINT, credential=COSMOS_KEY) as client:
        database = await client.create_database_if_not_exists(id=DATABASE_NAME)
        container = await database.create_container_if_not_exists(id=CONTAINER_NAME, partition_key=PARTITION_KEY)
        return await container.read_item(item=item_id, partition_key=item_id)


# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     # start up
#     await manage_cosmos(test_create)
#     yield
# clean up

# app = FastAPI(lifespan=lifespan)
app = FastAPI()
sam = BackendSAM()

app.mount("/static", StaticFiles(directory="static"), name="static")

origins = [
    # "http://localhost.tiangolo.com",
    # "https://localhost.tiangolo.com",
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


class Box(BaseModel):
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
# async def upload_file(file: UploadFile,
#                       model: Base = Depends(checker)):
async def upload_file(file: UploadFile = File(...),
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

    file_r = await file.read()
    image_array = np.frombuffer(file_r, np.uint8)
    image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
    input_image = np.asarray(image)

    seg_image, outline_image = sam.process(transformed_boxes, input_image)

    img_id = str(uuid.uuid4())
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
async def process(item: Model):
    # if (len(item.boxes) == 0):
    #     raise HTTPException(status_code=404, detail="Need at least one box")
    return item


@app.get("/cwd")
async def ping():
    return {
        "msg": os.getcwd()
    }


async def download_file():
    dir_path = os.path.dirname(os.path.abspath(__file__))
    output_dir = dir_path + '/files'
    return output_dir


async def read_file(path):
    f = open(path, "r")
    print(f.readline())
    f.close()


def transform_boxes(boxes):
    transformed_boxes = []
    for box in boxes:
        x1 = box.startX
        y1 = box.startY
        x2 = box.startX + box.width
        y2 = box.startY + box.height

        min_x = 0
        min_y = 0
        max_x = 0
        max_y = 0

        if x1 > x2:
            max_x = x1
            min_x = x2
        else:
            max_x = x2
            min_x = x1
        if y1 > y2:
            max_y = y1
            min_y = y2
        else:
            max_y = y2
            min_y = y1

        transformed_boxes.append([
            min_x,
            min_y,
            max_x,
            max_y
        ])
    return transformed_boxes

# @app.websocket("/ws")
# async def websocket_endpoint(websocket: WebSocket):
#     await websocket.accept()
#     while True:
#         data = await websocket.receive_text()
#         await websocket.send_text(f"Message text was: {data}")

# TODO: custom exception handlers
# TODO: wrap db connection functions with try/catch
