import axios from 'axios';
import { getToken } from './authService';
import { API_BASE_URL } from '../config/apiConfig';

// Endpoint for Assets
const ASSET_API = `${API_BASE_URL}/asset`;

// Helper function to get headers
const getHeaders = () => {
  const token = getToken();
  return {
    Authorization: `Bearer ${token}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };
};

export const getAllAssets = async () => {
  const response = await axios.get(ASSET_API, { headers: getHeaders() });
  return response.data;
};

export const createAsset = async (data) => {
  const response = await axios.post(ASSET_API, data, { headers: getHeaders() });
  return response.data;
};

export const updateAsset = async (id, data) => {
  const response = await axios.put(`${ASSET_API}/${id}`, data, { headers: getHeaders() });
  return response.data;
};

export const deleteAsset = async (id) => {
  const response = await axios.delete(`${ASSET_API}/${id}`, { headers: getHeaders() });
  return response.data;
};