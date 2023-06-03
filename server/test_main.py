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
