const BOOKING_KEY = "travelio_pending_booking";
const BOOKING_AUTH_USERS_KEY = "travelio_users";
const BOOKING_AUTH_SESSION_KEY = "travelio_session";

function getSessionUserContext() {
  const sessionRaw = localStorage.getItem(BOOKING_AUTH_SESSION_KEY);
  const usersRaw = localStorage.getItem(BOOKING_AUTH_USERS_KEY);
  if (!sessionRaw || !usersRaw) return null;
  const session = JSON.parse(sessionRaw);
  const users = JSON.parse(usersRaw);
  const index = users.findIndex(user => user.id === session.id);
  if (index < 0) return null;
  users[index].bookings = Array.isArray(users[index].bookings) ? users[index].bookings : [];
  users[index].companions = Array.isArray(users[index].companions) ? users[index].companions : [];
  return { session, users, index, user: users[index] };
}

function saveUserContext(context) {
  context.users[context.index] = context.user;
  localStorage.setItem(BOOKING_AUTH_USERS_KEY, JSON.stringify(context.users));
}

function requireLoggedIn() {
  const context = getSessionUserContext();
  if (!context) {
    const next = encodeURIComponent(location.pathname.split("/").pop() + location.search);
    window.location.href = `login.html?next=${next}`;
    return null;
  }
  return context;
}

function savePendingBooking(booking) {
  sessionStorage.setItem(BOOKING_KEY, JSON.stringify(booking));
}

function getPendingBooking() {
  const raw = sessionStorage.getItem(BOOKING_KEY);
  return raw ? JSON.parse(raw) : null;
}

function clearPendingBooking() {
  sessionStorage.removeItem(BOOKING_KEY);
}

function formatEuro(value) {
  return `€${Number(value || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function simpleEuro(value) {
  return `€${Math.round(Number(value || 0)).toLocaleString("en-US")}`;
}

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(path);
  return await response.json();
}

function slug(text) {
  return String(text || "trip").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function dealPrice(item) {
  if (item.finalPrice) return Number(item.finalPrice);
  if (item.price) return Number(item.price);
  if (item.originalPrice && item.discountPercent) return Math.round(item.originalPrice * (1 - item.discountPercent / 100));
  if (item.oldPrice && item.discountPercent) return Math.round(item.oldPrice * (1 - item.discountPercent / 100));
  return 1199;
}

function normalizeTrip(item, source = "deal") {
  const id = item.id || slug(item.title || item.destination);
  const title = item.title || item.destination || "Travel Package";
  const destination = item.destination || title.split(" ")[0] || "Destination";
  const country = item.country || destination || "Europe";
  const durationText = item.tripLength || item.duration || "7 days";
  const daysMatch = String(durationText).match(/\d+/);
  const days = item.tripLengthDays || (daysMatch ? Number(daysMatch[0]) : 7);
  const price = dealPrice(item);
  const image = item.image || "";
  const date = Array.isArray(item.dates) ? item.dates[0] : item.date || "Apr 5, 2026";

  return {
    id,
    source,
    title,
    country,
    destination,
    region: item.region || "Europe",
    image,
    date,
    endDate: Array.isArray(item.dates) ? item.dates[1] : "",
    rating: item.rating || "4.6",
    reviews: item.reviews || 24,
    currency: item.currency || "€",
    price,
    oldPrice: item.originalPrice || item.oldPrice || "",
    duration: durationText,
    days,
    hotel: item.hotel || `${item.hotelRating || "4.3"} Star Hotel`,
    hotelRating: item.hotelRating || "4.3",
    location: item.location || `${destination} Central`,
    tags: item.tags || ["Hotel", "Flight", "Transfer"],
    href: item.href || `pages/deal.html?id=${encodeURIComponent(id)}`
  };
}

async function loadAllTrips(base = "../") {
  const sources = [
    ["popular", `${base}data/json/popular-deals.json`],
    ["recent", `${base}data/json/recent-packages.json`],
    ["summer", `${base}data/json/summer-offers.json`],
    ["last-minute", `${base}data/json/last-minute-deals.json`],
    ["listing", `${base}data/json/listing.json`]
  ];

  const results = [];
  for (const [source, path] of sources) {
    try {
      const rows = await loadJson(path);
      rows.forEach(item => results.push(normalizeTrip(item, source)));
    } catch {}
  }
  return results;
}

async function findTripById(id, base = "../") {
  const trips = await loadAllTrips(base);
  return trips.find(trip => trip.id === id) || trips[0] || null;
}

function bookingTotal(booking) {
  const adultCount = Number(booking.guests?.adults || 1);
  const childCount = Number(booking.guests?.children || 0);
  const adultTotal = booking.trip.price * adultCount;
  const childTotal = Math.round(booking.trip.price * 0.5) * childCount;
  const subtotal = adultTotal + childTotal;
  const tax = Math.round(subtotal * 0.05);
  return { adultTotal, childTotal, subtotal, tax, total: subtotal + tax };
}

function bookingSummaryHtml(booking) {
  const totals = bookingTotal(booking);
  return `
    <div class="booking-summary-card">
      <div class="summary-trip">
        <div class="summary-thumb">${booking.trip.image ? `<img src="../${booking.trip.image}" alt="${booking.trip.title}">` : booking.trip.destination}</div>
        <div><h3>${booking.trip.title}</h3><small>${booking.trip.date}</small></div>
      </div>
      <div class="summary-line"><span>${booking.guests.adults} Adult</span><b>${formatEuro(totals.adultTotal)}</b></div>
      <div class="summary-line"><span>${booking.guests.children} Children</span><b>${formatEuro(totals.childTotal)}</b></div>
      <div class="summary-line"><span>Taxes & fees <em>5%</em></span><b>${formatEuro(totals.tax)}</b></div>
      <div class="summary-total"><span>Total price</span><strong>${formatEuro(totals.total)}</strong></div>
    </div>
  `;
}
