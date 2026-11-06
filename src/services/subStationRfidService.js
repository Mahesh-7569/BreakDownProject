import axios from "axios";
import { getToken } from "./authService";
import { API_BASE_URL } from "../config/apiConfig";

const API_URL = `${API_BASE_URL}/station-rfids`;

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  },
});


// =============================
// GET RFID BY STATION ID
// =============================
export const getSubstationRfids = async (stationId) => {
  try {
    const res = await axios.get(
      `${API_URL}/by-station/${stationId}`,
      authHeader()
    );

    return res.data || [];
  } catch (error) {
    console.error("Error fetching Station RFID:", error);
    return [];
  }
};


// =============================
// GET ALL DATA TYPES
// =============================
export const getDataTypes = async () => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/data-types`,
      authHeader()
    );

    return res.data || [];
  } catch (error) {
    console.error("Error fetching Data Types:", error);
    return [];
  }
};


// =============================
// GET ALL DATA CATEGORIES
// =============================
export const getCategories = async () => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/data-categories`,
      authHeader()
    );

    return res.data || [];
  } catch (error) {
    console.error("Error fetching Categories:", error);
    return [];
  }
};


// =============================
// ADD RFID
// =============================
export const addSubstationRfid = async (model) => {
  try {
    const res = await axios.post(
      API_URL,
      model,
      authHeader()
    );

    return res.data;
  } catch (error) {
    console.error("Error adding Station RFID:", error);
    throw error;
  }
};


// =============================
// UPDATE RFID
// =============================
export const updateSubstationRfid = async (id, model) => {
  try {
    const res = await axios.put(
      `${API_URL}/${id}`,
      model,
      authHeader()
    );

    return res.data;
  } catch (error) {
    console.error("Error updating Station RFID:", error);
    throw error;
  }
};


// =============================
// ADD OR EDIT RFID
// =============================
export const addOrEditSubstationRfid = async (model) => {
  try {
    if (model.id && model.id > 0) {
      return await updateSubstationRfid(model.id, model);
    } else {
      return await addSubstationRfid(model);
    }
  } catch (error) {
    console.error("Error saving Station RFID:", error);
    throw error;
  }
};


// =============================
// GET RFID BY ID
// =============================
export const getSubstationRfidById = async (id) => {
  try {
    const res = await axios.get(
      `${API_URL}/${id}`,
      authHeader()
    );

    return res.data || null;
  } catch (error) {
    console.error("Error fetching RFID by ID:", error);
    return null;
  }
};


// =============================
// DELETE RFID
// =============================
// DELETE RFID
// DELETE RFID
export const deleteSubstationRfid = async (id) => {
  try {
    const res = await axios.delete(
      `${API_URL}/${id}`,
      authHeader()
    );

    return res.data;
  } catch (error) {
    console.error("Delete error:", error);

    return {
      success: false,
      message: error.message,
    };
  }
};