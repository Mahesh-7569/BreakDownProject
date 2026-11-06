import { API_BASE_URL } from "../config/apiConfig";
import { getToken } from "./authService";

export async function getPartScanReportData(lineId, fromDate, toDate) {
  try {
    const url = `${API_BASE_URL}/TraceabilityReport/GetPartScanReportData?lineId=${lineId}&fromDate=${fromDate}&toDate=${toDate}`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    // API returns { success, message, data }
    return data.success ? data.data : [];
  } catch (err) {
    console.error("Failed to fetch Part Scan Report:", err);
    return [];
  }
}