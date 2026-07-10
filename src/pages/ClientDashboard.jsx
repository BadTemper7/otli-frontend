import { Link } from "react-router-dom"
import { ArrowRight, CreditCard, PackageCheck, ShieldCheck, Truck, UserRoundCheck } from "lucide-react"
import Alert from "../components/Alert"
import { useAuth } from "../context/AuthContext"

const isVerifiedClient = (status) => ["active", "verified"].includes(status)

const ClientDashboard = () => {
  const { user } = useAuth()
  const verified = isVerifiedClient(user?.status)

  const cards = [
    { label: "Account status", value: user?.status || "pending", icon: UserRoundCheck, helper: verified ? "Approved for portal actions" : "Waiting for admin review" },
    { label: "My Containers", value: verified ? "Open" : "Locked", icon: PackageCheck, helper: verified ? "View booking and inventory status" : "Available after verification" },
    { label: "Payment", value: verified ? "By status" : "Locked", icon: CreditCard, helper: "Pay once billing is available" },
    { label: "Gate-Out", value: verified ? "After payment" : "Locked", icon: Truck, helper: "Request release after approval" },
  ]

  return (
    <div className="space-y-6">
      <div className="card overflow-hidden p-0">
        <div className="relative overflow-hidden bg-slate-950 px-6 py-7 text-white sm:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(20,184,166,.35),transparent_32%),radial-gradient(circle_at_95%_0%,rgba(59,130,246,.18),transparent_28%)]" />
          <div className="surface-grid absolute inset-0 opacity-20" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.22em] text-teal-100">Client Dashboard</div>
              <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{user?.companyName || "Company Account"}</h1>
              <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-300">
                Track account verification, container movement, billing readiness, and Gate-Out release from one workspace.
              </p>
            </div>
            {verified ? (
              <Link className="btn-primary w-full sm:w-auto" to="/containers">
                <PackageCheck size={17} /> View My Containers <ArrowRight size={17} />
              </Link>
            ) : (
              <Link className="btn-secondary w-full !border-white/[0.15] !bg-white/10 !text-white hover:!bg-white/[0.15] sm:w-auto" to="/profile">
                <ShieldCheck size={17} /> View Profile
              </Link>
            )}
          </div>
        </div>
      </div>

      {!verified && (
        <Alert type="warning">
          Your account is currently <strong className="capitalize">{user?.status}</strong>. Container, payment, and Gate-Out actions will become available after admin verification. <Link className="font-black text-teal-700 underline" to="/profile">View account status</Link>.
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="card card-hover p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-slate-500">{card.label}</div>
                  <div className="mt-2 text-2xl font-black capitalize tracking-tight text-slate-950">{card.value}</div>
                  <div className="mt-1 text-xs font-bold leading-5 text-slate-400">{card.helper}</div>
                </div>
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-teal-50 text-teal-700 ring-1 ring-teal-100">
                  <Icon size={22} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ClientDashboard
