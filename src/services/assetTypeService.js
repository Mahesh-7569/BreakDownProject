import axios from 'axios';
import { getToken } from './authService';
import { API_BASE_URL } from '../config/apiConfig';

// Endpoint for Asset Types
const ASSET_TYPE_API = `${API_BASE_URL}/asset-type`;

// Helper function to get headers
const getHeaders = () => {
  const token = getToken();
  return {
    Authorization: `Bearer ${token}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };
};

export const getAllAssetTypes = async () => {
  const response = await axios.get(ASSET_TYPE_API, { headers: getHeaders() });
  return response.data;
};

export const createAssetType = async (data) => {
  const response = await axios.post(ASSET_TYPE_API, data, { headers: getHeaders() });
  return response.data;
};

export const updateAssetType = async (id, data) => {
  const response = await axios.put(`${ASSET_TYPE_API}/${id}`, data, { headers: getHeaders() });
  return response.data;
};

export const deleteAssetType = async (id) => {
  const response = await axios.delete(`${ASSET_TYPE_API}/${id}`, { headers: getHeaders() });
  return response.data;
};