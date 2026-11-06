import axios from "axios";
import { getToken } from "./authService";
import { API_BASE_URL } from "../config/apiConfig";


export const getLineFolderMaps = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/LineFolderMap/GetData`, {
      params: { status: 1 }, // fixed status here
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    return res.data.data; // return only the data array
  } catch (error) {
    console.error("Error fetching LineFolderMap:", error);
    return [];
  }
};

export const addOrEditLineFolderMap = async (payload: {
  id?: number;
  lineId: number | string;
  partDataFolder: string;
  isActive: boolean;
}) => {
  try {
    const res = await axios.post(
      `${API_BASE_URL}/LineFolderMap/AddOrEdit`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );

    return res.data; // return full API response (success/message)
  } catch (error) {
    console.error("Error adding/editing LineFolderMap:", error);
    throw error;
  }
};

export const getLineFolderMapByLineId = async (lineId: number) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/LineFolderMap/GetLineFolder`, {
      params: { lineId },
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.data.data; // returns {id, lineId, partDataFolder, isActive}
  } catch (err) {
    console.error("Error fetching LineFolderMap:", err);
    throw err;
  }
};
