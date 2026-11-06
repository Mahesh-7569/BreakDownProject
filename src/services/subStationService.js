// services/subStationService.js

import axios from "axios";
import { API_BASE_URL } from "../config/apiConfig";
import { getToken } from "./authService";

const API_URL = `${API_BASE_URL}/station-masters`;

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  },
});

// GET ALL STATIONS
export const getAllStations = async () => {
  try {
    const response = await axios.get(
      API_URL,
      authHeader()
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching stations:", error);
    return [];
  }
};

// SAME FUNCTION NAME FOR OLD COMPONENTS
export const getSubStations = async (lineId) => {
  try {
    const response = await axios.get(
      `${API_URL}?lineId=${lineId}`,
      authHeader()
    );

    return response.data;
  } catch (error) {
    console.error("Failed to fetch stations:", error);
    return [];
  }
};

// ADD STATION
export const addStation = async (station) => {
  try {
    const response = await axios.post(
      API_URL,
      station,
      authHeader()
    );

    return response.data;
  } catch (error) {
    console.error("Failed to save station:", error);
    return null;
  }
};

// UPDATE STATION
export const updateStation = async (id, station) => {
  try {
    const response = await axios.put(
      `${API_URL}/${id}`,
      station,
      authHeader()
    );

    return response.data;
  } catch (error) {
    console.error("Failed to update station:", error);
    return null;
  }
};

// DELETE STATION
export const deleteStation = async (id) => {
  try {
    const response = await axios.delete(
      `${API_URL}/${id}`,
      authHeader()
    );

    return response.data;
  } catch (error) {
    console.error("Failed to delete station:", error);
    return null;
  }
};

// GET STATION BY ID
export const getSubStationById = async (id) => {
  try {
    const response = await axios.get(
      `${API_URL}/${id}`,
      authHeader()
    );

    return response.data;
  } catch (error) {
    console.error("Failed to fetch station:", error);
    return null;
  }
};

// GET PLC DATA
export const getPlcData = async () => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/plc-masters`,
      authHeader()
    );

    return res.data;
  } catch (error) {
    console.error("Error fetching PLC Masters:", error);
    return [];
  }
};