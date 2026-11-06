export interface ShiftBreak {
  id: number
  shiftId: number
  startTime: string
  endTime: string
  breakDetails: string
  isActive: boolean
}

export interface ShiftBreakPayload extends Omit<ShiftBreak, 'id'> {
  id?: number
}
