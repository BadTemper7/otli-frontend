import { Link } from "react-router-dom"
import { ArrowRight, CheckCircle2, MapPinned, ShieldCheck, Truck, Warehouse } from "lucide-react"

const HomePage = () => {
  const steps = [
    "Submit a container booking request",
    "Admin checks yard capacity and assigns an area",
    "Gate staff approves Gate-In after inspection",
    "Container is stored in the assigned block",
    "Client settles billing before Gate-Out",
    "Admin approves release and completes Gate-Out",
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-teal-500 text-xl font-black">O</div>
            <div>
              <div className="font-black">One True Logistics Inc.</div>
              <div className="text-xs font-semibold text-slate-400">Container Yard Booking System</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/client/login" className="rounded-xl px-4 py-2 text-sm font-black text-slate-200 hover:bg-white/10">Client Login</Link>
            <Link to="/admin/login" className="rounded-xl px-4 py-2 text-sm font-black text-slate-200 hover:bg-white/10">Admin</Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_10%,rgba(20,184,166,.35),transparent_30%),radial-gradient(circle_at_85%_30%,rgba(59,130,246,.25),transparent_28%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-20 lg:grid-cols-[1fr_460px] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-300/30 bg-teal-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-teal-200">
                <Warehouse size={16} /> Yard Booking Portal
              </div>
              <h1 className="mt-6 max-w-4xl text-5xl font-black leading-tight tracking-tight md:text-6xl">
                Book your container yard slot and track it until Gate-Out.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                OTLI lets clients submit booking requests while admins control yard capacity, area assignment, gate-in inspection, billing approval, and gate-out release in one flow.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/client/login" className="btn-primary !bg-teal-500 !px-6 !py-3 hover:!bg-teal-400">
                  Make a Booking <ArrowRight size={18} />
                </Link>
                <Link to="/client/register" className="btn-secondary !border-white/20 !bg-white/10 !px-6 !py-3 !text-white hover:!bg-white/15">
                  Register Client
                </Link>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur">
              <div className="grid gap-4">
                {[
                  { icon: ShieldCheck, label: "Admin Approval", text: "Bookings start as pending until admin checks space." },
                  { icon: MapPinned, label: "Area Assignment", text: "Admin assigns area, block, bay, row, and tier." },
                  { icon: Truck, label: "Gate-In to Gate-Out", text: "Track container status and billing until release." },
                ].map((card) => {
                  const Icon = card.icon
                  return (
                    <div key={card.label} className="rounded-3xl border border-white/10 bg-slate-950/50 p-5">
                      <div className="flex items-start gap-4">
                        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-500/20 text-teal-200"><Icon size={22} /></div>
                        <div>
                          <div className="font-black">{card.label}</div>
                          <p className="mt-1 text-sm leading-6 text-slate-300">{card.text}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 bg-slate-900 px-4 py-14">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-2xl font-black">Booking process</h2>
            <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {steps.map((step, index) => (
                <div key={step} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-start gap-3">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-teal-500 text-sm font-black">{index + 1}</div>
                    <div className="font-bold text-slate-100">{step}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default HomePage
