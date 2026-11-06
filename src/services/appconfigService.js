import axios from "axios";
import { getToken } from "./authService";
import { API_BASE_URL } from "../config/apiConfig";

const API_URL = `${API_BASE_URL}/app-configs`;

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  },
});

// =============================
// GET ALL APP CONFIGS
// =============================
export const getAppConfigs = async () => {
  try {
    const res = await axios.get(
      API_URL,
      authHeader()
    );

    return res.data || [];
  } catch (error) {
    console.error("Error fetching App Configs:", error);
    return [];
  }
};

// =============================
// GET APP CONFIG BY ID
// =============================
export const getAppConfigById = async (id) => {
  try {
    const res = await axios.get(
      `${API_URL}/${id}`,
      authHeader()
    );

    return res.data || null;
  } catch (error) {
    console.error("Error fetching App Config By ID:", error);
    return null;
  }
};

// =============================
// ADD APP CONFIG
// =============================
export const addAppConfig = async (model) => {
  try {
    const res = await axios.post(
      API_URL,
      model,
      authHeader()
    );

    return res.data;
  } catch (error) {
    console.error("Error adding App Config:", error);
    throw error;
  }
};

// =============================
// UPDATE APP CONFIG
// =============================
export const updateAppConfig = async (id, model) => {
  try {
    const res = await axios.put(
      `${API_URL}/${id}`,
      model,
      authHeader()
    );

    return res.data;
  } catch (error) {
    console.error("Error updating App Config:", error);
    throw error;
  }
};

// =============================
// ADD OR EDIT APP CONFIG
// =============================
export const addOrEditAppConfig = async (model) => {
  try {
    if (model.id && model.id > 0) {
      return await updateAppConfig(
        model.id,
        model
      );
    } else {
      return await addAppConfig(model);
    }
  } catch (error) {
    console.error("Error saving App Config:", error);
    throw error;
  }
};

// =============================
// DELETE APP CONFIG
// =============================
export const deleteAppConfig = async (id) => {
  try {
    const res = await axios.delete(
      `${API_URL}/${id}`,
      authHeader()
    );

    return res.data;
  } catch (error) {
    console.error("Error deleting App Config:", error);

    return {
      success: false,
      message: error.message,
    };
  }
};