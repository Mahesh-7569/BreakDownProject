import { getToken } from "./authService";
import { API_BASE_DELAYLOG } from "../config/apiConfig";

// Dedicated base URL for this page's backend calls - kept separate from the other
// delay services since this page was asked to have its own service file.

const authHeaders = () => {
  const token = getToken();
  return { Authorization: token ? `Bearer ${token}` : "" };
};

export const getusername = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_DELAYLOG}/users/${userId}`, {
      headers: authHeaders(),
    });
    if (!response.ok)
      throw new Error(`Error fetching user: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch today's delays:", error);
    return [];
  }
};

// GET /delay-category -> [{ id, description }]
export const getDelayCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_DELAYLOG}/delay-category`, {
      headers: authHeaders(),
    });
    if (!response.ok)
      throw new Error(`Error fetching delay categories: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch delay categories:", error);
    return [];
  }
};

// GET /asset -> [{ id, assetName, assetType, parentId, isActive }]
export const getAssets = async () => {
  try {
    const response = await fetch(`${API_BASE_DELAYLOG}/asset`, {
      headers: authHeaders(),
    });
    if (!response.ok)
      throw new Error(`Error fetching assets: ${response.status}`);
    const data = await response.json();
    // Only active assets make sense to log a delay against.
    return (data || []).filter((a) => a.isActive !== false);
  } catch (error) {
    console.error("Failed to fetch assets:", error);
    return [];
  }
};

// GET /shift-master -> [{ id, shiftName, displayName, startTime, endTime }]
export const getShiftMasters = async () => {
  try {
    const response = await fetch(`${API_BASE_DELAYLOG}/shift-master`, {
      headers: authHeaders(),
    });
    if (!response.ok)
      throw new Error(`Error fetching shifts: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch shifts:", error);
    return [];
  }
};

// GET /delay/asset/{assetId}/today -> today's raw delay logs for one asset
export const getTodaysDelaysByAsset = async (assetId) => {
  try {
    const response = await fetch(
      `${API_BASE_DELAYLOG}/delay/asset/${assetId}/today`,
      { headers: authHeaders() },
    );
    if (!response.ok)
      throw new Error(`Error fetching today's delays: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch today's delays:", error);
    return [];
  }
};

// POST /delay/start (machineSignalTrigger) - creates a new delay.
// NOTE: this endpoint takes plain @RequestParam query params, not a JSON body.
export const createDelay = async ({
  assetId,
  shiftId,
  categoryId,
  remark,
  loggedBy,
}) => {
  try {
    const params = new URLSearchParams();
    params.append("assetId", assetId);
    params.append("shiftId", shiftId);
    params.append("categoryId", categoryId);
    if (remark) params.append("remark", remark);
    params.append("loggedBy", loggedBy);

    const response = await fetch(
      `${API_BASE_DELAYLOG}/delay/start?${params.toString()}`,
      {
        method: "POST",
        headers: authHeaders(),
      },
    );
    if (!response.ok)
      throw new Error(`Error creating delay: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to create delay:", error);
    return null;
  }
};
