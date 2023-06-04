import json
import os.path

import pytest
from fastapi.testclient import TestClient
from starlette import status

from main import app, get_container, CONTAINER_NAME

client = TestClient(app)


def test_ping():
    response = client.get("/ping")
    assert response.status_code == 200
    assert response.json() == "pong"

def make_box_data(intro_msg: str = 'hello'):
    data = {
        'intro': intro_msg,
        "boxes": [{
            "x": 5,
            "y": 10,
            "width": 25,
            "height": 20
        }]
    }
    data = {'data': json.dumps(data)}
    return data

@pytest.mark.parametrize("file_path, expected_status_code", [
    ("./test_fixtures/test-image.jpg", 200),
    ("./test_fixtures/test-image.png", 200),
    ("./test_fixtures/test-image.webp", 200),
    ("./test_fixtures/test-image.html", 422),
])
def test_file_upload_workswithvalidfileformats(file_path, expected_status_code):
    if os.path.isfile(file_path):
        _files = {'file': open(file_path, 'rb')}
        data = make_box_data()
        response = client.post('/file', data=data, files=_files)
        assert response.status_code == expected_status_code
    else:
        pytest.fail("Test image doesn't exist")

def test_file_upload_empty():
    data = make_box_data()
    response = client.post('/file', data=data)
    assert response.status_code == 422

def test_fileupload_filetoobig_fails():
    data = make_box_data()
    file_path = "./test_fixtures/test-image-big.png"
    expected_status_code = status.HTTP_413_REQUEST_ENTITY_TOO_LARGE
    if os.path.isfile(file_path):
        _files = {'file': open(file_path, 'rb')}
        response = client.post('/file', data=data, files=_files)
        assert response.status_code == expected_status_code
    else:
        pytest.fail("Test image doesn't exist")

def test_fileupload_noboxes_fails():
    data = {'intro': 'hello', 'boxes': []}
    file_path = "./test_fixtures/test-image.jpg"
    if os.path.isfile(file_path):
        _files = {'file': open(file_path, 'rb')}
        response = client.post('/file', data=data, files=_files)
        assert response.status_code != status.HTTP_200_OK
    else:
        pytest.fail("Test image doesn't exist")

@pytest.mark.parametrize("intro_msg, worked_expected", [
    (None, True),
    ("hello", True),
])
def test_fileupload_intro_is_optional(intro_msg, worked_expected):
    data = {
        'intro': None,
        "boxes": [{
            "x": 5,
            "y": 10,
            "width": 25,
            "height": 20
        }]
    }
    data = {'data': json.dumps(data)}
    file_path = "./test_fixtures/test-image.jpg"
    if os.path.isfile(file_path):
        _files = {'file': open(file_path, 'rb')}
        response = client.post('/file', data=data, files=_files)
        did_work = response.status_code == status.HTTP_200_OK
        assert did_work == worked_expected
    else:
        pytest.fail("Test image doesn't exist")


@pytest.mark.asyncio
async def test_cosmosutils_getcontainer():
    container = await get_container()
    assert container == CONTAINER_NAME