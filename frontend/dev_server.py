"""Local development server for the frontend (Python standard library only).

Serves the files in this folder and forwards every /api/* request to the
FastAPI backend, the same way nginx does in Docker. Because the browser
only talks to one address, no CORS setup is needed.

Usage:
    python3 dev_server.py                  # http://localhost:5500
    BACKEND_URL=http://127.0.0.1:8000 PORT=5500 python3 dev_server.py
"""

import os
import urllib.error
import urllib.request
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

BACKEND_URL = os.environ.get("BACKEND_URL", "http://127.0.0.1:8000").rstrip("/")
PORT = int(os.environ.get("PORT", "5500"))
ROOT = os.path.dirname(os.path.abspath(__file__))
FORWARDED_HEADERS = ("Authorization", "Content-Type", "Accept")


class DevHandler(SimpleHTTPRequestHandler):
    def _proxy(self):
        target = BACKEND_URL + self.path[len("/api"):]
        length = int(self.headers.get("Content-Length") or 0)
        body = self.rfile.read(length) if length else None
        headers = {h: self.headers[h] for h in FORWARDED_HEADERS if self.headers.get(h)}
        req = urllib.request.Request(target, data=body, headers=headers, method=self.command)

        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                self._send(resp.status, resp.headers, resp.read())
        except urllib.error.HTTPError as err:
            self._send(err.code, err.headers, err.read())
        except urllib.error.URLError as err:
            message = f'{{"detail": "Backend unreachable at {BACKEND_URL}: {err.reason}"}}'
            self._send(502, {"Content-Type": "application/json"}, message.encode())

    def _send(self, status, headers, payload):
        self.send_response(status)
        self.send_header("Content-Type", headers.get("Content-Type", "application/json"))
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def _route(self, static_handler):
        if self.path == "/api" or self.path.startswith("/api/"):
            self._proxy()
        elif static_handler:
            static_handler()
        else:
            self.send_error(405)

    def do_GET(self):
        self._route(super().do_GET)

    def do_HEAD(self):
        self._route(super().do_HEAD)

    def do_POST(self):
        self._route(None)

    def do_PUT(self):
        self._route(None)

    def do_DELETE(self):
        self._route(None)

    def end_headers(self):
        # Always load the latest JS/CSS while developing.
        if not self.path.startswith("/api"):
            self.send_header("Cache-Control", "no-store")
        super().end_headers()


if __name__ == "__main__":
    handler = partial(DevHandler, directory=ROOT)
    server = ThreadingHTTPServer(("127.0.0.1", PORT), handler)
    print(f"Frontend: http://localhost:{PORT}  (API -> {BACKEND_URL})")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
