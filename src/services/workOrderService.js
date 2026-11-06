import axios from 'axios';
import { getToken } from './authService';
import { API_BASE_URL } from '../config/apiConfig';

const WORK_ORDER_API = `${API_BASE_URL}/workOrder`;

const getHeaders = () => {
  const token = getToken();
  return {
    Authorization: `Bearer ${token}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };
};

export const getAllWorkOrders = async () => {
  const response = await axios.get(WORK_ORDER_API, { headers: getHeaders() });
  return response.data;
};

export const createWorkOrder = async (data) => {
  const response = await axios.post(WORK_ORDER_API, data, { headers: getHeaders() });
  return response.data;
};

export const updateWorkOrder = async (id, data) => {
  const response = await axios.put(`${WORK_ORDER_API}/${id}`, data, { headers: getHeaders() });
  return response.data;
};

export const deleteWorkOrder = async (id) => {
  const response = await axios.delete(`${WORK_ORDER_API}/${id}`, { headers: getHeaders() });
  return response.data;
};