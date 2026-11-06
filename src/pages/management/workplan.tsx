import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  CheckCircle2,
  RefreshCw,
  ClipboardCheck,
  Plus,
  Pencil,
} from 'lucide-react'

import PageHero from '../../components/PageHero'
import {
  getLines,
  getVariants,
  getWorkPlans,
  getShifts,
} from '../../services/workplanService'
import { getToken } from '../../services/authService'

/* ===================== INTERFACES ===================== */

interface Line {
  id: number
  description: string
}

interface Shift {
  id: number
  shiftname: string
}

interface Variant {
  id: number
  variantcode: string
}

interface FullWorkplan {
  id: number
  planDate: string
  startTime: string
  line: string
  shift: string
  variant: string
  status: string
  insertById: string
  logDateTime: string
  workOrderNo: string
  quantity: number
}

/* ===================== COMPONENT ===================== */

export default function WorkplanPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const today = new Date().toISOString().split('T')[0]

  const [date, setDate] = useState(today)
  const [line, setLine] = useState('')
  const [variant, setVariant] = useState('')
  const [status, setStatus] = useState('')

  const [lines, setLines] = useState<Line[]>([])
  const [variants, setVariants] = useState<Variant[]>([])
  const [shifts, setShifts] = useState<Shift[]>([])

  const [fullWorkplans, setFullWorkplans] = useState<FullWorkplan[]>([])
  const [loading, setLoading] = useState(false)
  const [showTable, setShowTable] = useState(false)

  /* -------- FLOATING LABEL STATES -------- */
  const [dateFocus, setDateFocus] = useState(false)
  const [lineFocus, setLineFocus] = useState(false)
  const [variantFocus, setVariantFocus] = useState(false)
  const [statusFocus, setStatusFocus] = useState(false)

  const formatDate = (dateString: string) => {
    const [y, m, d] = dateString.split('-')
    return `${d}-${m}-${y}`
  }

  /* ---------------- INITIAL LOAD ---------------- */
  useEffect(() => {
    if (!getToken()) {
      navigate('/login')
      return
    }
    fetchAllWorkplans()
  }, [])

  /* -------- REFRESH AFTER ADD / EDIT -------- */
  useEffect(() => {
    if (location.state?.refresh) {
      fetchAllWorkplans()
    }
  }, [location.state])

  /* ---------------- FETCH ALL ---------------- */
  const fetchAllWorkplans = async () => {
    setLoading(true)
    try {
      const [linesRes, variantsRes, shiftsRes, wpRes] = await Promise.all([
        getLines(),
        getVariants(),
        getShifts(),
        getWorkPlans({ date: today }),
      ])

      const linesData: Line[] = linesRes.data.data
      const variantsData: Variant[] = variantsRes.data.data
      const shiftsData: Shift[] = shiftsRes.data.data

      setLines(linesData)
      setVariants(variantsData)
      setShifts(shiftsData)

      const data: FullWorkplan[] = wpRes.data.data.map((wp: any) => ({
        id: wp.id,
        planDate: wp.planDate,
        startTime: wp.startTime ?? '-', // ✅ Add Start Time
        line:
          linesData.find(l => l.id === wp.lineId)?.description ??
          String(wp.lineId),
        shift:
          shiftsData.find(s => s.id === wp.shiftId)?.shiftname ??
          String(wp.shiftId),
        variant:
          variantsData.find(v => v.id === wp.variantId)?.variantcode ??
          String(wp.variantId),
        status:
          wp.status === 1 ? 'New' :
          wp.status === 2 ? 'Executing' :
          wp.status === 3 ? 'Hold' :
          wp.status === 4 ? 'Cancel' :
          wp.status === 5 ? 'Completed' : 'Unknown',
        insertById: wp.insertById,
        logDateTime: wp.logDateTime,
        workOrderNo: wp.workOrderNo,
        quantity: wp.quantity,
      }))

      setFullWorkplans(data)
      setShowTable(true)
    } catch (err) {
      console.error('Fetch failed:', err)
    }
    setLoading(false)
  }

  /* ---------------- SEARCH ---------------- */
  const handleSearch = async () => {
    setLoading(true)
    try {
      const res = await getWorkPlans({
        date: date || undefined,
        lineId:
          line && line !== 'ALL'
            ? lines.find(l => l.description === line)?.id
            : undefined,
        variantId:
          variant && variant !== 'ALL'
            ? variants.find(v => v.variantcode === variant)?.id
            : undefined,
        status:
          status && status !== '0'
            ? Number(status)
            : undefined,
      })

      const data: FullWorkplan[] = res.data.data.map((wp: any) => ({
        id: wp.id,
        planDate: wp.planDate,
        startTime: wp.startTime ?? '-', // ✅ Add Start Time
        line:
          lines.find(l => l.id === wp.lineId)?.description ??
          String(wp.lineId),
        shift:
          shifts.find(s => s.id === wp.shiftId)?.shiftname ??
          String(wp.shiftId),
        variant:
          variants.find(v => v.id === wp.variantId)?.variantcode ??
          String(wp.variantId),
        status:
          wp.status === 1 ? 'New' :
          wp.status === 2 ? 'Executing' :
          wp.status === 3 ? 'Hold' :
          wp.status === 4 ? 'Cancel' :
          wp.status === 5 ? 'Completed' : 'Unknown',
        insertById: wp.insertById,
        logDateTime: wp.logDateTime,
        workOrderNo: wp.workOrderNo,
        quantity: wp.quantity,
      }))

      setFullWorkplans(data)
      setShowTable(true)
    } catch (err) {
      console.error('Search error:', err)
    }
    setLoading(false)
  }

  /* ===================== UI ===================== */

  return (
    <div className="space-y-6">
      <PageHero
        title="Workplan"
        eyebrow="Management"
        description="View and manage live workplans for production lines."
        icon={ClipboardCheck}
        pill={
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 className="h-4 w-4" />
            Live plan
          </div>
        }
      />

      {/* ACTION BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900/70 dark:ring-slate-800">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-300">
            Workplan Actions
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Create, reload, or browse live workplans.
          </p>
        </div>

        <button
          onClick={() => navigate('/management/workplan/add')}
          className="inline-flex items-center gap-2 rounded-xl bg-[#1c75bc] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#155e96]"
        >
          <Plus className="h-4 w-4" /> Add Workplan
        </button>
      </div>

      {/* SEARCH FILTERS */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-white/80 dark:bg-slate-900 p-4 shadow-sm ring-1 ring-slate-200">

        {/* Date */}
        <div className="relative w-40">
          {(dateFocus || date) && (
            <label className="absolute -top-5 left-1 text-sm font-medium text-slate-600 dark:text-slate-300">
              Date
            </label>
          )}
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            onFocus={() => setDateFocus(true)}
            onBlur={() => setDateFocus(false)}
            className="mt-1 w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none transition-colors "
          />
        </div>

        {/* Line */}
        <div className="relative w-40 ">
          {(lineFocus || line) && (
            <label className="absolute -top-5 left-1 text-sm font-medium text-slate-600 dark:text-slate-300">
              Line
            </label>
          )}
          <select
            value={line}
            onChange={e => setLine(e.target.value)}
            onFocus={() => setLineFocus(true)}
            onBlur={() => setLineFocus(false)}
            className="mt-1 w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
          >
            <option value="">Select Line</option>
            <option value="ALL">All</option>
            {lines.map(l => (
              <option key={l.id} value={l.description}>
                {l.description}
              </option>
            ))}
          </select>
        </div>

        {/* Variant */}
        <div className="relative w-40">
          {(variantFocus || variant) && (
            <label className="absolute -top-5 left-1 text-sm font-medium text-slate-600 dark:text-slate-300">
              Variant
            </label>
          )}
          <select
            value={variant}
            onChange={e => setVariant(e.target.value)}
            onFocus={() => setVariantFocus(true)}
            onBlur={() => setVariantFocus(false)}
            className="mt-1 w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
          >
            <option value="">Select Variant</option>
            <option value="ALL">All</option>
            {variants.map(v => (
              <option key={v.id} value={v.variantcode}>
                {v.variantcode}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className="relative w-40">
          {(statusFocus || status) && (
            <label className="absolute -top-5 left-1 text-sm font-medium text-slate-600 dark:text-slate-300">
              Status
            </label>
          )}
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            onFocus={() => setStatusFocus(true)}
            onBlur={() => setStatusFocus(false)}
            className="mt-1 w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
          >
            <option value="">Select Status</option>
            <option value="0">All</option>
            <option value="1">New</option>
            <option value="2">Executing</option>
            <option value="3">Hold</option>
            <option value="4">Cancel</option>
            <option value="5">Completed</option>
          </select>
        </div>

        <button
          onClick={handleSearch}
          className="inline-flex items-center gap-2 rounded-xl bg-[#1c75bc] px-4 py-2 text-xs font-semibold text-white"
        >
          <RefreshCw className="h-4 w-4" /> Search
        </button>
      </div>

      {/* TABLE */}
      {showTable && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-sm ring-1 ring-slate-200/70 dark:border-slate-800 dark:bg-slate-950/70 dark:ring-slate-800/80">
          <div className="overflow-x-auto bg-white/80 dark:bg-slate-950/40">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-800 dark:divide-slate-800 dark:text-slate-100">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600 dark:bg-slate-900/80 dark:text-slate-200">
                <tr>
                  <th className="px-4 py-3 font-semibold">Start Time</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Work Order</th>

                  <th className="px-4 py-3 font-semibold">Line</th>
                  <th className="px-4 py-3 font-semibold">Shift</th>
                  <th className="px-4 py-3 font-semibold">Variant</th>
                  <th className="px-4 py-3 font-semibold">Quantity</th>

                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Log Time</th>
                  <th className="px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white/90 text-slate-800 dark:divide-slate-800 dark:bg-slate-900/70 dark:text-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="py-6 text-center">Loading...</td>
                  </tr>
                ) : fullWorkplans.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-6 text-center">No workplans found</td>
                  </tr>
                ) : (
                  fullWorkplans.map(wp => (
                    <tr
                      key={wp.id}
                      className="bg-white/95 transition hover:bg-slate-50/80 dark:bg-slate-900/75 dark:hover:bg-slate-800/70"
                    >

                      <td className="px-4 py-2">{wp.startTime}</td>
                      <td className="px-4 py-2">{formatDate(wp.planDate)}</td>
                      <td className="px-4 py-2">{wp.workOrderNo}</td>

                      
                      <td className="px-4 py-2">{wp.line}</td>
                      <td className="px-4 py-2">{wp.shift}</td>
                      <td className="px-4 py-2">{wp.variant}</td>
                      <td className="px-4 py-2">{wp.quantity}</td>

                      <td className="px-4 py-2">{wp.status}</td>
                      <td className="px-4 py-2">{wp.logDateTime}</td>
                      <td className="px-4 py-2">
                        
                        <button
                          onClick={() =>
                            navigate(`/management/workplan/edit/${wp.id}`, {
                              state: { workplan: wp },
                            })
                          }
                          className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-100 transition hover:-translate-y-0.5 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:bg-blue-500/20 dark:text-blue-50 dark:ring-blue-400/40 dark:hover:bg-blue-500/30"
                        >
                          <Pencil className="h-4 w-4" /> Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
