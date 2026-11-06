import axios from "axios";
import { API_BASE_URL } from "../config/apiConfig";
import { getToken } from "./authService";

export const getParameterChartData = async (
  lineId,
  sensorId,
  paramId,
  fromDate,
  toDate
) => {
  try {
    const token = getToken();

    const response = await axios.get(
      `${API_BASE_URL}/SensorData/GetSensorParamDataForReport`,
      {
        params: {
          lineId,
          sensorId,
          paramId,
          fromDate,
          toDate

          
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;

  } catch (error) {
    console.error("Chart API error:", error);
    return null;
  }
};