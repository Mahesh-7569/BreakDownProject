import { getToken } from "./authService";
import { API_BASE_URL } from "../config/apiConfig";
// export const API_BASE_URL = "https://localhost:7264/api";

export async function getDetailProductionForPart(partNo) {
  try {
    const encodedPartNo = encodeURIComponent(partNo);

    const url = `${API_BASE_URL}/TraceabilityReport/TraceabilityReport/GetDetailProductionForPart?partNo=${encodedPartNo}`;

    const token = getToken(); // ✅ GET TOKEN

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ✅ IMPORTANT
      },
    });

    console.log("STATUS 👉", res.status);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}