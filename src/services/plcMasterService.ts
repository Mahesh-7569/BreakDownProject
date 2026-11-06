import axios from "axios";
import { getToken } from "./authService";
import { API_BASE_URL } from "../config/apiConfig";

// GET ALL PLC MASTERS
export const getPlcMasters = async () => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/plc-masters`,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );

    return res.data;
  } catch (error) {
    console.error("Error fetching PLC Masters:", error);
    return [];
  }
};

// GET PLC TYPES
export const getPlcTypes = async () => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/plc-types`,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );

    return res.data;
  } catch (error) {
    console.error("Error fetching PLC Types:", error);
    return [];
  }
};

// ADD PLC
export const addPlc = async (payload: any) => {
  try {
    const res = await axios.post(
      `${API_BASE_URL}/plc-masters`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );

    return res.data;
  } catch (error) {
    console.error("Error adding PLC:", error);
    return null;
  }
};

// UPDATE PLC
export const updatePlc = async (id: number, payload: any) => {
  try {
    const res = await axios.put(
      `${API_BASE_URL}/plc-masters/${id}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );

    return res.data;
  } catch (error) {
    console.error("Error updating PLC:", error);
    return null;
  }
};

// DELETE PLC
export const deletePlc = async (id: number) => {
  try {
    const res = await axios.delete(
      `${API_BASE_URL}/plc-masters/${id}`,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );

    return res.data;
  } catch (error) {
    console.error("Error deleting PLC:", error);
    return null;
  }
};

// GET PLC BY ID
export const getPlcById = async (id: number) => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/plc-masters/${id}`,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );

    return res.data;
  } catch (error) {
    console.error("Error fetching PLC:", error);
    return null;
  }
};