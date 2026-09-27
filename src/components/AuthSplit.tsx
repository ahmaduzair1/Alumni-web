import type { ReactNode } from 'react'

export function AuthSplit({
  tone,
  eyebrow,
  headline,
  children,
}: {
  tone: 'alumni' | 'staff'
  eyebrow: string
  headline: string
  children: ReactNode
}) {
  const staff = tone === 'staff'
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
      <section
        className={`relative hidden flex-col justify-between overflow-hidden p-12 text-white lg:flex ${
          staff ? 'bg-[#0D1117]' : 'bg-gradient-to-br from-[#008080] to-[#00BFB2]'
        }`}
      >
        <div>
          <img src="/logo.png" alt="Alumni Connect" className="h-16 w-auto object-contain" />
          <p className={`mt-10 text-xs font-bold uppercase tracking-[0.2em] ${staff ? 'text-[#DAA520]' : 'text-white/80'}`}>
            {eyebrow}
          </p>
          <h1 className="mt-3 max-w-md text-4xl font-extrabold leading-tight tracking-tight">{headline}</h1>
        </div>
        <p className={`max-w-sm text-sm leading-relaxed ${staff ? 'text-white/55' : 'text-white/85'}`}>
          Connecting alumni, students, and administration in one unified platform.
        </p>
        {staff && <div className="pointer-events-none absolute -right-16 top-16 h-56 w-56 rounded-full bg-[#008080]/30 blur-3xl" />}
      </section>
      <section className="flex items-center justify-center bg-[var(--bg)] px-6 py-10 text-[var(--text)]">
        <div className="w-full max-w-md">{children}</div>
      </section>
    </div>
  )
}
