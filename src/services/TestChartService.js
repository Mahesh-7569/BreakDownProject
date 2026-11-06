import { API_BASE_URL } from "../config/apiConfig";
import { getToken } from "./authService";

/* ================================
   Helper: Safe Fetch
================================ */
const safeFetch = async (url) => {
  const token = getToken();

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.log("Backend error:", errorText);
    throw new Error(`API Error ${res.status}`);
  }

  return res.json();
};

/* ================================
   Get Sensors By Line Id
================================ */
export const getSensorsByLineId = async (lineId) => {
  return safeFetch(
    `${API_BASE_URL}/SensorData/GetSensorByLineId?lineId=${lineId}`
  );
};

/* ================================
   Get Sensor Parameters
================================ */
export const getSensorParamsById = async (sensorId) => {
  return safeFetch(
    `${API_BASE_URL}/SensorData/GetSensorParamsBySensorId?id=${sensorId}`
  );
};

/* ================================
   Get Sensor Report Data
================================ */
export const getSensorReportData = async (
  fromDate,
  toDate,
  lineId,
  sensorId
) => {
  return safeFetch(
    `${API_BASE_URL}/SensorData/GetSensorDataForReport?fromDate=${fromDate}&toDate=${toDate}&lineId=${lineId}&sensorId=${sensorId}`
  );
};

//save parastats
export const saveParamStats = async (saveData) => {
  const token = getToken();

  try {
    const res = await fetch(`${API_BASE_URL}/SensorData/SaveParamStats`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(saveData),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Backend error:", errorText);
      throw new Error(`API Error ${res.status}`);
    }

    return res.json();
  } catch (err) {
    console.error("Error saving ParamStats:", err);
    return { success: false, message: err.message };
  }
};

