FROM python:3.10

WORKDIR /code

COPY server/requirements.txt /code/requirements.txt

RUN apt-get update && apt-get install ffmpeg libsm6 libxext6  -y
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

COPY server /code

CMD ["uvicorn", "main:app", "--proxy-headers", "--host", "0.0.0.0", "--port", "8080"]