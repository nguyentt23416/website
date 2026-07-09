const form = document.getElementById("login-form");
const error = document.getElementById("auth-error");

form.addEventListener("submit", async event => {
  event.preventDefault();

  error.textContent = "";

  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value;

  if (!emailValid(email)) {
    error.textContent = "Please enter a valid email address.";
    return;
  }

  if (!password) {
    error.textContent = "Please enter your password.";
    return;
  }

  const users = await loadUsers();
  const user = users.find(item => item.email.toLowerCase() === email);

  if (!user || !(await verifyPassword(user, password))) {
    error.textContent = "Email or password is incorrect.";
    return;
  }

  saveUsers(users);
  setSession(user);
  const next = new URLSearchParams(location.search).get("next");
  window.location.href = next ? next : "../landing.html";
});
