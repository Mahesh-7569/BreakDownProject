import { FormEvent, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, Loader2, ArrowLeft } from 'lucide-react'
import httpClient from '../../api/httpClient'
import { getAllRoles } from '../../services/roleService'

interface User {
  id: number
  userName: string
  password: string
  displayName: string
  roleId: number
  isActive: boolean
}

interface FormValues {
  username: string
  password: string
  displayname: string
  roleid: string
  isactive: boolean
}

interface FieldErrors {
  username?: string
  password?: string
  displayname?: string
  roleid?: string
}

export default function EditUser() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const [formValues, setFormValues] = useState<FormValues>({
    username: '',
    password: '',
    displayname: '',
    roleid: '',
    isactive: true,
  })

  const [roles, setRoles] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Helper to get token
  const getValidToken = () => localStorage.getItem('accessToken') || localStorage.getItem('mes-auth-session');

  // Fetch Roles and Initial User Data
  useEffect(() => {
    const init = async () => {
      const token = getValidToken();
      if (!token || !id) {
        navigate('/users', { replace: true })
        return
      }

      setLoading(true)
      try {
        // Fetch roles for dropdown
        const roleData = await getAllRoles()
        setRoles(roleData)

        // Fetch user data
        const response = await httpClient.get(`/user-master/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })

        if (response.data) {
          const user = response.data
          setFormValues({
            username: user.userName || '',
            // ✅ This tells React to pre-fill the ACTUAL password from the database
            password: user.password || '', 
            displayname: user.displayName || '',
            roleid: String(user.roleId || ''),
            isactive: user.isActive,
          })
        }
      } catch (error) {
        setGeneralError('Failed to load user details.')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [id, navigate])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setGeneralError(null)
    setSuccessMessage(null)

    const token = getValidToken();
    if (!token) {
      navigate('/login', { replace: true })
      return
    }

    const validationErrors: FieldErrors = {}
    if (!formValues.username.trim()) validationErrors.username = 'Username is required.'
    if (!formValues.displayname.trim()) validationErrors.displayname = 'Display name is required.'
    if (!formValues.roleid) validationErrors.roleid = 'Role is required.'

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors)
      return
    }

    setSubmitting(true)
    
    // ✅ Sends exactly what is in the form state
    const payload = {
      id: Number(id),
      userName: formValues.username.trim(),
      password: formValues.password, 
      displayName: formValues.displayname.trim(),
      roleId: Number(formValues.roleid),
      departmentId: 0,
      isActive: formValues.isactive,
    }

    try {
      await httpClient.put(`/user-master/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSuccessMessage('User updated successfully')
      setTimeout(() => navigate('/users'), 700)
    } catch (error: any) {
      setGeneralError(error.response?.data?.message || 'Unable to update user.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container py-6 text-slate-900 dark:text-slate-100">
      {/* HEADER */}
      <div className="mb-6 rounded-3xl bg-gradient-to-br from-white/95 via-white/90 to-slate-50/90 p-6 shadow-lg ring-1 ring-slate-200/80 dark:from-slate-900/85 dark:via-slate-900/80 dark:to-slate-900/75 dark:ring-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Administration</p>
            <h1 className="mt-1 text-2xl font-semibold">Edit User</h1>
          </div>
          <button
            type="button"
            onClick={() => navigate("/users")}
            className="mt-1 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 dark:bg-amber-400 dark:text-slate-950 dark:hover:bg-amber-300"
          >
            <ArrowLeft className="h-4 w-4" /> Back to User Master
          </button>
        </div>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="mt-6 overflow-hidden rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-slate-200/80 dark:bg-slate-900/85 dark:ring-slate-800">
        {generalError && <div className="mb-6 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-200">{generalError}</div>}
        {successMessage && <div className="mb-6 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200">{successMessage}</div>}

        {loading ? (
            <div className="py-10 text-center">Loading...</div>
        ) : (
            <div className="grid gap-6 sm:grid-cols-2">
                <div>
                    <label className="mb-1 block text-sm font-semibold">Username*</label>
                    <input type="text" value={formValues.username} onChange={(e) => setFormValues(p => ({ ...p, username: e.target.value }))} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-900" />
                    {fieldErrors.username && <p className="mt-1 text-xs text-red-500">{fieldErrors.username}</p>}
                </div>
                <div>
                    <label className="mb-1 block text-sm font-semibold">Password</label>
                    <input type="password" value={formValues.password} onChange={(e) => setFormValues(p => ({ ...p, password: e.target.value }))} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-900" />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-semibold">Display Name*</label>
                    <input type="text" value={formValues.displayname} onChange={(e) => setFormValues(p => ({ ...p, displayname: e.target.value }))} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-900" />
                    {fieldErrors.displayname && <p className="mt-1 text-xs text-red-500">{fieldErrors.displayname}</p>}
                </div>
                <div>
                    <label className="mb-1 block text-sm font-semibold">Role*</label>
                    <select value={formValues.roleid} onChange={(e) => setFormValues(p => ({ ...p, roleid: e.target.value }))} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-900">
                        <option value="">Select a role</option>
                        {roles.map(r => <option key={r.id} value={r.id}>{r.roleName || r.description}</option>)}
                    </select>
                    {fieldErrors.roleid && <p className="mt-1 text-xs text-red-500">{fieldErrors.roleid}</p>}
                </div>
                <div className="self-end">
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
                        <input type="checkbox" checked={formValues.isactive} onChange={(e) => setFormValues(p => ({ ...p, isactive: e.target.checked }))} className="h-5 w-5 rounded border-slate-300 text-[#1c75bc]" />
                        <span className="text-sm font-medium">Active</span>
                    </div>
                </div>
            </div>
        )}

        <div className="mt-8 flex justify-end gap-3">
            <button type="button" onClick={() => navigate("/users")} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-xl bg-[#1c75bc] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#155c94] disabled:opacity-50">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Update User
            </button>
        </div>
      </form>
    </div>
  )
}