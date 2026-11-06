import { CheckCircle2, CircleDashed, Pencil, Trash2 } from 'lucide-react'

export type Variant = {
  id: number
  description: string
  variantcode: string
  isactive: boolean
}

type VariantsTableProps = {
  variants: Variant[]
  onEdit?: (variant: Variant) => void
  onDelete?: (variant: Variant) => void
  deletingId?: number | null
}

function StatusBadge({ active }: { active: boolean }) {
  const tone = active
    ? 'bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-400/15 dark:text-emerald-100 dark:ring-emerald-400/30'
    : 'bg-rose-50 text-rose-700 ring-rose-100 dark:bg-rose-400/15 dark:text-rose-100 dark:ring-rose-400/30'

  const dot = active ? 'bg-emerald-500 dark:bg-emerald-300' : 'bg-rose-500 dark:bg-rose-300'
  const Icon = active ? CheckCircle2 : CircleDashed

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 transition ${tone}`}
      title={active ? 'Active' : 'Inactive'}
    >
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      <Icon className="h-4 w-4" />
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

export default function VariantsTable({
  variants = [],
  onEdit,
  onDelete,
  deletingId = null,
}: VariantsTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-sm ring-1 ring-slate-200/70 dark:border-slate-800 dark:bg-slate-950/70 dark:ring-slate-800/80">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-800 dark:divide-slate-800 dark:text-slate-100">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600 dark:bg-slate-900/80 dark:text-slate-200">
            <tr>
              <th className="px-4 py-3 font-semibold">ID</th>
              <th className="px-4 py-3 font-semibold">Variant Name</th>
              <th className="px-4 py-3 font-semibold">Variant Code</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white/90 text-slate-800 dark:divide-slate-800 dark:bg-slate-900/70 dark:text-slate-100">
            {variants.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500 dark:text-slate-400">
                  No variants to display
                </td>
              </tr>
            ) : (
              variants.map((variant) => (
                <tr
                  key={variant.id}
                  className="bg-white/95 transition hover:bg-slate-50/80 dark:bg-slate-900/75 dark:hover:bg-slate-800/70"
                >
                  <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-100">{variant.id}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{variant.description}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-100">{variant.variantcode}</td>
                  <td className="px-4 py-3">
                    <StatusBadge active={variant.isactive} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit?.(variant)}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-100 transition hover:-translate-y-0.5 hover:bg-blue-100 dark:bg-blue-500/20 dark:text-blue-50 dark:ring-blue-400/40 dark:hover:bg-blue-500/30"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </button>
                     
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}