import { Link } from "react-router-dom"
import { ArrowRight, CheckCircle2, ClipboardCheck, CreditCard, MapPinned, ShieldCheck, ShipWheel, Truck, Warehouse } from "lucide-react"

const HomePage = () => {
  const steps = [
    { title: "Create booking", text: "Client submits container and document details." },
    { title: "Admin review", text: "Team checks requirements and yard capacity." },
    { title: "Assign location", text: "Area, line, row, and high are selected." },
    { title: "Gate-In", text: "Truck and container details are verified." },
    { title: "Billing", text: "Storage and release charges are monitored." },
    { title: "Gate-Out", text: "Paid containers are approved for release." },
  ]

  const featureCards = [
    { icon: ShieldCheck, label: "Admin Approval", text: "Bookings stay pending until the operations team confirms space and documents." },
    { icon: MapPinned, label: "Yard Assignment", text: "Assign container position using area, bay, row, and tier details." },
    { icon: Truck, label: "Gate-In to Gate-Out", text: "Track movement from arrival, storage, billing, payment, and release." },
  ]

  return (
    <div className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-white/10 bg-white px-3 py-2 shadow-xl shadow-black/20">
              <img src="/images/otli-logo.webp" alt="OTLI" className="h-9 w-auto object-contain" />
            </div>
            <div className="hidden sm:block">
              <div className="font-black">One True Logistics Inc.</div>
              <div className="text-xs font-semibold text-slate-400">Container Yard Booking System</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/client/login" className="rounded-2xl px-4 py-2 text-sm font-black text-slate-200 transition hover:bg-white/10">Client Login</Link>
            <Link to="/admin/login" className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-black text-white transition hover:bg-white/[0.15]">Admin</Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_8%,rgba(20,184,166,.40),transparent_32%),radial-gradient(circle_at_86%_26%,rgba(59,130,246,.24),transparent_30%),linear-gradient(135deg,#020617_0%,#0f172a_54%,#042f2e_100%)]" />
          <div className="surface-grid absolute inset-0 opacity-25" />
          <div className="absolute -right-24 top-24 h-72 w-72 rounded-full border border-teal-200/10" />
          <div className="absolute bottom-10 left-10 h-60 w-60 rounded-full bg-teal-400/10 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:py-20 lg:grid-cols-[1fr_470px] lg:items-center lg:py-24">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-300/25 bg-teal-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-teal-100">
                <Warehouse size={16} /> Yard Booking Portal
              </div>
              <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight tracking-tight sm:text-5xl md:text-6xl">
                A cleaner way to book, assign, and release containers.
              </h1>
              <p className="mt-6 max-w-2xl text-base font-medium leading-8 text-slate-300 sm:text-lg">
                OTLI connects client booking requests with admin verification, yard capacity, gate inspection, billing, and Gate-Out approval in one simple workflow.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/client/login" className="btn-primary !px-6 !py-3">
                  Make a Booking <ArrowRight size={18} />
                </Link>
                <Link to="/client/register" className="btn-secondary !border-white/20 !bg-white/10 !px-6 !py-3 !text-white hover:!bg-white/[0.15]">
                  Register Client
                </Link>
                <Link to="/booking-status" className="btn-secondary !border-white/20 !bg-white/10 !px-6 !py-3 !text-white hover:!bg-white/[0.15]">
                  Track Booking
                </Link>
              </div>

              <div className="mt-8 grid gap-3 text-sm font-bold text-slate-300 sm:grid-cols-3">
                {["Role-based access", "OTP registration", "Live admin updates"].map((item) => (
                  <div key={item} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                    <CheckCircle2 size={16} className="text-teal-200" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/10 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-5">
              <div className="rounded-[1.6rem] border border-white/10 bg-slate-950/[0.55] p-4">
                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <div className="text-sm font-black text-white">Today&apos;s Operations</div>
                    <div className="mt-1 text-xs font-semibold text-slate-400">Booking to release overview</div>
                  </div>
                  <div className="rounded-full bg-emerald-400/[0.15] px-3 py-1 text-xs font-black text-emerald-200">Live</div>
                </div>

                <div className="mt-4 grid gap-3">
                  {featureCards.map((card) => {
                    const Icon = card.icon
                    return (
                      <div key={card.label} className="rounded-3xl border border-white/10 bg-white/[0.07] p-4 transition hover:bg-white/10">
                        <div className="flex items-start gap-4">
                          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-500/20 text-teal-100">
                            <Icon size={22} />
                          </div>
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
          </div>
        </section>

        <section className="border-y border-white/10 bg-slate-900/80 px-4 py-14 backdrop-blur">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <div className="text-xs font-black uppercase tracking-[0.22em] text-teal-200">Process Flow</div>
              <h2 className="mt-3 text-3xl font-black tracking-tight">From booking request to final release</h2>
              <p className="mt-3 text-sm font-medium leading-6 text-slate-400">Each step is designed to keep the client and operations team aligned.</p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {steps.map((step, index) => (
                <div key={step.title} className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/5 transition hover:-translate-y-0.5 hover:bg-white/[0.08]">
                  <div className="flex items-start gap-4">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-teal-500 text-sm font-black text-white shadow-lg shadow-teal-950/30">{index + 1}</div>
                    <div>
                      <div className="font-black text-slate-100">{step.title}</div>
                      <p className="mt-1 text-sm leading-6 text-slate-400">{step.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-14">
          <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
            {[
              { icon: ClipboardCheck, title: "Document-first review", text: "Keep booking requirements clear before yard assignment." },
              { icon: ShipWheel, title: "Yard visibility", text: "Use configured areas and inventory status for cleaner operations." },
              { icon: CreditCard, title: "Release control", text: "Gate-Out stays tied to payment and approval status." },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-teal-100">
                    <Icon size={22} />
                  </div>
                  <h3 className="mt-4 text-lg font-black">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{item.text}</p>
                </div>
              )
            })}
          </div>
        </section>
      </main>
    </div>
  )
}

export default HomePage
