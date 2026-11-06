export interface Shift {
  id: number
  shiftNo: number
  shiftname: string
  starttime: string
  endtime: string
  availableHours: string
  isActive: boolean
}

export type ShiftFormValues = Omit<Shift, 'id'>
