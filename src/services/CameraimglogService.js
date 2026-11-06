import axios from "axios";
import { API_BASE_URL } from "../config/apiConfig";
import { getToken } from "./authService";

const authHeader = {
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
};

const CameraImageLogService = {

  getByStationCameraDates: async (stationId, cameraId, fromDateTime, toDateTime) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/camera-image-logs/by-station-camera-dates`,
        {
          params: {
            stationId,
            cameraId,
            fromDateTime,
            toDateTime,
          },
          ...authHeader,
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching logs by date range:", error);
      throw error;
    }
  }

};


  // ==============================
  // 2. PART API
  // ==============================
  getByStationCameraPart: async (stationId, cameraId, partNo) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/camera-image-logs/by-station/${stationId}/camera/${cameraId}/part/${partNo}`,
        authHeader()
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching logs by part number:", error);
      throw error;
    }
  }


export default CameraImageLogService;