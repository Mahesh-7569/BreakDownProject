import { useMemo, useState } from 'react'
import { Loader2, Save, ShieldAlert, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { createCustomer } from '../services/customerService'

const initialFormState = {
  customerName: '',
  location: '',
  vendorCode: '',
  isactive: true,
}

function ValidationMessage({ message }) {
  if (!message) return null

  return <p className="mt-1 text-xs font-semibold text-rose-600 dark:text-rose-300">{message}</p>
}

function AddCustomerPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialFormState)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const validationErrors = useMemo(() => {
    const nextErrors = {}

    if (!form.customerName.trim()) {
      nextErrors.customerName = 'Customer name is required.'
    }

    if (!form.location.trim()) {
      nextErrors.location = 'Location is required.'
    }

    if (!form.vendorCode.trim()) {
      nextErrors.vendorCode = 'Vendor code is required.'
    }

    return nextErrors
  }, [form.customerName, form.location, form.vendorCode])

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitError('')

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors({})
    setSubmitting(true)

    try {
      await createCustomer(form)
      navigate('/masters/customers', {
        replace: true,
        state: { successMessage: 'Customer created successfully' },
      })
    } catch (error) {
      const status = error?.response?.status ?? error?.status
      if (status === 401 || status === 403) {
        navigate('/login', { replace: true })
        return
      }

      const isNetworkError = error?.code === 'ERR_NETWORK' || error?.message?.includes('Network Error')
      setSubmitError(
        isNetworkError
          ? 'Unable to reach the server. Please check your connection and try again.'
          : error?.message || 'Unable to save customer. Please try again later.',
      )
      console.error('Failed to create customer', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container py-6 text-slate-900 dark:text-slate-100">
      <div className="mb-6 rounded-3xl bg-gradient-to-br from-white/95 via-white/90 to-slate-50/90 p-6 shadow-lg ring-1 ring-slate-200/80 dark:from-slate-900/85 dark:via-slate-900/80 dark:to-slate-900/75 dark:ring-slate-800">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Masters</p>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Add Customer</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">Create a new customer record and manage vendor mappings.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/masters/customers')}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:bg-amber-400 dark:text-slate-950 dark:hover:bg-amber-300"
          >
            Back to Customers
          </button>
        </div>
      </div>

      {submitError ? (
        <div className="mb-4 flex items-center gap-3 rounded-2xl bg-rose-50 px-4 py-3 text-rose-800 ring-1 ring-rose-100 dark:bg-rose-950/40 dark:text-rose-100 dark:ring-rose-900">
          <ShieldAlert className="h-5 w-5" />
          <div>
            <p className="text-sm font-semibold">Unable to save customer</p>
            <p className="text-xs text-rose-700 dark:text-rose-200">{submitError}</p>
          </div>
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-slate-200/80 backdrop-blur dark:bg-slate-900/85 dark:ring-slate-800"
        noValidate
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="col-span-2 sm:col-span-1">
            <label htmlFor="customerName" className="block text-sm font-semibold text-slate-800 dark:text-slate-100">
              Customer Name<span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="customerName"
              name="customerName"
              value={form.customerName}
              onChange={handleInputChange}
              className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm font-medium text-slate-900 shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 ${
                errors.customerName ? 'border-rose-300 ring-1 ring-rose-200 focus:ring-rose-400' : 'border-slate-200'
              }`}
              placeholder="Enter customer name"
              required
            />
            <ValidationMessage message={errors.customerName} />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label htmlFor="location" className="block text-sm font-semibold text-slate-800 dark:text-slate-100">
              Location<span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={form.location}
              onChange={handleInputChange}
              className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm font-medium text-slate-900 shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 ${
                errors.location ? 'border-rose-300 ring-1 ring-rose-200 focus:ring-rose-400' : 'border-slate-200'
              }`}
              placeholder="Enter location"
              required
            />
            <ValidationMessage message={errors.location} />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label htmlFor="vendorCode" className="block text-sm font-semibold text-slate-800 dark:text-slate-100">
              Vendor Code<span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="vendorCode"
              name="vendorCode"
              value={form.vendorCode}
              onChange={handleInputChange}
              className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm font-medium text-slate-900 shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 ${
                errors.vendorCode ? 'border-rose-300 ring-1 ring-rose-200 focus:ring-rose-400' : 'border-slate-200'
              }`}
              placeholder="Enter vendor code"
              required
            />
            <ValidationMessage message={errors.vendorCode} />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 shadow-inner transition dark:border-slate-700 dark:bg-slate-900/80">
              <input
                type="checkbox"
                id="isactive"
                name="isactive"
                checked={form.isactive}
                onChange={handleInputChange}
                className="h-5 w-5 rounded border-slate-300 text-[#1c75bc] focus:ring-2 focus:ring-[#1c75bc] dark:border-slate-600 dark:bg-slate-900"
              />
              <div>
                <label htmlFor="isactive" className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Active
                </label>
                <p className="text-xs text-slate-600 dark:text-slate-300">Keep enabled to allow assignments for this customer.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/masters/customers')}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1c75bc] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#16629b] focus:outline-none focus:ring-2 focus:ring-[#9ec4e3] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-amber-400 dark:text-slate-950 dark:hover:bg-amber-300"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {submitting ? 'Saving...' : 'Save Customer'}
          </button>
        </div>
      </form>

      <div className="mt-6 flex items-center gap-3 rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-800 ring-1 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-100 dark:ring-emerald-900">
        <ShieldCheck className="h-5 w-5" />
        <div>
          <p className="text-sm font-semibold">Validation rules</p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-xs text-emerald-700 dark:text-emerald-200">
            <li>Customer name, location, and vendor code are required.</li>
            <li>Active status defaults to enabled for new customers.</li>
            <li>Authorization is required; unauthorized users will be redirected to login.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default AddCustomerPage
