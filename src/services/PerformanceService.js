import { API_BASE_URL } from "../config/apiConfig";
import { getToken } from "./authService";

// Fetch the performance summary for the top 3 cards
export const getPerformanceSummary = async (assetId, startDateTime, endDateTime) => {
  try {
    const token = getToken();
    const queryString = `?startDateTime=${startDateTime}&endDateTime=${endDateTime}`;

    const response = await fetch(`${API_BASE_URL}/v1/performance/${assetId}/summary${queryString}`, {
      method: 'GET',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) throw new Error(`Error fetching performance summary: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch performance summary:", error);
    return null;
  }
};

export const getPerformanceTrend = async (assetId, period, customDate = '') => {
  if (!assetId) return null;
  try {
    const token = getToken();
    
    let url = `${API_BASE_URL}/v1/performance/${assetId}/trend?period=${period}`;
    
    // Append the date dynamically for ALL periods if a date is provided
    if (customDate) {
      url += `&date=${customDate}`; 
    }

    const response = await fetch(url, {
      headers: { 'Authorization': token ? `Bearer ${token}` : '' },
    });

    if (!response.ok) throw new Error(`Error fetching trend: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch performance trend:", error);
    return { chartData: [] }; 
  }
};

export const getAvailabilityVsPerformance = async (assetId, period, customDate = '') => {
  if (!assetId) return null;
  try {
    const token = getToken();
    
    let url = `${API_BASE_URL}/v1/performance/${assetId}/availability-vs-performance?period=${period}`;
    
    // Append the date dynamically for ALL periods if a date is provided
    if (customDate) {
      url += `&date=${customDate}`; 
    }

    const response = await fetch(url, {
      headers: { 'Authorization': token ? `Bearer ${token}` : '' },
    });

    if (!response.ok) throw new Error(`Error fetching availability vs performance: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch availability vs performance:", error);
    return { chartData: [] }; 
  }
};