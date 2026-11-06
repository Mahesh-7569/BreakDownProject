import { API_BASE_URL } from "../config/apiConfig";
import { getToken } from "./authService";

export const fetchMESBypassData = async (fromDate, toDate, lineId) => {
  const token = getToken();

  // lineId is passed directly in the URL
  const url = `${API_BASE_URL}/TraceabilityReport/GetMESBypassReportData?lineId=${lineId}&fromDate=${fromDate}&toDate=${toDate}`;

  const response = await fetch(url, {
    method: "GET",
    headers: { 
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
  });

  if (!response.ok) {
    throw new Error(`Network response was not ok: ${response.status}`);
  }

  const json = await response.json();

  return Array.isArray(json.data) ? json.data : [];
};