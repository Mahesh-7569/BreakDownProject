import axios from 'axios';
import { getToken } from './authService';
import { API_BASE_URL } from '../config/apiConfig';

const DOWNTIME_REASON_API = `${API_BASE_URL}/downtime-reason`;

export const getAllDowntimeReasons = async () => {
  const token = getToken();
  const response = await axios.get(DOWNTIME_REASON_API, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });
  return response.data;
};
// ✅ ADDED POST (Create)
export const createDowntimeReason = async (data) => {
  const token = getToken();
  const response = await axios.post(DOWNTIME_REASON_API, data, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  });
  return response.data;
};

// ✅ ADDED PUT (Update)
export const updateDowntimeReason = async (id, data) => {
  const token = getToken();
  const response = await axios.put(`${DOWNTIME_REASON_API}/${id}`, data, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  });
  return response.data;
};

export const deleteDowntimeReason = async (id) => {
  const token = getToken();
  const response = await axios.delete(`${DOWNTIME_REASON_API}/${id}`, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });
  return response.data;
};