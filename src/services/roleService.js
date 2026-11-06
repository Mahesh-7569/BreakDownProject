// services/roleService.js
import axios from "axios";
import { getToken } from "./authService";
import { API_BASE_URL } from "../config/apiConfig";

// ✅ GET ALL ROLES
export const getAllRoles = async () => {
  try {
    const token = getToken();

    const response = await axios.get(
      `${API_BASE_URL}/user-role`, // Changed from /user-roles
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data || [];
  } catch (error) {
    console.error("Error fetching roles:", error);
    return [];
  }
};

// ✅ ADD OR EDIT ROLE
export const addOrEditRole = async (payload) => {
  try {
    const token = getToken();
    let response;

    // ✅ EDIT ROLE
    if (payload.id && payload.id > 0) {
      response = await axios.put(
        `${API_BASE_URL}/user-role/${payload.id}`, // Changed from /user-roles/${payload.id}
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } 
    // ✅ ADD ROLE
    else {
      response = await axios.post(
        `${API_BASE_URL}/user-role`, // Changed from /user-roles
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    }

    return response.data;
  } catch (error) {
    console.error("Error saving role:", error);
    return null;
  }
};

// ✅ DELETE ROLE
export const deleteRole = async (id) => {
  try {
    const token = getToken();

    const response = await axios.delete(
      `${API_BASE_URL}/user-role/${id}`, // Changed from /user-roles/${id}
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error deleting role:", error);
    throw error;
  }
};

// ✅ GET ROLE BY ID (Added based on your new endpoint list)
export const getRoleById = async (id) => {
  try {
    const token = getToken();

    const response = await axios.get(
      `${API_BASE_URL}/user-role/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching role by id:", error);
    throw error;
  }
};