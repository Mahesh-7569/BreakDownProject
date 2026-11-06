// src/services/workplanService.ts
import axios from "axios";
import { API_BASE_URL } from "../config/apiConfig";
import {getToken } from "./authService";

const getAuthConfig = () => {
  const token = getToken();
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
};

export const getLines = async () => {
  return axios.get(`${API_BASE_URL}/Line/GetData`, getAuthConfig());
};

export const getShifts = async () => {
  return axios.get(`${API_BASE_URL}/Shift`, getAuthConfig());
};

export const getVariants = async () => {
  return axios.get(`${API_BASE_URL}/Variant`, getAuthConfig());
};

// 🔹 Add this function to fetch workplans
export const getWorkPlans = async (params: {
  date?: string;
  lineId?: number;
  shiftId?: number;
  variantId?: number;
  status?: number;
}) => {
  return axios.get(`${API_BASE_URL}/WorkPlan`, { 
    params,
    ...getAuthConfig()
  });
};
export const addWorkplan = async (data: {
  planDate: string;
  lineId: number;
  shiftId: number;
  variantId: number;
  status: number;
  startTime: string; 

  workOrderNo: string;
  quantity: number;
  insertedBy: number;
  logDateTime?: string;
}) => {
  return axios.post(`${API_BASE_URL}/WorkPlan`, data, getAuthConfig());
};
export const updateWorkplan = (id: number, data: {
  planDate: string;
  lineId: number;
  shiftId: number;
  variantId: number;
  workOrderNo: string;
  quantity: number;
   status?: number;
}) => {
  return axios.put(
    `${API_BASE_URL}/WorkPlan/${id}`,
    data,
    getAuthConfig()
  );
};
export const getWorkplanById = async (id: number) => {
  const res = await axios.get(`${API_BASE_URL}/WorkPlan`, getAuthConfig());

  const list = res?.data?.data || [];

  const workplan = list.find((item: any) => item.id === id);

  return { data: workplan };
};

export const deleteWorkplan = (id: number) => {
  return axios.delete(`${API_BASE_URL}/WorkPlan/${id}`, getAuthConfig());
};
