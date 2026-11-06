import axios from "axios";
import { API_BASE_URL } from "../config/apiConfig";
import { getToken } from "./authService";

const API_URL = `${API_BASE_URL}/camera-masters`;

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  },
});

export const getAllCameras = async (stationId) => {
  try {
    const response = await axios.get(
      `${API_URL}?stationId=${stationId}`,
      authHeader()
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching cameras:", error);
    return [];
  }
};

// ADD CAMERA
export const addCamera = async (cameraData) => {
  try {
    const response = await axios.post(API_URL, cameraData, authHeader());
    return response.data;
  } catch (error) {
    console.error("Error adding camera:", error);
    throw error;
  }
};

export const getCameraById = async (id) => {
  try {
    const response = await axios.get(
      `${API_URL}/${id}`,
      authHeader()
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching camera:", error);
    return null;
  }
};


// UPDATE CAMERA
export const updateCamera = async (id, cameraData) => {
  try {
    const response = await axios.put(
      `${API_URL}/${id}`,
      cameraData,
      authHeader()
    );
    return response.data;
  } catch (error) {
    console.error("Error updating camera:", error);
    throw error;
  }
};

// DELETE CAMERA
export const deleteCamera = async (id) => {
  try {
    const response = await axios.delete(
      `${API_URL}/${id}`,
      authHeader()
    );

    return response.data;
  } catch (error) {
    console.error("Error deleting camera:", error);
    throw error;
  }
};
export const getAllCamerasByStationId = async (stationId) => {
    try {
        const response = await axios.get(
            `${API_URL}/by-station/${stationId}`,
            authHeader()
        );
        return response.data;
    } catch (error) {
        console.error(`Error fetching cameras for station ${stationId}:`, error);
        return [];
    }
};