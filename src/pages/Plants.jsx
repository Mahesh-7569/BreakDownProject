import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Leaf,
  Loader2,
  Pencil,
  PlusCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  Sprout,
  Trash2,
} from 'lucide-react'
import { createPlant, deletePlant, getPlantById, getPlants, updatePlant } from '../services/plantService'

const gradientHeader =
  'bg-gradient-to-r from-[#1c75bc] via-[#1c75bc] to-[#1c75bc]/85 dark:from-amber-500/90 dark:via-amber-500/70 dark:to-amber-400/80'

function HeroCard() {
  return (
    <div
      className={`${gradientHeader} relative overflow-hidden rounded-3xl px-6 py-8 text-white shadow-lg ring-1 ring-[#1c75bc]/30 dark:ring-amber-200/30`}
    >
      <div className="absolute inset-0 opacity-20 mix-blend-screen">
        <div className="absolute -left-10 -top-24 h-52 w-52 rounded-full bg-white blur-3xl" />
        <div className="absolute bottom-0 right-0 h-60 w-60 rounded-full bg-[#1c75bc]/40 blur-3xl" />
      </div>
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-white/80">Network</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">Plant Directory</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/85 sm:text-base">
            Explore all manufacturing plants in one place with quick search, clean design, and responsive cards that adapt to any
            screen size.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-white/15 px-4 py-3 text-white shadow-inner ring-1 ring-white/20">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <Leaf className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-wide text-white/75">Updated</p>
            <p className="text-lg font-semibold">Live API</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon }) {
  const IconComponent = icon
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-lg dark:bg-slate-900/70 dark:ring-slate-800">
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-[#1c75bc] via-[#1c75bc]/80 to-[#1c75bc]/60 opacity-70 transition group-hover:opacity-100 dark:from-amber-400 dark:via-amber-300/80 dark:to-amber-400/70" />
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1c75bc]/10 text-[#1c75bc] ring-1 ring-[#1c75bc]/25 transition group-hover:bg-[#1c75bc]/15 dark:bg-amber-400/15 dark:text-amber-200 dark:ring-amber-200/35">
          <IconComponent className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  )
}

function PlantCard({ plant, onDelete, onEdit, deleting }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-lg dark:bg-slate-900/70 dark:ring-slate-800">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1c75bc]/10 text-[#1c75bc] ring-1 ring-[#1c75bc]/20 dark:bg-amber-400/15 dark:text-amber-200 dark:ring-amber-200/35">
            <Building2 className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Plant</p>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{plant.name}</h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#1c75bc]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#1c75bc] ring-1 ring-[#1c75bc]/20 dark:bg-amber-400/15 dark:text-amber-100 dark:ring-amber-200/35">
            <ShieldCheck className="h-4 w-4" />
            Verified
          </span>
          {onEdit ? (
            <button
              type="button"
              onClick={() => onEdit(plant)}
              className="inline-flex items-center gap-1 rounded-lg bg-[#1c75bc]/15 px-2.5 py-1 text-xs font-semibold text-[#0f4f7c] ring-1 ring-[#1c75bc]/30 transition hover:-translate-y-0.5 hover:bg-[#1c75bc]/25 focus:outline-none focus:ring-2 focus:ring-[#1c75bc]/40 dark:bg-[#1c75bc]/30 dark:text-white dark:ring-[#1c75bc]/55 dark:hover:bg-[#1c75bc]/40"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </button>
          ) : null}
          {onDelete ? (
            <button
              type="button"
              onClick={() => onDelete(plant)}
              disabled={deleting}
              className="inline-flex items-center gap-1 rounded-lg bg-rose-500/12 px-2.5 py-1 text-xs font-semibold text-rose-700 ring-1 ring-rose-200/70 transition hover:-translate-y-0.5 hover:bg-rose-500/18 focus:outline-none focus:ring-2 focus:ring-rose-300/80 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-rose-500/25 dark:text-rose-50 dark:ring-rose-400/70 dark:hover:bg-rose-500/35"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          ) : null}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <span className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700">
          <Sprout className="h-4 w-4 text-[#1c75bc] dark:text-amber-300" />
          <span className="uppercase tracking-wide">Code: {plant.code}</span>
        </span>
        <span className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800/60 dark:text-slate-200 dark:ring-slate-700">
          <Leaf className="h-4 w-4 text-[#1c75bc] dark:text-amber-300" />
          ID: {plant.id}
        </span>
      </div>
    </div>
  )
}

function EmptyState({ onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-3xl bg-white/80 p-10 text-center text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900/70 dark:text-slate-200 dark:ring-slate-800">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1c75bc]/10 text-[#1c75bc] ring-1 ring-[#1c75bc]/20 dark:bg-amber-400/15 dark:text-amber-200 dark:ring-amber-200/35">
        <Sprout className="h-8 w-8" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No plants found</h3>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Try refreshing or adjusting your search.</p>
      </div>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-lg bg-[#1c75bc] px-4 py-2 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5 hover:bg-[#175f96] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1c75bc] dark:bg-amber-400 dark:text-slate-900 dark:hover:bg-amber-300"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      ) : null}
    </div>
  )
}

function PlantsPage() {
  const [plants, setPlants] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [reloadIndex, setReloadIndex] = useState(0)
  const [formValues, setFormValues] = useState({ name: '', code: '' })
  const [formMessage, setFormMessage] = useState({ type: '', text: '' })
  const [creating, setCreating] = useState(false)
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' })
  const [deletingId, setDeletingId] = useState(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [editingPlant, setEditingPlant] = useState(null)
  const navigate = useNavigate()

  const fetchPlants = useCallback(
    async (signal) => {
      setLoading(true)
      setError('')
      try {
        const data = await getPlants(signal)
        setPlants(data)
      } catch (err) {
        const status = err?.response?.status ?? err?.status
        if (status === 401 || status === 403) {
          navigate('/login', { replace: true })
          return
        }
        const isNetworkIssue = err?.message?.includes('Network') || err?.message?.includes('Failed to fetch')
        setError(
          isNetworkIssue
            ? 'Unable to reach the server. Please check your connection and try again.'
            : err?.message || 'Unable to load plants. Please try again later.',
        )
      } finally {
        setLoading(false)
      }
    },
    [navigate],
  )

  useEffect(() => {
    const controller = new AbortController()
    fetchPlants(controller.signal)
    return () => controller.abort()
  }, [fetchPlants, reloadIndex])

  const filteredPlants = useMemo(() => {
    if (!searchQuery) return plants
    const query = searchQuery.toLowerCase()
    return plants.filter((plant) => {
      const code = String(plant.code).toLowerCase()
      const id = String(plant.id).toLowerCase()
      return plant.name.toLowerCase().includes(query) || code.includes(query) || id.includes(query)
    })
  }, [plants, searchQuery])

  const stats = useMemo(() => {
    const total = plants.length
    const codes = new Set(plants.map((plant) => plant.code))
    return { total, uniqueCodes: codes.size }
  }, [plants])

  const handleRetry = useCallback(() => setReloadIndex((prev) => prev + 1), [])
  const handleFormChange = useCallback(
    (field) => (event) => {
      const value = field === 'code' ? event.target.value.toUpperCase() : event.target.value
      setFormValues((prev) => ({ ...prev, [field]: value }))
      if (formMessage.text) {
        setFormMessage({ type: '', text: '' })
      }
      if (actionMessage.text) {
        setActionMessage({ type: '', text: '' })
      }
    },
    [formMessage.text, actionMessage.text],
  )
  const handleSearchChange = useCallback(
    (event) => {
      setSearchQuery(event.target.value)
      if (actionMessage.text) {
        setActionMessage({ type: '', text: '' })
      }
    },
    [actionMessage.text],
  )

  const handleCreateOrUpdatePlant = async (event) => {
    event.preventDefault()
    const name = formValues.name.trim()
    const code = formValues.code.trim()

    if (!name || !code) {
      setFormMessage({ type: 'error', text: 'Plant name and code are required.' })
      return
    }

    setCreating(true)
    setFormMessage({ type: '', text: '' })
    try {
      const payload = { id: editingPlant?.id || 0, plantName: name, plantCode: code }
      const result = editingPlant ? await updatePlant(editingPlant.id, payload) : await createPlant(payload)
      const savedPlant = result?.plant

      if (savedPlant) {
        setPlants((prev) => {
          const withoutDuplicate = prev.filter((plant) => plant.id !== savedPlant.id)
          return [savedPlant, ...withoutDuplicate]
        })
      }

      setFormValues({ name: '', code: '' })
      setEditingPlant(null)
      setFormMessage({
        type: 'success',
        text: result?.message || (editingPlant ? 'Plant updated successfully.' : 'Plant created successfully.'),
      })
      setError('')
      setSearchQuery('')
      setActionMessage({ type: '', text: '' })
    } catch (err) {
      const status = err?.response?.status ?? err?.status
      if (status === 401 || status === 403) {
        navigate('/login', { replace: true })
        return
      }
      const isNetworkIssue = err?.message?.includes('Network') || err?.message?.includes('Failed to fetch')
      setFormMessage({
        type: 'error',
        text: isNetworkIssue
          ? 'Unable to reach the server. Please check your connection and try again.'
          : err?.message || 'Unable to create plant. Please try again later.',
      })
    } finally {
      setCreating(false)
    }
  }

  const handleDeletePlant = async (plant) => {
    if (!plant?.id) return
    const confirmDelete = window.confirm(`Delete plant "${plant.name}"?`)
    if (!confirmDelete) return

    setDeletingId(plant.id)
    setActionMessage({ type: '', text: '' })
    try {
      const message = await deletePlant(plant.id)
      setPlants((prev) => prev.filter((item) => item.id !== plant.id))
      setActionMessage({ type: 'success', text: message || 'Plant deleted successfully.' })
      setError('')
    } catch (err) {
      const status = err?.response?.status ?? err?.status
      if (status === 401 || status === 403) {
        navigate('/login', { replace: true })
        return
      }
      const isNetworkIssue = err?.message?.includes('Network') || err?.message?.includes('Failed to fetch')
      setActionMessage({
        type: 'error',
        text: isNetworkIssue
          ? 'Unable to reach the server. Please check your connection and try again.'
          : err?.message || 'Unable to delete plant. Please try again later.',
      })
    } finally {
      setDeletingId(null)
    }
  }

  const handleEditPlant = (plant) => {
    setEditingPlant(plant)
    setFormValues({ name: plant?.name || '', code: plant?.code || '' })
    setFormMessage({ type: '', text: '' })
    setActionMessage({ type: '', text: '' })
  }

  const handleCancelEdit = () => {
    setEditingPlant(null)
    setFormValues({ name: '', code: '' })
    setFormMessage({ type: '', text: '' })
  }

  const handleLookup = async (event) => {
    event.preventDefault()
    const query = searchQuery.trim()
    if (!query) return

    const isNumericId = /^[0-9]+$/.test(query)
    if (!isNumericId) {
      setActionMessage({ type: '', text: '' })
      return
    }

    setSearchLoading(true)
    setActionMessage({ type: '', text: '' })
    try {
      const plant = await getPlantById(query)
      setPlants((prev) => {
        const withoutDuplicate = prev.filter((item) => item.id !== plant.id)
        return [plant, ...withoutDuplicate]
      })
      setSearchQuery(String(plant.id))
      setActionMessage({ type: 'success', text: 'Plant loaded from API.' })
    } catch (err) {
      const status = err?.response?.status ?? err?.status
      if (status === 401 || status === 403) {
        navigate('/login', { replace: true })
        return
      }
      const isNetworkIssue = err?.message?.includes('Network') || err?.message?.includes('Failed to fetch')
      setActionMessage({
        type: 'error',
        text: isNetworkIssue
          ? 'Unable to reach the server. Please check your connection and try again.'
          : err?.message || 'Unable to find plant. Please try again later.',
      })
    } finally {
      setSearchLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <HeroCard />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Plants" value={stats.total} icon={Building2} />
        <StatCard label="Unique Codes" value={stats.uniqueCodes} icon={Sprout} />
        <StatCard label="Theme" value="#1c75bc" icon={Leaf} />
        <StatCard label="Status" value="Healthy" icon={ShieldCheck} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <form
          className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl bg-gradient-to-br from-[#1c75bc] via-[#1c75bc]/90 to-[#145a8f] p-5 text-white shadow-lg ring-1 ring-[#1c75bc]/40 dark:from-amber-500/90 dark:via-amber-500/80 dark:to-amber-400"
          onSubmit={handleCreateOrUpdatePlant}
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -left-10 -top-14 h-32 w-32 rounded-full bg-white blur-3xl" />
            <div className="absolute bottom-0 right-0 h-40 w-40 rounded-full bg-slate-900/20 blur-3xl" />
          </div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/20">
                <PlusCircle className="h-6 w-6" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/80">{editingPlant ? 'Update' : 'Create'}</p>
                <h2 className="text-lg font-semibold">{editingPlant ? 'Update plant' : 'Add a new plant'}</h2>
                <p className="text-sm text-white/80">
                  {editingPlant ? 'Modify an existing plant and push changes live.' : 'Save plant name and code directly to the network.'}
                </p>
              </div>
            </div>
            <div className="hidden rounded-xl bg-white/15 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white ring-1 ring-white/25 md:block">
              Live
            </div>
          </div>
          <div className="relative grid gap-3 rounded-xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur">
            <label className="flex flex-col gap-1 text-sm font-semibold text-white">
              <span className="text-xs uppercase tracking-wide text-white/80">Plant name</span>
              <input
                type="text"
                value={formValues.name}
                onChange={handleFormChange('name')}
                placeholder="e.g. CVG Chakan"
                className="w-full rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-white placeholder:text-white/70 focus:border-white focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/60"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-semibold text-white">
              <span className="text-xs uppercase tracking-wide text-white/80">Plant code</span>
              <input
                type="text"
                value={formValues.code}
                onChange={handleFormChange('code')}
                placeholder="e.g. VC023"
                className="w-full rounded-lg border border-white/30 bg-white/10 px-3 py-2 uppercase text-white placeholder:text-white/70 focus:border-white focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/60"
              />
            </label>
            {formMessage.text ? (
              <div
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${
                  formMessage.type === 'success' ? 'bg-emerald-500/15 text-emerald-100 ring-1 ring-emerald-200/40' : 'bg-rose-500/10 text-rose-50 ring-1 ring-rose-100/40'
                }`}
              >
                {formMessage.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <span>{formMessage.text}</span>
              </div>
            ) : null}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-wide text-white/75">Instantly appears in the plant directory</p>
              <button
                type="submit"
                disabled={creating}
                className="inline-flex items-center gap-2 rounded-lg bg-amber-100 px-4 py-2 text-sm font-semibold text-[#1c75bc] shadow transition hover:-translate-y-0.5 hover:bg-amber-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-200 disabled:cursor-not-allowed disabled:opacity-80 dark:bg-amber-400 dark:text-slate-900 dark:shadow-lg dark:ring-amber-200/60 dark:hover:bg-amber-300"
              >
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
                {creating ? 'Saving...' : editingPlant ? 'Update plant' : 'Create plant'}
              </button>
              {editingPlant ? (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/25 transition hover:-translate-y-0.5 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/60"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </div>
        </form>

        <div className="flex flex-col gap-3 rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900/70 dark:ring-slate-800 lg:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1c75bc]/10 text-[#1c75bc] ring-1 ring-[#1c75bc]/20 dark:bg-amber-400/15 dark:text-amber-200 dark:ring-amber-200/35">
                <Search className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Search</p>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Find a plant</h2>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleRetry}
                className="inline-flex items-center gap-2 rounded-lg bg-[#1c75bc]/12 px-3 py-2 text-sm font-semibold text-[#0f4f7c] ring-1 ring-[#1c75bc]/25 transition hover:-translate-y-0.5 hover:bg-[#1c75bc]/18 focus:outline-none focus:ring-2 focus:ring-[#1c75bc]/35 dark:bg-[#1c75bc]/22 dark:text-white dark:ring-[#1c75bc]/45 dark:hover:bg-[#1c75bc]/32"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>

          <form className="relative flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3" onSubmit={handleLookup}>
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="search"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search by plant name, code, or ID..."
                className="w-full rounded-xl border border-slate-200 bg-white px-10 py-3 text-sm text-slate-700 shadow-sm transition placeholder:text-slate-400 focus:border-[#1c75bc] focus:outline-none focus:ring-2 focus:ring-[#1c75bc]/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400"
              />
            </div>
            <button
              type="submit"
              disabled={searchLoading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1c75bc] px-4 py-2 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5 hover:bg-[#175f96] focus:outline-none focus:ring-2 focus:ring-[#1c75bc] disabled:cursor-not-allowed disabled:opacity-75 dark:bg-amber-400 dark:text-slate-900 dark:hover:bg-amber-300"
            >
              {searchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {searchLoading ? 'Searching...' : 'Search'}
            </button>
          </form>

          {actionMessage.text ? (
            <div
              className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-semibold ${
                actionMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-100 dark:ring-emerald-800'
                  : 'bg-rose-50 text-rose-700 ring-1 ring-rose-100 dark:bg-rose-950/50 dark:text-rose-100 dark:ring-rose-900'
              }`}
            >
              <div className="flex items-center gap-2">
                {actionMessage.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <span>{actionMessage.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setActionMessage({ type: '', text: '' })}
                className="text-xs font-semibold underline decoration-1 underline-offset-4"
              >
                Dismiss
              </button>
            </div>
          ) : null}

          {error ? (
            <div className="flex items-center justify-between gap-3 rounded-xl bg-rose-50 px-4 py-3 text-rose-700 ring-1 ring-rose-100 dark:bg-rose-950/50 dark:text-rose-100 dark:ring-rose-900">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={handleRetry}
                className="inline-flex items-center gap-2 rounded-lg bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-800 ring-1 ring-rose-200 transition hover:bg-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-500 dark:bg-rose-900/50 dark:text-rose-100"
              >
                Try again
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-3xl bg-white/80 p-10 ring-1 ring-slate-200 dark:bg-slate-900/70 dark:ring-slate-800">
          <div className="flex items-center gap-3 text-[#1c75bc] dark:text-amber-200">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-sm font-semibold">Loading plants...</span>
          </div>
        </div>
      ) : filteredPlants.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredPlants.map((plant) => (
            <PlantCard
              key={`${plant.id}-${plant.code}`}
              plant={plant}
              onDelete={handleDeletePlant}
              onEdit={handleEditPlant}
              deleting={deletingId === plant.id}
            />
          ))}
        </div>
      ) : (
        <EmptyState onRetry={handleRetry} />
      )}
    </div>
  )
}

export default PlantsPage
