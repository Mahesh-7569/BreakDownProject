import axios from 'axios';
import { getToken } from './authService';
import { API_BASE_URL } from '../config/apiConfig';

// Assuming API_BASE_URL is "http://localhost:8080/api"
const WORK_ORDER_STATUS_API = `${API_BASE_URL}/workOrderStatus`;

export const getAllWorkOrderStatuses = async () => {
  const token = getToken();
  const response = await axios.get(WORK_ORDER_STATUS_API, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });
  return response.data;
};

export const createWorkOrderStatus = async (data) => {
  const token = getToken();
  const response = await axios.post(WORK_ORDER_STATUS_API, data, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data;
};

export const updateWorkOrderStatus = async (id, data) => {
  const token = getToken();
  const response = await axios.put(`${WORK_ORDER_STATUS_API}/${id}`, data, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data;
};

export const deleteWorkOrderStatus = async (id) => {
  const token = getToken();
  const response = await axios.delete(`${WORK_ORDER_STATUS_API}/${id}`, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });
  return response.data;
};