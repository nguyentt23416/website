async function initAccount(){
const session = getSession();
if (!session) window.location.href = "login.html";

let users = await loadUsers();
let userIndex = users.findIndex(item => item.id === session.id);
let user = users[userIndex] || session;

user.bookings = Array.isArray(user.bookings) ? user.bookings : [];
user.favorites = Array.isArray(user.favorites) ? user.favorites : [];
user.companions = Array.isArray(user.companions) ? user.companions : [];

function persistUser() {
  if (userIndex >= 0) {
    users[userIndex] = user;
    saveUsers(users);
    setSession(user);
  }
}

document.getElementById("account-name").textContent = user.fullName || "Travel.io user";
document.getElementById("account-email").textContent = user.email || "";
document.querySelector(".profile-photo").textContent = (user.fullName || user.email || "U").trim().charAt(0).toUpperCase();
document.getElementById("profile-full-name").value = user.fullName || "";
document.getElementById("profile-email").value = user.email || "";
document.getElementById("profile-phone").value = user.phone || "";

function showTab(name) {
  document.querySelectorAll(".account-tabs button").forEach(button => {
    button.classList.toggle("active", button.dataset.tab === name);
  });
  document.querySelectorAll(".account-tab-panel").forEach(panel => {
    panel.classList.toggle("is-active", panel.id === `panel-${name}`);
  });
  const hashes = { personal: "personal", booking: "booking-history", "booking-detail": "booking-detail", companions: "companions", favourites: "favourites", help: "help", settings: "settings" };
  history.replaceState(null, "", `#${hashes[name] || "personal"}`);
}

document.querySelectorAll(".account-tabs button").forEach(button => {
  button.addEventListener("click", () => showTab(button.dataset.tab));
});

function rootPath(path) {
  if (!path) return "";
  if (/^(https?:|data:|\/)/.test(path)) return path;
  return `../${path}`;
}

function renderBookings() {
  const list = document.getElementById("booking-list");
  if (!user.bookings.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No bookings yet.";
    list.replaceChildren(empty);
    return;
  }

  list.replaceChildren(...user.bookings.map(booking => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "booking-card booking-card-clickable";
    card.dataset.bookingId = booking.id;
    const title = document.createElement("span");
    title.textContent = booking.title || "Trip";
    const price = document.createElement("b");
    price.textContent = booking.price || "€0.00";
    const status = document.createElement("em");
    status.textContent = booking.status || "Past Trips";
    card.append(title, price, status);
    return card;
  }));

  list.querySelectorAll("[data-booking-id]").forEach(card => {
    card.addEventListener("click", () => openBookingDetail(card.dataset.bookingId));
  });
}

function openBookingDetail(id) {
  const booking = user.bookings.find(item => String(item.id) === String(id));
  if (!booking) return;

  showTab("booking-detail");

  const detail = document.getElementById("booking-detail");
  const travellers = Array.isArray(booking.travellers) ? booking.travellers : [];
  const lead = travellers[0] || {};
  const fullName = `${lead.firstName || ""} ${lead.lastName || ""}`.trim() || user.fullName || "Traveller";
  const phone = lead.phone || user.phone || "-";
  const address = booking.billing ? [booking.billing.street, booking.billing.city, booking.billing.country].filter(Boolean).join(", ") : "-";
  const pickupLocation = booking.pickupLocation || booking.leadTraveller?.pickupLocation || "-";
  const status = booking.status || "Upcoming";
  const paid = booking.price || "€0.00";
  const remaining = status === "Canceled" ? paid : "€0.00";
  const steps = ["Booking placed", "Preparing trip", "Travel documents", status === "Canceled" ? "Canceled" : "Confirmed"];

  detail.innerHTML = `
    <div class="order-status-card">
      <div class="order-steps">
        ${steps.map((step, index) => `<span class="${index < 3 || status !== "Upcoming" ? "done" : ""}">${step}</span>`).join("")}
      </div>
      <button class="journey-link" type="button">View booking journey</button>
    </div>

    <div class="order-detail-layout">
      <div class="order-left">
        <section class="order-box">
          <h2>Customer information</h2>
          <dl>
            <div><dt>Full name:</dt><dd>${fullName}</dd></div>
            <div><dt>Phone number:</dt><dd>${phone}</dd></div>
            <div><dt>Address:</dt><dd>${address}</dd></div>
            <div><dt>Pickup location:</dt><dd>${pickupLocation}</dd></div>
            <div><dt>Note:</dt><dd>${booking.note || "-"}</dd></div>
          </dl>
        </section>

        <section class="order-box">
          <h2>Support information</h2>
          <dl>
            <div><dt>Booking reference:</dt><dd>${booking.reference || "-"}</dd></div>
            <div><dt>Support phone:</dt><dd>0000 000 000</dd></div>
            <div><dt>Support email:</dt><dd>support@travel.io</dd></div>
          </dl>
        </section>

        <section class="order-box">
          <h2>Travellers</h2>
          <div class="order-travellers">
            ${travellers.length ? travellers.map((traveller, index) => `
              <p><strong>${index + 1}. ${(traveller.firstName || "") + " " + (traveller.lastName || "")}</strong><span>${traveller.nationality || "-"} · ${traveller.gender || "-"} · ${traveller.dob || "-"}</span></p>
            `).join("") : `<p>No traveller details saved.</p>`}
          </div>
        </section>
      </div>

      <div class="order-right">
        <section class="order-box">
          <h2>Payment information</h2>
          <div class="payment-product">Package <b>${booking.title || "Trip"}</b></div>
          <dl>
            <div><dt>Number of travellers:</dt><dd>${booking.travellerCount || travellers.length || 1}</dd></div>
            <div><dt>Total booking price:</dt><dd>${booking.price || "€0.00"}</dd></div>
            <div><dt>Discount:</dt><dd class="green">€0.00</dd></div>
            <div><dt>Payment method:</dt><dd>${booking.paymentStatus || "Paid"}</dd></div>
          </dl>
          <div class="payment-total"><span>Total paid</span><strong>${paid}</strong></div>
          <div class="payment-total"><span>Remaining balance</span><strong>${remaining}</strong></div>
        </section>

        ${user.role === "admin" ? `
        <section class="order-box">
          <h2>Admin booking control</h2>
          <form id="booking-edit-form" class="booking-edit-form compact">
            <label>Package<input id="edit-booking-title" value="${booking.title || ""}"></label>
            <label>Status<select id="edit-booking-status"><option>Upcoming</option><option>Past Trips</option><option>Canceled</option><option>Approved</option><option>Pending approval</option></select></label>
            <label>Destination<input id="edit-booking-destination" value="${booking.destination || ""}"></label>
            <label>Country<input id="edit-booking-country" value="${booking.country || ""}"></label>
            <label>Start date<input id="edit-booking-date" value="${booking.date || ""}"></label>
            <label>Pickup location<input id="edit-booking-pickup" value="${booking.pickupLocation || ""}"></label>
            <p class="account-message" id="booking-edit-message"></p>
            <div class="order-actions">
              <button id="delete-booking" type="button">Delete</button>
              <button id="save-booking" type="submit">Save</button>
            </div>
          </form>
        </section>` : `
        <section class="order-box">
          <h2>Booking management</h2>
          <p class="readonly-note">This booking is locked. Only an admin can approve, cancel, or edit booking details.</p>
          <dl>
            <div><dt>Current status:</dt><dd>${booking.status || "Upcoming"}</dd></div>
            <div><dt>Last updated:</dt><dd>${booking.updatedAt ? new Date(booking.updatedAt).toLocaleDateString("en-GB") : "-"}</dd></div>
          </dl>
        </section>`}
      </div>
    </div>
  `;

  if (user.role === "admin") {
    document.getElementById("edit-booking-status").value = booking.status || "Upcoming";

    document.getElementById("booking-edit-form").addEventListener("submit", event => {
      event.preventDefault();

      booking.title = document.getElementById("edit-booking-title").value.trim() || booking.title;
      booking.status = document.getElementById("edit-booking-status").value;
      booking.destination = document.getElementById("edit-booking-destination").value.trim();
      booking.country = document.getElementById("edit-booking-country").value.trim();
      booking.date = document.getElementById("edit-booking-date").value.trim();
      booking.pickupLocation = document.getElementById("edit-booking-pickup").value.trim();
      booking.updatedAt = new Date().toISOString();

      persistUser();
      renderBookings();

      const message = document.getElementById("booking-edit-message");
      message.className = "account-message success";
      message.textContent = "Booking updated.";
    });

    document.getElementById("delete-booking").addEventListener("click", () => {
      user.bookings = user.bookings.filter(item => String(item.id) !== String(id));
      persistUser();
      renderBookings();
      showTab("booking");
    });
  }
}

function renderCompanions() {
  const body = document.getElementById("companions-list");

  if (!user.companions.length) {
    body.innerHTML = `<tr><td colspan="5" class="table-empty">No companions added yet.</td></tr>`;
    return;
  }

  body.replaceChildren(...user.companions.map(companion => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${companion.name}</td>
      <td>${companion.type}</td>
      <td>${companion.dob}</td>
      <td>${companion.gender}</td>
      <td><button class="text-action" data-remove="${companion.id}" type="button">Remove</button></td>
    `;
    return row;
  }));

  body.querySelectorAll("[data-remove]").forEach(button => {
    button.addEventListener("click", () => {
      user.companions = user.companions.filter(item => item.id !== button.dataset.remove);
      persistUser();
      renderCompanions();
    });
  });
}

function renderFavourites() {
  const list = document.getElementById("favourites-list");

  if (!user.favorites.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No favourite trips yet.";
    list.replaceChildren(empty);
    return;
  }

  list.replaceChildren(...user.favorites.map(fav => {
    const card = document.createElement("article");
    card.className = "fav-card";
    const image = fav.image ? `<img src="${rootPath(fav.image)}" alt="${fav.title}">` : `<div class="fav-placeholder">${fav.title}</div>`;
    card.innerHTML = `
      <div class="fav-image">${image}<button type="button" class="heart active" data-fav="${fav.id}">♥</button></div>
      <div class="fav-copy">
        <div><h3>${fav.title}</h3><span>★ ${fav.rating || "4.6"}</span></div>
        <p>${fav.date || ""}<b>From <em>${fav.price || "€0"}</em></b></p>
      </div>
    `;
    return card;
  }));

  list.querySelectorAll("[data-fav]").forEach(button => {
    button.addEventListener("click", () => {
      user.favorites = user.favorites.filter(item => item.id !== button.dataset.fav);
      persistUser();
      renderFavourites();
    });
  });
}

renderBookings();
renderCompanions();
renderFavourites();

document.getElementById("new-companion").addEventListener("click", () => {
  const form = document.getElementById("companion-form");
  form.hidden = !form.hidden;
});

document.getElementById("companion-form").addEventListener("submit", event => {
  event.preventDefault();
  const name = document.getElementById("companion-name").value.trim();
  const type = document.getElementById("companion-type").value;
  const dob = document.getElementById("companion-dob").value;
  const gender = document.getElementById("companion-gender").value;

  if (!name || !dob) return;

  user.companions.push({
    id: `comp-${Date.now()}`,
    name,
    type,
    dob: dob.replaceAll("-", "/"),
    gender
  });

  persistUser();
  event.target.reset();
  event.target.hidden = true;
  renderCompanions();
});

function applyHashTab() {
  const map = {
    "#personal": "personal",
    "#booking-history": "booking",
    "#booking-detail": "booking-detail",
    "#companions": "companions",
    "#favourites": "favourites",
    "#help": "help",
    "#settings": "settings"
  };
  showTab(map[location.hash] || "personal");
}

applyHashTab();
window.addEventListener("hashchange", applyHashTab);

document.getElementById("back-to-bookings").addEventListener("click", () => {
  showTab("booking");
});

document.getElementById("save-account").addEventListener("click", () => {
  const fullName = document.getElementById("profile-full-name").value.trim();
  const email = document.getElementById("profile-email").value.trim().toLowerCase();
  const phone = document.getElementById("profile-phone").value.trim();

  if (!fullName || !emailValid(email) || !phoneValid(phone)) return;

  user = { ...user, fullName, email, phone };
  persistUser();
  window.location.reload();
});

document.getElementById("change-password-form").addEventListener("submit", async event => {
  event.preventDefault();
  const message = document.getElementById("settings-message");
  message.textContent = "";

  const oldPassword = document.getElementById("old-password").value;
  const newPassword = document.getElementById("new-password").value;
  const confirmPassword = document.getElementById("confirm-new-password").value;

  if (!(await verifyPassword(user, oldPassword))) {
    message.textContent = "Old password is incorrect.";
    message.className = "account-message error";
    return;
  }

  if (!passwordValid(newPassword)) {
    message.textContent = "Password must be 8 to 64 characters with 1 capital letter and 1 number.";
    message.className = "account-message error";
    return;
  }

  if (newPassword !== confirmPassword) {
    message.textContent = "Passwords do not match.";
    message.className = "account-message error";
    return;
  }

  await setUserPassword(user, newPassword);
  persistUser();
  message.textContent = "Password changed successfully.";
  message.className = "account-message success";
  event.target.reset();
});

document.getElementById("discard-password").addEventListener("click", () => {
  document.getElementById("change-password-form").reset();
  document.getElementById("settings-message").textContent = "";
});

document.getElementById("delete-account").addEventListener("click", () => {
  const remaining = users.filter(item => item.id !== session.id);
  saveUsers(remaining);
  clearSession();
  window.location.href = "signup.html";
});

document.getElementById("account-logout").addEventListener("click", () => {
  clearSession();
  window.location.href = "login.html";
});
}
initAccount();
