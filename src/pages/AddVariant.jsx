import { useState,useEffect } from 'react'
import { Loader2, Save, ShieldAlert, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { addOrEditVariant } from "../services/variantService";
import { getVariants } from "../services/variantService";
const initialFormState = {
  description: '',
  variantcode: '',
  isactive: true,
}

function ValidationMessage({ message }) {
  if (!message) return null
  return <p className="mt-1 text-xs font-semibold text-rose-600 dark:text-rose-300">{message}</p>
}

export default function AddVariantPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialFormState)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
const [variants, setVariants] = useState([]);
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

  // validation...
 if (!form.description.trim() || !form.variantcode.trim()) {
  setErrors({
    description: !form.description.trim() ? 'Description is required' : '',
    variantcode: !form.variantcode.trim() ? 'Variant code is required' : '',
  })
  return
}
  setSubmitting(true)

  try {
    const payload = {
      id: 0,
      description: form.description.trim(),
      variantcode: form.variantcode.trim(),
      isactive: Boolean(form.isactive),
    }

    const response = await addOrEditVariant(payload)

    const newVariant = {
      id: response.data?.id ?? 0, // assume backend returns new id
      description: payload.description,
      variantcode: payload.variantcode,
      isactive: payload.isactive,
    }

    // Send new variant back instead of just successMessage
    navigate('/masters/variants', {
      replace: true,
      state: { updatedVariant: newVariant },
    })
  } catch (error) {
    setSubmitError(error?.message || 'Unable to save variant.')
  } finally {
    setSubmitting(false)
  }
}
useEffect(() => {
  const controller = new AbortController();

  getVariants(controller.signal)
    .then((data) => setVariants(data))
    .catch((err) => {
      if (err?.name === "CanceledError") return; // optional extra safety
      console.error(err);
    });

  return () => controller.abort(); // cancel request on unmount
}, []);
  return (
    <div className="container py-6 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="mb-6 rounded-3xl bg-gradient-to-br from-white/95 via-white/90 to-slate-50/90 p-6 shadow-lg ring-1 ring-slate-200/80 dark:from-slate-900/85 dark:via-slate-900/80 dark:to-slate-900/75 dark:ring-slate-800">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Masters</p>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Add Variant</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Create a new product variant and map it to the appropriate customer.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/masters/variants')}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:bg-amber-400 dark:text-slate-950 dark:hover:bg-amber-300"
          >
            Back to Variants
          </button>
        </div>
      </div>

      {/* Submit Error */}
      {submitError && (
        <div className="mb-4 flex items-center gap-3 rounded-2xl bg-rose-50 px-4 py-3 text-rose-800 ring-1 ring-rose-100 dark:bg-rose-950/40 dark:text-rose-100 dark:ring-rose-900">
          <ShieldAlert className="h-5 w-5" />
          <div>
            <p className="text-sm font-semibold">Unable to save variant</p>
            <p className="text-xs text-rose-700 dark:text-rose-200">{submitError}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-slate-200/80 backdrop-blur dark:bg-slate-900/85 dark:ring-slate-800"
        noValidate
      >
        <div className="grid grid-cols-3 gap-6 items-end">
          {/* Variant Name */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-slate-800 dark:text-slate-100">
              Variant Name<span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="description"
              name="description"
              value={form.description}
              onChange={handleInputChange}
              className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm font-medium text-slate-900 shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 ${
                errors.description ? 'border-rose-300 ring-1 ring-rose-200 focus:ring-rose-400' : 'border-slate-200'
              }`}
              placeholder="Enter description"
              required
            />
            <ValidationMessage message={errors.description} />
          </div>

          {/* Variant Code */}
          <div>
            <label htmlFor="variantcode" className="block text-sm font-semibold text-slate-800 dark:text-slate-100">
              Variant Code<span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="variantcode"
              name="variantcode"
              value={form.variantcode}
              onChange={handleInputChange}
              className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm font-medium text-slate-900 shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 ${
                errors.variantcode ? 'border-rose-300 ring-1 ring-rose-200 focus:ring-rose-400' : 'border-slate-200'
              }`}
              placeholder="Enter variant code"
              required
            />
            <ValidationMessage message={errors.variantcode} />
          </div>

          {/* Status */}
          <div>
            <div className="flex items-center gap-3 mt-2 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-[10px] shadow-inner transition dark:border-slate-700 dark:bg-slate-900/80">
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
                <p className="text-xs text-slate-600 dark:text-slate-300">Keep enabled to allow planning for this variant.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/masters/variants')}
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
            {submitting ? 'Saving...' : 'Save Variant'}
          </button>
        </div>
      </form>

     </div>
  )
}