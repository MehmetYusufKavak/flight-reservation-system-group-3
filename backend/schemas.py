from datetime import datetime
from pydantic import BaseModel


class FlightCreate(BaseModel):
    flightnumber: str
    departureairportid: int
    arrivalairportid: int
    departuredatetime: datetime
    arrivaldatetime: datetime
    flightstatus: str


class FlightUpdate(BaseModel):
    flightnumber: str
    departureairportid: int
    arrivalairportid: int
    departuredatetime: datetime
    arrivaldatetime: datetime
    flightstatus: str