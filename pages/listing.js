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
  "France","Italy","Spain","Portugal","Greece","Netherlands","Germany","Switzerland",
  "Austria","Croatia","Morocco","Egypt","Turkey","United Arab Emirates","Japan","Thailand",
  "Vietnam","Indonesia","Singapore","Australia","New Zealand","United States","Mexico","United Kingdom","Argentina","South Africa","Israel","Tanzania","Ecuador","Maldives"
];

const countryCoordinates = {
  "France":[48.8566,2.3522],"Italy":[41.9028,12.4964],"Spain":[40.4168,-3.7038],"Portugal":[38.7223,-9.1393],
  "Greece":[37.9838,23.7275],"Netherlands":[52.3676,4.9041],"Germany":[52.52,13.405],"Switzerland":[46.948,7.4474],
  "Austria":[48.2082,16.3738],"Croatia":[45.815,15.9819],"Morocco":[31.6295,-7.9811],"Egypt":[30.0444,31.2357],
  "Turkey":[41.0082,28.9784],"United Arab Emirates":[25.2048,55.2708],"Japan":[35.6762,139.6503],"Thailand":[13.7563,100.5018],
  "Vietnam":[21.0285,105.8542],"Indonesia":[-6.2088,106.8456],"Singapore":[1.3521,103.8198],"Australia":[-33.8688,151.2093],
  "New Zealand":[-36.8485,174.7633],"United States":[40.7128,-74.006],"Mexico":[19.4326,-99.1332],"United Kingdom":[51.5072,-0.1276]
};

const flags = {
  "France":"🇫🇷","Italy":"🇮🇹","Spain":"🇪🇸","Portugal":"🇵🇹","Greece":"🇬🇷","Netherlands":"🇳🇱","Germany":"🇩🇪","Switzerland":"🇨🇭",
  "Austria":"🇦🇹","Croatia":"🇭🇷","Morocco":"🇲🇦","Egypt":"🇪🇬","Turkey":"🇹🇷","United Arab Emirates":"🇦🇪","Japan":"🇯🇵","Thailand":"🇹🇭",
  "Vietnam":"🇻🇳","Indonesia":"🇮🇩","Singapore":"🇸🇬","Australia":"🇦🇺","New Zealand":"🇳🇿","United States":"🇺🇸","Mexico":"🇲🇽","United Kingdom":"🇬🇧"
};

const countryMenu = document.getElementById("country-menu");
const destinationMenu = document.getElementById("destination-menu");
const countryTrigger = document.getElementById("country-trigger");
const destinationTrigger = document.getElementById("destination-trigger");
const countryValue = document.getElementById("country-value");
const destinationHelp = document.getElementById("destination-help");
const countryInput = document.getElementById("country-input");
const destinationInput = document.getElementById("destination-input");
const dateTrigger = document.getElementById("date-trigger");
const dateInput = document.getElementById("date-input");
const dateHelp = document.getElementById("date-help");
const tripSearch = document.getElementById("trip-search");
const tourList = document.getElementById("tour-list");

let listingData = [];
let fromCountry = "United Kingdom";
let destinationCountry = "";
let destinationCity = "";
let activeStayRating = 0;
let maxPriceLimit = 10000;

function money(value) {
  return `€${Math.round(value)}`;
}

function distanceKm(from, to) {
  const a = countryCoordinates[from] || countryCoordinates["United Kingdom"];
  const b = countryCoordinates[to] || a;
  const rad = value => value * Math.PI / 180;
  const r = 6371;
  const dLat = rad(b[0] - a[0]);
  const dLon = rad(b[1] - a[1]);
  const lat1 = rad(a[0]);
  const lat2 = rad(b[0]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(h));
}

function listingPrices(item) {
  const distance = distanceKm(fromCountry, item.country);
  const hotelRating = Number(item.hotelRating || item.hotel?.match(/[\d.]+/)?.[0] || 4);
  const minDays = Number(item.lengthMin || item.tripLengthMin || item.tripLengthDays || 3);
  const maxDays = Number(item.lengthMax || item.tripLengthMax || item.tripLengthDays || minDays + 4);
  const flightBase = 120 + distance * 0.11;
  const hotelPerDay = 35 + hotelRating * 28;
  const localPerDay = 24 + hotelRating * 9;
  const serviceFee = 90;
  const min = flightBase + minDays * (hotelPerDay + localPerDay) + serviceFee;
  const max = flightBase + maxDays * (hotelPerDay + localPerDay) + serviceFee + Math.max(80, distance * 0.025);
  return { min: Math.round(min), max: Math.round(max) };
}

function closeMenus() {
  document.querySelectorAll(".field-dropdown.is-open").forEach(menu => menu.classList.remove("is-open"));
  document.querySelectorAll(".field-trigger[aria-expanded='true']").forEach(button => button.setAttribute("aria-expanded", "false"));
}

function makeCountryButton(country, callback) {
  const button = document.createElement("button");
  button.type = "button";
  button.innerHTML = `<span class="country-flag">${flags[country] || ""}</span><span class="country-name">${country}</span>`;
  button.addEventListener("click", () => {
    callback(country);
    closeMenus();
  });
  return button;
}

function buildCountryMenu(menu, callback) {
  if (!menu) return;
  const wrap = document.createElement("div");
  wrap.className = "country-search-wrap";
  const search = document.createElement("input");
  search.className = "country-search";
  search.type = "search";
  search.placeholder = "Search country";
  search.autocomplete = "off";
  wrap.appendChild(search);
  const list = document.createElement("div");
  list.className = "country-list";
  menu.replaceChildren(wrap, list);

  function render(query = "") {
    const q = query.trim().toLowerCase();
    const matches = countries.filter(country => country.toLowerCase().includes(q));
    list.replaceChildren(...matches.map(country => makeCountryButton(country, callback)));
    if (!matches.length) {
      const empty = document.createElement("p");
      empty.className = "country-empty";
      empty.textContent = "No countries found";
      list.replaceChildren(empty);
    }
  }

  search.addEventListener("click", event => event.stopPropagation());
  search.addEventListener("input", () => render(search.value));
  render();
}

function toggleMenu(trigger, menu) {
  const willOpen = !menu.classList.contains("is-open");
  closeMenus();
  if (willOpen) {
    menu.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");
    const input = menu.querySelector(".country-search");
    if (input) setTimeout(() => input.focus(), 0);
  }
}

function readParams() {
  return new URLSearchParams(window.location.search);
}

function updateSearchFieldsFromParams() {
  const params = readParams();
  const from = params.get("from");
  const countryParam = params.get("country");
  const dest = params.get("destination");
  const date = params.get("date");

  if (from && countries.includes(from)) fromCountry = from;

  if (dest) {
    if (countries.includes(dest)) {
      destinationCountry = dest;
      destinationCity = "";
    } else {
      destinationCity = dest;
      const matchingCity = listingData.find(item => String(item.destination).toLowerCase() === dest.toLowerCase());
      destinationCountry = matchingCity?.country || countryParam || "";
    }
  } else if (countryParam) {
    destinationCountry = countryParam;
    destinationCity = "";
  } else {
    destinationCountry = "";
    destinationCity = "";
  }

  countryInput.value = fromCountry;
  countryValue.textContent = fromCountry === "United Kingdom" && !from ? "" : fromCountry;
  destinationInput.value = destinationCity || destinationCountry;
  destinationHelp.textContent = destinationCity || destinationCountry;

  if (date) {
    dateInput.value = date;
    const parsed = new Date(`${date}T00:00:00`);
    if (!Number.isNaN(parsed.getTime())) {
      dateHelp.textContent = parsed.toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });
    }
  }
}

function getFilterValues() {
  const priceMin = Number(document.getElementById("price-min")?.value || 0);
  const priceMax = Number(document.getElementById("price-max")?.value || maxPriceLimit);
  const lengthMin = Number(document.getElementById("length-min")?.value || 3);
  const lengthMax = Number(document.getElementById("length-max")?.value || 21);
  const stay = document.querySelector(".stay-filter:checked")?.value || "Any";
  const sort = document.getElementById("sort-select")?.value || "recommended";
  const categories = Array.from(document.querySelectorAll(".category-filter:checked")).map(input => input.value);
  return {
    priceMin: Math.min(priceMin, priceMax),
    priceMax: Math.max(priceMin, priceMax),
    lengthMin: Math.min(lengthMin, lengthMax),
    lengthMax: Math.max(lengthMin, lengthMax),
    stay,
    sort,
    categories,
    rating: activeStayRating
  };
}

function updateFilterLabels() {
  const filters = getFilterValues();
  const priceMin = document.getElementById("price-min");
  const priceMax = document.getElementById("price-max");
  if (priceMin && Number(priceMin.value) > Number(priceMax.value)) [priceMin.value, priceMax.value] = [priceMax.value, priceMin.value];
  const lengthMin = document.getElementById("length-min");
  const lengthMax = document.getElementById("length-max");
  if (lengthMin && Number(lengthMin.value) > Number(lengthMax.value)) [lengthMin.value, lengthMax.value] = [lengthMax.value, lengthMin.value];

  const minPriceText = document.getElementById("price-min-display");
  const maxPriceText = document.getElementById("price-max-display");
  if (minPriceText) minPriceText.value = `Min ${money(filters.priceMin)}`;
  if (maxPriceText) maxPriceText.value = `Max ${money(filters.priceMax)}`;

  const minLengthText = document.getElementById("length-min-label");
  const maxLengthText = document.getElementById("length-max-label");
  if (minLengthText) minLengthText.textContent = `min. ${filters.lengthMin} days`;
  if (maxLengthText) maxLengthText.textContent = filters.lengthMax >= 21 ? "21+ days" : `${filters.lengthMax} days`;
}

function updateStars() {
  document.querySelectorAll("#stay-rating-filter button").forEach(button => {
    const value = Number(button.dataset.rating);
    button.classList.toggle("active", value <= activeStayRating);
    button.textContent = value <= activeStayRating ? "★" : "☆";
  });
}

function normalizedItem(item) {
  const hotelRating = Number(item.hotelRating || item.hotel?.match(/[\d.]+/)?.[0] || 4);
  const lengthValue = Number(item.tripLengthDays || 3);
  const lengthMin = Number(item.lengthMin || Math.max(3, lengthValue - 2));
  const lengthMax = Number(item.lengthMax || Math.min(21, Math.max(lengthMin, lengthValue + 4)));
  const prices = listingPrices({ ...item, hotelRating, lengthMin, lengthMax });
  return {
    ...item,
    hotelRating,
    lengthMin,
    lengthMax,
    minPrice: prices.min,
    maxPrice: prices.max
  };
}


const cityImageMap = {
  "Paris": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80",
  "Nice": "https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?auto=format&fit=crop&w=1000&q=80",
  "Lyon": "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1000&q=80",
  "Marseille": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=80",
  "Bordeaux": "https://images.unsplash.com/photo-1513735492246-483525079686?auto=format&fit=crop&w=1000&q=80",
  "Rome": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1000&q=80",
  "Venice": "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1000&q=80",
  "Florence": "https://images.unsplash.com/photo-1543429258-cced2f190cc9?auto=format&fit=crop&w=1000&q=80",
  "Milan": "https://images.unsplash.com/photo-1513581166391-887a96ddeafd?auto=format&fit=crop&w=1000&q=80",
  "Naples": "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1000&q=80",
  "Barcelona": "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1000&q=80",
  "Madrid": "https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=1000&q=80",
  "Seville": "https://images.unsplash.com/photo-1558642084-fd07fae5282e?auto=format&fit=crop&w=1000&q=80",
  "Valencia": "https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?auto=format&fit=crop&w=1000&q=80",
  "Granada": "https://images.unsplash.com/photo-1558642084-fd07fae5282e?auto=format&fit=crop&w=1000&q=80",
  "Lisbon": "https://images.unsplash.com/photo-1513735492246-483525079686?auto=format&fit=crop&w=1000&q=80",
  "Porto": "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1000&q=80",
  "Sintra": "https://images.unsplash.com/photo-1513735492246-483525079686?auto=format&fit=crop&w=1000&q=80",
  "Faro": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
  "Madeira": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=80",
  "Athens": "https://images.unsplash.com/photo-1555993539-1732b0258235?auto=format&fit=crop&w=1000&q=80",
  "Santorini": "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1000&q=80",
  "Mykonos": "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1000&q=80",
  "Crete": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
  "Rhodes": "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1000&q=80",
  "Amsterdam": "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=1000&q=80",
  "Rotterdam": "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?auto=format&fit=crop&w=1000&q=80",
  "Utrecht": "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=1000&q=80",
  "The Hague": "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?auto=format&fit=crop&w=1000&q=80",
  "Giethoorn": "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=1000&q=80",
  "Berlin": "https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=1000&q=80",
  "Munich": "https://images.unsplash.com/photo-1595867818082-083862f3d630?auto=format&fit=crop&w=1000&q=80",
  "Hamburg": "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?auto=format&fit=crop&w=1000&q=80",
  "Cologne": "https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=1000&q=80",
  "Dresden": "https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=1000&q=80",
  "Zurich": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1000&q=80",
  "Lucerne": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1000&q=80",
  "Geneva": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1000&q=80",
  "Interlaken": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1000&q=80",
  "Zermatt": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1000&q=80",
  "Vienna": "https://images.unsplash.com/photo-1516550893923-42d28e5677af?auto=format&fit=crop&w=1000&q=80",
  "Salzburg": "https://images.unsplash.com/photo-1516550893923-42d28e5677af?auto=format&fit=crop&w=1000&q=80",
  "Innsbruck": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1000&q=80",
  "Graz": "https://images.unsplash.com/photo-1516550893923-42d28e5677af?auto=format&fit=crop&w=1000&q=80",
  "Hallstatt": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1000&q=80",
  "Dubrovnik": "https://images.unsplash.com/photo-1555990538-c48dbe5fcb17?auto=format&fit=crop&w=1000&q=80",
  "Split": "https://images.unsplash.com/photo-1555990538-c48dbe5fcb17?auto=format&fit=crop&w=1000&q=80",
  "Zagreb": "https://images.unsplash.com/photo-1555990538-c48dbe5fcb17?auto=format&fit=crop&w=1000&q=80",
  "Hvar": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
  "Rovinj": "https://images.unsplash.com/photo-1555990538-c48dbe5fcb17?auto=format&fit=crop&w=1000&q=80",
  "Marrakech": "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=1000&q=80",
  "Fez": "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=1000&q=80",
  "Chefchaouen": "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=1000&q=80",
  "Casablanca": "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=1000&q=80",
  "Merzouga": "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=1000&q=80",
  "Cairo": "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1000&q=80",
  "Luxor": "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1000&q=80",
  "Aswan": "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1000&q=80",
  "Alexandria": "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1000&q=80",
  "Sharm El Sheikh": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
  "Istanbul": "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1000&q=80",
  "Cappadocia": "https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=1000&q=80",
  "Antalya": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
  "Izmir": "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1000&q=80",
  "Bodrum": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
  "Dubai": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1000&q=80",
  "Abu Dhabi": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1000&q=80",
  "Sharjah": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1000&q=80",
  "Ras Al Khaimah": "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=1000&q=80",
  "Fujairah": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
  "Tokyo": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1000&q=80",
  "Kyoto": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1000&q=80",
  "Osaka": "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1000&q=80",
  "Nara": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1000&q=80",
  "Sapporo": "https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=1000&q=80",
  "Bangkok": "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1000&q=80",
  "Phuket": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
  "Chiang Mai": "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1000&q=80",
  "Krabi": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
  "Koh Samui": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
  "Hanoi": "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1000&q=80",
  "Ho Chi Minh City": "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1000&q=80",
  "Da Nang": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
  "Hoi An": "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1000&q=80",
  "Ha Long Bay": "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1000&q=80",
  "Singapore": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1000&q=80",
  "Sentosa": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1000&q=80",
  "Marina Bay": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1000&q=80",
  "Orchard Road": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1000&q=80",
  "Chinatown Singapore": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1000&q=80",
  "London": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1000&q=80",
  "Edinburgh": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1000&q=80",
  "Bath": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1000&q=80",
  "York": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1000&q=80",
  "Oxford": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1000&q=80",
  "New York": "https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=1000&q=80",
  "Los Angeles": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=80",
  "San Francisco": "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1000&q=80",
  "Las Vegas": "https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?auto=format&fit=crop&w=1000&q=80",
  "Miami": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
  "Sydney": "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1000&q=80",
  "Melbourne": "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1000&q=80",
  "Brisbane": "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1000&q=80",
  "Cairns": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
  "Perth": "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1000&q=80",
  "Auckland": "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1000&q=80",
  "Queenstown": "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1000&q=80",
  "Wellington": "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1000&q=80",
  "Rotorua": "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1000&q=80",
  "Christchurch": "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1000&q=80",
  "Bali": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1000&q=80",
  "Jakarta": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1000&q=80",
  "Yogyakarta": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1000&q=80",
  "Lombok": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
  "Komodo": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
  "Mexico City": "https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=1000&q=80",
  "Cancun": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
  "Tulum": "https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=1000&q=80",
  "Oaxaca": "https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=1000&q=80",
  "Guadalajara": "https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=1000&q=80"
};

const countryImageMap = {
  "France": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80",
  "Italy": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1000&q=80",
  "Spain": "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1000&q=80",
  "Portugal": "https://images.unsplash.com/photo-1513735492246-483525079686?auto=format&fit=crop&w=1000&q=80",
  "Greece": "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1000&q=80",
  "Netherlands": "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=1000&q=80",
  "Germany": "https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=1000&q=80",
  "Switzerland": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1000&q=80",
  "Austria": "https://images.unsplash.com/photo-1516550893923-42d28e5677af?auto=format&fit=crop&w=1000&q=80",
  "Croatia": "https://images.unsplash.com/photo-1555990538-c48dbe5fcb17?auto=format&fit=crop&w=1000&q=80",
  "Morocco": "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=1000&q=80",
  "Egypt": "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1000&q=80",
  "Turkey": "https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=1000&q=80",
  "United Arab Emirates": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1000&q=80",
  "Japan": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1000&q=80",
  "Thailand": "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1000&q=80",
  "Vietnam": "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1000&q=80",
  "Singapore": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1000&q=80",
  "United Kingdom": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1000&q=80",
  "United States": "https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=1000&q=80",
  "Australia": "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1000&q=80",
  "New Zealand": "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1000&q=80",
  "Indonesia": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1000&q=80",
  "Mexico": "https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=1000&q=80"
};

function listingImageUrl(item) {
  return item.image || cityImageMap[item.destination] || countryImageMap[item.country] || "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=80";
}


const wikiImageCache = JSON.parse(localStorage.getItem("travelioWikiImageCache") || "{}");

function saveWikiImageCache() {
  try {
    localStorage.setItem("travelioWikiImageCache", JSON.stringify(wikiImageCache));
  } catch (_) {}
}

function wikiTitleForListing(item) {
  const destination = String(item.destination || item.title || "").trim();
  const country = String(item.country || "").trim();
  const specific = {
    "Ho Chi Minh City": "Ho Chi Minh City",
    "Ha Long Bay": "Hạ Long Bay",
    "Chinatown Singapore": "Chinatown, Singapore",
    "Marina Bay": "Marina Bay",
    "Orchard Road": "Orchard Road",
    "Ras Al Khaimah": "Ras Al Khaimah",
    "Sharm El Sheikh": "Sharm El Sheikh",
    "Mexico City": "Mexico City"
  };
  return specific[destination] || destination || country || "Travel";
}

async function wikipediaSummaryImage(title) {
  if (!title) return "";
  if (wikiImageCache[title]) return wikiImageCache[title];

  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  const response = await fetch(url, { headers: { "accept": "application/json" } });
  if (!response.ok) throw new Error(`No image for ${title}`);

  const data = await response.json();
  const source = data.thumbnail?.source || data.originalimage?.source || "";
  if (source) {
    wikiImageCache[title] = source;
    saveWikiImageCache();
  }
  return source;
}

function fallbackListingImage(item) {
  const source = listingImageUrl(item);
  if (!source || /listing-placeholders|placeholder/i.test(source)) return "";
  return source;
}

async function applyListingImage(imageBox, img, item) {
  const title = wikiTitleForListing(item);
  const fallback = fallbackListingImage(item);

  imageBox.classList.add("is-loading");
  img.alt = item.alt || `${item.destination} travel photo`;

  try {
    const wikiImage = await wikipediaSummaryImage(title);
    img.src = wikiImage || fallback;
  } catch (_) {
    img.src = fallback;
  }

  img.addEventListener("load", () => {
    imageBox.classList.remove("is-loading");
    imageBox.style.backgroundImage = `url("${img.src}")`;
  }, { once: true });

  img.addEventListener("error", async () => {
    if (img.dataset.usedFallback !== "true" && fallback && img.src !== fallback) {
      img.dataset.usedFallback = "true";
      img.src = fallback;
      return;
    }
    imageBox.classList.remove("is-loading");
    imageBox.classList.add("tour-image-failed");
    imageBox.textContent = item.destination;
  });
}

function createListingCard(raw) {
  const item = normalizedItem(raw);
  const card = document.createElement("a");
  card.className = "tour-card";
  card.href = item.href ? `../${item.href}` : `deal.html?id=${encodeURIComponent(item.id)}`;
  card.setAttribute("aria-label", `View ${item.destination}`);

  const image = document.createElement("div");
  image.className = "tour-image";
  const img = document.createElement("img");
  img.loading = "lazy";
  image.appendChild(img);
  applyListingImage(image, img, item);

  const content = document.createElement("div");
  content.className = "tour-content";

  const head = document.createElement("div");
  head.className = "tour-head";
  const title = document.createElement("h2");
  title.textContent = item.destination;
  head.appendChild(title);

  const place = document.createElement("h4");
  place.textContent = `${item.destination}, ${item.country}`;

  const tags = document.createElement("div");
  tags.className = "tour-tags";
  (item.tags || []).slice(0, 4).forEach(tag => {
    const chip = document.createElement("span");
    chip.textContent = tag;
    tags.appendChild(chip);
  });

  const tripLabel = document.createElement("small");
  tripLabel.textContent = "Trip Length";
  const period = document.createElement("p");
  period.className = "tour-dates";
  period.textContent = `${item.lengthMin} to ${item.lengthMax} days | Starts ${item.dates?.[0] || "Apr 5, 2026"}`;

  const meta = document.createElement("div");
  meta.className = "tour-meta";
  [`☆ ${Number(item.rating).toFixed(1)} (${item.reviews} Reviews)`, `${item.hotelRating.toFixed(1)} Star Hotel`, item.location, `${item.lengthMin} to ${item.lengthMax} Days`].forEach(text => {
    const span = document.createElement("span");
    span.textContent = text;
    meta.appendChild(span);
  });

  const price = document.createElement("b");
  price.className = "tour-price";
  price.textContent = `From ${money(item.minPrice)} to ${money(item.maxPrice)}`;

  content.append(head, place, tags, tripLabel, period, meta, price);
  card.append(image, content);
  return card;
}

function renderListings() {
  if (!tourList) return;
  updateFilterLabels();
  const filters = getFilterValues();
  let items = listingData.map(normalizedItem).filter(item => {
    const countryMatch = !destinationCountry || item.country === destinationCountry;
    const cityMatch = !destinationCity || item.destination.toLowerCase() === destinationCity.toLowerCase();
    const priceMatch = item.maxPrice >= filters.priceMin && item.minPrice <= filters.priceMax;
    const lengthMatch = item.lengthMax >= filters.lengthMin && item.lengthMin <= filters.lengthMax;
    const categoryMatch = !filters.categories.length || filters.categories.includes(item.category);
    const stayMatch = filters.stay === "Any" || item.stay === filters.stay;
    const ratingMatch = !filters.rating || item.hotelRating >= filters.rating;
    return countryMatch && cityMatch && priceMatch && lengthMatch && categoryMatch && stayMatch && ratingMatch;
  });

  items.sort((a, b) => {
    if (filters.sort === "price-asc") return a.minPrice - b.minPrice;
    if (filters.sort === "price-desc") return b.minPrice - a.minPrice;
    if (filters.sort === "rating") return Number(b.rating) - Number(a.rating);
    if (filters.sort === "reviews") return Number(b.reviews) - Number(a.reviews);
    return (Number(b.rating) * 100 + Number(b.reviews)) - (Number(a.rating) * 100 + Number(a.reviews));
  });

  const count = document.getElementById("tour-count");
  const region = document.getElementById("tour-region");
  if (count) count.textContent = items.length;
  if (region) region.textContent = destinationCity || destinationCountry || "all destinations";

  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "no-results";
    empty.textContent = "No listings match these filters.";
    tourList.replaceChildren(empty);
    return;
  }

  tourList.replaceChildren(...items.map(createListingCard));
}

function setupControls() {
  ["price-min", "price-max", "length-min", "length-max", "sort-select"].forEach(id => {
    const control = document.getElementById(id);
    if (control) {
      control.addEventListener("input", renderListings);
      control.addEventListener("change", renderListings);
    }
  });

  document.querySelectorAll(".category-filter,.stay-filter").forEach(input => {
    input.addEventListener("change", renderListings);
  });

  document.querySelectorAll("#stay-rating-filter button").forEach(button => {
    button.addEventListener("click", () => {
      const value = Number(button.dataset.rating);
      activeStayRating = activeStayRating === value ? 0 : value;
      updateStars();
      renderListings();
    });
  });

  const clear = document.getElementById("clear-filters");
  if (clear) {
    clear.addEventListener("click", () => {
      document.querySelectorAll(".category-filter").forEach(input => input.checked = false);
      const any = document.querySelector(".stay-filter[value='Any']");
      if (any) any.checked = true;
      const sort = document.getElementById("sort-select");
      if (sort) sort.value = "recommended";

      fromCountry = "United Kingdom";
      destinationCountry = "";
    destinationCity = "";
      if (countryInput) countryInput.value = "";
      if (countryValue) countryValue.textContent = "";
      if (destinationInput) destinationInput.value = "";
      if (destinationHelp) destinationHelp.textContent = "";
      if (dateInput) dateInput.value = "";
      if (dateHelp) dateHelp.textContent = "";

      maxPriceLimit = Math.ceil(Math.max(...listingData.map(item => normalizedItem(item).maxPrice)) / 100) * 100;
      const priceMin = document.getElementById("price-min");
      const priceMax = document.getElementById("price-max");
      const lengthMin = document.getElementById("length-min");
      const lengthMax = document.getElementById("length-max");
      if (priceMin) {
        priceMin.max = maxPriceLimit;
        priceMin.value = 0;
      }
      if (priceMax) {
        priceMax.max = maxPriceLimit;
        priceMax.value = maxPriceLimit;
      }
      if (lengthMin) lengthMin.value = 3;
      if (lengthMax) lengthMax.value = 21;
      activeStayRating = 0;
      updateStars();
      history.replaceState(null, "", "listing.html");
      renderListings();
    });
  }
}

async function loadListings() {
  try {
    const response = await fetch("../data/json/listing.json");
    listingData = await response.json();

    maxPriceLimit = Math.ceil(Math.max(...listingData.map(item => normalizedItem(item).maxPrice)) / 100) * 100;
    const priceMin = document.getElementById("price-min");
    const priceMax = document.getElementById("price-max");
    if (priceMin) {
      priceMin.max = maxPriceLimit;
      priceMin.value = 0;
    }
    if (priceMax) {
      priceMax.max = maxPriceLimit;
      priceMax.value = maxPriceLimit;
    }

    setupControls();
    updateStars();
    renderListings();
  } catch {
    tourList.textContent = "Listings could not be loaded.";
  }
}

buildCountryMenu(countryMenu, country => {
  countryInput.value = country;
  countryValue.textContent = country;
  fromCountry = country;
});

buildCountryMenu(destinationMenu, country => {
  destinationInput.value = country;
  destinationHelp.textContent = country;
  destinationCountry = country;
});

if (countryTrigger) countryTrigger.addEventListener("click", () => toggleMenu(countryTrigger, countryMenu));
if (destinationTrigger) destinationTrigger.addEventListener("click", () => toggleMenu(destinationTrigger, destinationMenu));

if (dateTrigger && dateInput) {
  dateTrigger.addEventListener("click", () => {
    try { dateInput.showPicker(); } catch { dateInput.focus(); dateInput.click(); }
  });
  dateInput.addEventListener("change", () => {
    if (!dateInput.value) return;
    const selected = new Date(`${dateInput.value}T00:00:00`);
    dateHelp.textContent = selected.toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });
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
    event.preventDefault();
    fromCountry = countryInput.value || "United Kingdom";
    destinationCountry = destinationInput.value || "";
    renderListings();
    const params = new URLSearchParams();
    if (fromCountry) params.set("country", fromCountry);
    if (destinationCountry) params.set("destination", destinationCountry);
    if (dateInput.value) params.set("date", dateInput.value);
    const query = params.toString();
    history.replaceState(null, "", query ? `listing.html?${query}` : "listing.html");
  });
}

updateSearchFieldsFromParams();
loadListings();
