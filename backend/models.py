from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from database import Base


class Airport(Base):
    __tablename__ = "airport"

    airportid = Column(Integer, primary_key=True, index=True)
    airportname = Column(String(100), nullable=False)
    airportcode = Column(String(3), nullable=False, unique=True)
    city = Column(String(50), nullable=False)
    country = Column(String(50), nullable=False)


class Flight(Base):
    __tablename__ = "flight"

    flightid = Column(Integer, primary_key=True, index=True)
    flightnumber = Column(String(10), nullable=False)

    departureairportid = Column(
        Integer,
        ForeignKey("airport.airportid"),
        nullable=False
    )

    arrivalairportid = Column(
        Integer,
        ForeignKey("airport.airportid"),
        nullable=False
    )

    departuredatetime = Column(DateTime, nullable=False)
    arrivaldatetime = Column(DateTime, nullable=False)
    flightstatus = Column(String(20), nullable=False)