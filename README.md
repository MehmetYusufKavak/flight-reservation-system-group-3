# Flight Reservation System – Group 3

CMPE341 Database Design and Management – Atılım University, 2026-2027 Fall
Supervisor: Ercüment Aydın

## Team

| Member | Responsibility |
|---|---|
| Ahmet Bekir MAHMAT | _(to be filled)_ |
| Mehmet Yusuf KAVAK | Docker, PostgreSQL init, GitHub & Documentation |
| Uğur TURHAN | _(to be filled)_ |
| Yener TOPAL | _(to be filled)_ |

## Application URL

- **Live:** http://<PUBLIC_IP>  _(if a domain is used: http://<DOMAIN>)_
- **Local:** http://localhost

## Test Accounts

| Role | Email | Password |
|---|---|---|
| Administrator | admin@mail.com | admin123 |
| Customer | ali.yilmaz@mail.com | ali123 |
| Customer | zeynep.kaya@mail.com | zeynep123 |
| Customer | emre.demir@mail.com | emre123 |

Passwords are stored in the database as **bcrypt** hashes (`db/init.sql`).

## How to Run

Requirements: Docker + Docker Compose

    git clone https://github.com/MehmetYusufKavak/flight-reservation-system-group-3.git
    cd flight-reservation-system-group-3
    cp .env.example .env
    docker compose up -d --build

This single command starts PostgreSQL (with all tables and sample data) together with the web application.

To reset the database and re-run `init.sql`:

    docker compose down -v
    docker compose up -d --build

To connect to the database:

    docker exec -it flight_db psql -U flight_user -d flight_reservation

## Project Structure

    .
    ├── backend/            # API (Auth + CRUD) and Dockerfile
    ├── db/init.sql         # CREATE TABLE + sample data (Report Chapter 5)
    ├── docker-compose.yml
    ├── .env.example
    └── README.md

## Database

7 tables: `"User"`, `Passenger`, `Airport`, `Flight`, `Seat`, `Reservation`, `Payment`.
Roles: `Customer`, `Administrator`.

## API Endpoints

_(to be added by the backend developer / Swagger link)_
