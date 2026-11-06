import { API_BASE_URL } from "../config/apiConfig";
import { getToken } from "./authService";

// Helper function to build query strings
const buildQueryString = (period, date) => {
  const params = new URLSearchParams();
  if (period) params.append('period', period);
  if (date) params.append('date', date);
  return params.toString() ? `?${params.toString()}` : '';
};

// NEW: Overall Quality and Production Output Summary
export const getQualitySummary = async (assetId, startDateTime, endDateTime) => {
  try {
    const token = getToken();
    
    // Construct the query string exactly as your backend expects
    const queryString = `?startDateTime=${startDateTime}&endDateTime=${endDateTime}`;

    const response = await fetch(`${API_BASE_URL}/quality-dashboard/summary/${assetId}${queryString}`, {
      method: 'GET',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching quality summary: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch quality summary:", error);
    // Return a safe fallback object so the UI doesn't crash
    return null; 
  }
};


// NEW: Performance vs. Quality Trend (Line Chart)
export const getTrendChart = async (assetId, period, date) => {
  try {
    const token = getToken();
    const queryString = buildQueryString(period, date);

    const response = await fetch(`${API_BASE_URL}/quality-dashboard/trend-chart/${assetId}${queryString}`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) throw new Error(`Error fetching trend chart: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch trend chart:", error);
    return { chartData: [] }; 
  }
};

// NEW: Day-Wise OK/NOK Distribution (Bar Chart)
export const getDistributionChart = async (assetId, period, date) => {
  try {
    const token = getToken();
    const queryString = buildQueryString(period, date);

    const response = await fetch(`${API_BASE_URL}/quality-dashboard/distribution-chart/${assetId}${queryString}`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) throw new Error(`Error fetching distribution chart: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch distribution chart:", error);
    return { chartData: [] }; 
  }
};