import axios from "axios";
import { getToken } from "./authService";
import { API_BASE_URL } from "../config/apiConfig";


export const getLineMappingById = async (id: number) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/LineMap/GetById`, {
      params: { id },
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });

    return res.data.data;

  } catch (error) {
    console.error("Error fetching line mapping:", error);
    return null;
  }
};

export const getLineMappings = async (lineId?: number) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/LineMap/GetData`, {
      params: lineId ? { lineId } : {},
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });

    return res.data.data;
  } catch (error) {
    console.error("Error fetching line mappings:", error);
    return [];
  }
};

export const addOrEditLineMapping = async (data: any) => {

  const res = await axios.post(
    `${API_BASE_URL}/LineMap/AddOrEdit`,
    data,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    }
  );

  return res.data;

};

export const getLineSummary = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/LineMap/GetSummary`, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });

    return res.data.data; // ✅ directly return summary object

  } catch (error) {
    console.error("Error fetching line summary:", error);
    return null;
  }
};