import httpClient from './httpClient'
import type { ShiftBreak, ShiftBreakPayload } from '../types/shiftBreak'

interface ShiftBreakApiResponse<TData = unknown> {
  success: boolean
  message: string
  data: TData
  errors: unknown[]
}

const SHIFT_BREAK_ENDPOINT = '/ShiftBreak'
const SHIFT_BREAK_BY_ID_ENDPOINT = `${SHIFT_BREAK_ENDPOINT}/GetShiftBreakById`
const SHIFT_BREAK_BY_SHIFT_ENDPOINT = `${SHIFT_BREAK_ENDPOINT}/GetShiftBreakByShiftId`
const SHIFT_BREAK_UPDATE_ENDPOINT = `${SHIFT_BREAK_ENDPOINT}/id`

export async function fetchShiftBreaks(shiftId?: number) {
  const response = await httpClient.get<ShiftBreakApiResponse<ShiftBreak[]>>(SHIFT_BREAK_ENDPOINT, {
    params: shiftId ? { shiftId } : undefined,
  })

  const responseBody = response?.data

  if (!responseBody?.success || !Array.isArray(responseBody.data)) {
    throw new Error(responseBody?.message || 'Failed to load shift breaks')
  }

  return responseBody.data
}

export async function getShiftBreakById(id: number) {
  const response = await httpClient.get<ShiftBreakApiResponse<ShiftBreak>>(SHIFT_BREAK_BY_ID_ENDPOINT, {
    params: { id },
  })

  const responseBody = response?.data

  if (!responseBody?.success) {
    throw new Error(responseBody?.message || 'Failed to fetch shift break')
  }

  return responseBody.data
}

export async function getShiftBreaksByShiftId(shiftId: number) {
  const response = await httpClient.get<ShiftBreakApiResponse<ShiftBreak[]>>(SHIFT_BREAK_BY_SHIFT_ENDPOINT, {
    params: { shiftId },
  })

  const responseBody = response?.data

  if (!responseBody?.success || !Array.isArray(responseBody.data)) {
    throw new Error(responseBody?.message || 'Failed to fetch shift breaks for shift')
  }

  return responseBody.data
}

export async function createShiftBreak(payload: ShiftBreakPayload) {
  const payloadWithId = { id: payload.id ?? 0, ...payload }
  const response = await httpClient.post<ShiftBreakApiResponse<ShiftBreak>>(SHIFT_BREAK_ENDPOINT, payloadWithId)
  const responseBody = response?.data

  if (!responseBody?.success) {
    throw new Error(responseBody?.message || 'Failed to create shift break')
  }

  return responseBody.data
}

export async function updateShiftBreak(id: number, payload: ShiftBreakPayload) {
  const payloadWithId = { id: payload.id ?? 0, ...payload }
  const response = await httpClient.put<ShiftBreakApiResponse<ShiftBreak>>(SHIFT_BREAK_UPDATE_ENDPOINT, payloadWithId, {
    params: { id },
  })

  const responseBody = response?.data

  if (!responseBody?.success) {
    throw new Error(responseBody?.message || 'Failed to update shift break')
  }

  return responseBody.data
}

export async function deleteShiftBreak(id: number) {
  const response = await httpClient.delete<ShiftBreakApiResponse<ShiftBreak>>(SHIFT_BREAK_ENDPOINT, {
    params: { id },
  })

  const responseBody = response?.data

  if (!responseBody?.success) {
    throw new Error(responseBody?.message || 'Failed to delete shift break')
  }

  return responseBody.data
}
