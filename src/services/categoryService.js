import axios from 'axios';
import { getToken } from './authService';
import { API_BASE_URL } from '../config/apiConfig';

const CATEGORY_API = `${API_BASE_URL}/v1/categories`;

export const getAllCategories = async () => {
  const token = getToken();
  const response = await axios.get(CATEGORY_API, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });
  return response.data;
};

export const createCategory = async (payload) => {
  const token = getToken();
  return await axios.post(CATEGORY_API, payload, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

export const updateCategory = async (id, payload) => {
  const token = getToken();
  return await axios.put(`${CATEGORY_API}/${id}`, payload, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

export const deleteCategory = async (id) => {
  const token = getToken();
  return await axios.delete(`${CATEGORY_API}/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};