// Where the frontend sends API requests.
// "/api" works both with dev_server.py (local) and with nginx (Docker),
// because both forward /api/* to the FastAPI backend. That avoids CORS.
window.APP_CONFIG = {
  apiBaseUrl: "/api",
};
