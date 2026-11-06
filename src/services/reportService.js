import { API_BASE_URL } from "../config/apiConfig";
import { getToken } from "./authService";   

export async function getDaywiseReport(lineId, fromDate, toDate) {
  const token = getToken(); 

  const res = await fetch(
    `${API_BASE_URL}/Report/GetDayWiseReportData?lineId=${lineId}&fromDate=${fromDate}&toDate=${toDate}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch Daywise Report");
  }

  return res.json();
}

// 🔹 Stationwise Report 
export async function getStationwiseReport(lineId, fromDate) {
  const token = getToken();

  const res = await fetch(
    `${API_BASE_URL}/Report/GetStationWiseCountForDay?lineId=${lineId}&fromDate=${fromDate}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
if (!res.ok) {
  const errorText = await res.text();
  console.log("Backend error:", errorText);
  throw new Error("Failed to fetch Stationwise Report");
}


  return res.json();
}

// 🔹 Get Stations by Line
export async function getStationsByLine(lineId, fromDate) {
  try {
    const token = getToken();

    // Only format date if it exists
    let formattedDate = "";
    if (fromDate) {
      const [year, month, day] = fromDate.split("-");
      formattedDate = `${day}-${month}-${year}`;
    }

    const res = await fetch(`${API_BASE_URL}/Station/GetStationByLineId?lineId=${lineId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch stations: ${res.status}`);
    }

    const data = await res.json();
    return data; // { success: true, data: [...] }
  } catch (err) {
    console.error("Error in getStationsByLine:", err);
    throw err;
  }
}


// 🔹 Get Parameter Wise Count for Day
export async function getParameterWiseNGCount(lineId, stationId, fromDate) {
  try {
    const token = getToken(); // optional
    let formattedDate = fromDate;

    // If fromDate is in YYYY-MM-DD (from date input), convert to DD-MM-YYYY
    if (/^\d{4}-\d{2}-\d{2}$/.test(fromDate)) {
      const [year, month, day] = fromDate.split("-");
      formattedDate = `${day}-${month}-${year}`;
    }

    const res = await fetch(
      `${API_BASE_URL}/Report/GetParameterWiseCountForDay?lineId=${lineId}&stationId=${stationId}&fromDate=${formattedDate}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch parameter data: ${res.status}`);
    }

    const data = await res.json();
    return data; // { success: true, data: [...] }
  } catch (err) {
    console.error("Error in getParameterWiseNGCount:", err);
    throw err;
  }
}

export async function getParameterDataForDay(lineId, paramId, fromDate) {
  try {
    const token = getToken(); // optional
    let formattedDate = fromDate;

    // Convert YYYY-MM-DD → DD-MM-YYYY
    if (/^\d{4}-\d{2}-\d{2}$/.test(fromDate)) {
      const [year, month, day] = fromDate.split("-");
      formattedDate = `${day}-${month}-${year}`;
    }

    const res = await fetch(
      `${API_BASE_URL}/Report/GetParameterDataForDay?lineId=${lineId}&paramId=${paramId}&fromDate=${formattedDate}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch parameter chart data: ${res.status}`);
    }

    const data = await res.json();
    return data; // { success: true, data: {...} }
  } catch (err) {
    console.error("Error in getParameterDataForDay:", err);
    throw err;
  }
}
