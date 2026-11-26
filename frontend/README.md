# Frontend

Plain HTML/CSS/JavaScript (no build step) for the Flight Reservation System.

| Role | What the UI shows |
|---|---|
| Customer | Flight list (view only) |
| Administrator | Flight list + Add / Edit / Delete |

Error messages are shown for a wrong login (401), an expired session (401, sends the
user back to the login screen), missing permission (403), a flight that no longer
exists (404), invalid form data (422) and a failed delete (500, e.g. the flight still
has seats or reservations).

All API calls go to `/api/...` (see `js/config.js`), so the frontend and the API are
served from the same address and no CORS setup is needed.

## Run locally

1. Start the backend on port 8000 (`uvicorn main:app --port 8000` inside `backend/`).
2. Start the frontend:

       cd frontend
       python3 dev_server.py

3. Open http://localhost:5500

`dev_server.py` serves these files and forwards `/api/*` to `http://127.0.0.1:8000`
(change it with `BACKEND_URL=...`).

## Docker

Nothing extra is needed: the `nginx` service in `docker-compose.yml` serves this
folder and forwards `/api/*` to the backend (`nginx/default.conf`).
