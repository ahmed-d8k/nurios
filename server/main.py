from fastapi import FastAPI
from pydantic import BaseModel

class Item(BaseModel):
    name: str
    description: str | None = None
    price: float
    tax: float | None = None


app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.post("/process")
async def process(item: Item):
    return item
