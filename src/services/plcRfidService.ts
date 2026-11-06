import axios from "axios";
import { getToken } from "./authService"; 
import { API_BASE_URL } from "../config/apiConfig";

export async function getPlcRfids(plcId: number) {
  try {
    const token = getToken(); // get stored auth token
    const res = await fetch(`${API_BASE_URL}/PlcRFID/GetData?plcId=${plcId}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    if (data.success) return data.data;
    return [];
  } catch (err) {
    console.error("Failed to fetch PLC RFIDs", err);
    return [];
  }
}

export async function savePlcRfid(payload: any) {
  try {
    const res = await fetch(`${API_BASE_URL}/PlcRFID/AddOrEdit`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Save error:", err);
    return { success: false };
  }
}

export async function getPlcRfidById(id: number) {
  try {
    const res = await fetch(
      `${API_BASE_URL}/PlcRFID/GetById?id=${id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("GetById error:", err);
    return null;
  }
}

export async function deletePlcRfid(id: number) {
  try {
    const res = await fetch(`${API_BASE_URL}/PlcRFID/DeleteData?id=${id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!res.ok) throw new Error(`Server responded with ${res.status}`);
    return { success: true };
  } catch (err) {
    console.error("Delete error:", err);
    return { success: false };
  }
}