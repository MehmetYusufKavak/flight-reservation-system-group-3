-- =====================================================================
-- Flight Reservation System - Group 3
-- CMPE341 Database Design and Management
-- Bu dosya PostgreSQL konteyneri ILK KEZ olusturulurken
-- /docker-entrypoint-initdb.d/ icinden otomatik calisir.
-- (Tablolar + ornek veri: Rapor Chapter 5)
-- =====================================================================

-- Sifreleri bcrypt ile hash'lemek icin (crypt + gen_salt('bf'))
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------
-- 5.1 Creating the Tables
-- ---------------------------------------------------------------------

CREATE TABLE "User" (
    UserID     SERIAL PRIMARY KEY,
    FirstName  VARCHAR(50)  NOT NULL,
    LastName   VARCHAR(50)  NOT NULL,
    Email      VARCHAR(100) NOT NULL UNIQUE,
    Password   VARCHAR(100) NOT NULL,   -- bcrypt hash (60 karakter) saklanir
    UserRole   VARCHAR(20)  NOT NULL CHECK (UserRole IN ('Customer', 'Administrator'))
);

CREATE TABLE Passenger (
    PassengerID SERIAL PRIMARY KEY,
    FirstName   VARCHAR(50) NOT NULL,
    LastName    VARCHAR(50) NOT NULL,
    DateOfBirth DATE NOT NULL CHECK (DateOfBirth < CURRENT_DATE)
);

CREATE TABLE Airport (
    AirportID   SERIAL PRIMARY KEY,
    AirportName VARCHAR(100) NOT NULL,
    AirportCode VARCHAR(3)   NOT NULL UNIQUE,
    City        VARCHAR(50)  NOT NULL,
    Country     VARCHAR(50)  NOT NULL
);

CREATE TABLE Flight (
    FlightID           SERIAL PRIMARY KEY,
    FlightNumber       VARCHAR(10) NOT NULL,
    DepartureAirportID INT NOT NULL REFERENCES Airport(AirportID),
    ArrivalAirportID   INT NOT NULL REFERENCES Airport(AirportID),
    DepartureDateTime  TIMESTAMP NOT NULL,
    ArrivalDateTime    TIMESTAMP NOT NULL,
    FlightStatus       VARCHAR(20) NOT NULL,
    CHECK (ArrivalDateTime > DepartureDateTime)
);

CREATE TABLE Seat (
    SeatID                 SERIAL PRIMARY KEY,
    FlightID               INT NOT NULL REFERENCES Flight(FlightID),
    SeatNumber             VARCHAR(5)  NOT NULL,
    SeatAvailabilityStatus VARCHAR(20) NOT NULL
);

CREATE TABLE Reservation (
    ReservationID     SERIAL PRIMARY KEY,
    UserID            INT NOT NULL REFERENCES "User"(UserID),
    PassengerID       INT NOT NULL REFERENCES Passenger(PassengerID),
    FlightID          INT NOT NULL REFERENCES Flight(FlightID),
    SeatID            INT NOT NULL REFERENCES Seat(SeatID),
    ReservationDate   DATE NOT NULL,
    ReservationStatus VARCHAR(20) NOT NULL
);

CREATE TABLE Payment (
    PaymentID     SERIAL PRIMARY KEY,
    ReservationID INT NOT NULL UNIQUE REFERENCES Reservation(ReservationID),
    PaymentAmount DECIMAL(10,2) NOT NULL CHECK (PaymentAmount > 0),
    PaymentDate   DATE NOT NULL,
    PaymentMethod VARCHAR(20) NOT NULL,
    PaymentStatus VARCHAR(20) NOT NULL
);

-- ---------------------------------------------------------------------
-- 5.2 Data Loading
-- Not: Raporda sifreler duz metindi. Proje gereksinimi geregi burada
-- bcrypt hash olarak saklaniyor. Giris yaparken kullanilacak sifreler
-- yine ayni (ali123, admin123 ...) - README'de listeli.
-- ---------------------------------------------------------------------

INSERT INTO "User" (FirstName, LastName, Email, Password, UserRole) VALUES
('Ali',    'Yilmaz', 'ali.yilmaz@mail.com',   crypt('ali123',    gen_salt('bf', 10)), 'Customer'),
('Zeynep', 'Kaya',   'zeynep.kaya@mail.com',  crypt('zeynep123', gen_salt('bf', 10)), 'Customer'),
('Emre',   'Demir',  'emre.demir@mail.com',   crypt('emre123',   gen_salt('bf', 10)), 'Customer'),
('Admin',  'User',   'admin@mail.com',        crypt('admin123',  gen_salt('bf', 10)), 'Administrator');

INSERT INTO Passenger (FirstName, LastName, DateOfBirth) VALUES
('Ali',    'Yilmaz', '2002-05-14'),
('Zeynep', 'Kaya',   '1999-11-03'),
('Emre',   'Demir',  '1995-02-20'),
('Selin',  'Demir',  '2001-08-09');

INSERT INTO Airport (AirportName, AirportCode, City, Country) VALUES
('Esenboga Airport',       'ESB', 'Ankara',   'Turkey'),
('Istanbul Airport',       'IST', 'Istanbul', 'Turkey'),
('Adnan Menderes Airport', 'ADB', 'Izmir',    'Turkey');

INSERT INTO Flight (FlightNumber, DepartureAirportID, ArrivalAirportID, DepartureDateTime, ArrivalDateTime, FlightStatus) VALUES
('TK101', 1, 2, '2027-01-10 08:00', '2027-01-10 09:10', 'Scheduled'),
('TK202', 2, 3, '2027-01-12 14:00', '2027-01-12 15:15', 'Scheduled'),
('TK303', 3, 1, '2027-01-15 19:00', '2027-01-15 20:10', 'Delayed');

INSERT INTO Seat (FlightID, SeatNumber, SeatAvailabilityStatus) VALUES
(1, '1A', 'Reserved'), (1, '1B', 'Reserved'), (1, '1C', 'Available'),
(2, '2A', 'Reserved'), (2, '2B', 'Available'), (2, '2C', 'Available'),
(3, '3A', 'Reserved'), (3, '3B', 'Available'), (3, '3C', 'Available');

INSERT INTO Reservation (UserID, PassengerID, FlightID, SeatID, ReservationDate, ReservationStatus) VALUES
(1, 1, 1, 1, '2026-11-01', 'Confirmed'),
(2, 2, 1, 2, '2026-11-02', 'Confirmed'),
(3, 3, 2, 4, '2026-11-04', 'Confirmed'),
(3, 4, 3, 7, '2026-11-05', 'Confirmed');

INSERT INTO Payment (ReservationID, PaymentAmount, PaymentDate, PaymentMethod, PaymentStatus) VALUES
(1, 1500.00, '2026-11-01', 'Credit Card', 'Paid'),
(2, 1500.00, '2026-11-02', 'Debit Card',  'Paid'),
(3, 1800.00, '2026-11-04', 'Credit Card', 'Paid'),
(4, 1200.00, '2026-11-05', 'Credit Card', 'Pending');
