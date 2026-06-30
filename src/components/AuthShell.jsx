const AuthShell = ({ eyebrow, title, subtitle, children }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-white lg:grid lg:grid-cols-[1fr_560px]">
      <div className="relative hidden overflow-hidden lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(20,184,166,.35),transparent_30%),radial-gradient(circle_at_80%_80%,rgba(59,130,246,.25),transparent_32%)]" />
        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          <div>
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500 text-xl font-black text-white">O</div>
            <div className="mt-8 text-sm font-bold uppercase tracking-[0.35em] text-teal-200">One True Logistics Inc.</div>
            <h1 className="mt-5 max-w-2xl text-5xl font-black leading-tight">Mega Port Terminal management portal</h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">
              Secure login, client registration, document submission, and real-time admin updates.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">JWT secured access</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Brevo email OTP</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Socket.IO live updates</div>
          </div>
        </div>
      </div>

      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 text-slate-950">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:text-left">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-700 text-xl font-black text-white lg:mx-0">O</div>
            <div className="text-xs font-black uppercase tracking-[0.25em] text-teal-700">{eyebrow}</div>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

export default AuthShell
