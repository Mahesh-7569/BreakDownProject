import axios from 'axios';
import { getToken } from './authService';
import { API_BASE_URL } from '../config/apiConfig';

const ITEM_MASTER_API = `${API_BASE_URL}/item-master`;

const getHeaders = () => {
  const token = getToken();
  return {
    Authorization: `Bearer ${token}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };
};

export const getAllItemMasters = async () => {
  const response = await axios.get(ITEM_MASTER_API, { headers: getHeaders() });
  return response.data;
};

export const createItemMaster = async (data) => {
  const response = await axios.post(ITEM_MASTER_API, data, { headers: getHeaders() });
  return response.data;
};

export const updateItemMaster = async (id, data) => {
  const response = await axios.put(`${ITEM_MASTER_API}/${id}`, data, { headers: getHeaders() });
  return response.data;
};

export const deleteItemMaster = async (id) => {
  const response = await axios.delete(`${ITEM_MASTER_API}/${id}`, { headers: getHeaders() });
  return response.data;
};