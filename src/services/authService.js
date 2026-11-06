import { API_BASE_URL } from "../config/apiConfig";
const AUTH_STORAGE_KEY = "mes-auth-session";

let refreshTimeout = null;

// ==========================================
// STORAGE HELPERS
// ==========================================
function persistAuth({
  accessToken,
  refreshToken,
  expiration,
  userName,
  roleId,
  userId,
}) {
  const payload = {
    accessToken,
    refreshToken,
    expiration,
    userName,
    roleId,
    userId,
  };
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
}

function readStoredAuth() {
  const rawValue = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!rawValue) return null;
  try {
    return JSON.parse(rawValue);
  } catch {
    return null;
  }
}

function getToken() {
  return readStoredAuth()?.accessToken || null;
}
function getRefreshToken() {
  return readStoredAuth()?.refreshToken || null;
}
function getExpiration() {
  const expiration = readStoredAuth()?.expiration;
  return expiration ? new Date(expiration) : null;
}
function getUserName() {
  return readStoredAuth()?.userName || "";
}
function getRoleId() {
  return readStoredAuth()?.roleId || null;
}

function isTokenExpired() {
  const expiration = getExpiration();
  if (!expiration) return true;
  return expiration.getTime() <= Date.now();
}
function getUserId() {
  return readStoredAuth()?.userId || null;
}

function isAuthenticated() {
  const token = getToken();
  return Boolean(token) && !isTokenExpired();
}

function logout() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem("token");
  localStorage.removeItem("roleId");
  localStorage.removeItem("permissions");
  localStorage.removeItem("userId");
  stopRefreshTimer();
}

// ==========================================
// AUTO-REFRESH LOGIC
// ==========================================
async function refreshAuthToken() {
  const accessToken = getToken();
  const refreshToken = getRefreshToken();

  if (!accessToken || !refreshToken) {
    throw new Error("Missing tokens for refresh");
  }

  const payload = { accessToken, refreshToken };
  console.log("🔄 Sending Refresh Request:", payload);

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log("🔄 Refresh Response:", data);

    if (!response.ok || !data.success) {
      throw new Error("Refresh failed - Refresh token expired");
    }

    if (data?.success && data.accessToken) {
      persistAuth({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken || refreshToken,
        expiration: data.expiration,
        userName: getUserName(),
        roleId: data.roleId || getRoleId(),
        userId: data.userId || getUserId(),
      });

      localStorage.setItem("token", data.accessToken);
      if (data.roleId) localStorage.setItem("roleId", data.roleId);

      startRefreshTimer();
      return data;
    } else {
      throw new Error("Invalid refresh response structure");
    }
  } catch (error) {
    console.warn("Session expired. Logging out...", error);
    logout();
    window.location.href = "/login";
    throw error;
  }
}

function startRefreshTimer() {
  stopRefreshTimer();

  const expirationDate = getExpiration();
  if (!expirationDate) return;

  let msUntilExpiry = expirationDate.getTime() - Date.now();
  const refreshTime = msUntilExpiry - 10000;

  if (refreshTime <= 0) {
    refreshAuthToken().catch(() => {});
  } else {
    refreshTimeout = setTimeout(() => {
      refreshAuthToken().catch(() => {});
    }, refreshTime);
  }
}

function stopRefreshTimer() {
  if (refreshTimeout) {
    clearTimeout(refreshTimeout);
    refreshTimeout = null;
  }
}

function initAuthOnLoad() {
  if (isAuthenticated()) {
    startRefreshTimer();
  } else if (getRefreshToken()) {
    refreshAuthToken().catch(() => {});
  }
}

// ==========================================
// LOGIN LOGIC
// ==========================================
async function login(userName, password) {
  const payload = { userName, password };
  console.log("🔑 Sending Login Request:", payload);

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ Login Failed. Backend said:", errorText);
    throw new Error(`Login failed with status: ${response.status}`);
  }

  const data = await response.json();
  console.log("✅ Login Response:", data);

  if (data?.success && data.accessToken) {
    persistAuth({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiration: data.expiration,
      userName: userName,
      roleId: data.roleId,
      userId: data.userId,
    });

    startRefreshTimer();
  } else {
    throw new Error("Login succeeded but missing tokens in response.");
  }

  return data;
}

// ==========================================
// EXPORTS
// ==========================================
export {
  API_BASE_URL,
  getToken,
  getRefreshToken,
  getUserName,
  getRoleId,
  getUserId,
  getExpiration,
  isTokenExpired,
  isAuthenticated,
  login,
  logout,
  persistAuth,
  readStoredAuth,
  refreshAuthToken,
  startRefreshTimer,
  initAuthOnLoad,
};
