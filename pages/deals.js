const dealGrid = document.getElementById("deal-grid");
const dealCount = document.getElementById("deals-count");
const subtitle = document.getElementById("deals-subtitle");
const typeLabels = {
  "popular": "Popular Deals",
  "recent": "Recent Packages",
  "summer": "Summer Offers",
  "last-minute": "Last Minute Deals"
};

let deals = [];
let activeRating = 0;
let maxPrice = 5000;

function euro(value) {
  return `€${Math.round(Number(value || 0)).toLocaleString("en-US")}`;
}

function generatedDealPhoto(deal) {
  const title = encodeURIComponent(String(deal.title || "travel").trim().replace(/\s+/g, "-"));
  const seed = encodeURIComponent(String(deal.id || deal.title || title));
  return `https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1000&q=80`;
}

function localAsset(path) {
  if (!path) return "";
  if (/^(https?:|data:|\/)/.test(path)) return path;
  return `../${path}`;
}

function getFavoriteContext() {
  const sessionRaw = localStorage.getItem("travelio_session");
  const usersRaw = localStorage.getItem("travelio_users");
  if (!sessionRaw || !usersRaw) return null;
  const session = JSON.parse(sessionRaw);
  const users = JSON.parse(usersRaw);
  const index = users.findIndex(user => user.id === session.id);
  if (index < 0) return null;
  users[index].favorites = Array.isArray(users[index].favorites) ? users[index].favorites : [];
  return { users, index, user: users[index] };
}

function saveFavoriteContext(context) {
  context.users[context.index] = context.user;
  localStorage.setItem("travelio_users", JSON.stringify(context.users));
}

function isFavorite(id) {
  const context = getFavoriteContext();
  return Boolean(context && context.user.favorites.some(item => item.id === id));
}

function toggleFavorite(deal) {
  const context = getFavoriteContext();
  if (!context) {
    window.location.href = "login.html";
    return false;
  }

  const exists = context.user.favorites.some(item => item.id === deal.id);
  if (exists) {
    context.user.favorites = context.user.favorites.filter(item => item.id !== deal.id);
  } else {
    context.user.favorites.push({
      id: deal.id,
      title: deal.title,
      date: deal.date,
      rating: deal.rating,
      image: deal.image,
      price: euro(deal.finalPrice || deal.originalPrice),
      href: `pages/deal.html?id=${encodeURIComponent(deal.id)}`
    });
  }

  saveFavoriteContext(context);
  return !exists;
}

function readParams() {
  return new URLSearchParams(window.location.search);
}

function setInitialType() {
  const type = readParams().get("type");
  if (!type) return;
  document.querySelectorAll(".type-filter").forEach(input => {
    input.checked = input.value === type;
  });
  if (typeLabels[type]) subtitle.textContent = typeLabels[type];
}

function filters() {
  const types = Array.from(document.querySelectorAll(".type-filter:checked")).map(input => input.value);
  const minDiscount = Number(document.querySelector(".discount-filter:checked")?.value || 0);
  const priceMin = Number(document.getElementById("deal-price-min").value);
  const priceMax = Number(document.getElementById("deal-price-max").value);
  const sort = document.getElementById("deal-sort").value;

  return {
    types,
    minDiscount,
    priceMin: Math.min(priceMin, priceMax),
    priceMax: Math.max(priceMin, priceMax),
    sort,
    rating: activeRating
  };
}

function updateLabels() {
  const f = filters();
  const min = document.getElementById("deal-price-min");
  const max = document.getElementById("deal-price-max");
  if (Number(min.value) > Number(max.value)) [min.value, max.value] = [max.value, min.value];
  document.getElementById("deal-price-min-display").value = `Min ${euro(f.priceMin)}`;
  document.getElementById("deal-price-max-display").value = `Max ${euro(f.priceMax)}`;

  document.querySelectorAll("#deal-stars button").forEach(button => {
    const value = Number(button.dataset.rating);
    button.classList.toggle("active", value <= activeRating);
    button.textContent = value <= activeRating ? "★" : "☆";
  });
}

function card(deal) {
  const href = deal.href || `deal.html?id=${encodeURIComponent(deal.id)}`;
  const a = document.createElement("a");
  a.className = "deal-list-card";
  a.href = href;

  const image = document.createElement("div");
  image.className = "deal-list-image";

  if (deal.image) {
    const img = document.createElement("img");
    img.src = localAsset(deal.image);
    img.alt = deal.alt || deal.title;
    img.loading = "lazy";
    img.addEventListener("error", () => {
      img.remove();
      image.classList.add("image-failed");
      image.textContent = deal.title;
    });
    image.appendChild(img);
  } else {
    image.textContent = deal.title;
  }

  if (deal.discountPercent) {
    const badge = document.createElement("span");
    badge.className = "deal-discount";
    badge.textContent = `${deal.discountPercent}% Off`;
    image.appendChild(badge);
  }

  const heart = document.createElement("button");
  heart.type = "button";
  heart.className = isFavorite(deal.id) ? "deal-heart active" : "deal-heart";
  heart.textContent = "♥";
  heart.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();
    heart.classList.toggle("active", toggleFavorite(deal));
  });
  image.appendChild(heart);

  const content = document.createElement("div");
  content.className = "deal-list-content";
  content.innerHTML = `
    <div class="deal-type">${deal.groupLabel || "Travel Deal"}</div>
    <h3>${deal.title}</h3>
    <p>${deal.date || ""}</p>
    <div class="deal-list-meta">
      <span>★ ${Number(deal.rating || 4.5).toFixed(2)}</span>
      <b>From <s>${euro(deal.originalPrice)}</s> <em>${euro(deal.finalPrice || deal.originalPrice)}</em></b>
    </div>
  `;

  a.append(image, content);
  return a;
}

function render() {
  updateLabels();
  const f = filters();

  let output = deals.filter(deal => {
    const price = Number(deal.finalPrice || deal.originalPrice || 0);
    const typeOk = !f.types.length || f.types.includes(deal.group);
    const discountOk = Number(deal.discountPercent || 0) >= f.minDiscount;
    const priceOk = price >= f.priceMin && price <= f.priceMax;
    const ratingOk = !f.rating || Number(deal.rating || 0) >= f.rating;
    return typeOk && discountOk && priceOk && ratingOk;
  });

  output.sort((a, b) => {
    if (f.sort === "price-asc") return Number(a.finalPrice) - Number(b.finalPrice);
    if (f.sort === "price-desc") return Number(b.finalPrice) - Number(a.finalPrice);
    if (f.sort === "discount") return Number(b.discountPercent || 0) - Number(a.discountPercent || 0);
    if (f.sort === "rating") return Number(b.rating || 0) - Number(a.rating || 0);
    return (Number(b.rating || 0) * 100 + Number(b.discountPercent || 0)) - (Number(a.rating || 0) * 100 + Number(a.discountPercent || 0));
  });

  dealCount.textContent = output.length;

  if (!output.length) {
    const empty = document.createElement("p");
    empty.className = "empty-deals";
    empty.textContent = "No deals match these filters.";
    dealGrid.replaceChildren(empty);
    return;
  }

  dealGrid.replaceChildren(...output.map(card));
}

async function init() {
  const response = await fetch("../data/json/deals.json");
  deals = await response.json();

  maxPrice = Math.ceil(Math.max(...deals.map(deal => Number(deal.finalPrice || deal.originalPrice || 0))) / 100) * 100;
  document.getElementById("deal-price-min").max = maxPrice;
  document.getElementById("deal-price-max").max = maxPrice;
  document.getElementById("deal-price-max").value = maxPrice;

  setInitialType();
  render();
}

document.querySelectorAll(".type-filter,.discount-filter,#deal-sort,#deal-price-min,#deal-price-max").forEach(input => {
  input.addEventListener("input", render);
  input.addEventListener("change", render);
});

document.querySelectorAll("#deal-stars button").forEach(button => {
  button.addEventListener("click", () => {
    const value = Number(button.dataset.rating);
    activeRating = activeRating === value ? 0 : value;
    render();
  });
});

document.getElementById("clear-deals").addEventListener("click", () => {
  document.querySelectorAll(".type-filter").forEach(input => input.checked = false);
  document.querySelector(".discount-filter[value='0']").checked = true;
  document.getElementById("deal-sort").value = "recommended";
  document.getElementById("deal-price-min").value = 0;
  document.getElementById("deal-price-max").value = maxPrice;
  activeRating = 0;
  history.replaceState(null, "", "deals.html");
  subtitle.textContent = "Browse all current travel deals, packages, summer offers, and last minute escapes.";
  render();
});

init();
