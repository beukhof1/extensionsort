from __future__ import annotations

from typing import List

from fastapi import Depends, FastAPI, HTTPException, status
from sqlmodel import Session, select

from . import models
from .db import get_session, init_db

app = FastAPI(title="Fleet Management API", version="1.0.0")


@app.on_event("startup")
def on_startup() -> None:
    init_db()


def get_db_session() -> Session:
    with get_session() as session:
        yield session


# Vehicles
@app.post("/vehicles", response_model=models.VehicleRead, status_code=status.HTTP_201_CREATED)
def create_vehicle(vehicle: models.VehicleCreate, session: Session = Depends(get_db_session)) -> models.Vehicle:
    existing = session.exec(select(models.Vehicle).where(models.Vehicle.vin == vehicle.vin)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Vehicle with this VIN already exists")

    db_vehicle = models.Vehicle(**vehicle.model_dump())
    session.add(db_vehicle)
    session.commit()
    session.refresh(db_vehicle)
    return db_vehicle


@app.get("/vehicles", response_model=List[models.VehicleRead])
def list_vehicles(session: Session = Depends(get_db_session)) -> List[models.Vehicle]:
    vehicles = session.exec(select(models.Vehicle)).all()
    return vehicles


@app.get("/vehicles/{vehicle_id}", response_model=models.VehicleRead)
def get_vehicle(vehicle_id: int, session: Session = Depends(get_db_session)) -> models.Vehicle:
    vehicle = session.get(models.Vehicle, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle


@app.put("/vehicles/{vehicle_id}", response_model=models.VehicleRead)
def update_vehicle(vehicle_id: int, updates: models.VehicleUpdate, session: Session = Depends(get_db_session)) -> models.Vehicle:
    vehicle = session.get(models.Vehicle, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    if updates.vin and updates.vin != vehicle.vin:
        duplicate = session.exec(select(models.Vehicle).where(models.Vehicle.vin == updates.vin)).first()
        if duplicate:
            raise HTTPException(status_code=400, detail="Vehicle with this VIN already exists")

    update_data = updates.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(vehicle, field, value)

    session.add(vehicle)
    session.commit()
    session.refresh(vehicle)
    return vehicle


@app.delete("/vehicles/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vehicle(vehicle_id: int, session: Session = Depends(get_db_session)) -> None:
    vehicle = session.get(models.Vehicle, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    session.delete(vehicle)
    session.commit()


@app.post("/vehicles/{vehicle_id}/status", response_model=models.VehicleRead)
def update_vehicle_status(
    vehicle_id: int, status_update: models.StatusUpdate, session: Session = Depends(get_db_session)
) -> models.Vehicle:
    vehicle = session.get(models.Vehicle, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    vehicle.status = status_update.status
    session.add(vehicle)
    session.commit()
    session.refresh(vehicle)
    return vehicle


# Drivers
@app.post("/drivers", response_model=models.DriverRead, status_code=status.HTTP_201_CREATED)
def create_driver(driver: models.DriverCreate, session: Session = Depends(get_db_session)) -> models.Driver:
    existing = session.exec(select(models.Driver).where(models.Driver.license_number == driver.license_number)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Driver with this license already exists")
    db_driver = models.Driver(**driver.model_dump())
    session.add(db_driver)
    session.commit()
    session.refresh(db_driver)
    return db_driver


@app.get("/drivers", response_model=List[models.DriverRead])
def list_drivers(session: Session = Depends(get_db_session)) -> List[models.Driver]:
    return session.exec(select(models.Driver)).all()


@app.get("/drivers/{driver_id}", response_model=models.DriverRead)
def get_driver(driver_id: int, session: Session = Depends(get_db_session)) -> models.Driver:
    driver = session.get(models.Driver, driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    return driver


@app.put("/drivers/{driver_id}", response_model=models.DriverRead)
def update_driver(driver_id: int, updates: models.DriverUpdate, session: Session = Depends(get_db_session)) -> models.Driver:
    driver = session.get(models.Driver, driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")

    if updates.license_number and updates.license_number != driver.license_number:
        duplicate = session.exec(select(models.Driver).where(models.Driver.license_number == updates.license_number)).first()
        if duplicate:
            raise HTTPException(status_code=400, detail="Driver with this license already exists")

    for field, value in updates.model_dump(exclude_unset=True).items():
        setattr(driver, field, value)

    session.add(driver)
    session.commit()
    session.refresh(driver)
    return driver


@app.delete("/drivers/{driver_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_driver(driver_id: int, session: Session = Depends(get_db_session)) -> None:
    driver = session.get(models.Driver, driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    session.delete(driver)
    session.commit()


# Trips
@app.post("/trips", response_model=models.TripRead, status_code=status.HTTP_201_CREATED)
def create_trip(trip: models.TripCreate, session: Session = Depends(get_db_session)) -> models.Trip:
    vehicle = session.get(models.Vehicle, trip.vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    driver = session.get(models.Driver, trip.driver_id) if trip.driver_id else None
    if trip.driver_id and not driver:
        raise HTTPException(status_code=404, detail="Driver not found")

    db_trip = models.Trip(**trip.model_dump())
    session.add(db_trip)
    if vehicle.status == "available":
        vehicle.status = "on_trip"
        session.add(vehicle)

    session.commit()
    session.refresh(db_trip)
    return db_trip


@app.get("/trips", response_model=List[models.TripRead])
def list_trips(session: Session = Depends(get_db_session)) -> List[models.Trip]:
    return session.exec(select(models.Trip)).all()


@app.get("/trips/{trip_id}", response_model=models.TripRead)
def get_trip(trip_id: int, session: Session = Depends(get_db_session)) -> models.Trip:
    trip = session.get(models.Trip, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip


@app.put("/trips/{trip_id}", response_model=models.TripRead)
def update_trip(trip_id: int, updates: models.TripUpdate, session: Session = Depends(get_db_session)) -> models.Trip:
    trip = session.get(models.Trip, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    if updates.vehicle_id:
        if not session.get(models.Vehicle, updates.vehicle_id):
            raise HTTPException(status_code=404, detail="Vehicle not found")
    if updates.driver_id:
        if not session.get(models.Driver, updates.driver_id):
            raise HTTPException(status_code=404, detail="Driver not found")

    for field, value in updates.model_dump(exclude_unset=True).items():
        setattr(trip, field, value)

    session.add(trip)
    session.commit()
    session.refresh(trip)
    return trip


@app.post("/trips/{trip_id}/complete", response_model=models.TripRead)
def complete_trip(
    trip_id: int, completion: models.TripCompletion, session: Session = Depends(get_db_session)
) -> models.Trip:
    trip = session.get(models.Trip, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    trip.completed = True
    trip.arrived_at = completion.arrived_at
    session.add(trip)

    vehicle = session.get(models.Vehicle, trip.vehicle_id)
    if vehicle:
        vehicle.status = "available"
        vehicle.mileage_km += int(trip.distance_km)
        session.add(vehicle)

    session.commit()
    session.refresh(trip)
    return trip


@app.delete("/trips/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_trip(trip_id: int, session: Session = Depends(get_db_session)) -> None:
    trip = session.get(models.Trip, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    session.delete(trip)
    session.commit()


# Maintenance
@app.post("/maintenance", response_model=models.MaintenanceRead, status_code=status.HTTP_201_CREATED)
def create_maintenance(record: models.MaintenanceCreate, session: Session = Depends(get_db_session)) -> models.MaintenanceRecord:
    vehicle = session.get(models.Vehicle, record.vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    db_record = models.MaintenanceRecord(**record.model_dump())
    session.add(db_record)
    if vehicle.status == "available":
        vehicle.status = "maintenance"
        session.add(vehicle)
    session.commit()
    session.refresh(db_record)
    return db_record


@app.get("/maintenance", response_model=List[models.MaintenanceRead])
def list_maintenance(session: Session = Depends(get_db_session)) -> List[models.MaintenanceRecord]:
    return session.exec(select(models.MaintenanceRecord)).all()


@app.put("/maintenance/{record_id}", response_model=models.MaintenanceRead)
def update_maintenance(record_id: int, updates: models.MaintenanceUpdate, session: Session = Depends(get_db_session)) -> models.MaintenanceRecord:
    record = session.get(models.MaintenanceRecord, record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Maintenance record not found")

    if updates.vehicle_id and updates.vehicle_id != record.vehicle_id:
        if not session.get(models.Vehicle, updates.vehicle_id):
            raise HTTPException(status_code=404, detail="Vehicle not found")

    for field, value in updates.model_dump(exclude_unset=True).items():
        setattr(record, field, value)

    session.add(record)
    vehicle = session.get(models.Vehicle, record.vehicle_id)
    if vehicle and record.status == "closed" and vehicle.status == "maintenance":
        vehicle.status = "available"
        session.add(vehicle)
    session.commit()
    session.refresh(record)
    return record


@app.delete("/maintenance/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_maintenance(record_id: int, session: Session = Depends(get_db_session)) -> None:
    record = session.get(models.MaintenanceRecord, record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Maintenance record not found")
    session.delete(record)
    session.commit()


@app.get("/vehicles/{vehicle_id}/maintenance", response_model=List[models.MaintenanceRead])
def maintenance_for_vehicle(vehicle_id: int, session: Session = Depends(get_db_session)) -> List[models.MaintenanceRecord]:
    vehicle = session.get(models.Vehicle, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return session.exec(select(models.MaintenanceRecord).where(models.MaintenanceRecord.vehicle_id == vehicle_id)).all()


@app.get("/vehicles/{vehicle_id}/trips", response_model=List[models.TripRead])
def trips_for_vehicle(vehicle_id: int, session: Session = Depends(get_db_session)) -> List[models.Trip]:
    vehicle = session.get(models.Vehicle, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return session.exec(select(models.Trip).where(models.Trip.vehicle_id == vehicle_id)).all()


@app.get("/drivers/{driver_id}/trips", response_model=List[models.TripRead])
def trips_for_driver(driver_id: int, session: Session = Depends(get_db_session)) -> List[models.Trip]:
    driver = session.get(models.Driver, driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    return session.exec(select(models.Trip).where(models.Trip.driver_id == driver_id)).all()
