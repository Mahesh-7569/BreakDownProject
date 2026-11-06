import { Leaf } from 'lucide-react'

export const gradientHeader =
  'bg-gradient-to-r from-[#1c75bc] via-[#1c75bc] to-[#1c75bc]/85 dark:from-amber-500/90 dark:via-amber-500/70 dark:to-amber-400/80'

function PageHero({ title, eyebrow, description, icon = Leaf, pill  }) {
  const IconComponent = icon
  return (
    <div
      className={`${gradientHeader} relative overflow-hidden rounded-3xl px-6 py-8 text-white shadow-md ring-1 ring-[#1c75bc]/30 dark:ring-amber-200/30`}
    >
      <div className="absolute inset-0 opacity-20 mix-blend-screen">
        <div className="absolute -left-10 -top-24 h-52 w-52 rounded-full bg-white blur-3xl" />
        <div className="absolute bottom-0 right-0 h-60 w-60 rounded-full bg-[#1c75bc]/40 blur-3xl" />
      </div>
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/20">
            <IconComponent className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-white/80">{eyebrow}</p>
            <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">{title}</h1>
            {/* <p className="mt-2 max-w-2xl text-sm text-white/85 sm:text-base">{description}</p> */}
          </div>
        </div>
        {pill ? (
  <div className="flex items-center">
    {pill}
  </div>
) : null}
      </div>

      
    </div>
  )
}

export default PageHero
