import type React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Clock3, ShieldAlert } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { getToken, logout, API_BASE_URL } from '../../services/authService'

// Keeping your local state structure to match the UI
interface ShiftFormState {
  shiftNo: number
  shiftname: string
  displayName: string
  starttime: string
  endtime: string
  isActive: boolean
  availableHours: string
}

const initialFormState: ShiftFormState = {
  shiftNo: 0,
  shiftname: '',
  displayName: '',
  starttime: '',
  endtime: '',
  isActive: true,
  availableHours: '',
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

function Toast({ message, variant, onClose }: { message: string, variant: 'success' | 'error', onClose: () => void }) {
  if (!message) return null
  const styles = variant === 'success' ? 'bg-emerald-50 text-emerald-800 ring-emerald-100 dark:bg-emerald-900/80 dark:text-emerald-50 dark:ring-emerald-800' : 'bg-rose-50 text-rose-800 ring-rose-100 dark:bg-rose-900/80 dark:text-rose-50 dark:ring-rose-800'
  const Icon = variant === 'success' ? CheckCircle2 : ShieldAlert
  return (
    <div className={`fixed right-4 top-4 z-50 max-w-sm rounded-2xl px-4 py-3 shadow-lg ring-1 ${styles}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-full bg-white/80 p-2 text-inherit dark:bg-white/10"><Icon className="h-4 w-4" /></div>
        <div className="flex-1 text-sm font-semibold leading-5">{message}</div>
        <button type="button" onClick={onClose} className="text-xs font-semibold text-inherit transition hover:opacity-80">Dismiss</button>
      </div>
    </div>
  )
}

function FieldWrapper({ label, description, error, children }: { label: string, description?: string, error?: string, children: React.ReactNode }) {
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

export default function EditShift() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState<ShiftFormState>(initialFormState)
  const [errors, setErrors] = useState<Partial<Record<keyof ShiftFormState, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' | '' }>({ message: '', variant: '' })

  const shiftId = Number(id)

  useEffect(() => {
    const loadShift = async () => {
      const token = getToken()
      if (!token) return logout()
      
      try {
        setLoading(true)
        const response = await axios.get(`${API_BASE_URL}/shift-master/${shiftId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = response.data?.data || response.data
        
        setForm({
          shiftNo: data.id || 0,
          shiftname: data.shiftName || '',
          displayName: data.displayName || '',
          starttime: normalizeTimeValue(data.startTime || ''),
          endtime: normalizeTimeValue(data.endTime || ''),
          isActive: data.isActive ?? true,
          availableHours: '08:00:00'
        })
      } catch (err) {
        setToast({ message: 'Failed to load shift', variant: 'error' })
      } finally {
        setLoading(false)
      }
    }
    loadShift()
  }, [shiftId])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const token = getToken()
    if (!token) return logout()

    setSubmitting(true)
    try {
      const payload = {
        id: shiftId,
        shiftName: form.shiftname,
        displayName: form.displayName,
        startTime: normalizeTimeValue(form.starttime),
        endTime: normalizeTimeValue(form.endtime),
        isActive: form.isActive
      }

      await axios.put(`${API_BASE_URL}/shift-master/${shiftId}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      navigate('/masters/shifts', { state: { successMessage: 'Shift updated successfully' } })
    } catch (err) {
      setToast({ message: 'Failed to update shift', variant: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      <Toast message={toast.message} variant={toast.variant as 'success' | 'error'} onClose={() => setToast({ message: '', variant: '' })} />

      <div className="rounded-3xl bg-gradient-to-br from-white/95 via-white/90 to-slate-50/90 p-6 shadow-lg ring-1 ring-slate-200/80 dark:from-slate-900/85 dark:via-slate-900/80 dark:to-slate-900/75 dark:ring-slate-800">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Shift Master</p>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Edit Shift</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">Update shift timings and activation.</p>
          </div>
          <button type="button" onClick={() => navigate('/masters/shifts')} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-amber-400 dark:text-slate-950">Back to Shifts</button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="overflow-hidden rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-slate-200/80 backdrop-blur dark:bg-slate-900/85 dark:ring-slate-800">
        {loading ? <div className="text-center py-6">Loading...</div> : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* <FieldWrapper label="Shift Number" error={errors.shiftNo}>
              <input type="number" name="shiftNo" value={form.shiftNo} onChange={e => setForm({...form, shiftNo: Number(e.target.value)})} className="w-full rounded-2xl border px-4 py-2 text-sm font-semibold" />
            </FieldWrapper> */}
            <FieldWrapper label="Shift Name" error={errors.shiftname}>
              <input type="text" name="shiftname" value={form.shiftname} onChange={e => setForm({...form, shiftname: e.target.value})} className="w-full rounded-2xl border px-4 py-2 text-sm font-semibold" />
            </FieldWrapper>
            <FieldWrapper label="Display Name" error={errors.displayName}>
               <input type="text" name="displayName" value={form.displayName} onChange={e => setForm({...form, displayName: e.target.value})} className="w-full rounded-2xl border px-4 py-2 text-sm font-semibold" />
            </FieldWrapper>
            <FieldWrapper label="Start Time" error={errors.starttime}>
               <input type="time" name="starttime" value={form.starttime} onChange={e => setForm({...form, starttime: e.target.value})} className="w-full rounded-2xl border px-4 py-2 text-sm font-semibold" />
            </FieldWrapper>
            <FieldWrapper label="End Time" error={errors.endtime}>
               <input type="time" name="endtime" value={form.endtime} onChange={e => setForm({...form, endtime: e.target.value})} className="w-full rounded-2xl border px-4 py-2 text-sm font-semibold" />
            </FieldWrapper>
            {/* <FieldWrapper label="Active">
              <input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} className="h-5 w-5 rounded" />
            </FieldWrapper> */}
          </div>
        )}
        <div className="mt-8 flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/masters/shifts')} className="rounded-2xl border px-4 py-2 text-sm font-semibold">Cancel</button>
          <button type="submit" disabled={submitting} className="rounded-2xl bg-gradient-to-r from-[#184b6d] to-sky-500 px-5 py-2 text-sm font-semibold text-white">Update</button>
        </div>
      </form>
    </div>
  )
}