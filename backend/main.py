
from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from auth import login_user
from jwt_handler import create_access_token
from dependencies import get_current_user, require_admin
from database import get_db
from models import Flight
from schemas import FlightCreate, FlightUpdate


app = FastAPI(title="Flight Reservation System API")


class LoginRequest(BaseModel):
    email: str
    password: str


@app.get("/")
def home():
    return {"message": "Flight Reservation API is running!"}


@app.post("/auth/login")
def login(request: LoginRequest):
    user = login_user(request.email, request.password)

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token = create_access_token(user)

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@app.get("/users/me")
def get_my_profile(
    current_user: dict = Depends(get_current_user)
):
    return current_user


@app.get("/admin/test")
def admin_test(
    current_user: dict = Depends(require_admin)
):
    return {"message": "Welcome Administrator!"}


# GET - List all flights
@app.get("/flights")
def get_flights(db: Session = Depends(get_db)):
    flights = db.query(Flight).all()
    return flights


# POST - Create a new flight (Admin only)
@app.post("/flights")
def create_flight(
    flight: FlightCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin)
):
    new_flight = Flight(
        flightnumber=flight.flightnumber,
        departureairportid=flight.departureairportid,
        arrivalairportid=flight.arrivalairportid,
        departuredatetime=flight.departuredatetime,
        arrivaldatetime=flight.arrivaldatetime,
        flightstatus=flight.flightstatus
    )

    db.add(new_flight)
    db.commit()
    db.refresh(new_flight)

    return new_flight


# PUT - Update an existing flight (Admin only)
@app.put("/flights/{flight_id}")
def update_flight(
    flight_id: int,
    flight: FlightUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin)
):
    existing_flight = db.query(Flight).filter(
        Flight.flightid == flight_id
    ).first()

    if existing_flight is None:
        raise HTTPException(
            status_code=404,
            detail="Flight not found"
        )

    existing_flight.flightnumber = flight.flightnumber
    existing_flight.departureairportid = flight.departureairportid
    existing_flight.arrivalairportid = flight.arrivalairportid
    existing_flight.departuredatetime = flight.departuredatetime
    existing_flight.arrivaldatetime = flight.arrivaldatetime
    existing_flight.flightstatus = flight.flightstatus

    db.commit()
    db.refresh(existing_flight)

    return existing_flight


# DELETE - Delete a flight (Admin only)
@app.delete("/flights/{flight_id}")
def delete_flight(
    flight_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin)
):
    flight = db.query(Flight).filter(
        Flight.flightid == flight_id
    ).first()

    if flight is None:
        raise HTTPException(
            status_code=404,
            detail="Flight not found"
        )

    db.delete(flight)
    db.commit()

    return {"message": "Flight deleted successfully"}
