import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../../config/apiConfig'


interface User {
  id: number
  username: string
  password: string
  displayname: string
  roleid: number
  isactive: boolean
}

interface UserListResponse {
  success: boolean
  message: string
  data: User[]
  errors: unknown[]
}


const API_URL = `${API_BASE_URL}/User`


const filterUsers = (
  users: User[],
  searchTerm: string,
  filterActive: boolean,
  filterInactive: boolean,
): User[] => {
  const normalizedTerm = searchTerm.trim().toLowerCase()

  return users.filter((user) => {
    const matchesSearch = normalizedTerm
      ? user.username.toLowerCase().includes(normalizedTerm) ||
        user.displayname.toLowerCase().includes(normalizedTerm) ||
        user.roleid.toString().toLowerCase().includes(normalizedTerm)
      : true

    const matchesActiveFilter =
      filterActive && !filterInactive
        ? user.isactive
        : filterInactive && !filterActive
          ? !user.isactive
          : true

    return matchesSearch && matchesActiveFilter
  })
}

const StatusBadge = ({ isActive }: { isActive: boolean }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
      isActive
        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
        : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
    }`}
  >
    <span className={`h-2 w-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
    {isActive ? 'Active' : 'Inactive'}
  </span>
)

const FilterPill = ({
  label,
  active,
  tone,
  onClick,
}: {
  label: string
  active: boolean
  tone: 'green' | 'red'
  onClick: () => void
}) => {
  const activeStyles =
    tone === 'green'
      ? 'bg-emerald-600 text-white ring-emerald-600'
      : 'bg-rose-600 text-white ring-rose-600'
  const inactiveStyles =
    tone === 'green'
      ? 'text-emerald-700 ring-emerald-200 hover:bg-emerald-50'
      : 'text-rose-700 ring-rose-200 hover:bg-rose-50'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ring-1 transition ${
        active ? activeStyles : inactiveStyles
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${tone === 'green' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
      {label}
    </button>
  )
}

const EmptyState = () => (
  <div className="py-12 text-center text-sm text-slate-500">No users found.</div>
)

const LoadingState = () => (
  <div className="py-12 text-center text-sm text-slate-500">Loading users…</div>
)

export default function UserMasterWidget() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterActive, setFilterActive] = useState(false)
  const [filterInactive, setFilterInactive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')

    if (!token) {
      navigate('/login', { replace: true })
      return
    }

    const fetchUsers = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await axios.get<UserListResponse>(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = Array.isArray(response.data?.data) ? response.data.data : []
        setUsers(data)
        setFilteredUsers(data)
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const message = err.response?.data?.message || err.message || 'Failed to load users.'
          setError(message)
        } else {
          setError('Failed to load users.')
        }
      } finally {
        setLoading(false)
      }
    }

    void fetchUsers()
  }, [navigate])

  useEffect(() => {
    const handler = setTimeout(() => {
      setFilteredUsers(filterUsers(users, searchTerm, filterActive, filterInactive))
    }, 300)

    return () => clearTimeout(handler)
  }, [filterActive, filterInactive, searchTerm, users])

  const totalUsers = useMemo(() => filteredUsers.length, [filteredUsers])

  const handleToggleActive = () => setFilterActive((prev) => !prev)
  const handleToggleInactive = () => setFilterInactive((prev) => !prev)

  const handleDeleteUser = async (user: User) => {
    const confirmed = window.confirm(`Are you sure you want to delete user "${user.username}"?`)
    if (!confirmed) return

    setDeletingUserId(user.id)

    try {
      // const token = localStorage.getItem('accessToken')
      // if (!token) {
      //   navigate('/login', { replace: true })
      //   return
      // }
      // await axios.delete(`${API_URL}?id=${user.id}`, {
      //   headers: { Authorization: `Bearer ${token}` },
      // })
      // setUsers((prev) => prev.filter((item) => item.id !== user.id))
      // setFilteredUsers((prev) => prev.filter((item) => item.id !== user.id))
    } catch (_error) {
      // setError('Failed to delete user. Please try again.')
      // Optionally handle error state here
    } finally {
      setDeletingUserId(null)
    }
  }

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-lg backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Administration</p>
            <h1 className="text-2xl font-semibold">User Master</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Maintain user accounts, roles, and access status.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700">
              {totalUsers} users
            </span>
            <button
              type="button"
              onClick={() => navigate('/users/create')}
              className="inline-flex items-center gap-2 rounded-full bg-[#1c75bc] px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-[#165f96] focus:outline-none focus:ring-2 focus:ring-[#1c75bc]/30"
            >
              + Add User
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search username, name, or role"
                className="w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-2 text-sm text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:border-[#1c75bc] focus:outline-none focus:ring-2 focus:ring-[#1c75bc]/20 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-100"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FilterPill label="Active" active={filterActive} tone="green" onClick={handleToggleActive} />
            <FilterPill label="Inactive" active={filterInactive} tone="red" onClick={handleToggleInactive} />
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 ring-1 ring-rose-200 dark:bg-rose-900/30 dark:text-rose-200 dark:ring-rose-800">
            {error}
          </div>
        ) : null}

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white/70 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-800">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:bg-slate-800/70 dark:text-slate-200">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Display Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white/70 text-slate-800 dark:divide-slate-800 dark:bg-slate-900/50 dark:text-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6}>
                    <LoadingState />
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState />
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 text-sm font-semibold">{user.id}</td>
                    <td className="px-4 py-3 text-sm font-semibold">{user.username}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-200">{user.displayname}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-200">{user.roleid}</td>
                    <td className="px-4 py-3">
                      <StatusBadge isActive={user.isactive} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/users/edit/${user.id}`)}
                          className="rounded-full px-3 py-1 text-sm font-semibold text-[#1c75bc] transition hover:bg-[#1c75bc]/10 focus:outline-none focus:ring-2 focus:ring-[#1c75bc]/30"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={deletingUserId === user.id}
                          onClick={() => handleDeleteUser(user)}
                          className="rounded-full px-3 py-1 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-200 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-rose-900/20"
                        >
                          {deletingUserId === user.id ? 'Deleting...' : 'Delete'}
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
    </div>
  )
}
