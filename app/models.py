from __future__ import annotations

from datetime import date, datetime
from typing import List, Optional

from pydantic import ConfigDict
from sqlmodel import Field, Relationship, SQLModel


class VehicleBase(SQLModel):
    name: str = Field(index=True, description="Human friendly vehicle label")
    vin: str = Field(index=True, unique=True, description="Vehicle identification number")
    capacity: Optional[int] = Field(default=None, description="Passenger capacity")
    status: str = Field(default="available", description="Operational status")
    mileage_km: int = Field(default=0, description="Lifetime mileage in kilometers")


class Vehicle(VehicleBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    trips: List["Trip"] = Relationship(back_populates="vehicle")
    maintenance_records: List["MaintenanceRecord"] = Relationship(back_populates="vehicle")


class VehicleCreate(VehicleBase):
    pass


class VehicleRead(VehicleBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class VehicleUpdate(SQLModel):
    name: Optional[str] = None
    vin: Optional[str] = None
    capacity: Optional[int] = None
    status: Optional[str] = None
    mileage_km: Optional[int] = None


class DriverBase(SQLModel):
    name: str
    license_number: str = Field(index=True, unique=True)
    phone: Optional[str] = None


class Driver(DriverBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    trips: List["Trip"] = Relationship(back_populates="driver")


class DriverCreate(DriverBase):
    pass


class DriverRead(DriverBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class DriverUpdate(SQLModel):
    name: Optional[str] = None
    license_number: Optional[str] = None
    phone: Optional[str] = None


class TripBase(SQLModel):
    origin: str
    destination: str
    distance_km: float
    departed_at: datetime
    arrived_at: Optional[datetime] = None
    completed: bool = False


class Trip(TripBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    vehicle_id: int = Field(foreign_key="vehicle.id")
    driver_id: Optional[int] = Field(default=None, foreign_key="driver.id")

    vehicle: Vehicle = Relationship(back_populates="trips")
    driver: Optional[Driver] = Relationship(back_populates="trips")


class TripCreate(TripBase):
    vehicle_id: int
    driver_id: Optional[int] = None


class TripRead(TripBase):
    id: int
    vehicle_id: int
    driver_id: Optional[int]
    model_config = ConfigDict(from_attributes=True)


class TripUpdate(SQLModel):
    origin: Optional[str] = None
    destination: Optional[str] = None
    distance_km: Optional[float] = None
    departed_at: Optional[datetime] = None
    arrived_at: Optional[datetime] = None
    completed: Optional[bool] = None
    vehicle_id: Optional[int] = None
    driver_id: Optional[int] = None


class MaintenanceBase(SQLModel):
    description: str
    performed_on: date
    cost: Optional[float] = Field(default=None, description="Maintenance cost")
    status: str = Field(default="open", description="Maintenance ticket status")


class MaintenanceRecord(MaintenanceBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    vehicle_id: int = Field(foreign_key="vehicle.id")
    vehicle: Vehicle = Relationship(back_populates="maintenance_records")


class MaintenanceCreate(MaintenanceBase):
    vehicle_id: int


class MaintenanceRead(MaintenanceBase):
    id: int
    vehicle_id: int
    model_config = ConfigDict(from_attributes=True)


class MaintenanceUpdate(SQLModel):
    description: Optional[str] = None
    performed_on: Optional[date] = None
    cost: Optional[float] = None
    status: Optional[str] = None
    vehicle_id: Optional[int] = None


class StatusUpdate(SQLModel):
    status: str


class TripCompletion(SQLModel):
    arrived_at: datetime
