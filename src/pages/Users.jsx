import { useMemo, useState } from 'react'
import { BadgeCheck, Mail, Search, ShieldCheck, UserRound, Users } from 'lucide-react'

const sampleUsers = [
  {
    id: 1,
    name: 'Rashmi Varma',
    role: 'Production Lead',
    shift: 'A',
    status: 'Online',
    email: 'rashmi.varma@jrss.io',
    badge: 'E-124',
    focus: 'Assembly',
  },
  {
    id: 2,
    name: 'Miguel Santos',
    role: 'Quality Engineer',
    shift: 'B',
    status: 'Online',
    email: 'miguel.santos@jrss.io',
    badge: 'E-108',
    focus: 'Inspection',
  },
  {
    id: 3,
    name: 'Priya Khanna',
    role: 'Line Supervisor',
    shift: 'A',
    status: 'Away',
    email: 'priya.khanna@jrss.io',
    badge: 'E-097',
    focus: 'Line 3',
  },
  {
    id: 4,
    name: 'Arjun Mehta',
    role: 'Maintenance',
    shift: 'C',
    status: 'Offline',
    email: 'arjun.mehta@jrss.io',
    badge: 'E-042',
    focus: 'Robotics',
  },
  {
    id: 5,
    name: 'Kara Smith',
    role: 'Planner',
    shift: 'B',
    status: 'Online',
    email: 'kara.smith@jrss.io',
    badge: 'E-151',
    focus: 'Scheduling',
  },
]

const statusStyles = {
  Online: 'bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-400/15 dark:text-emerald-100 dark:ring-emerald-400/30',
  Away: 'bg-amber-50 text-amber-700 ring-amber-100 dark:bg-amber-400/15 dark:text-amber-100 dark:ring-amber-400/30',
  Offline: 'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800/70 dark:text-slate-200 dark:ring-slate-700',
}

export default function UsersPage() {
  const [search, setSearch] = useState('')

  const filteredUsers = useMemo(() => {
    const value = search.trim().toLowerCase()
    if (!value) return sampleUsers

    return sampleUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(value) ||
        user.role.toLowerCase().includes(value) ||
        user.email.toLowerCase().includes(value) ||
        user.focus.toLowerCase().includes(value),
    )
  }, [search])

  const stats = useMemo(() => {
    const online = sampleUsers.filter((user) => user.status === 'Online').length
    const total = sampleUsers.length
    const coverage = ((online / total) * 100).toFixed(0)
    return { online, total, coverage }
  }, [])

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-lg backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Directory</p>
            <h1 className="text-2xl font-semibold">User workspace</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">Review active users, shifts, and contact details.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-400/15 dark:text-emerald-100 dark:ring-emerald-400/30">
              {stats.online} online
            </div>
            <div className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800/60 dark:text-slate-100 dark:ring-slate-700">
              {stats.coverage}% coverage
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Role-aware access enabled</span>
          </div>
          <label className="relative block w-full max-w-sm text-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              className="w-full rounded-2xl border border-slate-200 bg-white/60 py-2 pl-9 pr-3 text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:border-[#1c75bc] focus:outline-none focus:ring-2 focus:ring-[#1c75bc]/20 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-100"
              placeholder="Search name, role, or focus area"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-lg backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#184b6d] to-sky-500 text-white shadow-inner">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Team</p>
              <p className="text-lg font-semibold">{stats.total} registered users</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-lg backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-inner">
              <BadgeCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Compliance</p>
              <p className="text-lg font-semibold">Digital badges synced</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-lg backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-inner">
              <UserRound className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Shift coverage</p>
              <p className="text-lg font-semibold">{stats.coverage}% active this shift</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-lg backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Roster</p>
            <h2 className="text-xl font-semibold">Current shift overview</h2>
          </div>
          <div className="rounded-full bg-[#1c75bc]/10 px-3 py-1 text-xs font-semibold text-[#1c75bc] ring-1 ring-[#1c75bc]/30 dark:bg-amber-300/15 dark:text-amber-100 dark:ring-amber-200/30">
            Live sync
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredUsers.map((user) => (
            <article
              key={user.id}
              className="group rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-md transition hover:-translate-y-0.5 hover:shadow-xl dark:border-slate-800/70 dark:bg-slate-900/70"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-white via-slate-50 to-slate-100 text-sm font-bold text-[#184b6d] ring-2 ring-white shadow-inner dark:from-slate-800 dark:via-slate-900 dark:to-slate-950 dark:text-amber-100 dark:ring-slate-800">
                    {user.name
                      .split(' ')
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-slate-900 dark:text-slate-50">{user.name}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{user.role}</p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                    statusStyles[user.status] || statusStyles.Offline
                  }`}
                >
                  <span className="inline-block h-2 w-2 rounded-full bg-current" />
                  {user.status}
                </span>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600 dark:text-slate-300">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Shift</dt>
                  <dd className="font-semibold text-slate-900 dark:text-slate-100">{user.shift}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Focus</dt>
                  <dd className="font-semibold text-slate-900 dark:text-slate-100">{user.focus}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Badge</dt>
                  <dd className="font-semibold text-slate-900 dark:text-slate-100">{user.badge}</dd>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-slate-500" />
                  <a
                    href={`mailto:${user.email}`}
                    className="font-semibold text-[#1c75bc] transition hover:text-[#145a8f] dark:text-amber-200 dark:hover:text-amber-100"
                  >
                    {user.email}
                  </a>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
