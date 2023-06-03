import os.path

import pytest
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_ping():
    response = client.get("/ping")
    assert response.status_code == 200
    assert response.json() == "pong"


def test_process_happy_simple():
    item = {
        "intro": "something",
        "boxes": [{
            "x": 5,
            "y": 10,
            "width": 25,
            "height": 20
        }]
    }
    response = client.post("/process", json=item)
    assert response.json() == item


def test_process_fail_noboxes():
    item = {
        "intro": "something",
        "boxes": []
    }
    response = client.post("/process", json=item)
    assert response.status_code == 404
    assert response.json()["detail"] == "Need at least one box"


@pytest.mark.parametrize("file_path, expected_status_code", [
    ("./server/test_fixtures/test-image.jpg", 200),
    ("./server/test_fixtures/test-image.png", 200),
    ("./server/test_fixtures/test-image.webp", 200),
])
def test_file_upload_workswithvalidfileformats(file_path, expected_status_code):
    if os.path.isfile(file_path):
        _files = {'file': open(file_path, 'rb')}
        response = client.post('/file', files=_files)
        assert response.status_code == expected_status_code
    else:
        pytest.fail("Test image doesn't exist")

def test_file_upload_empty():
    response = client.post('/file')
    assert response.status_code == 422
