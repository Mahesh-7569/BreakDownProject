import httpClient from './httpClient'
import { API_BASE_URL } from '../config/apiConfig'
import { logout } from './authService'

const PLANT_API_URL = `${API_BASE_URL}/Plant`
const isUnauthorized = (status) => status === 401 || status === 403
const normalizePlant = (plant) => ({
  id: plant?.id ?? '',
  name: plant?.plantName?.trim() || 'Unnamed Plant',
  code: plant?.plantCode?.trim() || 'N/A',
})

async function getPlants(signal) {
  try {
    const response = await httpClient.get(PLANT_API_URL, { signal })
    const payload = response?.data
    const errors = Array.isArray(payload?.errors) ? payload.errors : []

    if (payload?.success === false || errors.length) {
      throw new Error(payload?.message || errors.join(', ') || 'Unable to load plants. Please try again later.')
    }

    return Array.isArray(payload?.data) ? payload.data.map(normalizePlant) : []
  } catch (error) {
    const status = error?.response?.status ?? error?.status
    if (isUnauthorized(status)) {
      logout()
      const unauthorizedError = new Error('Unauthorized request')
      unauthorizedError.status = status
      throw unauthorizedError
    }
    throw error
  }
}

async function getPlantById(id, signal) {
  try {
    const response = await httpClient.get(`${PLANT_API_URL}/GetPlantById`, { params: { id }, signal })
    const apiPayload = response?.data
    const apiErrors = Array.isArray(apiPayload?.errors) ? apiPayload.errors : []

    if (apiPayload?.success === false || apiErrors.length) {
      throw new Error(apiPayload?.message || apiErrors.join(', ') || 'Unable to find plant. Please try again later.')
    }

    return normalizePlant(apiPayload?.data)
  } catch (error) {
    const status = error?.response?.status ?? error?.status
    if (isUnauthorized(status)) {
      logout()
      const unauthorizedError = new Error('Unauthorized request')
      unauthorizedError.status = status
      throw unauthorizedError
    }
    throw error
  }
}

async function createPlant(payload) {
  try {
    const response = await httpClient.post(PLANT_API_URL, payload)
    const apiPayload = response?.data
    const apiErrors = Array.isArray(apiPayload?.errors) ? apiPayload.errors : []

    if (apiPayload?.success === false || apiErrors.length) {
      throw new Error(apiPayload?.message || apiErrors.join(', ') || 'Unable to create plant. Please try again later.')
    }

    return {
      plant: normalizePlant(apiPayload?.data),
      message: apiPayload?.message || 'Plant created successfully.',
    }
  } catch (error) {
    const status = error?.response?.status ?? error?.status
    if (isUnauthorized(status)) {
      logout()
      const unauthorizedError = new Error('Unauthorized request')
      unauthorizedError.status = status
      throw unauthorizedError
    }
    throw error
  }
}

async function updatePlant(id, payload) {
  try {
    const response = await httpClient.put(`${PLANT_API_URL}/id`, payload, { params: { id } })
    const apiPayload = response?.data
    const apiErrors = Array.isArray(apiPayload?.errors) ? apiPayload.errors : []

    if (apiPayload?.success === false || apiErrors.length) {
      throw new Error(apiPayload?.message || apiErrors.join(', ') || 'Unable to update plant. Please try again later.')
    }

    return {
      plant: normalizePlant(apiPayload?.data),
      message: apiPayload?.message || 'Plant updated successfully.',
    }
  } catch (error) {
    const status = error?.response?.status ?? error?.status
    if (isUnauthorized(status)) {
      logout()
      const unauthorizedError = new Error('Unauthorized request')
      unauthorizedError.status = status
      throw unauthorizedError
    }
    throw error
  }
}

async function deletePlant(id) {
  try {
    const response = await httpClient.delete(PLANT_API_URL, { params: { id } })
    const apiPayload = response?.data
    const apiErrors = Array.isArray(apiPayload?.errors) ? apiPayload.errors : []

    if (apiPayload?.success === false || apiErrors.length) {
      throw new Error(apiPayload?.message || apiErrors.join(', ') || 'Unable to delete plant. Please try again later.')
    }

    return apiPayload?.message || 'Plant deleted successfully.'
  } catch (error) {
    const status = error?.response?.status ?? error?.status
    if (isUnauthorized(status)) {
      logout()
      const unauthorizedError = new Error('Unauthorized request')
      unauthorizedError.status = status
      throw unauthorizedError
    }
    throw error
  }
}

export { createPlant, deletePlant, getPlantById, getPlants, updatePlant, PLANT_API_URL }
