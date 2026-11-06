import type { Shift } from '../types/shift'
import httpClient from './httpClient'

export type { Shift }

export interface ShiftPayload {
  shiftNo: number
  shiftname: string
  starttime: string
  endtime: string
  isActive: boolean
  availableHours: string
}

interface ShiftApiResponse<TData = unknown> {
  success: boolean
  message: string
  data: TData
  errors: unknown[]
}

const SHIFT_ENDPOINT = '/Shift'

export async function fetchShifts() {
  const response = await httpClient.get<ShiftApiResponse<Shift[]>>(SHIFT_ENDPOINT)

  const responseBody = response?.data

  if (!responseBody?.success || !Array.isArray(responseBody.data)) {
    throw new Error(responseBody?.message || 'Failed to load shifts')
  }

  return responseBody.data
}

export async function createShift(payload: ShiftPayload) {
  const response = await httpClient.post<ShiftApiResponse>(SHIFT_ENDPOINT, payload)
  const responseBody = response?.data

  if (!responseBody?.success) {
    throw new Error(responseBody?.message || 'Failed to create shift')
  }

  return responseBody
}

export async function fetchShiftById(id: number) {
  const response = await httpClient.get<ShiftApiResponse<Shift>>(`${SHIFT_ENDPOINT}/id`, {
    params: { id },
  })

  const responseBody = response?.data

  if (!responseBody?.success || !responseBody.data) {
    throw new Error(responseBody?.message || 'Failed to load shift')
  }

  return responseBody.data
}

export async function updateShift(payload: Shift) {
  const response = await httpClient.put<ShiftApiResponse<Shift>>(
    `${SHIFT_ENDPOINT}/id`,
    payload,
    { params: { id: payload.id } },
  )

  const responseBody = response?.data

  if (!responseBody?.success) {
    throw new Error(responseBody?.message || 'Failed to update shift')
  }

  return responseBody
}

export async function deleteShift(id: number) {
  const response = await httpClient.delete<ShiftApiResponse>(SHIFT_ENDPOINT, {
    params: { id },
  })

  const responseBody = response?.data

  if (!responseBody?.success) {
    const errorMessage =
      responseBody?.message ||
      (Array.isArray(responseBody?.errors) && responseBody.errors[0]) ||
      'Failed to delete shift'

    throw new Error(typeof errorMessage === 'string' ? errorMessage : 'Failed to delete shift')
  }

  return responseBody
}
