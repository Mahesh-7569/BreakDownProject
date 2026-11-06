import axios from 'axios';
import { getToken } from './authService';
import { API_BASE_URL } from '../config/apiConfig';

const ITEM_TYPE_API = `${API_BASE_URL}/item-type`;

const getHeaders = () => {
  const token = getToken();
  return {
    Authorization: `Bearer ${token}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };
};

export const getAllItemTypes = async () => {
  const response = await axios.get(ITEM_TYPE_API, { headers: getHeaders() });
  return response.data;
};

export const createItemType = async (data) => {
  const response = await axios.post(ITEM_TYPE_API, data, { headers: getHeaders() });
  return response.data;
};

export const updateItemType = async (id, data) => {
  const response = await axios.put(`${ITEM_TYPE_API}/${id}`, data, { headers: getHeaders() });
  return response.data;
};

export const deleteItemType = async (id) => {
  const response = await axios.delete(`${ITEM_TYPE_API}/${id}`, { headers: getHeaders() });
  return response.data;
};