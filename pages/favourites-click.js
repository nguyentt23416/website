function prepareFavouriteCards() {
  document.querySelectorAll("#favourites-list .fav-card").forEach(card => {
    const heart = card.querySelector("[data-fav]");
    if (!heart) return;

    card.dataset.tripId = heart.dataset.fav;
    card.tabIndex = 0;
    card.setAttribute("role", "link");
    card.style.cursor = "pointer";
  });
}

function openFavourite(card) {
  const tripId = card.dataset.tripId;
  if (!tripId) return;
  window.location.href = `deal.html?id=${encodeURIComponent(tripId)}`;
}

document.addEventListener("click", event => {
  if (event.target.closest("[data-fav]")) return;

  const card = event.target.closest("#favourites-list .fav-card");
  if (!card) return;

  openFavourite(card);
});

document.addEventListener("keydown", event => {
  if (event.key !== "Enter" && event.key !== " ") return;

  const card = event.target.closest("#favourites-list .fav-card");
  if (!card) return;

  event.preventDefault();
  openFavourite(card);
});

const favouritesList = document.getElementById("favourites-list");

if (favouritesList) {
  prepareFavouriteCards();

  new MutationObserver(prepareFavouriteCards).observe(favouritesList, {
    childList: true,
    subtree: true
  });
}
