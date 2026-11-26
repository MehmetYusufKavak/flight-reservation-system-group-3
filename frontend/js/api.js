// Small wrapper around fetch for the Flight Reservation API.
// Every request goes through request(), which adds the JWT and turns
// HTTP errors into ApiError objects with a readable message.

const API_BASE = window.APP_CONFIG && window.APP_CONFIG.apiBaseUrl
  ? window.APP_CONFIG.apiBaseUrl.replace(/\/+$/, "")
  : "/api";

const TOKEN_KEY = "frs_access_token";

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "ApiError";
    this.status = status; // 0 = server unreachable
  }
}

const Auth = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
  },
};

// FastAPI returns errors as {"detail": "..."} or, for 422,
// {"detail": [{"loc": [...], "msg": "..."}]}.
function extractErrorMessage(status, data) {
  if (data && typeof data.detail === "string") {
    return data.detail;
  }
  if (data && Array.isArray(data.detail)) {
    return data.detail
      .map((item) => {
        const loc = Array.isArray(item.loc)
          ? item.loc.filter((p) => p !== "body").join(".")
          : "";
        return loc ? `${loc}: ${item.msg}` : item.msg;
      })
      .join("\n");
  }
  if (status >= 500) {
    return "The server could not complete the request.";
  }
  return `Request failed (HTTP ${status}).`;
}

async function request(method, path, body) {
  const headers = { Accept: "application/json" };
  const token = Auth.getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  let response;
  try {
    response = await fetch(API_BASE + path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new ApiError(0, "Cannot reach the server. Is the backend running?");
  }

  // Errors such as a 500 may come back as plain text, so parse defensively.
  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (err) {
      data = null;
    }
  }

  if (!response.ok) {
    throw new ApiError(response.status, extractErrorMessage(response.status, data));
  }
  return data;
}

const Api = {
  login(email, password) {
    return request("POST", "/auth/login", { email, password });
  },
  me() {
    return request("GET", "/users/me");
  },
  getFlights() {
    return request("GET", "/flights");
  },
  createFlight(flight) {
    return request("POST", "/flights", flight);
  },
  updateFlight(id, flight) {
    return request("PUT", `/flights/${encodeURIComponent(id)}`, flight);
  },
  deleteFlight(id) {
    return request("DELETE", `/flights/${encodeURIComponent(id)}`);
  },
};
