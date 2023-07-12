import uuid
from typing import Annotated, List, Optional
from fastapi import File, FastAPI, WebSocket, HTTPException, UploadFile, Form, Depends
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel, ValidationError
from dotenv import load_dotenv
from starlette import status

from azure.cosmos import PartitionKey
from azure.cosmos.aio import CosmosClient
import os
import json
import asyncio
from contextlib import asynccontextmanager

from starlette.middleware.cors import CORSMiddleware

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


@app.post("/submit")
async def upload_file(file: UploadFile,
                      model: Base = Depends(checker)):
    # if len(model.boxes) < 1:
    #     raise HTTPException(status_code=status.HTTP_411_LENGTH_REQUIRED, detail="Need at least 1 box to work with")
    if file.content_type not in ["image/jpeg", "image/png", "image/webp"]:
        raise HTTPException(status_code=422, detail="Bad image format")
    size = await file.read()
    if len(size) > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size is too big. Limit is 15mb"
        )
    await file.seek(0)

    return {
        "file_name": file.filename,
        "intro": model.intro,
        "boxes": model.boxes
    }


@app.post("/process")
async def process(item: Model):
    # if (len(item.boxes) == 0):
    #     raise HTTPException(status_code=404, detail="Need at least one box")
    return item


@app.get("/ping")
async def ping():
    return {
        "msg": "pong"
    }


async def download_file():
    dir_path = os.path.dirname(os.path.abspath(__file__))
    output_dir = dir_path + '/files'
    return output_dir


async def read_file(path):
    f = open(path, "r")
    print(f.readline())
    f.close()

# @app.websocket("/ws")
# async def websocket_endpoint(websocket: WebSocket):
#     await websocket.accept()
#     while True:
#         data = await websocket.receive_text()
#         await websocket.send_text(f"Message text was: {data}")

# TODO: custom exception handlers
# TODO: wrap db connection functions with try/catch
