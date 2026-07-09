const appBase = document.body.dataset.base || "";

const AUTH_USERS_KEY_FOR_FAVS = "travelio_users";
const AUTH_SESSION_KEY_FOR_FAVS = "travelio_session";

function getTravelioUserForFavorites() {
  const sessionRaw = localStorage.getItem(AUTH_SESSION_KEY_FOR_FAVS);
  const usersRaw = localStorage.getItem(AUTH_USERS_KEY_FOR_FAVS);
  if (!sessionRaw || !usersRaw) return null;
  const session = JSON.parse(sessionRaw);
  const users = JSON.parse(usersRaw);
  const index = users.findIndex(user => user.id === session.id);
  if (index < 0) return null;
  users[index].favorites = Array.isArray(users[index].favorites) ? users[index].favorites : [];
  return { users, index, user: users[index] };
}

function saveTravelioUserForFavorites(context) {
  context.users[context.index] = context.user;
  localStorage.setItem(AUTH_USERS_KEY_FOR_FAVS, JSON.stringify(context.users));
}

function isFavoriteTrip(id) {
  const context = getTravelioUserForFavorites();
  return Boolean(context && context.user.favorites.some(item => item.id === id));
}

function toggleFavoriteTrip(favorite) {
  const context = getTravelioUserForFavorites();
  if (!context) {
    window.location.href = localPath("pages/login.html");
    return false;
  }

  const exists = context.user.favorites.some(item => item.id === favorite.id);
  if (exists) {
    context.user.favorites = context.user.favorites.filter(item => item.id !== favorite.id);
  } else {
    context.user.favorites.push(favorite);
  }

  saveTravelioUserForFavorites(context);
  return !exists;
}

function favoriteButton(favorite) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = isFavoriteTrip(favorite.id) ? "favorite-toggle is-active" : "favorite-toggle";
  button.setAttribute("aria-label", `Toggle favourite for ${favorite.title}`);
  button.textContent = "♥";
  button.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();
    const active = toggleFavoriteTrip(favorite);
    button.classList.toggle("is-active", active);
  });
  return button;
}


function assetPath(path) {
  if (!path) return "";
  if (/^(https?:|data:|\/)/.test(path)) return path;
  return `${appBase}${path}`;
}

function localPath(path) {
  if (!path) return "#";
  if (/^(https?:|data:|\/|#)/.test(path)) return path;
  return `${appBase}${path}`;
}

const cityImageMap = {
  "Paris": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80",
  "Cappadocia": "https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=1000&q=80",
  "Graz": "https://images.unsplash.com/photo-1516550893923-42d28e5677af?auto=format&fit=crop&w=1000&q=80",
  "Lucerne": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1000&q=80",
  "London": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1000&q=80",
  "Rome": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1000&q=80",
  "Venice": "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1000&q=80",
  "Florence": "https://images.unsplash.com/photo-1543429258-cced2f190cc9?auto=format&fit=crop&w=1000&q=80",
  "Barcelona": "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1000&q=80",
  "Santorini": "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1000&q=80",
  "Amsterdam": "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=1000&q=80",
  "Tokyo": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1000&q=80",
  "Bangkok": "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1000&q=80",
  "Hanoi": "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1000&q=80",
  "Singapore": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1000&q=80",
  "Dubai": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1000&q=80",
  "New York": "https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=1000&q=80",
  "Sydney": "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1000&q=80",
  "Bali": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1000&q=80",
  "Mexico City": "https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=1000&q=80"
};

const countryImageMap = {
  "France": cityImageMap["Paris"],
  "Italy": cityImageMap["Rome"],
  "Spain": cityImageMap["Barcelona"],
  "Greece": cityImageMap["Santorini"],
  "Netherlands": cityImageMap["Amsterdam"],
  "Turkey": cityImageMap["Cappadocia"],
  "Austria": cityImageMap["Graz"],
  "Switzerland": cityImageMap["Lucerne"],
  "United Kingdom": cityImageMap["London"],
  "Japan": cityImageMap["Tokyo"],
  "Thailand": cityImageMap["Bangkok"],
  "Vietnam": cityImageMap["Hanoi"],
  "Singapore": cityImageMap["Singapore"],
  "United Arab Emirates": cityImageMap["Dubai"],
  "United States": cityImageMap["New York"],
  "Australia": cityImageMap["Sydney"],
  "Indonesia": cityImageMap["Bali"],
  "Mexico": cityImageMap["Mexico City"],
  "Portugal": "https://images.unsplash.com/photo-1513735492246-483525079686?auto=format&fit=crop&w=1000&q=80",
  "Germany": "https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=1000&q=80",
  "Croatia": "https://images.unsplash.com/photo-1555990538-c48dbe5fcb17?auto=format&fit=crop&w=1000&q=80",
  "Morocco": "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=1000&q=80",
  "Egypt": "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1000&q=80",
  "New Zealand": "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1000&q=80"
};

function cityPhotoUrl(item) {
  return cityImageMap[item.destination] || countryImageMap[item.country] || "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=80";
}

function dealPhotoUrl(item) {
  const text = `${item.title || ""} ${item.destination || ""} ${item.country || ""}`.toLowerCase();
  for (const name in cityImageMap) {
    if (text.includes(name.toLowerCase())) return cityImageMap[name];
  }
  for (const name in countryImageMap) {
    if (text.includes(name.toLowerCase())) return countryImageMap[name];
  }
  if (text.includes("beach") || text.includes("island") || text.includes("coast")) return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80";
  return "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1000&q=80";
}


const countryCodes = {
  "France": "FR",
  "Italy": "IT",
  "Spain": "ES",
  "Portugal": "PT",
  "Greece": "GR",
  "Netherlands": "NL",
  "Germany": "DE",
  "Austria": "AT",
  "Croatia": "HR",
  "Morocco": "MA",
  "Egypt": "EG",
  "Turkey": "TR",
  "United Arab Emirates": "AE",
  "Japan": "JP",
  "Thailand": "TH",
  "Vietnam": "VN",
  "Indonesia": "ID",
  "Singapore": "SG",
  "Australia": "AU",
  "New Zealand": "NZ",
  "United States": "US",
  "Mexico": "MX",
  "United Kingdom": "GB",
  "Switzerland": "CH",
  "Argentina": "AR",
  "South Africa": "ZA",
  "Israel": "IL",
  "Tanzania": "TZ",
  "Ecuador": "EC",
  "Maldives": "MV"
};

const countries = [
  { name: "France", flag: "🇫🇷" },
  { name: "Italy", flag: "🇮🇹" },
  { name: "Spain", flag: "🇪🇸" },
  { name: "Portugal", flag: "🇵🇹" },
  { name: "Greece", flag: "🇬🇷" },
  { name: "Netherlands", flag: "🇳🇱" },
  { name: "Germany", flag: "🇩🇪" },
  { name: "Switzerland", flag: "🇨🇭" },
  { name: "Austria", flag: "🇦🇹" },
  { name: "Croatia", flag: "🇭🇷" },
  { name: "Morocco", flag: "🇲🇦" },
  { name: "Egypt", flag: "🇪🇬" },
  { name: "Turkey", flag: "🇹🇷" },
  { name: "United Arab Emirates", flag: "🇦🇪" },
  { name: "Japan", flag: "🇯🇵" },
  { name: "Thailand", flag: "🇹🇭" },
  { name: "Vietnam", flag: "🇻🇳" },
  { name: "Indonesia", flag: "🇮🇩" },
  { name: "Singapore", flag: "🇸🇬" },
  { name: "Australia", flag: "🇦🇺" },
  { name: "New Zealand", flag: "🇳🇿" },
  { name: "United States", flag: "🇺🇸" },
  { name: "Mexico", flag: "🇲🇽" },
  { name: "United Kingdom", flag: "🇬🇧" }
];

const countryCoordinates = {
  "France": [48.8566, 2.3522],
  "Italy": [41.9028, 12.4964],
  "Spain": [40.4168, -3.7038],
  "Portugal": [38.7223, -9.1393],
  "Greece": [37.9838, 23.7275],
  "Netherlands": [52.3676, 4.9041],
  "Germany": [52.52, 13.405],
  "Switzerland": [46.948, 7.4474],
  "Austria": [48.2082, 16.3738],
  "Croatia": [45.815, 15.9819],
  "Morocco": [31.6295, -7.9811],
  "Egypt": [30.0444, 31.2357],
  "Turkey": [41.0082, 28.9784],
  "United Arab Emirates": [25.2048, 55.2708],
  "Japan": [35.6762, 139.6503],
  "Thailand": [13.7563, 100.5018],
  "Vietnam": [21.0278, 105.8342],
  "Indonesia": [-6.2088, 106.8456],
  "Singapore": [1.3521, 103.8198],
  "Australia": [-33.8688, 151.2093],
  "New Zealand": [-36.8485, 174.7633],
  "United States": [40.7128, -74.006],
  "Mexico": [19.4326, -99.1332],
  "United Kingdom": [51.5072, -0.1276]
};

function flightDistanceKm(fromCountry, toCountry) {
  const from = countryCoordinates[fromCountry];
  const to = countryCoordinates[toCountry];
  if (!from || !to) return 0;
  const toRad = value => value * Math.PI / 180;
  const earth = 6371;
  const dLat = toRad(to[0] - from[0]);
  const dLon = toRad(to[1] - from[1]);
  const lat1 = toRad(from[0]);
  const lat2 = toRad(to[0]);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return earth * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function predictedListingPrice(item, fromCountry) {
  const stayDays = Number(item.tripLengthDays || 7);
  const hotelQuality = Number(item.hotelRating || String(item.hotel || "4.0").match(/\d+(\.\d+)?/)?.[0] || 4);
  const distance = flightDistanceKm(fromCountry, item.country);
  if (!fromCountry || !distance) return item.price;
  const stayCost = stayDays * 80;
  const hotelCost = hotelQuality * 120;
  const flightCost = distance * 0.11;
  return Math.round((180 + stayCost + hotelCost + flightCost) / 10) * 10;
}

let listingData = [];

const countryMenu = document.getElementById("country-menu");
const destinationMenu = document.getElementById("destination-menu");
const countryTrigger = document.getElementById("country-trigger");
const destinationTrigger = document.getElementById("destination-trigger");
const countryValue = document.getElementById("country-value");
const countryInput = document.getElementById("country-input");
const destinationInput = document.getElementById("destination-input");
if (countryInput) countryInput.name = "from";
const destinationHelp = document.getElementById("destination-help");
const dateTrigger = document.getElementById("date-trigger");
const dateInput = document.getElementById("date-input");
const dateHelp = document.getElementById("date-help");
const tripSearch = document.getElementById("trip-search");

async function loadListings() {
  if (listingData.length) return listingData;
  try {
    const response = await fetch(assetPath("data/json/listing.json"));
    if (!response.ok) throw new Error("Could not load listings");
    listingData = await response.json();
    return listingData;
  } catch {
    listingData = [];
    return listingData;
  }
}

function closeMenus() {
  document.querySelectorAll(".field-dropdown.is-open").forEach(menu => menu.classList.remove("is-open"));
  document.querySelectorAll(".field-trigger[aria-expanded='true']").forEach(button => button.setAttribute("aria-expanded", "false"));
}

function toggleMenu(trigger, menu) {
  if (!trigger || !menu) return;
  const willOpen = !menu.classList.contains("is-open");
  closeMenus();
  if (willOpen) {
    menu.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");
    const search = menu.querySelector(".country-search");
    if (search) setTimeout(() => search.focus(), 0);
  }
}

function buildSearchMenu(menu, items, callback, placeholder) {
  if (!menu) return;
  const searchWrap = document.createElement("div");
  searchWrap.className = "country-search-wrap";
  const search = document.createElement("input");
  search.className = "country-search";
  search.type = "search";
  search.placeholder = placeholder;
  search.autocomplete = "off";
  searchWrap.appendChild(search);
  const list = document.createElement("div");
  list.className = "country-list";
  menu.replaceChildren(searchWrap, list);

  function render(query = "") {
    const text = query.trim().toLowerCase();
    const matches = items.filter(item => item.name.toLowerCase().includes(text));
    if (!matches.length) {
      const empty = document.createElement("p");
      empty.className = "country-empty";
      empty.textContent = "No results found";
      list.replaceChildren(empty);
      return;
    }
    list.replaceChildren(...matches.map(item => {
      const button = document.createElement("button");
      button.type = "button";
      button.role = "menuitem";
      button.className = "country-option";
      const icon = document.createElement("span");
      icon.className = "country-flag";
      icon.textContent = item.flag || "📍";
      const label = document.createElement("span");
      label.className = "country-name";
      label.textContent = item.name;
      button.append(icon, label);
      button.addEventListener("click", () => {
        callback(item);
        closeMenus();
        search.value = "";
        render();
      });
      return button;
    }));
  }

  search.addEventListener("click", event => event.stopPropagation());
  search.addEventListener("input", () => render(search.value));
  render();
}

function setInitialSearchValues() {
  const params = new URLSearchParams(window.location.search);
  const from = params.get("country") || "";
  const destination = params.get("destination") || "";
  const date = params.get("date") || "";
  if (from && countryInput && countryValue) {
    countryInput.value = from;
    countryValue.textContent = from;
  }
  if (destination && destinationInput && destinationHelp) {
    destinationInput.value = destination;
    destinationHelp.textContent = destination;
  }
  if (date && dateInput && dateHelp) {
    dateInput.value = date;
    const selected = new Date(`${date}T00:00:00`);
    if (!Number.isNaN(selected.getTime())) dateHelp.textContent = selected.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  }
}

function setupMenus() {
  buildSearchMenu(countryMenu, countries, country => {
    if (countryValue) countryValue.textContent = country.name;
    if (countryInput) countryInput.value = country.name;
  }, "Search country");
  buildSearchMenu(destinationMenu, countries, country => {
    if (destinationHelp) destinationHelp.textContent = country.name;
    if (destinationInput) destinationInput.value = country.name;
  }, "Search country");
}

setupMenus();
setInitialSearchValues();

if (countryTrigger) countryTrigger.addEventListener("click", () => toggleMenu(countryTrigger, countryMenu));
if (destinationTrigger) destinationTrigger.addEventListener("click", () => toggleMenu(destinationTrigger, destinationMenu));

if (dateTrigger && dateInput) {
  dateTrigger.addEventListener("click", () => {
    try { dateInput.showPicker(); } catch { dateInput.focus(); dateInput.click(); }
  });
}

if (dateInput) {
  dateInput.addEventListener("change", () => {
    if (!dateInput.value || !dateHelp) return;
    const selected = new Date(`${dateInput.value}T00:00:00`);
    dateHelp.textContent = selected.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  });
}

document.addEventListener("click", event => {
  if (!event.target.closest(".search-field")) closeMenus();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeMenus();
});

if (tripSearch) {
  tripSearch.addEventListener("submit", event => {
    const isListingPage = Boolean(document.getElementById("tour-list"));
    if (isListingPage) {
      event.preventDefault();
      const params = new URLSearchParams();
      if (countryInput?.value) params.set("country", countryInput.value);
      if (destinationInput?.value) params.set("destination", destinationInput.value);
      if (dateInput?.value) params.set("date", dateInput.value);
      const query = params.toString();
      window.history.replaceState({}, "", query ? `${window.location.pathname}?${query}` : window.location.pathname);
      renderToursPage();
      return;
    }
    if (!countryInput?.value || !destinationInput?.value || !dateInput?.value) {
      event.preventDefault();
      if (!countryInput?.value && countryValue) countryValue.textContent = "Please choose a country";
      if (!destinationInput?.value && destinationHelp) destinationHelp.textContent = "Please choose a country";
      if (!dateInput?.value && dateHelp) dateHelp.textContent = "Please select a date";
    }
  });
}

const dealSections = [
  { id: "popular-deals-list", url: "data/json/popular-deals.json" },
  { id: "recent-packages-list", url: "data/json/recent-packages.json" },
  { id: "summer-offers-list", url: "data/json/summer-offers.json", dark: true },
  { id: "last-minute-deals-list", url: "data/json/last-minute-deals.json" }
];

function money(value, currency = "€") {
  if (typeof value === "string") return value;
  return `${currency}${value}`;
}

function discountedPrice(deal) {
  if (deal.finalPrice) return deal.finalPrice;
  if (deal.price) return deal.price;
  if (deal.originalPrice && deal.discountPercent) return Math.round(deal.originalPrice * (100 - deal.discountPercent) / 100);
  return "";
}

function createDealCard(deal, options = {}) {
  const link = document.createElement("a");
  link.className = "trip-card-link";
  link.href = localPath(deal.href || `pages/deal.html?id=${encodeURIComponent(deal.id || deal.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"))}`);
  link.setAttribute("aria-label", `View details for ${deal.title}`);
  const card = document.createElement("article");
  card.className = options.dark ? "trip-card dark" : "trip-card";
  const imageWrap = document.createElement("div");
  imageWrap.className = "trip-image-wrap";
  const image = document.createElement("img");
  image.src = assetPath(deal.image);
  image.alt = deal.alt || deal.title;
  image.loading = "lazy";
  image.addEventListener("error", () => {
    image.remove();
    imageWrap.classList.add("image-failed");
    imageWrap.textContent = deal.title;
  });
  imageWrap.appendChild(image);
  const favoriteId = deal.id || deal.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  imageWrap.appendChild(favoriteButton({
    id: favoriteId,
    title: deal.title,
    date: deal.date,
    rating: deal.rating,
    image: deal.image,
    price: money(discountedPrice(deal), deal.currency),
    href: deal.href || `pages/deal.html?id=${encodeURIComponent(favoriteId)}`
  }));
  const discountBadge = deal.discountPercent ? `${deal.discountPercent}% Off` : null;
  const badges = Array.isArray(deal.badges) && deal.badges.length ? deal.badges : discountBadge ? [discountBadge] : [];
  if (badges.length) {
    const badgeStack = document.createElement("div");
    badgeStack.className = "badge-stack";
    badges.forEach(text => {
      const badge = document.createElement("span");
      badge.className = "deal-badge sale";
      badge.textContent = text;
      badgeStack.appendChild(badge);
    });
    imageWrap.appendChild(badgeStack);
  }
  const copy = document.createElement("div");
  copy.className = "trip-copy";
  const top = document.createElement("div");
  const title = document.createElement("h3");
  title.textContent = deal.title;
  const rating = document.createElement("span");
  rating.textContent = `★ ${deal.rating}`;
  top.append(title, rating);
  const detail = document.createElement("p");
  detail.append(document.createTextNode(deal.date));
  const price = document.createElement("b");
  price.append(document.createTextNode("From "));
  const original = deal.originalPrice || deal.oldPrice;
  if (original) {
    const oldPrice = document.createElement("s");
    oldPrice.textContent = money(original, deal.currency);
    price.append(oldPrice, document.createTextNode(" "));
  }
  const newPrice = document.createElement("em");
  newPrice.textContent = money(discountedPrice(deal), deal.currency);
  price.appendChild(newPrice);
  detail.appendChild(price);
  copy.append(top, detail);
  card.append(imageWrap, copy);
  link.appendChild(card);
  return link;
}

async function renderDealSection(section) {
  const target = document.getElementById(section.id);
  if (!target) return;
  try {
    const response = await fetch(assetPath(section.url));
    if (!response.ok) throw new Error("Could not load deals");
    const deals = await response.json();
    target.replaceChildren(...deals.map(deal => createDealCard(deal, section)));
  } catch {
    target.textContent = "Deals could not be loaded.";
  }
}

dealSections.forEach(renderDealSection);

async function renderPopularCities() {
  const target = document.getElementById("popular-cities-list");
  if (!target) return;
  try {
    const response = await fetch(assetPath("data/json/popular-cities.json"));
    if (!response.ok) throw new Error("Could not load cities");
    const cities = await response.json();
    target.replaceChildren(...cities.map(city => {
      const link = document.createElement("a");
      link.className = "city-card";
      const cityParams = new URLSearchParams();
      cityParams.set("destination", city.name);
      if (city.country) cityParams.set("country", city.country);
      link.href = localPath(`pages/listing.html?${cityParams.toString()}`);
      link.setAttribute("aria-label", `View trips to ${city.name}`);
      const image = document.createElement("img");
      image.src = assetPath(city.image);
      image.alt = city.alt || `${city.name}, ${city.country}`;
      image.loading = "lazy";
      const copy = document.createElement("div");
      copy.className = "city-copy";
      const name = document.createElement("h3");
      name.textContent = city.name;
      const country = document.createElement("p");
      country.textContent = city.country;
      copy.append(name, country);
      link.append(image, copy);
      return link;
    }));
  } catch {
    target.textContent = "Cities could not be loaded.";
  }
}

async function renderToursPage() {
  const target = document.getElementById("tour-list");
  if (!target) return;
  const listings = await loadListings();
  const params = new URLSearchParams(window.location.search);
  const selectedDestination = params.get("destination") || "";
  const selectedCountry = params.get("country") || "";
  const selected = selectedDestination;
  if (selectedDestination && destinationInput && destinationHelp) {
    destinationInput.value = selectedDestination;
    destinationHelp.textContent = selectedDestination;
  }
  if (selectedCountry && countryInput && countryValue) {
    countryInput.value = selectedCountry;
    countryValue.textContent = selectedCountry;
  }
  const visibleListings = selected ? listings.filter(item => item.country.toLowerCase() === selected.toLowerCase()) : listings;
  const count = document.getElementById("tour-count");
  const region = document.getElementById("tour-region");
  if (count) count.textContent = visibleListings.length;
  if (region) region.textContent = selected || "all destinations";
  target.replaceChildren(...visibleListings.map(item => {
    const link = document.createElement("a");
    link.className = "tour-card";
    link.href = localPath(item.href || `pages/deal.html?id=${encodeURIComponent(item.id)}`);
    link.setAttribute("aria-label", `View ${item.title}`);
    const visual = document.createElement("div");
    visual.className = "tour-image";
    const src = localPath(item.image || cityPhotoUrl(item));
    const fallbackSrc = cityPhotoUrl(item);
    visual.style.backgroundImage = `url("${src}")`;
    const img = document.createElement("img");
    img.src = src;
    img.alt = item.alt || `${item.destination} travel photo`;
    img.loading = "lazy";
    img.addEventListener("error", () => {
      if (img.src !== fallbackSrc) {
        img.src = fallbackSrc;
        visual.style.backgroundImage = `url("${fallbackSrc}")`;
        return;
      }
      visual.className = "tour-image tour-image-failed";
      visual.textContent = item.destination;
    });
    visual.appendChild(img);
    visual.appendChild(favoriteButton({
      id: item.id,
      title: item.title,
      date: item.dates ? item.dates[0] : "",
      rating: item.rating,
      image: item.image || cityPhotoUrl(item),
      price: money(predictedListingPrice(item, selectedCountry), item.currency),
      href: item.href || `pages/deal.html?id=${encodeURIComponent(item.id)}`
    }));
    const content = document.createElement("div");
    content.className = "tour-content";
    const head = document.createElement("div");
    head.className = "tour-head";
    const title = document.createElement("h2");
    title.textContent = item.title;
    head.append(title);
    const destination = document.createElement("p");
    destination.className = "tour-country";
    destination.textContent = `${item.destination}, ${item.country}`;
    const tags = document.createElement("div");
    tags.className = "tour-tags";
    item.tags.forEach(tag => {
      const chip = document.createElement("span");
      chip.textContent = tag;
      tags.appendChild(chip);
    });
    const dateLabel = document.createElement("small");
    dateLabel.textContent = "Trip Length";
    const dates = document.createElement("p");
    dates.className = "tour-dates";
    dates.textContent = `${item.tripLength || item.duration} | Starts ${item.dates[0]}`;
    const meta = document.createElement("div");
    meta.className = "tour-meta";
    [`☆ ${item.rating} (${item.reviews} Reviews)`, item.hotel, item.location, item.duration].forEach(detail => {
      const span = document.createElement("span");
      span.textContent = detail;
      meta.appendChild(span);
    });
    const price = document.createElement("b");
    price.className = "tour-price";
    price.textContent = `From ${money(predictedListingPrice(item, selectedCountry), item.currency)}`;
    content.append(head, destination, tags, dateLabel, dates, meta, price);
    link.append(visual, content);
    return link;
  }));
}

renderPopularCities();
renderToursPage();
