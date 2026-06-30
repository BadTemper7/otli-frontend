import { Link } from "react-router-dom"
import { CreditCard, PackageCheck, Truck, UserRoundCheck } from "lucide-react"
import Alert from "../components/Alert"
import { useAuth } from "../context/AuthContext"

const isVerifiedClient = (status) => ["active", "verified"].includes(status)

const ClientDashboard = () => {
  const { user } = useAuth()
  const verified = isVerifiedClient(user?.status)

  const cards = [
    { label: "Account status", value: user?.status || "pending", icon: UserRoundCheck },
    { label: "My Containers", value: verified ? "Open" : "Locked", icon: PackageCheck },
    { label: "Payment", value: verified ? "By status" : "Locked", icon: CreditCard },
    { label: "Gate-Out", value: verified ? "After payment" : "Locked", icon: Truck },
  ]

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="text-sm font-black uppercase tracking-wide text-teal-700">Client Dashboard</div>
        <h1 className="mt-2 text-3xl font-black text-slate-950">{user?.companyName}</h1>
        <p className="mt-2 text-slate-600">
          Track your container status, add payment only when your container is already stored in inventory, and request Gate-Out once payment is approved.
        </p>
        {verified && (
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link className="btn-primary" to="/client/containers">
              <PackageCheck size={17} /> View My Containers
            </Link>
          </div>
        )}
      </div>

      {!verified && (
        <Alert type="warning">
          Your account is currently <strong className="capitalize">{user?.status}</strong>. Container, payment, and Gate-Out actions will become available after admin verification. <Link className="font-black text-teal-700 underline" to="/client/account-status">View account status</Link>.
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-500">{card.label}</div>
                  <div className="mt-2 text-2xl font-black capitalize text-slate-950">{card.value}</div>
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-teal-700">
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
