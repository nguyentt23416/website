const form = document.getElementById("signup-form");
const error = document.getElementById("auth-error");

form.addEventListener("submit", async event => {
  event.preventDefault();

  error.textContent = "";

  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim().toLowerCase();
  const phone = document.getElementById("phone").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const terms = document.getElementById("terms").checked;

  if (fullName.length < 2) {
    error.textContent = "Please enter your full name.";
    return;
  }

  if (!emailValid(email)) {
    error.textContent = "Please enter a valid email address.";
    return;
  }

  if (!phoneValid(phone)) {
    error.textContent = "Phone number must contain at least 10 numbers only.";
    return;
  }

  if (!passwordValid(password)) {
    error.textContent = "Password must be 8 to 64 characters with 1 capital letter and 1 number.";
    return;
  }

  if (password !== confirmPassword) {
    error.textContent = "Passwords do not match.";
    return;
  }

  if (!terms) {
    error.textContent = "Please agree to the terms and condition.";
    return;
  }

  const users = await loadUsers();

  if (users.some(user => user.email.toLowerCase() === email)) {
    error.textContent = "An account with this email already exists.";
    return;
  }

  const user = {
    id: `user-${Date.now()}`,
    fullName,
    email,
    phone,
    bookings: [],
    favorites: [],
    companions: [],
    createdAt: new Date().toISOString(),
    role: "customer"
  };

  await setUserPassword(user, password);

  users.push(user);
  saveUsers(users);
  setSession(user);
  window.location.href = "../landing.html";
});
