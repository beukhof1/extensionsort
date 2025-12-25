import os
from datetime import datetime, timedelta
from pathlib import Path

import pytest
from httpx import AsyncClient

TEST_DB_PATH = Path("test.db")
os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DB_PATH}"

from app.db import init_db  # noqa: E402
from app.main import app  # noqa: E402


@pytest.fixture(autouse=True)
def reset_db():
    if TEST_DB_PATH.exists():
        TEST_DB_PATH.unlink()
    init_db()
    yield
    if TEST_DB_PATH.exists():
        TEST_DB_PATH.unlink()


@pytest.mark.anyio
async def test_vehicle_crud_flow():
    async with AsyncClient(app=app, base_url="http://testserver") as client:
        create_resp = await client.post(
            "/vehicles",
            json={"name": "Cargo Van", "vin": "VIN123", "capacity": 2, "status": "available", "mileage_km": 10},
        )
        assert create_resp.status_code == 201
        vehicle_id = create_resp.json()["id"]

        list_resp = await client.get("/vehicles")
        assert list_resp.status_code == 200
        assert any(v["vin"] == "VIN123" for v in list_resp.json())

        update_resp = await client.put(f"/vehicles/{vehicle_id}", json={"status": "maintenance", "name": "Cargo Van 1"})
        assert update_resp.status_code == 200
        assert update_resp.json()["status"] == "maintenance"

        status_resp = await client.post(f"/vehicles/{vehicle_id}/status", json={"status": "available"})
        assert status_resp.status_code == 200
        assert status_resp.json()["status"] == "available"

        delete_resp = await client.delete(f"/vehicles/{vehicle_id}")
        assert delete_resp.status_code == 204

        missing_resp = await client.get(f"/vehicles/{vehicle_id}")
        assert missing_resp.status_code == 404


@pytest.mark.anyio
async def test_trip_completion_updates_vehicle():
    async with AsyncClient(app=app, base_url="http://testserver") as client:
        vehicle = await client.post(
            "/vehicles",
            json={"name": "Sedan", "vin": "VIN888", "capacity": 4, "status": "available", "mileage_km": 0},
        )
        vehicle_id = vehicle.json()["id"]

        driver = await client.post(
            "/drivers",
            json={"name": "Alex Driver", "license_number": "LIC999", "phone": "555-5555"},
        )
        driver_id = driver.json()["id"]

        departed_at = datetime.utcnow().isoformat()
        trip = await client.post(
            "/trips",
            json={
                "vehicle_id": vehicle_id,
                "driver_id": driver_id,
                "origin": "Warehouse",
                "destination": "Client",
                "distance_km": 125.5,
                "departed_at": departed_at,
            },
        )
        trip_id = trip.json()["id"]

        completion_time = (datetime.utcnow() + timedelta(hours=2)).isoformat()
        complete_resp = await client.post(f"/trips/{trip_id}/complete", json={"arrived_at": completion_time})
        assert complete_resp.status_code == 200
        assert complete_resp.json()["completed"] is True

        vehicle_resp = await client.get(f"/vehicles/{vehicle_id}")
        assert vehicle_resp.json()["status"] == "available"
        assert vehicle_resp.json()["mileage_km"] >= 125


@pytest.mark.anyio
async def test_maintenance_flow():
    async with AsyncClient(app=app, base_url="http://testserver") as client:
        vehicle = await client.post(
            "/vehicles",
            json={"name": "Truck", "vin": "VINMT1", "capacity": 2, "status": "available", "mileage_km": 0},
        )
        vehicle_id = vehicle.json()["id"]

        created = await client.post(
            "/maintenance",
            json={"vehicle_id": vehicle_id, "description": "Oil change", "performed_on": "2024-09-01", "cost": 120.0},
        )
        assert created.status_code == 201
        record_id = created.json()["id"]

        vehicle_after_ticket = await client.get(f"/vehicles/{vehicle_id}")
        assert vehicle_after_ticket.json()["status"] == "maintenance"

        updated = await client.put(f"/maintenance/{record_id}", json={"status": "closed", "cost": 125.0})
        assert updated.status_code == 200
        assert updated.json()["status"] == "closed"

        vehicle_after_close = await client.get(f"/vehicles/{vehicle_id}")
        assert vehicle_after_close.json()["status"] == "available"

        maintenance_list = await client.get(f"/vehicles/{vehicle_id}/maintenance")
        assert len(maintenance_list.json()) == 1
