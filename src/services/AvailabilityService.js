import { API_BASE_URL } from "../config/apiConfig";
import { getToken } from "./authService";
export const getShiftMasters = async () => {
  try {
    const token = getToken();
    
    const response = await fetch(`${API_BASE_URL}/shift-master`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '', 
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching shifts: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch shifts:", error);
    return []; 
  }
};


export const getTimelineData = async (date, shiftId, assetIds) => {
  try {
    const token = getToken();
    // assetIds should be a comma-separated string: "1,2,3"
    const url = `${API_BASE_URL}/v1/analysis/timeline?date=${date}&shiftId=${shiftId}&assetIds=${assetIds}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '', 
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching timeline: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch timeline data:", error);
    return []; 
  }
};

export const getReasonsByCategory = async (categoryId) => {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/v1/categories/${categoryId}/reasons`, {
      headers: { 'Authorization': token ? `Bearer ${token}` : '' },
    });
    if (!response.ok) throw new Error(`Error fetching reasons: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch reasons:", error);
    return []; 
  }
};

export const getCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/categories`);
    
    if (!response.ok) {
      console.error(`Error fetching categories: ${response.status}`);
      return [];
    }
    
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return []; // Return empty array to prevent the UI from crashing
  }
};


export const getAllReasons = async () => {
  try {
    const token = getToken();
    
    // Updated to match your specific endpoint
    const response = await fetch(`${API_BASE_URL}/downtime-reason`, {
      headers: { 'Authorization': token ? `Bearer ${token}` : '' },
    });
    
    if (!response.ok) throw new Error(`Error fetching all reasons: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch all reasons:", error);
    return []; 
  }
};

// NEW: Save Update Log API (POST)
export const saveUpdateLog = async (payload) => {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/v1/analysis/update-log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error(`Error saving log: ${response.status}`);
    return true; // Success
  } catch (error) {
    console.error("Failed to save update log:", error);
    return false; // Failed
  }
};

export const getAllocationData = async (date, shiftId, assetIds) => {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/v1/analysis/allocation?date=${date}&shiftId=${shiftId}&assetIds=${assetIds}`, {
      headers: { 'Authorization': token ? `Bearer ${token}` : '' },
    });
    return response.ok ? await response.json() : [];
  } catch (error) {
    console.error("Failed to fetch allocations:", error);
    return [];
};

}

export const getMachineStatuses = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/machine-status`); 
        if (!response.ok) throw new Error("Failed to fetch statuses");
        return await response.json();
    } catch (error) {
        console.error("Error fetching statuses:", error);
        return [];
    }
};