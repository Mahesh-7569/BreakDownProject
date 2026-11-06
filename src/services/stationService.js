import { API_BASE_URL, logout } from './authService'

const STATION_API_URL = `${API_BASE_URL}/Station`
const STATION_DELETE_API_URL = STATION_API_URL
const STATION_SEARCH_API_URL = `${STATION_API_URL}/GetStationById`
const STATION_SEARCH_BY_LINE_API_URL = `${STATION_API_URL}/GetStationByLineId`

const handleUnauthorized = () => {
  logout()
  console.warn('Unauthorized access detected while calling Station API')
}

const getStations = async (token, signal) => {
  const response = await fetch(STATION_API_URL, {
    method: 'GET',
    headers: {
      Accept: '*/*',
      Authorization: `Bearer ${token}`,
    },
    signal,
  })

  if (response.status === 401 || response.status === 403) {
    const error = new Error('Unauthorized request')
    error.status = response.status
    throw error
  }

  if (!response.ok) {
    throw new Error('Unable to load stations. Please try again later.')
  }

  const data = await response.json()

  if (!data?.success) {
    throw new Error(data?.message || 'Unable to load stations. Please try again later.')
  }

  return Array.isArray(data.data) ? data.data : []
}

const createStation = async (payload, token) => {
  const response = await fetch(STATION_API_URL, {
    method: 'POST',
    headers: {
      Accept: '*/*',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  let responseBody = null
  try {
    responseBody = await response.json()
  } catch {
    responseBody = null
  }

  if (response.status === 401 || response.status === 403) {
    const error = new Error(responseBody?.message || 'Unauthorized request')
    error.status = response.status
    throw error
  }

  if (!response.ok || responseBody?.success === false) {
    const error = new Error(responseBody?.message || 'Failed to create station')
    error.status = response.status
    throw error
  }

  return responseBody?.data
}

const getStationById = async (stationId, token, signal) => {
  const response = await fetch(`${STATION_SEARCH_API_URL}?id=${encodeURIComponent(stationId)}`, {
    method: 'GET',
    headers: {
      Accept: '*/*',
      Authorization: `Bearer ${token}`,
    },
    signal,
  })

  const data = await response.json()

  if (response.status === 401 || response.status === 403) {
    const error = new Error(data?.message || 'Unauthorized request')
    error.status = response.status
    throw error
  }

  if (!response.ok || data?.success === false) {
    const error = new Error(data?.message || 'Unable to find station. Please try again later.')
    error.status = response.status
    throw error
  }

  return data?.data ?? null
}

const getStationsByLineId = async (lineId, token, signal) => {
  const response = await fetch(
    `${STATION_SEARCH_BY_LINE_API_URL}?lineId=${encodeURIComponent(lineId)}`,
    {
      method: 'GET',
      headers: {
        Accept: '*/*',
        Authorization: `Bearer ${token}`,
      },
      signal,
    },
  )

  const data = await response.json()

  if (response.status === 401 || response.status === 403) {
    const error = new Error(data?.message || 'Unauthorized request')
    error.status = response.status
    throw error
  }

  if (!response.ok || data?.success === false) {
    const error = new Error(data?.message || 'Unable to find stations. Please try again later.')
    error.status = response.status
    throw error
  }

  if (!Array.isArray(data?.data)) {
    return []
  }

  return data.data
}

const deleteStation = async (stationId, token) => {
  const response = await fetch(
    `${STATION_DELETE_API_URL}?id=${encodeURIComponent(stationId)}`,
    {
      method: 'DELETE',
      headers: {
        Accept: '*/*',
        Authorization: `Bearer ${token}`,
      },
    },
  )

  let responseBody = null
  try {
    responseBody = await response.json()
  } catch {
    responseBody = null
  }

  if (response.status === 401 || response.status === 403) {
    const error = new Error(responseBody?.message || 'Unauthorized request')
    error.status = response.status
    throw error
  }

  if (!response.ok || responseBody?.success === false) {
    const error = new Error(responseBody?.message || 'Failed to delete station')
    error.status = response.status
    throw error
  }

  return responseBody
}

const updateStation = async (stationId, payload, token) => {
  const response = await fetch(
    `${STATION_API_URL}/id?id=${encodeURIComponent(stationId)}`,
    {
      method: 'PUT',
      headers: {
        Accept: '*/*',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    },
  )

  let responseBody = null
  try {
    responseBody = await response.json()
  } catch {
    responseBody = null
  }

  if (response.status === 401 || response.status === 403) {
    handleUnauthorized()
    const error = new Error(responseBody?.message || 'Unauthorized request')
    error.status = response.status
    throw error
  }

  if (!response.ok || responseBody?.success === false) {
    const error = new Error(responseBody?.message || 'Unable to update station. Please try again later.')
    error.status = response.status
    throw error
  }

  return responseBody?.data
}

export {
  createStation,
  deleteStation,
  getStationById,
  getStations,
  getStationsByLineId,
  updateStation,
  STATION_API_URL,
}
