// UI logic: login, role-based flight screen and admin CRUD.
// Depends on js/api.js (Api, Auth, ApiError).

const ROLE_ADMIN = "Administrator";
const FLIGHT_STATUSES = ["Scheduled", "Delayed", "Cancelled"];

// Airports from the sample data (report section 5.2 / db/init.sql).
// The API has no airport endpoint, so the list is kept here.
const AIRPORTS = [
  { airportid: 1, airportcode: "ESB", city: "Ankara" },
  { airportid: 2, airportcode: "IST", city: "Istanbul" },
  { airportid: 3, airportcode: "ADB", city: "Izmir" },
];

const state = {
  user: null,      // { userid, email, role }
  flights: [],
  airports: AIRPORTS,
  editingId: null, // null = creating a new flight
};

const $ = (id) => document.getElementById(id);

// ---------------------------------------------------------------- alerts

function showAlert(el, message, type = "error") {
  el.textContent = message;
  el.classList.toggle("success", type === "success");
  el.hidden = false;
}

function hideAlert(el) {
  el.hidden = true;
  el.textContent = "";
}

let appAlertTimer = null;
function flash(message, type = "error") {
  const el = $("app-alert");
  showAlert(el, message, type);
  clearTimeout(appAlertTimer);
  if (type === "success") {
    appAlertTimer = setTimeout(() => hideAlert(el), 4000);
  }
}

// Turns an API error into a message for the user. Returns true if the
// session ended (401) and the user was sent back to the login screen.
function handleApiError(err, targetAlert, context) {
  if (err.status === 401) {
    logout("Your session has expired. Please sign in again.");
    return true;
  }
  let message = err.message;
  if (err.status === 403) {
    message = "You are not authorized to perform this action. Administrator access is required.";
  } else if (err.status === 404) {
    message = "This flight no longer exists. The list has been refreshed.";
    loadFlights();
  } else if (err.status >= 500 && context === "delete") {
    message = "The flight could not be deleted. It probably still has seats or reservations linked to it.";
  }
  if (targetAlert === $("app-alert")) {
    flash(message);
  } else {
    showAlert(targetAlert, message);
  }
  return false;
}

// ---------------------------------------------------------------- views

function showLogin(message) {
  $("app-view").hidden = true;
  $("login-view").hidden = false;
  $("login-password").value = "";
  if (message) {
    showAlert($("login-alert"), message);
  } else {
    hideAlert($("login-alert"));
  }
  $("login-email").focus();
}

function showApp() {
  const isAdmin = state.user.role === ROLE_ADMIN;

  $("login-view").hidden = true;
  $("app-view").hidden = false;
  hideAlert($("app-alert"));

  $("user-email").textContent = state.user.email;
  const badge = $("user-role");
  badge.textContent = state.user.role;
  badge.classList.toggle("admin", isAdmin);

  document.querySelectorAll(".admin-only").forEach((el) => {
    el.hidden = !isAdmin;
  });
  $("customer-note").hidden = isAdmin;

  loadFlights();
}

function isAdmin() {
  return state.user && state.user.role === ROLE_ADMIN;
}

// ---------------------------------------------------------------- auth

async function handleLogin(event) {
  event.preventDefault();
  const alertEl = $("login-alert");
  hideAlert(alertEl);

  const email = $("login-email").value.trim();
  const password = $("login-password").value;
  if (!email || !password) {
    showAlert(alertEl, "Please enter your email and password.");
    return;
  }

  const button = $("login-submit");
  button.disabled = true;
  button.textContent = "Signing in...";
  try {
    const result = await Api.login(email, password);
    Auth.setToken(result.access_token);
    state.user = await Api.me();
    showApp();
  } catch (err) {
    Auth.clear();
    if (err.status === 401) {
      showAlert(alertEl, "Invalid email or password.");
    } else {
      showAlert(alertEl, err.message);
    }
  } finally {
    button.disabled = false;
    button.textContent = "Sign in";
  }
}

function logout(message) {
  Auth.clear();
  state.user = null;
  state.flights = [];
  if ($("flight-dialog").open) {
    $("flight-dialog").close();
  }
  showLogin(message);
}

// Keeps the user signed in after a page refresh while the token is valid.
async function restoreSession() {
  if (!Auth.getToken()) {
    showLogin();
    return;
  }
  try {
    state.user = await Api.me();
    showApp();
  } catch (err) {
    Auth.clear();
    showLogin(err.status === 401 ? "Your session has expired. Please sign in again." : err.message);
  }
}

// ---------------------------------------------------------------- data

async function loadFlights() {
  try {
    const flights = await Api.getFlights();
    state.flights = Array.isArray(flights) ? flights : [];
    renderFlights();
  } catch (err) {
    handleApiError(err, $("app-alert"));
  }
}

function airportLabel(id) {
  const airport = state.airports.find((a) => a.airportid === id);
  if (!airport) {
    return `Airport #${id}`;
  }
  return airport.city ? `${airport.airportcode} (${airport.city})` : airport.airportcode;
}

// "2027-01-10T08:00:00" -> "2027-01-10 08:00"
function formatDateTime(value) {
  if (!value) return "";
  return String(value).replace("T", " ").slice(0, 16);
}

// ---------------------------------------------------------------- render

function cell(text, className) {
  const td = document.createElement("td");
  td.textContent = text;
  if (className) td.className = className;
  return td;
}

function renderFlights() {
  const body = $("flights-body");
  body.replaceChildren();

  const flights = [...state.flights].sort((a, b) => a.flightid - b.flightid);
  $("flights-empty").hidden = flights.length > 0;

  for (const flight of flights) {
    const tr = document.createElement("tr");
    tr.append(
      cell(flight.flightid),
      cell(flight.flightnumber),
      cell(airportLabel(flight.departureairportid)),
      cell(airportLabel(flight.arrivalairportid)),
      cell(formatDateTime(flight.departuredatetime)),
      cell(formatDateTime(flight.arrivaldatetime)),
      cell(flight.flightstatus, `status status-${String(flight.flightstatus).toLowerCase()}`)
    );

    if (isAdmin()) {
      const actions = document.createElement("td");
      actions.className = "row-actions";

      const edit = document.createElement("button");
      edit.type = "button";
      edit.className = "btn btn-light btn-small";
      edit.textContent = "Edit";
      edit.addEventListener("click", () => openFlightForm(flight));

      const del = document.createElement("button");
      del.type = "button";
      del.className = "btn btn-danger btn-small";
      del.textContent = "Delete";
      del.addEventListener("click", () => deleteFlight(flight, del));

      actions.append(edit, del);
      tr.append(actions);
    }
    body.append(tr);
  }
}

// ---------------------------------------------------------------- form

function fillSelect(select, options, selectedValue) {
  select.replaceChildren();
  for (const { value, label } of options) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    select.append(option);
  }
  if (selectedValue !== undefined && selectedValue !== null) {
    select.value = String(selectedValue);
  }
}

function airportOptions(extraIds) {
  const options = state.airports.map((a) => ({
    value: a.airportid,
    label: airportLabel(a.airportid),
  }));
  for (const id of extraIds) {
    if (id && !options.some((o) => o.value === id)) {
      options.push({ value: id, label: airportLabel(id) });
    }
  }
  return options;
}

function openFlightForm(flight) {
  const form = $("flight-form");
  form.reset();
  hideAlert($("form-alert"));
  state.editingId = flight ? flight.flightid : null;
  $("flight-form-title").textContent = flight ? `Edit flight ${flight.flightnumber}` : "Add flight";

  const extraIds = flight ? [flight.departureairportid, flight.arrivalairportid] : [];
  const airports = airportOptions(extraIds);
  fillSelect($("f-dep-airport"), airports, flight ? flight.departureairportid : airports[0] && airports[0].value);
  fillSelect($("f-arr-airport"), airports, flight ? flight.arrivalairportid : airports[1] && airports[1].value);

  const statuses = FLIGHT_STATUSES.map((s) => ({ value: s, label: s }));
  if (flight && !FLIGHT_STATUSES.includes(flight.flightstatus)) {
    statuses.push({ value: flight.flightstatus, label: flight.flightstatus });
  }
  fillSelect($("f-status"), statuses, flight ? flight.flightstatus : "Scheduled");

  if (flight) {
    $("f-number").value = flight.flightnumber;
    $("f-dep-time").value = String(flight.departuredatetime).slice(0, 16);
    $("f-arr-time").value = String(flight.arrivaldatetime).slice(0, 16);
  }

  $("flight-dialog").showModal();
  $("f-number").focus();
}

// Checks the form before sending it. Returns an error message or null.
function validateFlight(data) {
  if (!data.flightnumber) return "Flight number is required.";
  if (data.flightnumber.length > 10) return "Flight number can be at most 10 characters.";
  if (!data.departureairportid || !data.arrivalairportid) return "Please choose both airports.";
  if (data.departureairportid === data.arrivalairportid) {
    return "Departure and arrival airports must be different.";
  }
  if (!data.departuredatetime || !data.arrivaldatetime) return "Please enter departure and arrival times.";
  if (data.arrivaldatetime <= data.departuredatetime) return "Arrival time must be after departure time.";
  return null;
}

async function handleFlightSubmit(event) {
  event.preventDefault();
  const alertEl = $("form-alert");
  hideAlert(alertEl);

  const data = {
    flightnumber: $("f-number").value.trim().toUpperCase(),
    departureairportid: Number($("f-dep-airport").value),
    arrivalairportid: Number($("f-arr-airport").value),
    // datetime-local gives "YYYY-MM-DDTHH:MM"; FastAPI accepts it as is.
    departuredatetime: $("f-dep-time").value,
    arrivaldatetime: $("f-arr-time").value,
    flightstatus: $("f-status").value,
  };

  const problem = validateFlight(data);
  if (problem) {
    showAlert(alertEl, problem);
    return;
  }

  const saveButton = $("flight-save");
  saveButton.disabled = true;
  try {
    if (state.editingId === null) {
      const created = await Api.createFlight(data);
      flash(`Flight ${created.flightnumber} was added.`, "success");
    } else {
      const updated = await Api.updateFlight(state.editingId, data);
      flash(`Flight ${updated.flightnumber} was updated.`, "success");
    }
    $("flight-dialog").close();
    await loadFlights();
  } catch (err) {
    if (err.status === 404) {
      $("flight-dialog").close();
      handleApiError(err, $("app-alert"));
    } else {
      handleApiError(err, alertEl);
    }
  } finally {
    saveButton.disabled = false;
  }
}

async function deleteFlight(flight, button) {
  const ok = window.confirm(`Delete flight ${flight.flightnumber} (ID ${flight.flightid})? This cannot be undone.`);
  if (!ok) return;

  button.disabled = true;
  try {
    await Api.deleteFlight(flight.flightid);
    flash(`Flight ${flight.flightnumber} was deleted.`, "success");
    await loadFlights();
  } catch (err) {
    handleApiError(err, $("app-alert"), "delete");
    button.disabled = false;
  }
}

// ---------------------------------------------------------------- start

document.addEventListener("DOMContentLoaded", () => {
  $("login-form").addEventListener("submit", handleLogin);
  $("logout-btn").addEventListener("click", () => logout());
  $("refresh-btn").addEventListener("click", () => {
    hideAlert($("app-alert"));
    loadFlights();
  });
  $("add-flight-btn").addEventListener("click", () => openFlightForm(null));
  $("flight-form").addEventListener("submit", handleFlightSubmit);
  $("flight-cancel").addEventListener("click", () => $("flight-dialog").close());

  restoreSession();
});
