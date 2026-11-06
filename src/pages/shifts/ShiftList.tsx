import type { FormEvent } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import axios, { AxiosError } from 'axios'
import {
  CalendarClock,
  CheckCircle2,
  Clock,
  Edit3,
  Loader2,
  PauseCircle,
  Plus,
  RefreshCcw,
  ShieldAlert,
  Trash2,
  X,
} from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

import { API_BASE_URL, getToken } from '../../services/authService'
import {
  createShiftBreak,
  deleteShiftBreak,
  fetchShiftBreaks,
  getShiftBreakById,
  getShiftBreaksByShiftId,
  updateShiftBreak,
} from '../../services/shiftBreakService'
import type { ShiftBreak, ShiftBreakPayload } from '../../types/shiftBreak'

// Updated interface to match your new API payload
interface Shift {
  id: number
  shiftName: string
  displayName: string
  startTime: string
  endTime: string
  isActive?: boolean
}

interface ShiftApiResponse {
  success: boolean
  message: string
  data: Shift[]
  errors: unknown[]
}

const formatTime = (time: string): string => {
  if (!time) return '-'
  return time.slice(0, 5)
}

// Dynamically calculate hours based on start and end time
const calculateHours = (start: string, end: string): string => {
  if (!start || !end) return '-'
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  
  let diff = (eh * 60 + (em || 0)) - (sh * 60 + (sm || 0))
  if (diff < 0) diff += 24 * 60 // Handle overnight shifts
  
  const hours = Math.floor(diff / 60)
  const mins = diff % 60
  return `${hours}:${mins.toString().padStart(2, '0')} hrs`
}

const statusClasses: Record<'active' | 'inactive', string> = {
  active:
    'bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-100 dark:ring-emerald-500/30',
  inactive:
    'bg-rose-50 text-rose-700 ring-rose-100 dark:bg-rose-500/15 dark:text-rose-100 dark:ring-rose-500/30',
}

const shiftBreakInitialForm: ShiftBreakPayload = {
  shiftId: 0,
  breakDetails: '',
  startTime: '',
  endTime: '',
  isActive: true,
}

function Toast({
  message,
  variant,
  onClose,
}: {
  message: string
  variant: 'success' | 'error'
  onClose: () => void
}) {
  if (!message) return null

  const styles =
    variant === 'success'
      ? 'bg-emerald-50 text-emerald-800 ring-emerald-100 dark:bg-emerald-900/80 dark:text-emerald-50 dark:ring-emerald-800'
      : 'bg-rose-50 text-rose-800 ring-rose-100 dark:bg-rose-900/80 dark:text-rose-50 dark:ring-rose-800'

  const Icon = variant === 'success' ? CheckCircle2 : ShieldAlert

  return (
    <div
      className={`fixed right-4 top-4 z-50 max-w-sm rounded-2xl px-4 py-3 shadow-lg ring-1 ${styles}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-full bg-white/80 p-2 text-inherit dark:bg-white/10">
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 text-sm font-semibold leading-5">{message}</div>
        <button type="button" onClick={onClose} className="text-xs font-semibold text-inherit transition hover:opacity-80">
          Dismiss
        </button>
      </div>
    </div>
  )
}

function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  loading,
}: {
  open: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600 ring-1 ring-rose-100 dark:bg-rose-900/30 dark:text-rose-200 dark:ring-rose-900/60">
            <Trash2 className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <p className="text-lg font-semibold text-slate-900 dark:text-white">{title}</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p>
          </div>
          <div className="flex w-full justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="w-full rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`w-full rounded-lg px-4 py-2 text-sm font-semibold text-white shadow transition ${
                loading ? 'cursor-not-allowed bg-rose-400/80 opacity-80' : 'bg-rose-500 hover:-translate-y-0.5 hover:bg-rose-600'
              }`}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const ShiftList = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [shifts, setShifts] = useState<Shift[]>([])
  const [filteredShifts, setFilteredShifts] = useState<Shift[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [successMessage, setSuccessMessage] = useState<string>(location.state?.successMessage || '')
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' | '' }>({
    message: '',
    variant: '',
  })
  const [shiftToDelete, setShiftToDelete] = useState<Shift | null>(null)
  const [activeSection, setActiveSection] = useState<'shifts' | 'breaks'>('shifts')
  const [breaks, setBreaks] = useState<ShiftBreak[]>([])
  const [breakLoading, setBreakLoading] = useState(false)
  const [breakSaving, setBreakSaving] = useState(false)
  const [breakSelectedShift, setBreakSelectedShift] = useState<number | 'all'>('all')
  const [breakStatusFilter, setBreakStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [breakSearch, setBreakSearch] = useState('')
  const [breakSearchMode, setBreakSearchMode] = useState<'id' | 'shift'>('id')
  const [breakSearchLoading, setBreakSearchLoading] = useState(false)
  const [breakForm, setBreakForm] = useState<ShiftBreakPayload>(shiftBreakInitialForm)
  const [editingBreak, setEditingBreak] = useState<ShiftBreak | null>(null)
  const [showBreakModal, setShowBreakModal] = useState(false)
  const [breakDeletingId, setBreakDeletingId] = useState<number | null>(null)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      navigate('/login', { replace: true })
      return
    }

    const fetchShifts = async () => {
      setLoading(true)
      setError(null)

      try {
        // ✅ Connected to the new GET /shift-master API
        const response = await axios.get<ShiftApiResponse>(`${API_BASE_URL}/shift-master`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const shiftData = response.data?.data ?? response.data ?? []
        setShifts(shiftData as unknown as Shift[])
        setFilteredShifts(shiftData as unknown as Shift[])
      } catch (err) {
        const message = err instanceof AxiosError ? err.message : 'Failed to load shifts.'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    fetchShifts()
  }, [navigate])

  useEffect(() => {
    const term = searchTerm.trim().toLowerCase()

    if (!term) {
      setFilteredShifts(shifts)
      return
    }

    setFilteredShifts(
      shifts.filter(
        (shift) =>
          (shift.shiftName || '').toLowerCase().includes(term) ||
          (shift.displayName || '').toLowerCase().includes(term),
      ),
    )
  }, [searchTerm, shifts])

  const loadBreaks = useCallback(
    async (shiftId?: number) => {
      try {
        setBreakLoading(true)
        const token = getToken()

        if (!token) {
          navigate('/login', { replace: true })
          return
        }

        const data = await fetchShiftBreaks(shiftId)
        setBreaks(data)
      } catch (error) {
        console.error(error)
        setToast({ message: 'Unable to load shift breaks', variant: 'error' })
      } finally {
        setBreakLoading(false)
      }
    },
    [navigate],
  )

  // useEffect(() => {
  //   void loadBreaks()
  // }, [loadBreaks])

  // useEffect(() => {
  //   if (activeSection === 'breaks') {
  //     void loadBreaks(breakSelectedShift === 'all' ? undefined : Number(breakSelectedShift))
  //   }
  // }, [activeSection, breakSelectedShift, loadBreaks])

  // useEffect(() => {
  //   if (activeSection !== 'breaks') return

  //   if (!breakSearch.trim()) {
  //     void loadBreaks(breakSelectedShift === 'all' ? undefined : Number(breakSelectedShift))
  //   }
  // }, [activeSection, breakSearch, breakSelectedShift, loadBreaks])

  const stripSeconds = (value: string) => (value && value.length >= 5 ? value.slice(0, 5) : value)

  const handleOpenBreakModal = (shiftBreak?: ShiftBreak) => {
    if (shiftBreak) {
      setEditingBreak(shiftBreak)
      setBreakForm({
        breakDetails: shiftBreak.breakDetails,
        endTime: stripSeconds(shiftBreak.endTime),
        startTime: stripSeconds(shiftBreak.startTime),
        shiftId: shiftBreak.shiftId,
        isActive: shiftBreak.isActive,
      })
    } else {
      setEditingBreak(null)
      setBreakForm((prev) => ({
        ...prev,
        shiftId: breakSelectedShift === 'all' ? 0 : Number(breakSelectedShift),
      }))
    }

    setShowBreakModal(true)
  }

  const resetBreakModal = () => {
    setShowBreakModal(false)
    setBreakForm(shiftBreakInitialForm)
    setEditingBreak(null)
  }

  const handleSaveBreak = async (event: FormEvent) => {
    event.preventDefault()

    const normalizeTime = (value: string) => (value?.length === 5 ? `${value}:00` : value)

    if (!breakForm.breakDetails.trim()) {
      setToast({ message: 'Break name is required', variant: 'error' })
      return
    }

    if (!breakForm.startTime || !breakForm.endTime) {
      setToast({ message: 'Start and End time are required', variant: 'error' })
      return
    }

    if (!breakForm.shiftId) {
      setToast({ message: 'Please select a shift', variant: 'error' })
      return
    }

    try {
      setBreakSaving(true)

      const payload = {
        ...breakForm,
        breakDetails: breakForm.breakDetails.trim(),
        startTime: normalizeTime(breakForm.startTime),
        endTime: normalizeTime(breakForm.endTime),
      }

      if (editingBreak) {
        const updated = await updateShiftBreak(editingBreak.id, payload)
        setBreaks((prev) => prev.map((item) => (item.id === editingBreak.id ? updated : item)))
        setToast({ message: 'Shift break updated', variant: 'success' })
      } else {
        const created = await createShiftBreak(payload)
        setBreaks((prev) => [created, ...prev])
        setToast({ message: 'Shift break added', variant: 'success' })
      }

      resetBreakModal()
    } catch (error) {
      console.error(error)
      setToast({ message: 'Unable to save shift break', variant: 'error' })
    } finally {
      setBreakSaving(false)
    }
  }

  const handleDeleteBreak = async (id: number) => {
    try {
      setBreakDeletingId(id)
      await deleteShiftBreak(id)
      setBreaks((prev) => prev.filter((item) => item.id !== id))
      setToast({ message: 'Shift break removed', variant: 'success' })
    } catch (error) {
      console.error(error)
      setToast({ message: 'Unable to delete shift break', variant: 'error' })
    } finally {
      setBreakDeletingId(null)
    }
  }

  const handleRefreshBreaks = async () => {
    try {
      await loadBreaks(breakSelectedShift === 'all' ? undefined : Number(breakSelectedShift))
      setToast({ message: 'Shift breaks refreshed', variant: 'success' })
    } catch (error) {
      console.error(error)
      setToast({ message: 'Unable to refresh shift breaks', variant: 'error' })
    }
  }

  const handleSearchBreak = async () => {
    const term = breakSearch.trim()

    if (!term) {
      await loadBreaks(breakSelectedShift === 'all' ? undefined : Number(breakSelectedShift))
      return
    }

    const id = Number(term)

    if (Number.isNaN(id)) {
      const label = breakSearchMode === 'shift' ? 'shift ID' : 'shift break ID'
      setToast({ message: `Enter a valid numeric ${label}`, variant: 'error' })
      return
    }

    try {
      setBreakSearchLoading(true)
      if (breakSearchMode === 'shift') {
        const result = await getShiftBreaksByShiftId(id)
        setBreakSelectedShift(id)
        setBreakStatusFilter('all')
        setBreaks(result ?? [])
        setToast({ message: 'Shift breaks loaded', variant: 'success' })
      } else {
        const result = await getShiftBreakById(id)
        setBreakSelectedShift('all')
        setBreakStatusFilter('all')
        setBreaks(result ? [result] : [])
        setToast({ message: 'Shift break loaded', variant: 'success' })
      }
    } catch (error) {
      console.error(error)
      setToast({ message: 'Unable to find shift break', variant: 'error' })
    } finally {
      setBreakSearchLoading(false)
    }
  }

  const getShiftLabel = useCallback(
    (shiftId: number) => shifts.find((shift) => Number(shift.id) === Number(shiftId))?.shiftName || `Shift ${shiftId}`,
    [shifts],
  )

  const filteredBreaks = useMemo(() => {
    return breaks
      .filter((item) => (breakSelectedShift === 'all' ? true : Number(item.shiftId) === Number(breakSelectedShift)))
      .filter((item) =>
        breakStatusFilter === 'all' ? true : breakStatusFilter === 'active' ? item.isActive : !item.isActive,
      )
      .filter((item) => {
        const term = breakSearch.toLowerCase().trim()
        return (
          item.breakDetails.toLowerCase().includes(term) ||
          item.startTime.toLowerCase().includes(term) ||
          item.endTime.toLowerCase().includes(term) ||
          String(item.id).includes(term)
        )
      })
  }, [breakSearch, breakSelectedShift, breakStatusFilter, breaks])

  const handleAddShift = () => navigate('/masters/shifts/create')
const handleEditShift = (shiftId: number) => navigate(`/masters/shifts/edit/${shiftId}`)
  const handleDeleteClick = (shift: Shift) => {
    setShiftToDelete(shift)
  }

  const handleConfirmDelete = async () => {
    if (!shiftToDelete) return

    const token = getToken()

    if (!token) {
      navigate('/login', { replace: true })
      return
    }

    setDeletingId(shiftToDelete.id)

    try {
      // ✅ Connected to the new DELETE /shift-master/:id API
      const response = await axios.delete(`${API_BASE_URL}/shift-master/${shiftToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const successMsg = response.data?.message || 'Shift deleted successfully'
      setToast({ message: successMsg, variant: 'success' })
      setShifts((prev) => prev.filter((item) => item.id !== shiftToDelete.id))
      setFilteredShifts((prev) => prev.filter((item) => item.id !== shiftToDelete.id))
    } catch (err) {
      const axiosError = err as AxiosError
      const status = axiosError?.response?.status

      if (status === 401 || status === 403) {
        navigate('/login', { replace: true })
        return
      }

      const message =
        (axiosError?.response?.data as any)?.message ||
        (axiosError?.response?.data as any)?.errors?.[0] ||
        (err instanceof Error ? err.message : 'Failed to delete shift.')

      setToast({ message, variant: 'error' })
    } finally {
      setDeletingId(null)
      setShiftToDelete(null)
    }
  }

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage)
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.pathname, location.state?.successMessage, navigate])

  useEffect(() => {
    if (!successMessage) return undefined
    const timer = setTimeout(() => setSuccessMessage(''), 3500)
    return () => clearTimeout(timer)
  }, [successMessage])

  useEffect(() => {
    if (!toast.message) return undefined
    const timer = setTimeout(() => setToast({ message: '', variant: '' }), 3500)
    return () => clearTimeout(timer)
  }, [toast.message])

  const shiftCountBadge = useMemo(
    () => (
      <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800/70 dark:text-slate-100 dark:ring-slate-700">
        <span className="inline-flex h-2 w-2 rounded-full bg-[#1c75bc]" />
        {filteredShifts.length} shifts
      </div>
    ),
    [filteredShifts.length],
  )

  const activeBreakCount = useMemo(() => breaks.filter((item) => item.isActive).length, [breaks])
  const selectedShiftLabel = useMemo(
    () => (breakSelectedShift === 'all' ? 'All shifts' : getShiftLabel(Number(breakSelectedShift))),
    [breakSelectedShift, getShiftLabel],
  )

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      <Toast
        message={toast.message}
        variant={(toast.variant as 'success' | 'error') || 'success'}
        onClose={() => setToast({ message: '', variant: '' })}
      />

      {successMessage && (
        <div className="fixed right-4 top-4 z-40 inline-flex items-start gap-3 rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-800 shadow-lg ring-1 ring-emerald-100 dark:bg-emerald-900/80 dark:text-emerald-50 dark:ring-emerald-800">
          <div className="mt-0.5 rounded-full bg-white/80 p-2 text-emerald-700 ring-1 ring-emerald-100 dark:bg-white/10 dark:text-emerald-50 dark:ring-emerald-700/70">
            ✓
          </div>
          <div className="text-sm font-semibold leading-5">{successMessage}</div>
          <button
            type="button"
            className="text-xs font-semibold text-emerald-700 transition hover:text-emerald-900 dark:text-emerald-100 dark:hover:text-white"
            onClick={() => setSuccessMessage('')}
          >
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-100 dark:border-rose-500/40 dark:bg-rose-500/15 dark:text-rose-100 dark:ring-rose-500/30">
          {error}
        </div>
      )}

      {/* <div className="flex flex-wrap gap-3">
        {[{ label: 'Shifts', value: 'shifts' }, { label: 'Shift Breaks', value: 'breaks' }].map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setActiveSection(item.value as 'shifts' | 'breaks')}
            className={`rounded-2xl px-4 py-2 text-sm font-semibold ring-1 transition ${
              activeSection === item.value
                ? 'bg-[#1c75bc] text-white ring-[#1c75bc]/40 dark:bg-amber-400 dark:text-slate-900'
                : 'bg-white text-slate-700 ring-slate-200 hover:-translate-y-0.5 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div> */}

      {activeSection === 'shifts' ? (
        <>
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-lg backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Shift Master</p>
                <h1 className="text-2xl font-semibold">Shift Master</h1>
                <p className="text-sm text-slate-600 dark:text-slate-300">Manage factory shifts, timings, and availability.</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {shiftCountBadge}
                <button
                  type="button"
                  onClick={handleAddShift}
                  className="rounded-2xl bg-gradient-to-r from-[#184b6d] to-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                >
                  + Add Shift
                </button>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                <span>Operational coverage</span>
              </div> */}
              <input
                type="search"
                placeholder="Search by shift name or display name"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full max-w-md rounded-2xl border border-slate-200 bg-white/60 px-4 py-2 text-sm text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:border-[#1c75bc] focus:outline-none focus:ring-2 focus:ring-[#1c75bc]/20 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-100"
              />
            </div>

            {loading ? (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-white/80 px-4 py-6 text-center text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
                Loading shifts…
              </div>
            ) : (
              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/70 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-3 text-left">ID</th>
                      <th className="px-4 py-3 text-left">Display Name</th>
                      <th className="px-4 py-3 text-left">Shift Name</th>
                      <th className="px-4 py-3 text-left">Start Time</th>
                      <th className="px-4 py-3 text-left">End Time</th>
                      {/* <th className="px-4 py-3 text-left">Available Hours</th> */}
                      {/* <th className="px-4 py-3 text-left">Status</th> */}
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-slate-900/90 text-slate-100 dark:divide-slate-800 dark:bg-slate-900/90 dark:text-slate-100">
                    {filteredShifts.map((shift) => (
                      <tr key={shift.id} className="hover:bg-slate-800/70 dark:hover:bg-slate-800/70">
                        <td className="px-4 py-3">{shift.id}</td>
                        <td className="px-4 py-3 font-semibold">{shift.displayName}</td>
                        <td className="px-4 py-3">{shift.shiftName}</td>
                        <td className="px-4 py-3">{formatTime(shift.startTime)}</td>
                        <td className="px-4 py-3">{formatTime(shift.endTime)}</td>
                        {/* <td className="px-4 py-3">{calculateHours(shift.startTime, shift.endTime)}</td> */}
                        {/* <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                              (shift.isActive ?? true) ? statusClasses.active : statusClasses.inactive
                            }`}
                          >
                            {(shift.isActive ?? true) ? 'Active' : 'Inactive'}
                          </span>
                        </td> */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditShift(shift.id)}
                              className="rounded-lg border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-[#1c75bc] hover:text-[#1c75bc] focus:outline-none focus:ring-2 focus:ring-[#1c75bc]/20 dark:border-slate-600 dark:bg-slate-900/70 dark:text-white dark:ring-slate-700 dark:hover:bg-slate-800"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteClick(shift)}
                              disabled={deletingId === shift.id}
                              className={`rounded-lg border px-3 py-1 text-xs font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-rose-400/30 dark:border-rose-500/40 dark:bg-rose-500/15 dark:text-rose-100 ${
                                deletingId === shift.id
                                  ? 'cursor-not-allowed border-rose-200 bg-rose-100 text-rose-600 opacity-80 dark:bg-rose-500/20'
                                  : 'border-rose-200 bg-rose-50 text-rose-700 hover:-translate-y-0.5 hover:border-rose-400 dark:bg-rose-500/25 dark:text-rose-50'
                              }`}
                            >
                              {deletingId === shift.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredShifts.length === 0 && !loading && (
                      <tr>
                        <td colSpan={8} className="px-4 py-6 text-center text-slate-500 dark:text-slate-300">
                          No shifts found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <ConfirmDialog
            open={Boolean(shiftToDelete)}
            title="Delete Shift"
            message="Are you sure you want to delete this shift?"
            onCancel={() => setShiftToDelete(null)}
            onConfirm={handleConfirmDelete}
            loading={deletingId === shiftToDelete?.id}
          />
        </>
      ) : (
        <>
          <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-lg backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Shift Breaks</p>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Shift Break Master</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">Manage breaks without leaving the shift workspace.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleRefreshBreaks}
                  className="inline-flex items-center gap-2 rounded-2xl border border-[#1c75bc]/25 bg-[#1c75bc]/10 px-4 py-2 text-sm font-semibold text-[#1c75bc] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#1c75bc]/15 hover:text-[#0f4f7c] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#1c75bc]/35 dark:border-[#1c75bc]/45 dark:bg-[#1c75bc]/18 dark:text-white dark:ring-[#1c75bc]/50 dark:hover:bg-[#1c75bc]/28"
                >
                  <RefreshCcw className={`h-4 w-4 ${breakLoading ? 'animate-spin' : ''}`} /> Refresh
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenBreakModal()}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#1c75bc] to-[#5da3eb] px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#1c75bc]/50"
                >
                  <Plus className="h-4 w-4" /> Add Shift Break
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-3 rounded-2xl bg-white/90 p-4 ring-1 ring-slate-200/80 shadow-sm dark:bg-slate-800/80 dark:ring-slate-700">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1c75bc]/10 text-[#1c75bc] dark:bg-amber-300/15 dark:text-amber-200">
                  <PauseCircle className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Total breaks</p>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white">{breaks.length}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-white/90 p-4 ring-1 ring-slate-200/80 shadow-sm dark:bg-slate-800/80 dark:ring-slate-700">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-200">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Active</p>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white">{activeBreakCount}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-white/90 p-4 ring-1 ring-slate-200/80 shadow-sm dark:bg-slate-800/80 dark:ring-slate-700">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/15 dark:text-indigo-200">
                  <CalendarClock className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Selected shift</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{selectedShiftLabel}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-white/90 p-4 ring-1 ring-slate-200/80 shadow-sm dark:bg-slate-800/80 dark:ring-slate-700">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/15 dark:text-amber-200">
                  <Clock className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Updated</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Real-time controls</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white/85 p-5 shadow-lg backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Shift</label>
                  <select
                    value={breakSelectedShift}
                    onChange={(event) => setBreakSelectedShift(event.target.value === 'all' ? 'all' : Number(event.target.value))}
                    className="w-full rounded-2xl border border-slate-300 bg-slate-100 px-3 py-2.5 text-sm font-semibold text-slate-800 shadow-inner transition focus:border-[#1c75bc] focus:outline-none focus:ring-2 focus:ring-[#1c75bc]/30 dark:border-slate-600 dark:bg-slate-900/70 dark:text-white dark:ring-slate-700"
                  >
                    <option value="all">All shifts</option>
                    {shifts.map((shift) => (
                      <option key={shift.id} value={shift.id}>
                        {shift.shiftName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Status</label>
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-slate-100 px-2 py-1 shadow-inner dark:border-slate-600 dark:bg-slate-900/70">
                    {[{ label: 'All', value: 'all' }, { label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }].map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setBreakStatusFilter(item.value as typeof breakStatusFilter)}
                        className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                          breakStatusFilter === item.value
                            ? 'bg-[#1c75bc] text-white shadow-lg dark:bg-amber-400 dark:text-slate-900'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800/80 dark:text-slate-100 dark:ring-1 dark:ring-slate-700 dark:hover:bg-slate-700'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    <span>Search</span>
                    <select
                      value={breakSearchMode}
                      onChange={(event) => setBreakSearchMode(event.target.value as 'id' | 'shift')}
                      className="rounded-xl border border-slate-300 bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700 shadow-inner transition hover:border-[#1c75bc] focus:border-[#1c75bc] focus:outline-none focus:ring-1 focus:ring-[#1c75bc]/25 dark:border-slate-600 dark:bg-slate-900/70 dark:text-white dark:ring-slate-700"
                    >
                      <option value="id">Break ID</option>
                      <option value="shift">Shift ID</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-slate-100 px-3 py-2 shadow-inner transition focus-within:border-[#1c75bc] focus-within:ring-2 focus-within:ring-[#1c75bc]/25 dark:border-slate-600 dark:bg-slate-900/70">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder={breakSearchMode === 'shift' ? 'Enter shift ID' : 'Break name, time, or ID'}
                      value={breakSearch}
                      onChange={(event) => setBreakSearch(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault()
                          void handleSearchBreak()
                        }
                      }}
                      className="w-full bg-transparent text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none dark:text-white dark:placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => void handleSearchBreak()}
                      disabled={breakSearchLoading || breakLoading}
                      className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                        breakSearchLoading || breakLoading
                          ? 'cursor-not-allowed bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                          : 'bg-[#1c75bc] text-white hover:-translate-y-0.5 hover:shadow-lg dark:bg-amber-400 dark:text-slate-900 dark:hover:bg-amber-300'
                      }`}
                    >
                      {breakSearchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
                      Search
                    </button>
                  </div>
                </div>
              </div>

            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
                  <thead className="bg-slate-50/70 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:bg-slate-800/70 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-3">Break</th>
                      <th className="px-4 py-3">Shift</th>
                      <th className="px-4 py-3">Start</th>
                      <th className="px-4 py-3">End</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-slate-900 text-slate-100 dark:divide-slate-800 dark:bg-slate-900 dark:text-slate-100">
                    {breakLoading && (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-slate-500 dark:text-slate-300">
                          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                            <Loader2 className="h-4 w-4 animate-spin" /> Loading shift breaks...
                          </div>
                        </td>
                      </tr>
                    )}

                    {!breakLoading && filteredBreaks.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-slate-500 dark:text-slate-300">
                          <div className="mx-auto max-w-md space-y-2">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-[#1c75bc] shadow-inner dark:bg-slate-800 dark:text-amber-300">
                              <PauseCircle className="h-6 w-6" />
                            </div>
                            <p className="text-lg font-semibold text-slate-800 dark:text-white">No shift breaks found</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Try adjusting filters or add a new break to start tracking pauses.</p>
                          </div>
                        </td>
                      </tr>
                    )}

                    {!breakLoading &&
                      filteredBreaks.map((item) => (
                        <tr key={item.id} className="bg-slate-900/95 transition hover:bg-slate-800/80 dark:bg-slate-900/95 dark:hover:bg-slate-800/80">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1c75bc]/10 text-[#1c75bc] dark:bg-amber-300/15 dark:text-amber-200">
                                <Clock className="h-5 w-5" />
                              </span>
                              <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.breakDetails}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">ID #{item.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm font-semibold text-slate-100">{getShiftLabel(item.shiftId)}</td>
                          <td className="px-4 py-4 text-sm font-semibold text-slate-100">{item.startTime}</td>
                          <td className="px-4 py-4 text-sm font-semibold text-slate-100">{item.endTime}</td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                                item.isActive
                                  ? 'bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/40 dark:bg-emerald-400/15 dark:text-emerald-50 dark:ring-emerald-300/40'
                                  : 'bg-slate-200/70 text-slate-700 ring-1 ring-slate-300/60 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700'
                              }`}
                            >
                              <span className={`h-2 w-2 rounded-full ${item.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                              {item.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleOpenBreakModal(item)}
                                className="rounded-xl bg-[#1c75bc]/18 p-2 text-white ring-1 ring-[#1c75bc]/45 transition hover:-translate-y-0.5 hover:bg-[#1c75bc]/28 focus:outline-none focus:ring-2 focus:ring-[#1c75bc]/55"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteBreak(item.id)}
                                className="rounded-xl bg-rose-500/18 p-2 text-rose-50 ring-1 ring-rose-400/70 transition hover:-translate-y-0.5 hover:bg-rose-500/28 focus:outline-none focus:ring-2 focus:ring-rose-400/80"
                                disabled={breakDeletingId === item.id}
                              >
                                {breakDeletingId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {showBreakModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
              <div className="w-full max-w-2xl rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{editingBreak ? 'Edit' : 'Add'} break</p>
                    <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{editingBreak ? 'Update shift break' : 'Add new shift break'}</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Define the break name, timing, status, and linked shift.</p>
                  </div>
                  <button
                    type="button"
                    onClick={resetBreakModal}
                    className="rounded-2xl bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1c75bc]/30 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form className="mt-6 space-y-4" onSubmit={handleSaveBreak}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Break name</label>
                      <input
                        type="text"
                        value={breakForm.breakDetails}
                        onChange={(event) => setBreakForm((prev) => ({ ...prev, breakDetails: event.target.value }))}
                        placeholder="e.g., Lunch or Tea"
                        className="w-full rounded-2xl border border-slate-200/80 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 shadow-inner transition focus:border-[#1c75bc] focus:outline-none focus:ring-2 focus:ring-[#1c75bc]/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Shift</label>
                      <select
                        value={breakForm.shiftId}
                        onChange={(event) => setBreakForm((prev) => ({ ...prev, shiftId: Number(event.target.value) }))}
                        className="w-full rounded-2xl border border-slate-200/80 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 shadow-inner transition focus:border-[#1c75bc] focus:outline-none focus:ring-2 focus:ring-[#1c75bc]/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      >
                        <option value={0}>Select shift</option>
                        {shifts.map((shift) => (
                          <option key={shift.id} value={shift.id}>
                            {shift.shiftName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Start time</label>
                      <input
                        type="time"
                        value={breakForm.startTime}
                        onChange={(event) => setBreakForm((prev) => ({ ...prev, startTime: event.target.value }))}
                        className="w-full rounded-2xl border border-slate-200/80 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 shadow-inner transition focus:border-[#1c75bc] focus:outline-none focus:ring-2 focus:ring-[#1c75bc]/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">End time</label>
                      <input
                        type="time"
                        value={breakForm.endTime}
                        onChange={(event) => setBreakForm((prev) => ({ ...prev, endTime: event.target.value }))}
                        className="w-full rounded-2xl border border-slate-200/80 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 shadow-inner transition focus:border-[#1c75bc] focus:outline-none focus:ring-2 focus:ring-[#1c75bc]/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {[{ label: 'Active', value: true }, { label: 'Inactive', value: false }].map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => setBreakForm((prev) => ({ ...prev, isActive: item.value }))}
                        className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold ring-1 transition ${
                          breakForm.isActive === item.value
                            ? 'bg-[#1c75bc] text-white ring-[#1c75bc]/40 dark:bg-amber-400 dark:text-slate-900 dark:ring-amber-300/60'
                            : 'bg-white text-slate-700 ring-slate-200 hover:-translate-y-0.5 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700'
                        }`}
                      >
                        <span className={`h-2.5 w-2.5 rounded-full ${item.value ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {item.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={resetBreakModal}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={breakSaving}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#1c75bc] to-[#5da3eb] px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#1c75bc]/40 disabled:opacity-70"
                    >
                      {breakSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarClock className="h-4 w-4" />}
                      {editingBreak ? 'Update Break' : 'Save Break'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ShiftList