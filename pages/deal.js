const params = new URLSearchParams(location.search);
const tripId = params.get("id");
const travelioDisableWikiGalleryOverride = true;
try { localStorage.removeItem("travelioWikiGalleryCache"); } catch (_) {}

const gallerySets = [
  {
    keys: ["cappadocia", "turkey"],
    images: [
      "https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1000&q=80"
    ]
  },
  {
    keys: ["italy", "venice", "rome", "florence"],
    images: [
      "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1543429258-cced2f190cc9?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1513581166391-887a96ddeafd?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1000&q=80"
    ]
  },
  {
    keys: ["japan", "tokyo", "kyoto", "osaka"],
    images: [
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=1000&q=80"
    ]
  },
  {
    keys: ["thailand", "bali", "maldives", "phuket"],
    images: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1000&q=80"
    ]
  },
  {
    keys: ["paris", "france"],
    images: [
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?auto=format&fit=crop&w=1000&q=80"
    ]
  },
  {
    keys: ["greece", "santorini", "athens"],
    images: [
      "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1555993539-1732b0258235?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1000&q=80"
    ]
  }
];

const fallbackGalleryImages = [
  "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80"
];

function imageSource(path) {
  if (!path) return "";
  if (/^(https?:|data:|\/)/.test(path)) return path;
  return `../${path}`;
}

function galleryImagesForTrip(trip) {
  const text = `${trip.title || ""} ${trip.destination || ""} ${trip.country || ""}`.toLowerCase();
  const found = gallerySets.find(set => set.keys.some(key => text.includes(key)));
  const images = found ? found.images : fallbackGalleryImages;
  const main = trip.image ? imageSource(trip.image) : images[0];
  return [main, ...images.filter(src => src !== main)].slice(0, 5);
}

function imageBlock(trip, label = "") {
  const order = ["main landscape", "city view", "landmark", "food street", "hotel resort"];
  const index = Math.max(0, order.indexOf(label));
  const src = galleryImagesForTrip(trip)[index] || galleryImagesForTrip(trip)[0];
  return `<img src="${src}" alt="${trip.title} ${label}" loading="lazy">`;
}


const wikiGalleryCache = JSON.parse(localStorage.getItem("travelioWikiGalleryCache") || "{}");

function saveWikiGalleryCache() {
  try {
    localStorage.setItem("travelioWikiGalleryCache", JSON.stringify(wikiGalleryCache));
  } catch (_) {}
}

function wikiTitleForTrip(trip) {
  const destination = String(trip.destination || trip.title || "").trim();
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
  return specific[destination] || destination || trip.country || "Travel";
}

function mediaSourceFromItem(item) {
  return item?.thumbnail?.source || item?.original?.source || item?.srcset?.[0]?.src || item?.src || "";
}

async function wikipediaGalleryImages(title) {
  if (!title) return [];
  if (wikiGalleryCache[title]) return wikiGalleryCache[title];

  const mediaUrl = `https://en.wikipedia.org/api/rest_v1/page/media-list/${encodeURIComponent(title)}`;
  let images = [];

  try {
    const response = await fetch(mediaUrl, { headers: { "accept": "application/json" } });
    if (response.ok) {
      const data = await response.json();
      images = (data.items || [])
        .map(mediaSourceFromItem)
        .filter(Boolean)
        .filter(src => /^https?:/.test(src))
        .filter(src => !/\.svg($|\?)/i.test(src))
        .filter((src, index, arr) => arr.indexOf(src) === index)
        .slice(0, 8);
    }
  } catch (_) {}

  if (images.length < 3) {
    try {
      const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
      const response = await fetch(summaryUrl, { headers: { "accept": "application/json" } });
      if (response.ok) {
        const data = await response.json();
        const image = data.originalimage?.source || data.thumbnail?.source || "";
        if (image) images.unshift(image);
      }
    } catch (_) {}
  }

  images = images.filter((src, index, arr) => arr.indexOf(src) === index).slice(0, 5);
  if (images.length) {
    wikiGalleryCache[title] = images;
    saveWikiGalleryCache();
  }
  return images;
}

function renderGalleryImages(images, trip) {
  const gallery = document.getElementById("detail-gallery");
  if (!gallery || !images.length) return;

  const slots = ["main landscape", "city view", "landmark", "local scene", "hotel resort"];
  gallery.innerHTML = images.slice(0, 5).map((src, index) => {
    const large = index === 0 ? "gallery-large" : "";
    return `<div class="${large}"><img src="${src}" alt="${trip.title} ${slots[index] || "travel photo"}" loading="lazy"></div>`;
  }).join("");
}

async function loadLiveTripGallery(trip) {
  const title = wikiTitleForTrip(trip);
  const images = await wikipediaGalleryImages(title);
  renderGalleryImages(images, trip);
}

function parseTripDate(value) {
  const currentYear = new Date().getFullYear();
  const clean = String(value || "").split("-")[0].trim();
  const withYear = /\d{4}/.test(clean) ? clean : `${clean}, ${currentYear}`;
  const parsed = new Date(withYear);
  return Number.isNaN(parsed.getTime()) ? new Date(currentYear, 3, 5) : parsed;
}

function formatTripDate(date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatShortDate(date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function tripDateOptions(trip) {
  const base = parseTripDate(trip.date);
  const options = [];
  for (let i = 0; i < 8; i += 1) {
    const start = new Date(base);
    start.setDate(base.getDate() + i * 7);
    options.push(start);
  }
  return options;
}

function endDateFor(startDate, days) {
  const end = new Date(startDate);
  end.setDate(startDate.getDate() + Math.max(1, Number(days || 1)) - 1);
  return end;
}


const airportCoordinates = {
  "London (LGW)": [51.1537, -0.1821],
  "Paris (CDG)": [49.0097, 2.5479],
  "Berlin (BER)": [52.3667, 13.5033],
  "Rome (FCO)": [41.8003, 12.2389],
  "Madrid (MAD)": [40.4983, -3.5676],
  "Dubai (DXB)": [25.2532, 55.3657],
  "Singapore (SIN)": [1.3644, 103.9915],
  "Tokyo (HND)": [35.5494, 139.7798],
  "Sydney (SYD)": [-33.9399, 151.1753],
  "New York (JFK)": [40.6413, -73.7781],
  "Los Angeles (LAX)": [33.9416, -118.4085],
  "Ho Chi Minh City (SGN)": [10.8188, 106.6519],
  "Hanoi (HAN)": [21.2187, 105.8048],
  "Italy Airport": [41.8003, 12.2389],
  "France Airport": [49.0097, 2.5479],
  "Greece Airport": [37.9364, 23.9445],
  "Thailand Airport": [13.6900, 100.7501],
  "Vietnam Airport": [10.8188, 106.6519],
  "Japan Airport": [35.5494, 139.7798],
  "United States Airport": [40.6413, -73.7781],
  "Mexico Airport": [19.4361, -99.0719],
  "Morocco Airport": [33.3675, -7.5899],
  "Egypt Airport": [30.1219, 31.4056],
  "Turkey Airport": [41.2753, 28.7519],
  "Germany Airport": [52.3667, 13.5033],
  "Spain Airport": [40.4983, -3.5676],
  "Portugal Airport": [38.7756, -9.1354],
  "Netherlands Airport": [52.3105, 4.7683],
  "Switzerland Airport": [47.4581, 8.5555],
  "Australia Airport": [-33.9399, 151.1753],
  "Singapore Airport": [1.3644, 103.9915],
  "United Kingdom Airport": [51.1537, -0.1821]
};

function destinationAirportName(trip) {
  const destination = trip.destination || trip.country || "Destination";
  if (/airport/i.test(destination)) return destination;
  return `${destination} Airport`;
}

function coordinateFor(name) {
  if (airportCoordinates[name]) return airportCoordinates[name];
  const fallback = Object.keys(airportCoordinates).find(key => key.toLowerCase().includes(String(name).toLowerCase().replace(" airport", "")));
  return fallback ? airportCoordinates[fallback] : airportCoordinates["London (LGW)"];
}

function distanceKm(from, to) {
  const [lat1, lon1] = coordinateFor(from);
  const [lat2, lon2] = coordinateFor(to);
  const radius = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function minutesToTime(totalMinutes) {
  const minutes = ((totalMinutes % 1440) + 1440) % 1440;
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function durationText(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (!hours) return `${mins} minutes`;
  return `${hours} hours${mins ? ` ${mins} minutes` : ""}`;
}

function flightPlanFor(trip) {
  const origin = trip.originAirport || "London (LGW)";
  const destination = destinationAirportName(trip);
  const km = distanceKm(origin, destination);
  const flightMinutes = Math.max(65, Math.round(km / 780 * 60 + 45));
  const startSeed = Math.round(km) % 360;
  const outboundStart = 480 + startSeed;
  const outboundEnd = outboundStart + flightMinutes;
  const returnStart = 900 + (startSeed % 180);
  const returnEnd = returnStart + flightMinutes;
  return {
    origin,
    destination,
    km,
    flightMinutes,
    outbound: { start: minutesToTime(outboundStart), end: minutesToTime(outboundEnd), duration: durationText(flightMinutes) },
    return: { start: minutesToTime(returnStart), end: minutesToTime(returnEnd), duration: durationText(flightMinutes) }
  };
}

function shortDateWithYear(date) {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function lengthOptionsFor(trip) {
  const base = Math.max(3, Number(trip.days || 7));
  const values = new Set([3, 4, 5, 7, 10, 12, 14, 16, 18, 21, base]);
  return Array.from(values).filter(value => value >= 3 && value <= 21).sort((a, b) => a - b);
}

function adjustedPriceForLength(basePrice, baseDays, selectedDays, tripType = "round", distanceKmValue = 1200) {
  const base = Number(basePrice || 0);
  const fixedFlightCost = Math.min(base * 0.35, 650);
  const variableStayCost = Math.max(0, base - fixedFlightCost);
  const stayMultiplier = selectedDays / Math.max(1, Number(baseDays || selectedDays || 1));
  const distanceFlightCost = Math.max(90, Math.round(distanceKmValue * 0.09));
  const flightCost = tripType === "one-way" ? distanceFlightCost : distanceFlightCost * 1.75;
  return Math.round(variableStayCost * stayMultiplier + flightCost);
}

function updateDateDisplay(trip, startDate) {
  const endDate = endDateFor(startDate, trip.days);
  const rangeText = `${formatShortDate(startDate)} - ${formatShortDate(endDate)}, ${endDate.getFullYear()}`;
  const plan = flightPlanFor(trip);

  trip.date = formatTripDate(startDate);
  trip.endDate = formatTripDate(endDate);
  trip.dateRange = rangeText;
  trip.flightDistanceKm = Math.round(plan.km);
  trip.flightType = trip.flightType || "round";
  trip.flight = {
    outbound: { from: plan.origin, to: plan.destination, startTime: plan.outbound.start, endTime: plan.outbound.end, date: shortDateWithYear(startDate), duration: plan.outbound.duration },
    return: { from: plan.destination, to: plan.origin, startTime: plan.return.start, endTime: plan.return.end, date: shortDateWithYear(endDate), duration: plan.return.duration }
  };

  document.getElementById("duration-copy").textContent = `${trip.duration} in total, starting on ${trip.date}.`;
  document.querySelector(".flight-card-detail:first-of-type .flight-endpoint b").textContent = plan.origin;
  document.getElementById("arrival-airport").textContent = plan.destination;
  document.getElementById("return-airport").textContent = plan.destination;
  document.querySelector(".flight-card-detail:nth-of-type(2) .flight-endpoint.right b").textContent = plan.origin;

  document.getElementById("outbound-start-time").textContent = plan.outbound.start;
  document.getElementById("outbound-end-time").textContent = plan.outbound.end;
  document.getElementById("outbound-start-date").textContent = shortDateWithYear(startDate);
  document.getElementById("outbound-end-date").textContent = shortDateWithYear(startDate);
  document.getElementById("outbound-duration").textContent = plan.outbound.duration;
  document.getElementById("return-start-time").textContent = plan.return.start;
  document.getElementById("return-end-time").textContent = plan.return.end;
  document.getElementById("return-start-date").textContent = shortDateWithYear(endDate);
  document.getElementById("return-end-date").textContent = shortDateWithYear(endDate);
  document.getElementById("return-duration").textContent = plan.return.duration;

  const returnCard = document.querySelectorAll(".flight-card-detail")[1];
  returnCard.style.display = trip.flightType === "one-way" ? "none" : "grid";

  const summaryLines = document.getElementById("side-summary").querySelectorAll("p");
  if (summaryLines[0]) summaryLines[0].textContent = trip.flightType === "one-way" ? trip.date : trip.dateRange;
  if (summaryLines[1]) summaryLines[1].textContent = trip.duration;
  const summaryPrice = document.querySelector("#side-summary .summary-total strong");
  if (summaryPrice) summaryPrice.textContent = simpleEuro(trip.price);
}
function buildItinerary(trip) {
  const destination = trip.destination || trip.country;
  const days = Math.max(3, Number(trip.days || 7));
  const chunks = [
    [`Day 1 to ${Math.min(2, days)}: Arrival`, [`Arrive in ${destination}`, "Hotel check-in", "Welcome walk and local dinner"]],
    [`Day ${Math.min(3, days)} to ${Math.min(5, days)}: Explore`, ["Guided city highlights", "Museum or landmark visit", "Free time for shopping and cafés"]],
    [`Day ${Math.min(6, days)} to ${Math.max(6, days - 1)}: Local experience`, ["Scenic route", "Cultural stop", "Group activity"]],
    [`Day ${days}: Departure`, ["Breakfast", "Transfer to airport", "Return flight"]]
  ];
  return chunks.map(item => `<li><b>${item[0]}</b><ul>${item[1].map(x => `<li>${x}</li>`).join("")}</ul></li>`).join("");
}

async function initDeal() {
  const trip = await findTripById(tripId);
  if (!trip) {
    document.getElementById("detail-title").textContent = "Trip not found";
    return;
  }

  document.title = `travel.io — ${trip.title}`;
  document.getElementById("detail-title").textContent = `${trip.title}: A Journey Through ${trip.destination}`;
  document.getElementById("detail-copy").textContent = `Explore ${trip.destination} with curated accommodation, guided activities, flexible services, and a smooth booking process.`;
  const listingHasAdjustableLength = trip.source === "listing";
  const baseTrip = { ...trip };
  const startDate = parseTripDate(trip.date);
  const lengthOptions = lengthOptionsFor(trip);
  const dateOptions = tripDateOptions(trip);
  const dateSelect = document.getElementById("trip-date-select");
  const regionSelect = document.getElementById("traveller-region-select");
  const tripTypeSelect = document.getElementById("trip-type-select");
  const lengthSlider = document.getElementById("trip-length-slider");
  const lengthAdjustCard = document.getElementById("length-adjust-card");

  if (listingHasAdjustableLength) {
    dateSelect.innerHTML = dateOptions.map((date, index) => `<option value="${index}">${formatTripDate(date)}</option>`).join("");
    lengthSlider.max = String(lengthOptions.length - 1);
    const defaultIndex = Math.max(0, lengthOptions.findIndex(days => days === Number(baseTrip.days)));
    lengthSlider.value = String(defaultIndex);
    dateSelect.value = "0";
    document.getElementById("length-slider-start").textContent = `${lengthOptions[0]} days`;
    document.getElementById("length-slider-end").textContent = `${lengthOptions[lengthOptions.length - 1]} days`;
  } else {
    lengthAdjustCard.remove();
  }

  document.getElementById("duration-pills").innerHTML = [`${trip.duration} total`, `Flights included`, `${trip.hotel}`, `Transfer included`].map(x => `<span>${x}</span>`).join("");
  document.getElementById("arrival-airport").textContent = destinationAirportName(trip);
  document.getElementById("return-airport").textContent = destinationAirportName(trip);
  document.getElementById("accommodation-list").innerHTML = [trip.destination, trip.country, "Central stay"].map((x, i) => `<details ${i===0?"open":""}><summary>${x} · ${Math.max(1, Math.floor(trip.days / 3))} nights</summary><p>${trip.hotel} near ${trip.location}.</p></details>`).join("");
  document.getElementById("itinerary-list").innerHTML = buildItinerary(trip);

  document.getElementById("detail-gallery").innerHTML = `
    <div class="gallery-large">${imageBlock(trip, "main landscape")}</div>
    <div>${imageBlock(trip, "city view")}</div>
    <div>${imageBlock(trip, "landmark")}</div>
    <div>${imageBlock(trip, "food street")}</div>
    <div>${imageBlock(trip, "hotel resort")}</div>
  `;

  document.getElementById("side-summary").innerHTML = `
    <h3>${trip.title}</h3>
    <p>${trip.date}</p>
    <p>${trip.duration}</p>
    <p>${trip.hotel}</p>
    <div class="summary-total"><span>From</span><strong>${simpleEuro(trip.price)}</strong></div>
  `;

  function refreshDurationPills() {
    document.getElementById("duration-pills").innerHTML = [`${trip.duration} total`, `Flights included`, `${trip.hotel}`, `Transfer included`].map(x => `<span>${x}</span>`).join("");
  }

  function refreshTripControls() {
    const lengthIndex = Number(lengthSlider.value);
    const dateIndex = Number(dateSelect.value || 0);
    const selectedDays = lengthOptions[lengthIndex];

    if (listingHasAdjustableLength) {
      trip.days = selectedDays;
      trip.duration = `${selectedDays} days`;
      trip.originAirport = regionSelect.value;
      trip.flightType = tripTypeSelect.value;
      const plan = flightPlanFor(trip);
      trip.price = adjustedPriceForLength(baseTrip.price, baseTrip.days, selectedDays, trip.flightType, plan.km);
      refreshDurationPills();
      updateDateDisplay(trip, dateOptions[dateIndex]);
    } else {
      trip.originAirport = "London (LGW)";
      trip.flightType = "round";
      updateDateDisplay(trip, startDate);
    }
  }

  if (listingHasAdjustableLength) {
    dateSelect.addEventListener("change", refreshTripControls);
    regionSelect.addEventListener("change", refreshTripControls);
    tripTypeSelect.addEventListener("change", refreshTripControls);
    lengthSlider.addEventListener("input", refreshTripControls);
    refreshTripControls();
  } else {
    updateDateDisplay(trip, startDate);
  }

  const allTrips = await loadAllTrips("../");
  document.getElementById("similar-grid").replaceChildren(...allTrips.filter(item => item.id !== trip.id).slice(0, 4).map(item => {
    const a = document.createElement("a");
    a.className = "mini-trip";
    a.href = `deal.html?id=${encodeURIComponent(item.id)}`;
    a.innerHTML = `<div>${item.image ? `<img src="${imageSource(item.image, "similar")}" alt="${item.title}">` : `<span>${item.destination}</span>`}</div><h3>${item.title}</h3><p>${item.date}<b>From ${simpleEuro(item.price)}</b></p>`;
    return a;
  }));

  document.getElementById("book-now").addEventListener("click", () => {
    const context = getSessionUserContext();
    if (!context) {
      window.location.href = `login.html?next=${encodeURIComponent(`deal.html?id=${trip.id}`)}`;
      return;
    }

    const booking = {
      id: `booking-${Date.now()}`,
      status: "Draft",
      trip: { ...trip },
      guests: { adults: 1, children: 0 },
      travellers: [],
      createdAt: new Date().toISOString()
    };

    savePendingBooking(booking);
    window.location.href = "booking.html";
  });
}

initDeal();
