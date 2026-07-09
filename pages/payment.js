const context = requireLoggedIn();
let booking = getPendingBooking();

if (!booking || !booking.travellers?.length) {
  window.location.href = "booking.html";
}

const summary = document.getElementById("payment-summary");
summary.innerHTML = bookingSummaryHtml(booking) + `<button class="checkout-pay" form="payment-form" type="submit">Pay Now</button>`;
document.querySelectorAll(".pay-option input").forEach(input => {
  input.addEventListener("change", () => {
    document.querySelectorAll(".pay-option").forEach(label => label.classList.toggle("selected", label.contains(input) && input.checked));
  });
});

document.getElementById("card-number").addEventListener("input", event => {
  event.target.value = event.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim().slice(0, 19);
});

document.getElementById("card-exp").addEventListener("input", event => {
  let value = event.target.value.replace(/\D/g, "").slice(0, 4);
  if (value.length > 2) value = `${value.slice(0, 2)}/${value.slice(2)}`;
  event.target.value = value;
});

document.getElementById("card-cvv").addEventListener("input", event => {
  event.target.value = event.target.value.replace(/\D/g, "").slice(0, 4);
});

function validatePayment() {
  const cardNumber = document.getElementById("card-number").value.replace(/\s/g, "");
  const exp = document.getElementById("card-exp").value;
  const cvv = document.getElementById("card-cvv").value;
  if (!/^\d{16}$/.test(cardNumber)) return "Please enter a valid 16-digit card number.";
  if (!/^\d{2}\/\d{2}$/.test(exp)) return "Please enter expiration as MM/YY.";
  if (!/^\d{3,4}$/.test(cvv)) return "Please enter a valid CVV.";
  if (!document.getElementById("billing-name").value.trim()) return "Please enter the name on card.";
  if (!document.getElementById("street").value.trim() || !document.getElementById("city").value.trim() || !document.getElementById("zip").value.trim() || !document.getElementById("country").value) return "Please complete billing address.";
  if (!document.getElementById("terms").checked) return "Please accept the terms and privacy policy.";
  return "";
}

document.getElementById("payment-form").addEventListener("submit", event => {
  event.preventDefault();

  const error = document.getElementById("payment-error");
  error.textContent = "";

  const message = validatePayment();
  if (message) {
    error.textContent = message;
    return;
  }

  const finalTotals = bookingTotal(booking);
  booking.status = "Upcoming";
  booking.paymentStatus = "Paid";
  booking.paidAt = new Date().toISOString();
  booking.total = finalTotals.total;
  booking.price = formatEuro(finalTotals.total);
  booking.title = booking.trip.title;
  booking.date = booking.trip.date;
  booking.destination = booking.trip.destination;
  booking.country = booking.trip.country;
  booking.reference = `TRV-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  booking.travellerCount = booking.guests.adults + booking.guests.children;

  context.user.bookings = Array.isArray(context.user.bookings) ? context.user.bookings : [];

  const completedBooking = {
    id: booking.id || `booking-${Date.now()}`,
    reference: booking.reference,
    title: booking.title,
    destination: booking.destination,
    country: booking.country,
    date: booking.date,
    endDate: booking.trip.endDate || "",
    duration: booking.trip.duration || "",
    status: booking.status,
    paymentStatus: booking.paymentStatus,
    price: formatEuro(finalTotals.total),
    total: finalTotals.total,
    payMode: "full",
    guests: booking.guests,
    travellers: booking.travellers,
    pickupLocation: booking.pickupLocation || booking.leadTraveller?.pickupLocation || "",
    billing: {
      name: document.getElementById("billing-name").value.trim(),
      street: document.getElementById("street").value.trim(),
      city: document.getElementById("city").value.trim(),
      zip: document.getElementById("zip").value.trim(),
      country: document.getElementById("country").value
    },
    trip: booking.trip,
    createdAt: booking.createdAt,
    paidAt: booking.paidAt,
    updatedAt: new Date().toISOString()
  };

  const existingIndex = context.user.bookings.findIndex(item => item.id === completedBooking.id || item.reference === completedBooking.reference);
  if (existingIndex >= 0) {
    context.user.bookings[existingIndex] = completedBooking;
  } else {
    context.user.bookings.unshift(completedBooking);
  }
  saveUserContext(context);
  savePendingBooking(booking);
  window.location.href = "booking-confirmation.html";
});
