import { useCallback, useEffect, useMemo, useState } from 'react'
import { BadgeCheck, CheckCircle2, PencilLine, Plus, Search, Trash2 } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getToken, logout } from '../../services/authService'
import { API_BASE_URL } from '../../config/apiConfig'

interface User {
  id: number
  username: string
  password: string
  displayname: string
  roleid: number
  isactive: boolean
  roleName?: string 
  cardId?: string  
}

const USERS_API_URL = `${API_BASE_URL}/user-master`

const statusTone = {
  Active: 'bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-400/15 dark:text-emerald-100 dark:ring-emerald-400/30',
  Inactive: 'bg-rose-50 text-rose-700 ring-rose-100 dark:bg-rose-400/15 dark:text-rose-100 dark:ring-rose-400/30',
}

const getFriendlyNetworkMessage = (message?: string, fallback?: string) => {
  if (message?.includes('Failed to fetch')) {
    return 'Unable to reach the server. Please check your connection and try again.'
  }
  return message || fallback || 'Unexpected error occurred. Please try again.'
}

const getAccessTokenOrRedirect = (navigate: ReturnType<typeof useNavigate>) => {
  const token = getToken()
  if (!token) {
    logout()
    navigate('/login', { replace: true })
  }
  return token
}

const fetchUsers = async (token: string): Promise<User[]> => {
  try {
    const response = await fetch(USERS_API_URL, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const body = await response.json();
    const list = Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : [];

    return list.map((u: any): User => ({
      id: u.id,
      username: u.userName || u.username || '',
      password: u.password || '',
      displayname: u.displayName || u.displayname || '',
      roleid: u.roleId || u.roleid || 0,
      isactive: u.isActive ?? u.isactive ?? false,
      roleName: u.roleName || '',
    }));
  } catch (err) {
    console.error("Fetch users failed:", err);
    return [];
  }
};

const deleteUser = async (userId: number, token: string) => {
  const response = await fetch(`${USERS_API_URL}/${userId}`, {
    method: 'DELETE',
    headers: {
      Accept: '*/*',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error('Failed to delete user');
  return true;
};

export default function UserList() {
  const navigate = useNavigate()
  const location = useLocation()
  const [menuPermissions, setMenuPermissions] = useState<any>(null)
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [actionError, setActionError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [confirmingDelete, setConfirmingDelete] = useState<User | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [roles, setRoles] = useState<{ id: number; description?: string; roleName?: string }[]>([])

  const isTruthy = (val: any) => {
    if (typeof val === 'boolean') return val;
    if (typeof val === 'number') return val === 1;
    if (typeof val === 'string') return val.toLowerCase() === 'true' || val === '1';
    return false;
  };

  const handleUnauthorized = useCallback(() => {
    logout()
    navigate('/login', { replace: true })
  }, [navigate])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const token = getToken() 
      if (!token) return

      try {
        const data = await fetchUsers(token) 
        setUsers(data)
      } catch (error) {
        console.error('Failed to load users', error)
        setActionError('Unable to load users. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    const token = getAccessTokenOrRedirect(navigate)
    if (!token) return
    
    const fetchRoles = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/user-role`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
    
        const text = await res.text();
        if (!text.startsWith("{") && !text.startsWith("[")) return;
    
        const data = JSON.parse(text);
        const rolesData = Array.isArray(data) ? data : data?.data || [];
        setRoles(rolesData);
      } catch (err) {
        console.error("Failed to load roles", err);
      }
    };

    fetchRoles()
  }, [navigate])

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return users

    return users.filter((user) =>
      (user.username || '').toLowerCase().includes(term) ||
      (user.displayname || '').toLowerCase().includes(term) ||
      (user.roleName || '').toLowerCase().includes(term)
    )
  }, [search, users])

 // ✅ Simplified permission check: Focuses only on the page access
useEffect(() => {
  const permissionsStr = localStorage.getItem("permissions") || "[]";
  const permissions = JSON.parse(permissionsStr);
  
  const currentPath = location.pathname.toLowerCase().replace(/\/$/, "");

  const currentMenu = permissions.find((menu: any) => {
    const route = (menu.to || menu.routePath || "").toLowerCase().replace(/\/$/, "");
    return route && (currentPath === route || currentPath.startsWith(`${route}/`));
  });

  if (currentMenu) {
    setMenuPermissions({
      canAdd: true,   // Always enabled since you aren't using these yet
      canEdit: true,  // Always enabled since you aren't using these yet
      canDelete: true, // ✅ Added canDelete
      canView: isTruthy(currentMenu.canView ?? currentMenu.canview),
    });
  } else {
    setMenuPermissions({ canAdd: false, canEdit: false, canDelete: false, canView: false });
  }
}, [location.pathname]);

  useEffect(() => {
    if (menuPermissions && menuPermissions.canView === false) {
      navigate("/unauthorized")
    }
  }, [menuPermissions, navigate])

  const handleDelete = async () => {
    if (!confirmingDelete) return
    const token = getAccessTokenOrRedirect(navigate)
    if (!token) return

    setDeletingId(confirmingDelete.id)
    setActionError('')

    try {
      await deleteUser(confirmingDelete.id, token)
      setSuccessMessage('User deleted successfully.')
      setUsers((prev) => prev.filter((user) => user.id !== confirmingDelete.id))
    } catch (error) {
      const typed = error as Error & { status?: number }
      if (typed.status === 401 || typed.status === 403) {
        handleUnauthorized()
        return
      }
      setActionError(getFriendlyNetworkMessage(typed.message, 'Unable to delete user. Please try again.'))
    } finally {
      setDeletingId(null)
      setConfirmingDelete(null)
    }
  }

  const getRoleName = (roleId: number) => {
    const role = roles.find((r: any) => r.id === roleId)
    return role ? (role.roleName || role.description || '') : ''
  }

  return (
    <div className="space-y-8 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-white/80 via-white/40 to-slate-100/40 p-6 shadow-lg ring-1 ring-slate-200/70 backdrop-blur-xl dark:from-slate-900/70 dark:via-slate-900/50 dark:to-slate-950/50 dark:ring-slate-800/80">
        {successMessage ? (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/80 px-4 py-3 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-100 dark:border-emerald-400/40 dark:bg-emerald-400/15 dark:text-emerald-50 dark:ring-emerald-400/30">
            {successMessage}
          </div>
        ) : null}
        {actionError ? (
          <div className="rounded-xl border border-rose-100 bg-rose-50/80 px-4 py-3 text-sm font-semibold text-rose-700 ring-1 ring-rose-100 dark:border-rose-400/40 dark:bg-rose-400/15 dark:text-rose-50 dark:ring-rose-400/30">
            {actionError}
          </div>
        ) : null}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Directory</p>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">User Master</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">Maintain user accounts, roles, and access status.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800/70 dark:text-slate-200 dark:ring-slate-700">
              <BadgeCheck className="h-4 w-4 text-emerald-500" />
              <span>{users.length} users</span>
            </div>
            <button
              type="button"
              onClick={() => navigate('/users/create')}
              disabled={!menuPermissions?.canAdd}
              className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold shadow-sm transition
                ${
                  menuPermissions?.canAdd
                    ? 'bg-[#1c75bc] text-white hover:bg-[#155c94]'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-50'
                }`}
            >
              <Plus className="h-4 w-4" /> Add User
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <label className="relative block w-full max-w-xl text-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              className="w-full rounded-2xl border border-slate-200 bg-white/60 py-2 pl-9 pr-3 text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:border-[#1c75bc] focus:outline-none focus:ring-2 focus:ring-[#1c75bc]/20 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-100"
              placeholder="Search username, name, or role"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-3 py-1 ring-1 ring-slate-200 dark:bg-slate-900/50 dark:ring-slate-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Active
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-3 py-1 ring-1 ring-slate-200 dark:bg-slate-900/50 dark:ring-slate-700">
              <span className="h-2 w-2 rounded-full bg-rose-500" /> Inactive
            </span>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/70 shadow-lg ring-1 ring-slate-200/70 dark:border-slate-800 dark:bg-slate-900/60 dark:ring-slate-800/80">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-800">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/70 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3 font-semibold">ID</th>
                  <th className="px-4 py-3 font-semibold">Username</th>
                  <th className="px-4 py-3 font-semibold">Display Name</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-600 dark:text-slate-300">
                      Loading users…
                    </td>
                  </tr>
                ) : null}
                {!loading &&
                  filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="bg-white/90 transition hover:bg-slate-50 dark:bg-slate-900/50 dark:hover:bg-slate-800/70"
                    >
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-50">{user.id}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{user.username}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{user.displayname}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                        {getRoleName(user.roleid)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusTone[user.isactive ? 'Active' : 'Inactive']}`}
                        >
                          <span className={`h-2 w-2 rounded-full ${user.isactive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          {user.isactive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/users/edit/${user.id}`)} 
                            disabled={!menuPermissions?.canEdit}
                            className={`inline-flex items-center gap-1 rounded-xl px-3 py-1 text-xs font-semibold ring-1 transition
                              ${
                                menuPermissions?.canEdit
                                  ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800/70 dark:text-slate-100'
                                  : 'bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500 opacity-50'
                              }`}
                          >
                            <PencilLine className="h-4 w-4" /> Edit
                          </button>
                          
                          {/* ✅ ADDED DELETE BUTTON */}
                          {/* <button
                            type="button"
                            onClick={() => setConfirmingDelete(user)}
                            disabled={!menuPermissions?.canDelete}
                            className={`inline-flex items-center gap-1 rounded-xl px-3 py-1 text-xs font-semibold ring-1 transition
                              ${
                                menuPermissions?.canDelete
                                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20 dark:ring-rose-500/30'
                                  : 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500 opacity-50'
                              }`}
                          >
                            <Trash2 className="h-4 w-4" /> Delete
                          </button> */}

                        </div>
                      </td>
                    </tr>
                  ))}
                {!loading && filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-300">
                      No users found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {confirmingDelete ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-rose-50 p-3 text-rose-700 ring-1 ring-rose-100 dark:bg-rose-500/15 dark:text-rose-50 dark:ring-rose-400/40">
                <Trash2 className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Confirm Delete</p>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Remove user?</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {confirmingDelete.username} will be removed from User Master. This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmingDelete(null)}
                className="inline-flex items-center rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200/60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deletingId === confirmingDelete.id}
                className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-300 disabled:cursor-not-allowed disabled:bg-rose-600/70"
              >
                {deletingId === confirmingDelete.id ? 'Deleting…' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {successMessage ? (
        <div className="fixed bottom-6 right-6 z-30 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-emerald-700 shadow-xl ring-1 ring-emerald-100 dark:bg-slate-900 dark:text-emerald-100 dark:ring-emerald-400/40">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          {successMessage}
          <button
            type="button"
            onClick={() => setSuccessMessage('')}
            className="rounded-full bg-emerald-50 px-2 py-1 text-xs text-emerald-700 ring-1 ring-emerald-100 transition hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-50 dark:ring-emerald-400/30"
          >
            Dismiss
          </button>
        </div>
      ) : null}
    </div>
  )
}