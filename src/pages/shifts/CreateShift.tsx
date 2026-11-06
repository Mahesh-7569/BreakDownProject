import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Clock3, ShieldAlert } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_BASE_URL, getToken, logout } from '../../services/authService'

// ✅ Updated to match the new API JSON structure
interface ShiftPayload {
  shiftName: string
  displayName: string
  startTime: string
  endTime: string
  isActive: boolean
}

const initialFormState: ShiftPayload = {
  shiftName: '',
  displayName: '',
  startTime: '',
  endTime: '',
  isActive: true,
}

const timePattern = /^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/

const normalizeTimeValue = (value: string) => {
  if (!value) return ''
  if (/^\d{2}:\d{2}:\d{2}$/.test(value)) return value
  if (/^\d{2}:\d{2}$/.test(value)) return `${value}:00`
  return value
}

function ValidationMessage({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-xs font-semibold text-rose-600 dark:text-rose-300">{message}</p>
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
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-semibold text-inherit transition hover:opacity-80"
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}

function FieldWrapper({
  label,
  description,
  error,
  children,
}: {
  label: string
  description?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-slate-800 dark:text-slate-100">{label}</label>
        {description ? <span className="text-[11px] text-slate-500 dark:text-slate-400">{description}</span> : null}
      </div>
      {children}
      <ValidationMessage message={error} />
    </div>
  )
}

export default function CreateShift() {
  const navigate = useNavigate()
  const [form, setForm] = useState<ShiftPayload>(initialFormState)
  const [errors, setErrors] = useState<Partial<Record<keyof ShiftPayload, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' | '' }>(
    { message: '', variant: '' },
  )

  const validationErrors = useMemo(() => {
    const nextErrors: Partial<Record<keyof ShiftPayload, string>> = {}

    if (!form.shiftName.trim()) {
      nextErrors.shiftName = 'Shift name is required.'
    }
    
    if (!form.displayName.trim()) {
      nextErrors.displayName = 'Display name is required.'
    }

    if (!form.startTime.trim()) {
      nextErrors.startTime = 'Start time is required.'
    } else if (!timePattern.test(form.startTime)) {
      nextErrors.startTime = 'Use HH:MM or HH:MM:SS format.'
    }

    if (!form.endTime.trim()) {
      nextErrors.endTime = 'End time is required.'
    } else if (!timePattern.test(form.endTime)) {
      nextErrors.endTime = 'Use HH:MM or HH:MM:SS format.'
    }

    // Optional: Only enforce if you don't allow overnight shifts (e.g. 22:00 to 06:00)
    const start = normalizeTimeValue(form.startTime)
    const end = normalizeTimeValue(form.endTime)
    if (timePattern.test(start) && timePattern.test(end)) {
      const startSeconds = start.split(':').reduce((acc, part, index) => acc + Number(part) * 60 ** (2 - index), 0)
      const endSeconds = end.split(':').reduce((acc, part, index) => acc + Number(part) * 60 ** (2 - index), 0)
      
      // If your shifts CAN go overnight, remove this check entirely.
      if (endSeconds <= startSeconds && startSeconds - endSeconds < 12 * 3600) {
        // nextErrors.endTime = 'End time must be later than start time.'
      }
    }

    return nextErrors
  }, [form.endTime, form.shiftName, form.displayName, form.startTime])

  useEffect(() => {
    if (!toast.message) return undefined
    const timer = setTimeout(() => setToast({ message: '', variant: '' }), 4000)
    return () => clearTimeout(timer)
  }, [toast.message])

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrors({})

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    const token = getToken()
    if (!token) {
      logout()
      navigate('/login', { replace: true })
      return
    }

    setSubmitting(true)
    try {
      // ✅ Preparing payload matching the new JSON standard
      const payload: ShiftPayload = {
        shiftName: form.shiftName.trim(),
        displayName: form.displayName.trim(),
        startTime: normalizeTimeValue(form.startTime),
        endTime: normalizeTimeValue(form.endTime),
        isActive: Boolean(form.isActive),
      }

      // ✅ Connecting directly to your new POST API
      await axios.post(`${API_BASE_URL}/shift-master`, payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      setToast({ message: 'Shift created successfully', variant: 'success' })
      setForm(initialFormState)
      setTimeout(() => navigate('/masters/shifts', { replace: true, state: { successMessage: 'Shift created successfully' } }), 300)
    } catch (error: any) {
      const friendlyMessage = error.response?.data?.message || error.message || 'Failed to create shift'
      setToast({ message: friendlyMessage, variant: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => navigate('/masters/shifts')

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      <Toast message={toast.message} variant={toast.variant as 'success' | 'error'} onClose={() => setToast({ message: '', variant: '' })} />

      <div className="rounded-3xl bg-gradient-to-br from-white/95 via-white/90 to-slate-50/90 p-6 shadow-lg ring-1 ring-slate-200/80 dark:from-slate-900/85 dark:via-slate-900/80 dark:to-slate-900/75 dark:ring-slate-800">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Shift Master</p>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Add Shift</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Create a new production shift using the same layout and visual rhythm as the Line module.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/masters/shifts')}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:bg-amber-400 dark:text-slate-950 dark:hover:bg-amber-300"
          >
            Back to Shifts
          </button>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-slate-200/80 backdrop-blur dark:bg-slate-900/85 dark:ring-slate-800"
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          
          {/* ✅ Updated Input Field for shiftName */}
          <FieldWrapper label="Shift Name" description="E.g. Shift A" error={errors.shiftName}>
            <input
              type="text"
              name="shiftName"
              value={form.shiftName}
              onChange={handleInputChange}
              className="w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition focus:border-[#1c75bc] focus:outline-none focus:ring-2 focus:ring-[#1c75bc]/20 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
              placeholder="e.g., Shift A"
              required
            />
          </FieldWrapper>

          {/* ✅ New Input Field for displayName */}
          <FieldWrapper label="Display Name" description="E.g. Morning" error={errors.displayName}>
            <input
              type="text"
              name="displayName"
              value={form.displayName}
              onChange={handleInputChange}
              className="w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition focus:border-[#1c75bc] focus:outline-none focus:ring-2 focus:ring-[#1c75bc]/20 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
              placeholder="e.g., Morning"
              required
            />
          </FieldWrapper>

          {/* ✅ Updated Input Field for startTime */}
          <FieldWrapper label="Start Time" description="HH:MM:SS" error={errors.startTime}>
            <div className="relative">
              <Clock3 className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="time"
                name="startTime"
                step={1}
                value={form.startTime}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-2 pl-10 text-sm font-semibold text-slate-800 shadow-sm transition focus:border-[#1c75bc] focus:outline-none focus:ring-2 focus:ring-[#1c75bc]/20 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
                required
              />
            </div>
          </FieldWrapper>

          {/* ✅ Updated Input Field for endTime */}
          <FieldWrapper label="End Time" description="HH:MM:SS" error={errors.endTime}>
            <div className="relative">
              <Clock3 className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="time"
                name="endTime"
                step={1}
                value={form.endTime}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-2 pl-10 text-sm font-semibold text-slate-800 shadow-sm transition focus:border-[#1c75bc] focus:outline-none focus:ring-2 focus:ring-[#1c75bc]/20 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
                required
              />
            </div>
          </FieldWrapper>

          {/* <FieldWrapper label="Active" description="Toggle shift availability" error={errors.isActive}>
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleInputChange}
                className="h-5 w-5 rounded border-slate-300 text-[#1c75bc] focus:ring-[#1c75bc] dark:border-slate-600 dark:bg-slate-800"
              />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {form.isActive ? 'Active' : 'Inactive'}
              </span>
            </label>
          </FieldWrapper> */}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#184b6d] to-sky-500 px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-sky-500/40 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? 'Saving…' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  )
}