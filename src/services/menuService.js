import axios from "axios";
import { getToken } from "./authService";
import { API_BASE_URL } from "../config/apiConfig";

const normalizeMenu = (menu) => ({
  id: menu.id,
  menuName: menu.menuName || menu.menuname || "",
  menuCode: menu.menuCode || menu.menucode || menu.menu_code || "",
  routePath: menu.routePath || menu.routepath || "/",
  parentMenuId: menu.parentMenuId ?? menu.parentmenuid ?? null,
  displayOrder: menu.displayOrder ?? menu.displayorder ?? 0, // Added from new payload
  icon: menu.icon || "LayoutDashboard",
  isActive: menu.isActive ?? menu.isactive ?? true,
  createdDate: menu.createdDate || menu.createddate || null // Added from new payload
});


// ✅ GET ALL MENUS
export const getAllMenus = async () => {
  try {
    const token = getToken();

    const response = await axios.get(
      `${API_BASE_URL}/menu-master`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = response.data || [];

    return Array.isArray(data) ? data.map(normalizeMenu) : [];
  } catch (error) {
    console.error("Error fetching menus:", error);
    return [];
  }
};


// ✅ ADD OR EDIT MENU
export const addOrEditMenu = async (payload) => {
  try {
    const token = getToken();
    let response;

    // ✅ UPDATE
    if (payload.id && payload.id > 0) {
      response = await axios.put(
        `${API_BASE_URL}/menu-master/${payload.id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } else {
      // ✅ CREATE
      response = await axios.post(
        `${API_BASE_URL}/menu-master`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    }

    console.log("Save Menu Response:", response.data);
    return response.data;

  } catch (error) {
    console.error("Error saving menu:", error);
    throw error;
  }
};

// ✅ DELETE MENU
export const deleteMenu = async (id) => {
  try {
    const token = getToken();

    await axios.delete(
      `${API_BASE_URL}/menu-master/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

  } catch (error) {
    console.error("Error deleting menu:", error);
    throw error;
  }
};

// ✅ GET MENU BY ID
export const getMenuById = async (id) => {
  try {
    const token = getToken();

    const response = await axios.get(
      `${API_BASE_URL}/menu-master/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return normalizeMenu(response.data);
  } catch (error) {
    console.error("Error fetching menu by id:", error);
    throw error;
  }
};