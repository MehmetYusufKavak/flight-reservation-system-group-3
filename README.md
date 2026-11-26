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

This single command starts three containers:

| Service | What it does | Address |
|---|---|---|
| `nginx` | Serves the frontend and forwards `/api/*` to the backend (no CORS needed) | http://localhost (only public port: 80) |
| `backend` | FastAPI app (uvicorn, port 8000) | http://localhost/api/ — Swagger: http://localhost:8000/docs |
| `db` | PostgreSQL 16 with all tables and sample data from `db/init.sql` | localhost:5432 (local machine only) |

The frontend must call the API with the `/api` prefix, e.g. `fetch("/api/flights")`.

To reset the database and re-run `init.sql`:

    docker compose down -v
    docker compose up -d --build

To connect to the database:

    docker exec -it flight_db psql -U flight_user -d flight_reservation

## Project Structure

    .
    ├── backend/            # FastAPI app (Auth + CRUD) and Dockerfile
    ├── frontend/           # Static frontend files served by nginx
    ├── nginx/default.conf  # nginx: frontend + /api reverse proxy
    ├── db/init.sql         # CREATE TABLE + sample data (Report Chapter 5)
    ├── requirements.txt    # Python dependencies
    ├── docker-compose.yml
    ├── .env.example
    └── README.md

## Local Development (backend without Docker)

    docker compose up -d db
    pip install -r requirements.txt
    cd backend && uvicorn main:app --reload

Uses `DATABASE_URL` from `.env` (`postgresql+psycopg://...@localhost:5432/...`).

## Database

7 tables: `"User"`, `Passenger`, `Airport`, `Flight`, `Seat`, `Reservation`, `Payment`.
Roles: `Customer`, `Administrator`.

## API Endpoints

Interactive documentation (Swagger): http://localhost:8000/docs

_(endpoint list to be added by the backend developer)_
