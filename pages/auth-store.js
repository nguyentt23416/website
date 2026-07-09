const AUTH_USERS_KEY = "travelio_users";
const AUTH_SESSION_KEY = "travelio_session";

async function loadUsers() {
  const saved = localStorage.getItem(AUTH_USERS_KEY);
  if (saved) return JSON.parse(saved);

  try {
    const response = await fetch("../data/json/users.json");
    const users = await response.json();
    localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
    return users;
  } catch {
    const users = [];
    localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
    return users;
  }
}

function saveUsers(users) {
  localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
}

function setSession(user) {
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone
  }));
}

function getSession() {
  const raw = localStorage.getItem(AUTH_SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

function clearSession() {
  localStorage.removeItem(AUTH_SESSION_KEY);
}

function passwordValid(password) {
  return /[A-Z]/.test(password) && /\d/.test(password) && password.length >= 8 && password.length <= 64;
}

function phoneValid(phone) {
  return /^\d{10,}$/.test(phone);
}

function emailValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function bytesToBase64(bytes) {
  let binary = "";
  bytes.forEach(byte => binary += String.fromCharCode(byte));
  return btoa(binary);
}

function base64ToBytes(value) {
  return Uint8Array.from(atob(value), character => character.charCodeAt(0));
}

async function hashPassword(password, saltBase64 = null, iterations = 100000) {
  const encoder = new TextEncoder();
  const salt = saltBase64 ? base64ToBytes(saltBase64) : crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations,
      hash: "SHA-256"
    },
    keyMaterial,
    256
  );

  return {
    passwordSalt: bytesToBase64(salt),
    passwordHash: bytesToBase64(new Uint8Array(bits)),
    passwordIterations: iterations,
    passwordAlgorithm: "PBKDF2-SHA256"
  };
}

async function setUserPassword(user, password) {
  const record = await hashPassword(password);
  delete user.password;
  Object.assign(user, record);
}

async function verifyPassword(user, password) {
  if (user.password) {
    const match = user.password === password;
    if (match) await setUserPassword(user, password);
    return match;
  }

  if (!user.passwordHash || !user.passwordSalt) return false;

  const result = await hashPassword(password, user.passwordSalt, user.passwordIterations || 100000);
  return result.passwordHash === user.passwordHash;
}
