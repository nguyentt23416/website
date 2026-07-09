function getTravelioSession() {
  const raw = localStorage.getItem("travelio_session");
  return raw ? JSON.parse(raw) : null;
}

function normalizeHref(target) {
  const depth = document.body.dataset.base || "";
  return `${depth}${target}`;
}

function buildAuthNav() {
  const account = document.querySelector(".account-links");
  if (!account) return;

  const session = getTravelioSession();

  if (!session) {
    account.innerHTML = `<a href="#">Help</a><span class="globe">◉</span><span class="divider"></span><a href="${normalizeHref("pages/login.html")}">Log In</a>`;
    return;
  }

  const initial = (session.fullName || session.email || "U").trim().charAt(0).toUpperCase();

  account.innerHTML = `
    <a href="#">Help</a>
    <span class="globe">◉</span>
    <span class="divider"></span>
    <div class="user-menu">
      <button class="user-avatar" id="user-menu-button" type="button" aria-expanded="false">${initial}</button>
      <div class="user-dropdown" id="user-dropdown">
        <div class="user-summary">
          <strong>${session.fullName || "Travel.io user"}</strong>
          <small>${session.email || ""}</small>
        </div>
        <a href="${normalizeHref("pages/account.html#personal")}">Personal data</a>
        <a href="${normalizeHref("pages/account.html#booking-history")}">Booking history</a>
        <a href="${normalizeHref("pages/account.html#favourites")}">Favourites</a>
        <a href="${normalizeHref("pages/account.html#settings")}">Account settings</a>
        <button type="button" id="logout-button">Log out</button>
      </div>
    </div>
  `;

  const button = document.getElementById("user-menu-button");
  const dropdown = document.getElementById("user-dropdown");

  button.addEventListener("click", event => {
    event.stopPropagation();
    dropdown.classList.toggle("is-open");
    button.setAttribute("aria-expanded", dropdown.classList.contains("is-open"));
  });

  document.addEventListener("click", event => {
    if (!event.target.closest(".user-menu")) {
      dropdown.classList.remove("is-open");
      button.setAttribute("aria-expanded", "false");
    }
  });

  dropdown.querySelectorAll("a[href*='account.html#']").forEach(link => {
    link.addEventListener("click", event => {
      const targetHash = link.getAttribute("href").split("#")[1];
      const onAccountPage = location.pathname.endsWith("/account.html");
      if (onAccountPage && targetHash) {
        event.preventDefault();
        location.hash = targetHash;
        dropdown.classList.remove("is-open");
        button.setAttribute("aria-expanded", "false");
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      }
    });
  });

  document.getElementById("logout-button").addEventListener("click", () => {
    localStorage.removeItem("travelio_session");
    window.location.href = normalizeHref("landing.html");
  });
}

buildAuthNav();