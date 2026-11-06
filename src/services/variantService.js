import axios from "axios";
import { API_BASE_URL } from "../config/apiConfig";
import { getToken } from "./authService";

// Get all variants
export const getVariants = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/Variant/GetData`, {
      params: { status: 0 },
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.data.data; // return only the array
  } catch (error) {
    console.error("Error fetching variants:", error);
    return [];
  }
};

export const addOrEditVariant = async (data) => {
  try {
    const res = await axios.post(
      `${API_BASE_URL}/Variant/AddOrEdit`,
      data,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      }
    );

    return res.data;
  } catch (err) {
   if (err?.code === "ERR_CANCELED" || err?.name === "CanceledError") return

    console.error("Variant API error:", err)
    throw err
  }
};

export const updateVariant = async (variant) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/Variant/AddOrEdit`, variant, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (err) {
    console.error("Failed to update variant:", err);
    throw err;
  }
};
export const getVariantById = async (variantID) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/Variant/GetVariant`, {
      params: { variantID },
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.data.data; // returns the variant object
  } catch (err) {
    console.error("Failed to fetch variant:", err);
    throw err;
  }
};



