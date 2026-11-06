import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, Edit3, Loader2, MapPin, Plus, RefreshCw, Search, Trash2, UserCheck, UserMinus, Users } from 'lucide-react'
import PageHero from '../components/PageHero'
import StatsCard from '../components/StatsCard'
import { deleteCustomer, getCustomers } from '../services/customerService'

function StatusBadge({ active }) {
  const tone = active
    ? 'bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-400/15 dark:text-emerald-100 dark:ring-emerald-400/30'
    : 'bg-rose-50 text-rose-700 ring-rose-100 dark:bg-rose-400/15 dark:text-rose-100 dark:ring-rose-400/30'

  const dot = active ? 'bg-emerald-500 dark:bg-emerald-300' : 'bg-rose-500 dark:bg-rose-300'

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 transition ${tone}`}
    >
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

function ErrorBanner({ message, onRetry }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl bg-rose-50 px-4 py-3 text-rose-800 ring-1 ring-rose-100 dark:bg-rose-950/40 dark:text-rose-100 dark:ring-rose-900">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <AlertTriangle className="h-4 w-4" />
        <span>{message}</span>
      </div>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-lg bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-900 transition hover:bg-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-500 dark:bg-rose-900/50 dark:text-rose-100 dark:hover:bg-rose-900/70"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      ) : null}
    </div>
  )
}

function ConfirmDeleteModal({ customer, onCancel, onConfirm, deleting, errorMessage }) {
  if (!customer) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-100">
            <Trash2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-300">Delete Customer</p>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{customer.customerName}</h2>
          </div>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300">
          Are you sure you want to delete this customer?
        </p>

        {errorMessage ? (
          <div className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 ring-1 ring-rose-100 dark:bg-rose-950/50 dark:text-rose-100 dark:ring-rose-900">
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
            disabled={deleting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-300 disabled:opacity-60 dark:bg-rose-500 dark:hover:bg-rose-400"
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            {deleting ? 'Deleting...' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

function computeCustomerStats(customers = []) {
  if (!Array.isArray(customers)) {
    return { total: 0, active: 0, inactive: 0, uniqueLocations: 0 }
  }

  let active = 0
  const locations = new Set()

  customers.forEach((customer) => {
    if (customer?.isactive) active += 1
    if (customer?.location) locations.add(customer.location)
  })

  const total = customers.length

  return {
    total,
    active,
    inactive: Math.max(total - active, 0),
    uniqueLocations: locations.size,
  }
}

function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadIndex, setReloadIndex] = useState(0)
  const navigate = useNavigate()
  const location = useLocation()
  const [flashMessage, setFlashMessage] = useState(location.state?.successMessage || '')
  const [customerToDelete, setCustomerToDelete] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (location.state?.successMessage) {
      setFlashMessage(location.state.successMessage)
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.pathname, location.state?.successMessage, navigate])

  const fetchCustomers = useCallback(
    async (signal) => {
      setLoading(true)
      setError('')

      try {
        const data = await getCustomers(signal)
        setCustomers(data)
      } catch (err) {
        if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return

        const status = err?.response?.status ?? err?.status
        if (status === 401 || status === 403) {
          navigate('/login', { replace: true })
          return
        }

        const isNetworkError = err?.code === 'ERR_NETWORK' || err?.message?.includes('Network Error')
        setError(
          isNetworkError
            ? 'Unable to reach the server. Please check your connection and try again.'
            : err?.message || 'Unable to load customers. Please try again later.',
        )
        console.error('Failed to fetch customers', err)
      } finally {
        setLoading(false)
      }
    },
    [navigate],
  )

  useEffect(() => {
    const controller = new AbortController()
    fetchCustomers(controller.signal)
    return () => controller.abort()
  }, [fetchCustomers, reloadIndex])

  const handleRetry = useCallback(() => setReloadIndex((prev) => prev + 1), [])

  const openDeleteModal = useCallback((customer) => {
    setCustomerToDelete(customer)
    setDeleteError('')
  }, [])

  const closeDeleteModal = useCallback(() => {
    if (deletingId) return
    setCustomerToDelete(null)
    setDeleteError('')
  }, [deletingId])

  const handleConfirmDelete = useCallback(async () => {
    if (!customerToDelete) return
    setDeletingId(customerToDelete.id)
    setDeleteError('')
    try {
      await deleteCustomer(customerToDelete.id)
      setCustomers((prev) => prev.filter((customer) => customer.id !== customerToDelete.id))
      setFlashMessage('Customer deleted successfully')
      setCustomerToDelete(null)
    } catch (err) {
      const status = err?.response?.status ?? err?.status
      if (status === 401 || status === 403) {
        navigate('/login', { replace: true })
        return
      }

      const isNetworkError = err?.code === 'ERR_NETWORK' || err?.message?.includes('Network Error')
      const apiMessage = err?.response?.data?.errors?.join(', ') || err?.response?.data?.message
      setDeleteError(
        apiMessage ||
          (isNetworkError
            ? 'Unable to reach the server. Please check your connection and try again.'
            : err?.message || 'Failed to delete customer. Please try again.'),
      )
      console.error('Failed to delete customer', err)
    } finally {
      setDeletingId(null)
    }
  }, [customerToDelete, navigate])

  const customerStats = useMemo(() => computeCustomerStats(customers), [customers])

  const displayedStats = useMemo(() => {
    if (loading) {
      return { total: '–', active: '–', inactive: '–', uniqueLocations: '–' }
    }

    if (error) {
      return { total: 'N/A', active: 'N/A', inactive: 'N/A', uniqueLocations: 'N/A' }
    }

    return customerStats
  }, [customerStats, error, loading])

  const statusFilteredCustomers = useMemo(() => {
    if (statusFilter === 'active') {
      return customers.filter((customer) => customer.isactive)
    }

    if (statusFilter === 'inactive') {
      return customers.filter((customer) => !customer.isactive)
    }

    return customers
  }, [customers, statusFilter])

  const filteredCustomers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    if (!query) return statusFilteredCustomers

    return statusFilteredCustomers.filter((customer) => {
      const searchable = [
        customer.customerName,
        customer.location,
        customer.vendorCode,
        customer.id?.toString(),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return searchable.includes(query)
    })
  }, [searchQuery, statusFilteredCustomers])

  const handleFilterChange = useCallback((filterValue) => setStatusFilter(filterValue), [])

  const content = useMemo(() => {
    if (loading) {
      return (
        <div className="flex items-center gap-3 rounded-2xl bg-white/80 px-5 py-6 text-slate-700 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900/70 dark:text-slate-200 dark:ring-slate-800">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm font-semibold">Loading customers...</span>
        </div>
      )
    }

    if (error) {
      return <ErrorBanner message={error} onRetry={handleRetry} />
    }

    if (!customers.length) {
      return (
        <div className="rounded-2xl bg-white/80 px-5 py-6 text-center text-slate-600 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900/70 dark:text-slate-200 dark:ring-slate-800">
          <p className="text-sm font-semibold">No customers found.</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Try refreshing or check back later.</p>
        </div>
      )
    }

    if (!filteredCustomers.length) {
      return (
        <div className="rounded-2xl bg-white/80 px-5 py-6 text-center text-slate-600 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900/70 dark:text-slate-200 dark:ring-slate-800">
          <p className="text-sm font-semibold">No customers match the current filters.</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Try adjusting your filters or search query.</p>
        </div>
      )
    }

    return (
      <div className="overflow-hidden rounded-3xl bg-white/90 shadow-lg ring-1 ring-slate-200/80 backdrop-blur-lg dark:bg-slate-900/80 dark:ring-slate-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
            <thead className="bg-slate-50/80 text-left uppercase tracking-wide text-xs font-semibold text-slate-500 dark:bg-slate-800/60 dark:text-slate-300">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Customer Name</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Vendor Code</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white/60 dark:divide-slate-800 dark:bg-slate-900/60">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50">
                  <td className="whitespace-nowrap px-6 py-4 font-semibold text-slate-800 dark:text-slate-100">{customer.id}</td>
                  <td className="px-6 py-4 text-slate-900 dark:text-slate-100">{customer.customerName}</td>
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-200">{customer.location}</td>
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-200">{customer.vendorCode}</td>
                  <td className="px-6 py-4">
                    <StatusBadge active={customer.isactive} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/masters/customers/${customer.id}/edit`)}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:ring-slate-600 dark:hover:bg-slate-700"
                      >
                        <Edit3 className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => openDeleteModal(customer)}
                        disabled={deletingId === customer.id}
                        className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-300 disabled:opacity-60 dark:border-rose-400/60 dark:bg-rose-500/20 dark:text-rose-50 dark:ring-rose-500/40 dark:hover:bg-rose-500/30"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }, [customers, deletingId, error, filteredCustomers, handleRetry, loading, navigate, openDeleteModal])

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      <PageHero
        title="Customers"
        eyebrow="Masters"
        description="View and manage customer records with refreshed plant-themed cards and search shortcuts."
        icon={Users}
        pill={
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 className="h-4 w-4" />
            Synced directory
          </div>
        }
      />

      {flashMessage ? (
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-800 ring-1 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-100 dark:ring-emerald-900">
          <CheckCircle2 className="h-5 w-5" />
          <span className="text-sm font-semibold">{flashMessage}</span>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900/70 dark:ring-slate-800">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Find a customer</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">Search by name, vendor code, or location.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full min-w-[220px] max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-9 py-2 text-sm font-semibold text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#1c75bc] focus:ring-2 focus:ring-[#1c75bc]/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-600 dark:focus:ring-[#1c75bc]"
              placeholder="Search customers..."
            />
          </div>
          <button
            type="button"
            onClick={() => navigate('/masters/customers/add')}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1c75bc] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#16629b] focus:outline-none focus:ring-2 focus:ring-[#9ec4e3] dark:bg-amber-400 dark:text-slate-950 dark:hover:bg-amber-300"
          >
            <Plus className="h-4 w-4" />
            Add Customer
          </button>
          <button
            type="button"
            onClick={handleRetry}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:bg-amber-400 dark:text-slate-950 dark:hover:bg-amber-300"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Customers"
          value={displayedStats.total}
          subtitle="All records"
          icon={Users}
          onClick={() => handleFilterChange('all')}
          isActive={statusFilter === 'all'}
        />
        <StatsCard
          title="Active Customers"
          value={displayedStats.active}
          subtitle="Currently active"
          icon={UserCheck}
          onClick={() => handleFilterChange('active')}
          isActive={statusFilter === 'active'}
        />
        <StatsCard
          title="Inactive Customers"
          value={displayedStats.inactive}
          subtitle="Inactive or archived"
          icon={UserMinus}
          onClick={() => handleFilterChange('inactive')}
          isActive={statusFilter === 'inactive'}
        />
        <StatsCard title="Unique Locations" value={displayedStats.uniqueLocations} subtitle="Across all customers" icon={MapPin} />
      </div>

      {content}

      <ConfirmDeleteModal
        customer={customerToDelete}
        onCancel={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        deleting={Boolean(deletingId)}
        errorMessage={deleteError}
      />
    </div>
  )
}

export default CustomersPage
