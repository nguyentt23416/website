const requestForm = document.getElementById("request-reset-form");
const verifyForm = document.getElementById("verify-reset-form");
const error = document.getElementById("auth-error");
const success = document.getElementById("auth-success");
const resetCodePreview = document.getElementById("reset-code-preview");

const RESET_KEY = "travelio_reset_request";
let resetEmail = "";

function setMessage(type, message) {
  error.textContent = type === "error" ? message : "";
  success.textContent = type === "success" ? message : "";
}

function createResetCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

requestForm.addEventListener("submit", async event => {
  event.preventDefault();
  setMessage("", "");

  const email = document.getElementById("resetEmail").value.trim().toLowerCase();

  if (!emailValid(email)) {
    setMessage("error", "Please enter a valid email address.");
    return;
  }

  const users = await loadUsers();
  const user = users.find(item => item.email.toLowerCase() === email);

  if (!user) {
    setMessage("error", "No account was found with that email.");
    return;
  }

  const code = createResetCode();
  const request = {
    email,
    code,
    expiresAt: Date.now() + 10 * 60 * 1000
  };

  sessionStorage.setItem(RESET_KEY, JSON.stringify(request));
  resetEmail = email;
  resetCodePreview.textContent = code;

  requestForm.classList.remove("is-active");
  verifyForm.classList.add("is-active");
  setMessage("success", "Reset code sent. Please enter the code to continue.");
});

verifyForm.addEventListener("submit", async event => {
  event.preventDefault();
  setMessage("", "");

  const request = JSON.parse(sessionStorage.getItem(RESET_KEY) || "null");
  const code = document.getElementById("resetCode").value.trim();
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (!request || request.email !== resetEmail) {
    setMessage("error", "Please request a new reset code.");
    return;
  }

  if (Date.now() > request.expiresAt) {
    sessionStorage.removeItem(RESET_KEY);
    setMessage("error", "Reset code expired. Please request a new one.");
    requestForm.classList.add("is-active");
    verifyForm.classList.remove("is-active");
    return;
  }

  if (code !== request.code) {
    setMessage("error", "Reset code is incorrect.");
    return;
  }

  if (!passwordValid(newPassword)) {
    setMessage("error", "Password must be 8 to 64 characters with 1 capital letter and 1 number.");
    return;
  }

  if (newPassword !== confirmPassword) {
    setMessage("error", "Passwords do not match.");
    return;
  }

  const users = await loadUsers();
  const user = users.find(item => item.email.toLowerCase() === request.email);

  if (!user) {
    setMessage("error", "No account was found with that email.");
    return;
  }

  await setUserPassword(user, newPassword);
  saveUsers(users);
  sessionStorage.removeItem(RESET_KEY);

  setMessage("success", "Password reset successfully. Redirecting to sign in...");

  setTimeout(() => {
    window.location.href = "login.html";
  }, 1200);
});
