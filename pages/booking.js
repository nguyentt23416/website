const nationalityOptions = ["Afghan", "Albanian", "Algerian", "Andorran", "Angolan", "Argentinian", "Armenian", "Australian", "Austrian", "Azerbaijani", "Bahamian", "Bahraini", "Bangladeshi", "Belgian", "Bolivian", "Bosnian", "Brazilian", "British", "Bruneian", "Bulgarian", "Cambodian", "Canadian", "Chilean", "Chinese", "Colombian", "Costa Rican", "Croatian", "Cuban", "Cypriot", "Czech", "Danish", "Dominican", "Dutch", "Ecuadorian", "Egyptian", "Emirati", "Estonian", "Ethiopian", "Finnish", "French", "Georgian", "German", "Ghanaian", "Greek", "Hungarian", "Icelandic", "Indian", "Indonesian", "Iranian", "Iraqi", "Irish", "Israeli", "Italian", "Japanese", "Jordanian", "Kazakh", "Kenyan", "Kuwaiti", "Lao", "Latvian", "Lebanese", "Lithuanian", "Luxembourgish", "Malaysian", "Maldivian", "Mexican", "Monegasque", "Mongolian", "Moroccan", "Burmese", "Nepalese", "New Zealander", "Nigerian", "Norwegian", "Omani", "Pakistani", "Peruvian", "Filipino", "Polish", "Portuguese", "Qatari", "Romanian", "Russian", "Saudi Arabian", "Serbian", "Singaporean", "Slovak", "Slovenian", "South African", "South Korean", "Spanish", "Sri Lankan", "Swedish", "Swiss", "Taiwanese", "Thai", "Turkish", "Ukrainian", "Uruguayan", "Venezuelan", "Vietnamese"];

function nationalitySelectOptions(selected = "") {
  return `<option value="">Choose your nationality</option>` + nationalityOptions.map(value => `<option value="${value}" ${value === selected ? "selected" : ""}>${value}</option>`).join("");
}

function pickupLocationOptions(selected = "") {
  const destination = booking?.trip?.destination || booking?.trip?.country || "City";
  const country = booking?.trip?.country || "";
  const values = [
    `${destination} Airport`,
    `${destination} Central Station`,
    `${destination} City Center Hotel`,
    `${destination} Main Bus Terminal`,
    `${destination} Cruise Port`,
    country ? `${country} Downtown Pickup Point` : "Downtown Pickup Point"
  ];

  return `<option value="">Choose pickup location</option>` + values.map(value => `<option value="${value}" ${value === selected ? "selected" : ""}>${value}</option>`).join("");
}


const context = requireLoggedIn();
let booking = getPendingBooking();

if (!booking) {
  window.location.href = "listing.html";
}

if (context) {
  const user = context.user;
  if (!booking.leadTraveller) {
    const names = (user.fullName || "").split(" ");
    booking.leadTraveller = {
      firstName: names.slice(0, -1).join(" ") || user.fullName || "",
      lastName: names.slice(-1).join("") || "",
      email: user.email || "",
      phone: user.phone || "",
      nationality: "",
      dob: "",
      gender: "",
      pickupLocation: ""
    };
  }
}

function updateSummary() {
  document.getElementById("checkout-summary").innerHTML = bookingSummaryHtml(booking) + `<button class="checkout-pay" form="booking-form" type="submit">Continue</button>`;
  document.getElementById("adult-price").textContent = formatEuro(booking.trip.price);
  document.getElementById("child-price").textContent = formatEuro(Math.round(booking.trip.price * 0.5));
  document.getElementById("adults-count").textContent = booking.guests.adults;
  document.getElementById("children-count").textContent = booking.guests.children;
}

function travellerTemplate(index, lead = false, data = {}) {
  return `
    <section class="traveller-card" data-index="${index}">
      <div class="traveller-head"><h3>${lead ? "Lead traveller" : `Traveller ${index + 1}`}</h3>${!lead ? `<button class="use-companion" type="button" data-fill="${index}">Companions</button>` : ""}</div>
      ${lead ? `<p>This traveller will serve as the contact person for the booking.</p>` : `<p>Contact</p>`}
      <div class="traveller-grid">
        <label>First name<input name="firstName-${index}" value="${data.firstName || ""}" placeholder="Your name" required></label>
        <label>Last name<input name="lastName-${index}" value="${data.lastName || ""}" placeholder="Your last name" required></label>
        ${lead ? `<label>Email<input name="email-${index}" type="email" value="${data.email || ""}" placeholder="Your mail" required></label><label>Phone number<input name="phone-${index}" value="${data.phone || ""}" placeholder="Your phone number" required></label>` : ""}
        <label class="nationality-field">Nationality<select name="nationality-${index}" required>${nationalitySelectOptions(data.nationality || "")}</select></label>${lead ? `<label class="pickup-field">Pickup location<select name="pickupLocation-${index}" required>${pickupLocationOptions(data.pickupLocation || booking.pickupLocation || "")}</select></label>` : ""}
        <label>Date of birth<input name="dob-${index}" type="date" value="${data.dob || ""}" required></label>
        <fieldset><legend>Gender</legend><label><input type="radio" name="gender-${index}" value="Female" ${data.gender==="Female"?"checked":""}>Female</label><label><input type="radio" name="gender-${index}" value="Male" ${data.gender==="Male"?"checked":""}>Male</label></fieldset>
      </div>
    </section>
  `;
}

function renderTravellers() {
  const total = booking.guests.adults + booking.guests.children;
  const holder = document.getElementById("traveller-list");
  const cards = [];
  cards.push(travellerTemplate(0, true, booking.leadTraveller));
  for (let i = 1; i < total; i++) cards.push(travellerTemplate(i, false, booking.travellers?.[i] || {}));
  holder.innerHTML = cards.join("");

  holder.querySelectorAll(".use-companion").forEach(button => {
    button.addEventListener("click", () => {
      const companions = context.user.companions || [];
      if (!companions.length) {
        document.getElementById("booking-error").textContent = "No companions saved in your account yet.";
        return;
      }
      const names = companions.map((c, i) => `${i + 1}. ${c.name}`).join("\n");
      const choice = prompt(`Choose companion number:\n${names}`);
      const companion = companions[Number(choice) - 1];
      if (!companion) return;
      const index = button.dataset.fill;
      const parts = companion.name.split(" ");
      const card = holder.querySelector(`[data-index="${index}"]`);
      card.querySelector(`[name="firstName-${index}"]`).value = parts.slice(0, -1).join(" ") || companion.name;
      card.querySelector(`[name="lastName-${index}"]`).value = parts.slice(-1).join("") || "";
      card.querySelector(`[name="dob-${index}"]`).value = companion.dob.replaceAll("/", "-");
      const gender = card.querySelector(`[name="gender-${index}"][value="${companion.gender}"]`);
      if (gender) gender.checked = true;
    });
  });
}

function collectTravellers() {
  const total = booking.guests.adults + booking.guests.children;
  const travellers = [];
  for (let i = 0; i < total; i++) {
    const firstName = document.querySelector(`[name="firstName-${i}"]`).value.trim();
    const lastName = document.querySelector(`[name="lastName-${i}"]`).value.trim();
    const nationality = document.querySelector(`[name="nationality-${i}"]`).value;
    const dob = document.querySelector(`[name="dob-${i}"]`).value;
    const gender = document.querySelector(`[name="gender-${i}"]:checked`)?.value || "";
    const pickupLocation = document.querySelector(`[name="pickupLocation-${i}"]`)?.value || "";
    const email = document.querySelector(`[name="email-${i}"]`)?.value.trim() || "";
    const phone = document.querySelector(`[name="phone-${i}"]`)?.value.trim() || "";
    if (!firstName || !lastName || !nationality || !dob || !gender || (i === 0 && (!emailValid(email) || !phoneValid(phone) || !pickupLocation))) return null;
    travellers.push({ firstName, lastName, nationality, dob, gender, email, phone, pickupLocation });
  }
  return travellers;
}

document.querySelectorAll("[data-count]").forEach(button => {
  button.addEventListener("click", () => {
    const key = button.dataset.count;
    const step = Number(button.dataset.step);
    const min = key === "adults" ? 1 : 0;
    booking.guests[key] = Math.max(min, Math.min(8, booking.guests[key] + step));
    savePendingBooking(booking);
    updateSummary();
    renderTravellers();
  });
});

document.getElementById("booking-form").addEventListener("submit", event => {
  event.preventDefault();
  const error = document.getElementById("booking-error");
  error.textContent = "";
  const travellers = collectTravellers();
  if (!travellers) {
    error.textContent = "Please complete all required traveller details.";
    return;
  }
  booking.travellers = travellers;
  booking.leadTraveller = travellers[0];
  booking.pickupLocation = travellers[0].pickupLocation;
  booking.status = "Details completed";
  booking.totals = bookingTotal(booking);
  savePendingBooking(booking);
  window.location.href = "payment.html";
});

updateSummary();
renderTravellers();
