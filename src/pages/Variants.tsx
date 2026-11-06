import { useEffect, useState } from "react"
import { ClipboardList, CheckCircle2, AlertTriangle, Loader2, Plus, RefreshCw } from "lucide-react"
import PageHero from "../components/PageHero"
import VariantsTable, { Variant } from "../components/VariantsTable"
import { useNavigate } from "react-router-dom"
import { getVariants } from "../services/variantService"
export default function VariantsPage() {
  const navigate = useNavigate()

  const [variants, setVariants] = useState<Variant[]>([])
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [toastMessage, setToastMessage] = useState("")
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // Fetch variants from backend
  const fetchVariants = async () => {
    setLoading(true)
    setErrorMessage("")
    try {
      const data: Variant[] = await getVariants()
      setVariants(
        data.map((v: Variant) => ({
          ...v,
          description: v.description || "", // ensure string
        }))
      )
      if (data.length === 0) setToastMessage("No variants found.")
    } catch (error) {
      console.error(error)
      setErrorMessage("Failed to fetch variants. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVariants()
  }, [])

  // Handlers
  const handleRetry = () => fetchVariants()
const handleEditVariant = (variant: Variant) => navigate(`/masters/variants/${variant.id}/edit`)
 
  return (
    <div className="space-y-6">
      <PageHero
        title="Variants"
        eyebrow="Masters"
        description="Browse product variants, customer references, and IDs in a layout that matches the refreshed plant dashboard."
        icon={ClipboardList}
        pill={
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 className="h-4 w-4" />
            Live catalogue
          </div>
        }
      />

      {successMessage && (
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-800 ring-1 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-100 dark:ring-emerald-900">
          <CheckCircle2 className="h-5 w-5" />
          <span className="text-sm font-semibold">{successMessage}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900/70 dark:ring-slate-800">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
            Variant actions
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Create, reload, or browse the live catalogue.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/masters/variants/add")}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1c75bc] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#16629b] focus:outline-none focus:ring-2 focus:ring-[#9ec4e3] dark:bg-amber-400 dark:text-slate-950 dark:hover:bg-amber-300"
          >
            <Plus className="h-4 w-4" />
            Add Variant
          </button>

          {errorMessage && (
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-800 dark:hover:bg-slate-800"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-start gap-3 rounded-2xl bg-rose-50 px-4 py-3 text-rose-800 ring-1 ring-rose-100 dark:bg-rose-900/40 dark:text-rose-50 dark:ring-rose-800">
          <AlertTriangle className="mt-0.5 h-5 w-5" />
          <div className="flex-1">
            <p className="text-sm font-semibold">{errorMessage}</p>
            <button
              type="button"
              onClick={handleRetry}
              className="mt-2 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-rose-800 ring-1 ring-rose-100 transition hover:-translate-y-0.5 hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-300 dark:bg-rose-950/50 dark:text-rose-100 dark:ring-rose-700 dark:hover:bg-rose-900/60"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/60 px-6 py-12 text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200">
          <Loader2 className="mr-3 h-5 w-5 animate-spin" />
          Loading variants...
        </div>
      )}

      {!loading && variants.length > 0 && (
        <VariantsTable
          variants={variants}
          onEdit={handleEditVariant}
         
        
        />
      )}
    </div>
  )
}