const booking = getPendingBooking();

if (!booking || booking.status !== "Upcoming") {
  window.location.href = "listing.html";
}

document.getElementById("confirmation-card").innerHTML = `
  <div class="confirm-icon">✓</div>
  <h1>Booking confirmed</h1>
  <p>Your trip has been added to your booking history.</p>
  <div class="confirm-details">
    <span>Reference</span><b>${booking.reference}</b>
    <span>Trip</span><b>${booking.title}</b>
    <span>Date</span><b>${booking.date}</b>
    <span>Total paid</span><b>${formatEuro(booking.total)}</b>
  </div>
  <div class="confirm-actions">
    <a href="account.html#booking-history">View booking history</a>
    <a href="../landing.html">Back to home</a>
  </div>
`;
