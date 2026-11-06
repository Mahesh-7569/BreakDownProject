import { API_BASE_URL } from "../config/apiConfig";
import { getToken } from "./authService";

export const getDashboardMachines = async () => {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/v1/dashboard/machines`, {
      headers: { 'Authorization': token ? `Bearer ${token}` : '' },
    });
    if (!response.ok) throw new Error(`Error fetching machines: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch dashboard machines:", error);
    return []; 
  }
};

export const getKpiSummary = async (assetId, date) => {
  try {
    const token = getToken();
    
    // 1. Start with just the asset ID
    let url = `${API_BASE_URL}/v1/dashboard/kpi-summary?assetId=${assetId}`;
    
    // 2. Only append '&date=' if a date was actually passed
    if (date) {
      url += `&date=${date}`;
    }

    const response = await fetch(url, {
      headers: { 'Authorization': token ? `Bearer ${token}` : '' },
    });
    if (!response.ok) throw new Error(`Error fetching KPI summary: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch KPI summary:", error);
    return null; 
  }
};

export const getPerformanceTrend = async (assetId, period, date) => {
  try {
    const token = getToken();
    
    let url = `${API_BASE_URL}/v1/dashboard/performance-trend?assetId=${assetId}&period=${period}`;
    if (date) {
      url += `&date=${date}`;
    }

    const response = await fetch(url, {
      headers: { 'Authorization': token ? `Bearer ${token}` : '' },
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch trend:", error);
    return [];
  }
};

export const getTopMachines = async (date) => {
  try {
    const token = getToken();
    
    let url = `${API_BASE_URL}/v1/dashboard/top-machines`;
    // Since there are no other parameters, we use '?' to start the query string here
    if (date) {
      url += `?date=${date}`;
    }

    const response = await fetch(url, {
      headers: { 'Authorization': token ? `Bearer ${token}` : '' },
    });
    if (!response.ok) throw new Error(`Error fetching top machines: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch top machines:", error);
    return []; 
  }
};

export const getInsights = async (assetId, date) => {
  try {
    const token = getToken();
    
    // Base URL with assetId
    let url = `${API_BASE_URL}/v1/dashboard/insights?assetId=${assetId}`;
    
    // Dynamically append the date if it is provided
    if (date) {
      url += `&date=${date}`; 
    }

    const response = await fetch(url, {
      headers: { 'Authorization': token ? `Bearer ${token}` : '' },
    });
    
    if (!response.ok) throw new Error(`Error fetching insights: ${response.status}`);
    
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch insights:", error);
    return null; 
  }
};