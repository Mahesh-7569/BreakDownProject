import axios from "axios";
import { API_BASE_URL } from "../config/apiConfig";
import { getToken } from "./authService";

const API_URL = `${API_BASE_URL}/app-station-configs`;

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  },
});

// =============================
// GET ALL APP STATION CONFIGS
// =============================
export const getAppStationConfigs = async () => {
  try {
    const res = await axios.get(
      API_URL,
      authHeader()
    );

    return res.data || [];
  } catch (error) {
    console.error(
      "Error fetching app station configs:",
      error
    );

    return [];
  }
};

// =============================
// GET APP STATION CONFIG BY ID
// =============================
export const getAppStationConfigById = async (
  id
) => {
  try {
    const res = await axios.get(
      `${API_URL}/${id}`,
      authHeader()
    );

    return res.data || null;
  } catch (error) {
    console.error(
      "Error fetching app station config by ID:",
      error
    );

    return null;
  }
};

// =============================
// GET CONFIG BY APP ID
// =============================
export const getAppStationConfigByAppId =
  async (appId) => {
    try {
      const res = await axios.get(
        `${API_URL}/by-appId/${appId}`,
        authHeader()
      );

      return res.data || [];
    } catch (error) {
      console.error(
        "Error fetching config by app ID:",
        error
      );

      return [];
    }
  };

// =============================
// ADD APP STATION CONFIG
// =============================
export const addAppStationConfig = async (
  model
) => {
  try {
    const res = await axios.post(
      API_URL,
      model,
      authHeader()
    );

    return res.data;
  } catch (error) {
    console.error(
      "Error adding app station config:",
      error
    );

    throw error;
  }
};

// =============================
// UPDATE APP STATION CONFIG
// =============================
export const updateAppStationConfig =
  async (id, model) => {
    try {
      const res = await axios.put(
        `${API_URL}/${id}`,
        model,
        authHeader()
      );

      return res.data;
    } catch (error) {
      console.error(
        "Error updating app station config:",
        error
      );

      throw error;
    }
  };

// =============================
// DELETE APP STATION CONFIG
// =============================
export const deleteAppStationConfig =
  async (id) => {
    try {
      const res = await axios.delete(
        `${API_URL}/${id}`,
        authHeader()
      );

      return res.data;
    } catch (error) {
      console.error(
        "Error deleting app station config:",
        error
      );

      throw error;
    }
  };