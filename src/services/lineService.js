import { API_BASE_URL } from "../config/apiConfig";
import { getToken } from "../services/authService";
import axios from "axios";

// GET ALL LINES
export const getLines = async () => {
  try {

    const token = getToken();

    const response = await fetch(
      `${API_BASE_URL}/line-masters`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch lines");
    }

    const result = await response.json();

    return result || [];

  } catch (error) {

    console.error("Error fetching lines:", error);
    return [];

  }
};

// LIVE DATA (using same API for now)
export const getLinesForLiveData = async () => {
  try {

    const token = getToken();

    const response = await fetch(
      `${API_BASE_URL}/line-masters`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch lines");
    }

    const result = await response.json();

    return result || [];

  } catch (error) {

    console.error("Error fetching lines:", error);
    return [];

  }
};

// ADD OR EDIT LINE
export const addOrEditLine = async (lineData) => {
  try {

    const token = getToken();

    // UPDATE
    if (lineData.id) {

      const response = await fetch(
        `${API_BASE_URL}/line-masters/${lineData.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(lineData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update line");
      }

      return await response.json();

    } 
    
    // ADD
    else {

      const response = await fetch(
        `${API_BASE_URL}/line-masters`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(lineData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add line");
      }

      return await response.json();

    }

  } catch (error) {

    console.error("Error saving line:", error);
    throw error;

  }
};

// GET LINE BY ID
export const getLineById = async (id) => {
  try {

    const res = await axios.get(
      `${API_BASE_URL}/line-masters/${id}`,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );

    return res.data;

  } catch (error) {

    console.error("Error fetching line:", error);
    return null;

  }
};