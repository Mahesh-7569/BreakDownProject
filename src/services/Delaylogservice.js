import { getToken } from "./authService";
import { API_BASE_DELAYLOG } from "../config/apiConfig";

const authHeaders = () => {
  const token = getToken();
  return { Authorization: token ? `Bearer ${token}` : "" };
};

// GET /api/delay/filter?assetIds=1,2&shiftId=1&startDate=2026-07-10&endDate=2026-07-17
export const getFilteredDelayLogs = async (
  assetIds,
  shiftId,
  startDate,
  endDate,
) => {
  try {
    const ids = Array.isArray(assetIds) ? assetIds : [assetIds];
    const params = new URLSearchParams();
    ids.forEach((id) => params.append("assetIds", id));
    params.append("shiftId", shiftId);
    params.append("startDate", startDate);
    params.append("endDate", endDate);

    const url = `${API_BASE_DELAYLOG}/delay/filter?${params.toString()}`;

    const response = await fetch(url, { headers: authHeaders() });
    if (!response.ok)
      throw new Error(`Error fetching delay logs: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch filtered delay logs:", error);
    return [];
  }
};

// GET /api/delay/{id}
export const getDelayLogById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_DELAYLOG}/delay/${id}`, {
      headers: authHeaders(),
    });
    if (!response.ok)
      throw new Error(`Error fetching delay log: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch delay log:", error);
    return null;
  }
};

// PUT /api/delay/update  (operatorCategorizationUpdate)
// ASSUMPTION: payload shape below - confirm against DelayLogRequestDTO and adjust field names if different.
export const updateDelayLog = async (payload) => {
  try {
    const response = await fetch(`${API_BASE_DELAYLOG}/delay/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok)
      throw new Error(`Error updating delay log: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to update delay log:", error);
    return null;
  }
};

// GET /delay-category
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

// GET /delay-reason/active  (has rgbColor per your schema - used for timeline colors)
export const getActiveDelayReasons = async () => {
  try {
    const response = await fetch(`${API_BASE_DELAYLOG}/delay-reason/active`, {
      headers: authHeaders(),
    });
    if (!response.ok)
      throw new Error(`Error fetching delay reasons: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch delay reasons:", error);
    return [];
  }
};

// GET /delay-reason/by-category/{delayCategoryId}
export const getDelayReasonsByCategory = async (categoryId) => {
  try {
    const response = await fetch(
      `${API_BASE_DELAYLOG}/delay-reason/by-category/${categoryId}`,
      { headers: authHeaders() },
    );
    if (!response.ok)
      throw new Error(`Error fetching reasons by category: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch reasons by category:", error);
    return [];
  }
};

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

// GET /delay/asset/FilterBy-Today-AssetAndStatus?assetIds=1&assetIds=2&statusIds=1
// Filters today's delays by asset(s) AND status(es) together, confirmed against

export const getTodaysDelaysByAssetAndStatus = async (
  assetIds = [],
  statusIds = [],
) => {
  try {
    const params = new URLSearchParams();
    assetIds.forEach((id) => params.append("assetIds", id));
    statusIds.forEach((id) => params.append("statusIds", id));

    const url = `${API_BASE_DELAYLOG}/delay/asset/FilterBy-Today-AssetAndStatus${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    const response = await fetch(url, { headers: authHeaders() });
    if (!response.ok)
      throw new Error(`Error fetching filtered delays: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch filtered delays:", error);
    return [];
  }
};

// POST /api/delay/start (machineSignalTrigger) - creates a new delay.
// NOTE: this endpoint takes plain @RequestParam query params, not a JSON body.
export const createDelayLog = async ({
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
      { method: "POST", headers: authHeaders() },
    );
    if (!response.ok)
      throw new Error(`Error creating delay log: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to create delay log:", error);
    return null;
  }
};

export const getDelayStatuses = async () => {
  try {
    const response = await fetch(`${API_BASE_DELAYLOG}/delay-status`, {
      headers: authHeaders(),
    });
    if (!response.ok)
      throw new Error(`Error fetching delay statuses: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch delay statuses:", error);
    // Fallback so the UI still works if this endpoint doesn't exist yet.
    // Matches the real /delay-status response: Open=1, Closed=2, Attended=5.
    return [
      { id: 1, description: "Open" },
      { id: 2, description: "Closed" },
      { id: 5, description: "Attended" },
    ];
  }
};

// GET /delay/report?fromDate=...&toDate=...&shiftIds=1&assetIds=2&statusIds=1
// shiftIds/assetIds/statusIds are arrays server-side, but the report page's UI is
// single-select per filter - so it sends at most one value per array param, and
// simply omits a param entirely when its filter is "All" (rather than sending an
// empty/zero value).
export const getDelayLogReport = async ({
  fromDate,
  toDate,
  shiftId,
  assetId,
  statusId,
}) => {
  try {
    const params = new URLSearchParams();
    params.append("fromDate", fromDate);
    params.append("toDate", toDate);
    if (shiftId) params.append("shiftIds", shiftId);
    if (assetId) params.append("assetIds", assetId);
    if (statusId) params.append("statusIds", statusId);

    const response = await fetch(
      `${API_BASE_DELAYLOG}/delay/report?${params.toString()}`,
      { headers: authHeaders() },
    );
    if (!response.ok)
      throw new Error(`Error fetching delay report: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch delay report:", error);
    return [];
  }
};

export const getDelayLogReportByCategory = async ({
  fromDate,
  toDate,
  shiftId,
  categoryId,
  statusId,
}) => {
  try {
    const params = new URLSearchParams();
    params.append("fromDate", fromDate);
    params.append("toDate", toDate);
    if (shiftId) params.append("shiftIds", shiftId);
    if (categoryId) params.append("categoryIds", categoryId);
    if (statusId) params.append("statusIds", statusId);

    const response = await fetch(
      `${API_BASE_DELAYLOG}/delay/report-by-category?${params.toString()}`,
      { headers: authHeaders() },
    );
    if (!response.ok)
      throw new Error(
        `Error fetching delay report by category: ${response.status}`,
      );
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch delay report by category:", error);
    return [];
  }
};
