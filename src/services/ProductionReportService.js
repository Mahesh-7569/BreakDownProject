import { API_BASE_URL } from "../config/apiConfig";
import { getToken } from "./authService";

export const fetchProductionReportData = async (lineId, fromDate, toDate) => {
  try {
    const token = getToken();
    const response = await fetch(
      `${API_BASE_URL}/TraceabilityReport/GetProductionReportData?lineId=${lineId}&fromDate=${fromDate}&toDate=${toDate}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("Server Error:", text);
      return [];
    }

    const json = await response.json();
    // Return the data array directly
    return Array.isArray(json.data) ? json.data : [];
  } catch (err) {
    console.error("Failed to fetch MES Bypass data:", err);
    return [];
  }
};