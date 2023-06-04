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

load_dotenv()

COSMOS_ENDPOINT = os.getenv("COSMOS_ENDPOINT")
COSMOS_KEY = os.getenv("COSMOS_KEY")
DATABASE_NAME = "cosmicworks"
CONTAINER_NAME = "products"
MAX_IMAGE_SIZE_BYTES = 1000000 * 15

if COSMOS_KEY is None or COSMOS_ENDPOINT is None:
    raise Exception("One or more env variables missing")

# async def manage_cosmos(func):
#     async with CosmosClient(url=COSMOS_ENDPOINT, credential=COSMOS_KEY) as client:
#         database = await client.create_database_if_not_exists(id=DATABASE_NAME)
#         key_path = PartitionKey(path="/categoryId")
#         container = await database.create_container_if_not_exists(id=CONTAINER_NAME, partition_key=key_path)
#         print("Loaded databases\t", database.id)
#         await func(container)

# async def establish_databases(client):

# key_path = PartitionKey(path="/categoryId")
# new_item = {
#     "id": "70b63682-b93a-4c77-aad2-65501347265f",
#     "categoryId": "61dba35b-4f02-45c5-b648-c6badc0cbd79",
#     "categoryName": "gear-surf-surfboards",
#     "name": "Yamba Surfboard",
#     "quantity": 12,
#     "sale": False,
# }
# container.create_item(new_item)

# async def test_create(container):
#     new_item = {
#         "id": "asd",
#         "categoryId": "qwe",
#         "categoryName": "gear-surf-surfboards",
#         "name": "Yamba Surfboard",
#         "quantity": 12,
#         "sale": False,
#     }
#     await container.create_item(new_item)
#

# async def test_create():
#     print("working")
# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     # start up
#     await manage_cosmos(test_create)
#     yield
# clean up

# app = FastAPI(lifespan=lifespan)
app = FastAPI()


# async def get_item(container):
#     return await container.read_item(
#         item="70b63682-b93a-4c77-aad2-65501347265f",
#         partition_key="61dba35b-4f02-45c5-b648-c6badc0cbd79",
#     )
@app.get("/")
async def root():
    # async with CosmosClient(url=COSMOS_ENDPOINT, credential=COSMOS_KEY) as client:
    #     database = await client.create_database_if_not_exists(id=DATABASE_NAME)
    return {"message": "Hello World"}


@app.get("/ping")
async def root():
    return "pong"


class Box(BaseModel):
    x: int
    y: int
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
@app.post("/file")
async def upload_file(file: UploadFile,
                      model: Base = Depends(checker)):
    if len(model.boxes) < 1:
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


    return {"file_name": file.filename}

@app.post("/process")
async def process(item: Model):
    # if (len(item.boxes) == 0):
    #     raise HTTPException(status_code=404, detail="Need at least one box")
    return item

# @app.websocket("/ws")
# async def websocket_endpoint(websocket: WebSocket):
#     await websocket.accept()
#     while True:
#         data = await websocket.receive_text()
#         await websocket.send_text(f"Message text was: {data}")

# TODO: custom exception handlers
