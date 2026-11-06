function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  onClick,
  isActive = false,
  disabled = false,
  children,
  isDashboard,
  className="" 

}) {
  const clickable = Boolean(onClick) && !disabled
  const ringColor =
  title === 'OK Quantity'
    ? 'ring-emerald-400'
    : title === 'NOK Quantity'
    ? 'ring-red-400'
    : 'ring-[#1c75bc]/60 dark:ring-amber-400/70'

  const classNames = [
`group relative overflow-hidden rounded-2xl bg-white/85 p-4 text-slate-900 shadow-sm ring-1 ${ringColor} transition hover:-translate-y-1 hover:shadow-lg dark:bg-slate-900/70 dark:text-slate-100`,
className,

isActive ? 'ring-2' : '',
clickable
  ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-2'
  : '',
    disabled ? 'opacity-60' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? onClick : undefined}
      onKeyDown={
        clickable
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onClick()
              }
            }
          : undefined
      }
      className={classNames}
    >
<div
  className={`absolute inset-x-0 bottom-0 h-1 opacity-70 transition group-hover:opacity-100 ${
    title === 'OK Quantity'
      ? 'bg-emerald-400'
      : title === 'NOK Quantity'
      ? 'bg-red-400'
      : 'bg-[#1c75bc] dark:bg-amber-400'

  }`}
/>
      <div className="flex items-center gap-3">
        {Icon ? (
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1c75bc]/10 text-[#1c75bc] ring-1 ring-[#1c75bc]/20 transition group-hover:bg-[#1c75bc]/15 dark:bg-amber-400/15 dark:text-amber-200 dark:ring-amber-200/35">
            <Icon className="h-5 w-5" />
          </span>
        ) : null}
        <div className="space-y-1 stats-card">
 <p
  className={`stats-title font-semibold uppercase tracking-[0.2em] text-slate-900 dark:text-slate-400 ${
    isDashboard ? "text-lg" : "text-xs"
  }`}
>
  {title}
</p>

<p
  className={`stats-value font-bold text-slate-900 dark:text-white ${
    isDashboard ? "text-4xl" : "text-3xl"
  }`}
>
  {value}
</p>

{subtitle ? (
  <p
    className={`stats-subtitle text-slate-700 dark:text-slate-400 ${
      isDashboard ? "text-sm" : "text-xs"
    }`}
  >
    {subtitle}
  </p>
) : null}


        </div>
      </div>
      {children ? <div className="mt-4 space-y-2 text-sm text-slate-700 dark:text-slate-200">{children}</div> : null}
    </div>
  )
}

export default StatsCard
