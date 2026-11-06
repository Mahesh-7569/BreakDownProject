import axios from "axios";
import { getToken } from "./authService";
import { API_BASE_URL } from "../config/apiConfig";

// ✅ GET ALL ROLES (Kept as is)
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

// ✅ GET MENUS BY ROLE
export const getMenusByRole = async (roleId) => {
  try {
    const token = getToken();

    const response = await axios.get(
      `${API_BASE_URL}/role-menu-map/by-role/${roleId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = response.data || [];

    if (!Array.isArray(data)) return [];

    // ✅ normalize backend fields → frontend safe fields
    return data.map((item) => ({
      id: item.id, // Ensure we map the new ID field
      menuId: item.menuId,
      roleId: item.roleId,

      canView: item.canView,
      canAdd: item.canAdd,
      canEdit: item.canEdit,
      canDelete: item.canDelete,

      menuName: item.menuName,
      routePath: item.routePath,
      parentMenuId: item.parentMenuId,
      icon: item.icon,
    }));
  } catch (error) {
    console.error("Menu API error:", error);
    return [];
  }
};

// ✅ ADD OR EDIT ROLE MENU MAPPING
export const addOrEditRoleMenuMapping = async (item) => {
  try {
    const token = getToken();

    // ✅ UPDATE
    if (item.id && item.id > 0) {
      const response = await axios.put(
        `${API_BASE_URL}/role-menu-map/${item.id}`,
        item,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    }

    // ✅ CREATE
    const response = await axios.post(
      `${API_BASE_URL}/role-menu-map`,
      item,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error saving role menu mapping:", error);
    throw error;
  }
};

// ✅ DELETE MAPPING
export const deleteMappingsByRole = async (id) => {
  try {
    const token = getToken();

    // Using DELETE method as per standard REST practice for your new endpoint
    return await axios.delete(
      `${API_BASE_URL}/role-menu-map/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    console.error("Delete mapping error:", error);
    throw error;
  }
};