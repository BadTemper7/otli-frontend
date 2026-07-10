import { Link } from "react-router-dom"
import { ArrowRight, BarChart3, CheckCircle2, ClipboardCheck, Clock3, CreditCard, FileCheck2, MapPinned, RadioTower, ShieldCheck, ShipWheel, Sparkles, Truck, Warehouse } from "lucide-react"

const HomePage = () => {
  const steps = [
    { title: "Book", text: "Submit container, truck, and document details from the client portal." },
    { title: "Review", text: "Operations checks requirements, account status, and yard capacity." },
    { title: "Assign", text: "Admin selects the yard area, bay, row, and tier for the container." },
    { title: "Release", text: "Gate-Out is controlled by billing, approval, and final release status." },
  ]

  const featureCards = [
    { icon: FileCheck2, label: "Document-first workflow", text: "Required files are collected before review, so approvals are clearer and easier to track." },
    { icon: MapPinned, label: "Yard visibility", text: "Container locations are tied to configured areas, rows, and stacking positions." },
    { icon: RadioTower, label: "Live portal updates", text: "Clients can follow booking, billing, payment, and Gate-Out movement in one place." },
  ]

  const stats = [
    { value: "4-step", label: "Booking flow" },
    { value: "24/7", label: "Portal access" },
    { value: "Live", label: "Status updates" },
  ]

  return (
    <div className="overflow-hidden bg-slate-950 text-white">
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(20,184,166,.42),transparent_34%),radial-gradient(circle_at_86%_18%,rgba(59,130,246,.26),transparent_30%),linear-gradient(135deg,#020617_0%,#0f172a_50%,#042f2e_100%)]" />
        <div className="surface-grid absolute inset-0 opacity-25" />
        <div className="absolute -left-28 top-24 h-80 w-80 rounded-full bg-teal-300/10 blur-3xl" />
        <div className="absolute -right-16 top-36 h-72 w-72 rounded-full border border-teal-200/10" />
        <div className="absolute bottom-0 right-20 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:py-20 lg:grid-cols-[1.04fr_0.96fr] lg:items-center lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-300/25 bg-teal-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-teal-100">
              <Sparkles size={15} /> Container Yard Booking System
            </div>
            <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight tracking-tight sm:text-5xl md:text-6xl">
              Book, track, and release containers with less back-and-forth.
            </h1>
            <p className="mt-6 max-w-2xl text-base font-medium leading-8 text-slate-300 sm:text-lg">
              OTLI gives clients and operations teams one clean workspace for registration, document review, yard assignment, billing, payment proof, and Gate-Out approval.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/register" className="btn-primary !px-6 !py-3">
                Register Client <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn-secondary !border-white/20 !bg-white/10 !px-6 !py-3 !text-white hover:!bg-white/[0.15]">
                Client Login
              </Link>
              <Link to="/booking-status" className="btn-secondary !border-white/20 !bg-white/10 !px-6 !py-3 !text-white hover:!bg-white/[0.15]">
                Track Booking
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {stats.map((item) => (
                <div key={item.label} className="rounded-3xl border border-white/10 bg-white/[0.07] p-4 shadow-xl shadow-black/10 backdrop-blur">
                  <div className="text-2xl font-black text-white">{item.value}</div>
                  <div className="mt-1 text-xs font-black uppercase tracking-wide text-slate-400">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[2.25rem] bg-teal-400/10 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.10] p-4 shadow-2xl shadow-black/25 backdrop-blur-xl sm:p-5">
              <div className="rounded-[1.6rem] border border-white/10 bg-slate-950/[0.66] p-5">
                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
                  <div>
                    <div className="text-sm font-black text-white">Operations Snapshot</div>
                    <div className="mt-1 text-xs font-semibold text-slate-400">From client booking to final release</div>
                  </div>
                  <div className="rounded-full bg-emerald-400/[0.15] px-3 py-1 text-xs font-black text-emerald-200 ring-1 ring-emerald-300/10">Live</div>
                </div>

                <div className="mt-5 grid gap-3">
                  {[
                    { icon: ClipboardCheck, title: "Pending Review", value: "Docs checked" },
                    { icon: Warehouse, title: "Yard Assignment", value: "Area and stack set" },
                    { icon: CreditCard, title: "Billing Control", value: "Payment proof tracked" },
                    { icon: Truck, title: "Gate-Out", value: "Release after approval" },
                  ].map((item) => {
                    const Icon = item.icon
                    return (
                      <div key={item.title} className="flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/[0.07] p-4 transition hover:bg-white/[0.10]">
                        <div className="flex items-center gap-4">
                          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-500/20 text-teal-100">
                            <Icon size={22} />
                          </div>
                          <div>
                            <div className="font-black text-white">{item.title}</div>
                            <div className="mt-1 text-xs font-semibold text-slate-400">{item.value}</div>
                          </div>
                        </div>
                        <CheckCircle2 size={18} className="text-teal-200" />
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-slate-900/80 px-4 py-14 backdrop-blur">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.24em] text-teal-200">Why OTLI Portal</div>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">A smoother way to manage yard operations</h2>
              <p className="mt-3 text-sm font-medium leading-6 text-slate-400">
                Reduce manual follow-ups with a portal that connects client requests, admin review, operational status, and release control.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {featureCards.map((card) => {
                const Icon = card.icon
                return (
                  <div key={card.label} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-xl shadow-black/10 transition hover:-translate-y-1 hover:bg-white/[0.09]">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-400/[0.14] text-teal-100 ring-1 ring-teal-300/10">
                      <Icon size={22} />
                    </div>
                    <h3 className="mt-4 font-black text-white">{card.label}</h3>
                    <p className="mt-2 text-sm font-medium leading-6 text-slate-400">{card.text}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.24em] text-teal-200">Process Flow</div>
              <h2 className="mt-3 text-3xl font-black tracking-tight">Simple steps from request to release</h2>
            </div>
            <Link to="/booking-status" className="btn-secondary !border-white/20 !bg-white/10 !text-white hover:!bg-white/[0.15]">
              Check Booking Status <ArrowRight size={17} />
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.title} className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-xl shadow-black/10">
                <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-teal-400/10 blur-xl" />
                <div className="relative grid h-11 w-11 place-items-center rounded-2xl bg-teal-500 text-sm font-black text-white shadow-lg shadow-teal-950/30">{index + 1}</div>
                <h3 className="relative mt-5 text-lg font-black text-white">{step.title}</h3>
                <p className="relative mt-2 text-sm font-medium leading-6 text-slate-400">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/10 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-400/10 px-3 py-1 text-xs font-black uppercase tracking-wide text-teal-100">
                <Clock3 size={14} /> Ready when your team is
              </div>
              <h2 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">Start with client registration, then manage bookings after approval.</h2>
              <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-slate-400">
                New clients can submit company details and supporting documents. Once approved, booking, container tracking, payment proof, and Gate-Out requests become available.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link to="/register" className="btn-primary !px-6">
                Create Client Account <ArrowRight size={17} />
              </Link>
              <Link to="/login" className="btn-secondary !border-white/20 !bg-white/10 !text-white hover:!bg-white/[0.15]">
                Login to Portal
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
