import { API_BASE_URL } from '../config/apiConfig'
import httpClient from './httpClient'
import { logout } from './authService'
import { normalizeCustomer } from '../models/customer'

const CUSTOMER_API_URL = `${API_BASE_URL}/Customer`

const isUnauthorized = (status) => status === 401 || status === 403

/**
 * Fetch customers from the backend API.
 * @param {AbortSignal} [signal]
 * @returns {Promise<import('../models/customer').Customer[]>}
 */
async function getCustomers(signal) {
  try {
    const response = await httpClient.get(CUSTOMER_API_URL, { signal })
    const apiPayload = response?.data
    const apiErrors = Array.isArray(apiPayload?.errors) ? apiPayload.errors : []

    if (apiPayload?.success === false || apiErrors.length) {
      console.error('Customer API returned an error response', apiPayload)
      throw new Error(apiPayload?.message || 'Unable to load customers. Please try again later.')
    }

    const rawCustomers = Array.isArray(apiPayload?.data) ? apiPayload.data : []
    return rawCustomers.map((item) => normalizeCustomer(item))
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

/**
 * Fetch a single customer by ID.
 * @param {number|string} id
 * @param {AbortSignal} [signal]
 * @returns {Promise<import('../models/customer').Customer>}
 */
async function getCustomerById(id, signal) {
  try {
    const response = await httpClient.get(`${CUSTOMER_API_URL}/GetCustomerById`, {
      params: { id },
      signal,
    })
    const apiPayload = response?.data
    const apiErrors = Array.isArray(apiPayload?.errors) ? apiPayload.errors : []

    if (apiPayload?.success === false || apiErrors.length) {
      console.error('Customer API returned an error response', apiPayload)
      throw new Error(apiPayload?.message || 'Unable to load customer. Please try again later.')
    }

    return normalizeCustomer(apiPayload?.data)
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

/**
 * Create a new customer.
 * @param {import('../models/customer').CreateCustomerInput} customer
 * @returns {Promise<import('../models/customer').Customer>}
 */
async function createCustomer(customer) {
  try {
    const response = await httpClient.post(CUSTOMER_API_URL, customer)
    const apiPayload = response?.data
    const apiErrors = Array.isArray(apiPayload?.errors) ? apiPayload.errors : []

    if (apiPayload?.success === false || apiErrors.length) {
      console.error('Customer API returned an error response', apiPayload)
      throw new Error(apiPayload?.message || 'Failed to create customer. Please try again later.')
    }

    return normalizeCustomer(apiPayload?.data)
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

/**
 * Update an existing customer.
 * @param {number|string} id
 * @param {import('../models/customer').CreateCustomerInput} customer
 * @returns {Promise<import('../models/customer').Customer>}
 */
async function updateCustomer(id, customer) {
  try {
    const response = await httpClient.put(`${CUSTOMER_API_URL}/id`, customer, {
      params: { id },
    })
    const apiPayload = response?.data
    const apiErrors = Array.isArray(apiPayload?.errors) ? apiPayload.errors : []

    if (apiPayload?.success === false || apiErrors.length) {
      console.error('Customer API returned an error response', apiPayload)
      throw new Error(apiPayload?.message || 'Failed to update customer. Please try again later.')
    }

    return normalizeCustomer(apiPayload?.data)
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

/**
 * Delete a customer by ID.
 * @param {number|string} id
 * @returns {Promise<void>}
 */
async function deleteCustomer(id) {
  try {
    const response = await httpClient.delete(CUSTOMER_API_URL, { params: { id } })
    const apiPayload = response?.data
    const apiErrors = Array.isArray(apiPayload?.errors) ? apiPayload.errors : []

    if (apiPayload?.success === false || apiErrors.length) {
      console.error('Customer API returned an error response', apiPayload)
      const detailedMessage = apiErrors.length ? apiErrors.join(', ') : apiPayload?.message
      throw new Error(detailedMessage || 'Failed to delete customer. Please try again later.')
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

export { CUSTOMER_API_URL, createCustomer, deleteCustomer, getCustomerById, getCustomers, updateCustomer }
