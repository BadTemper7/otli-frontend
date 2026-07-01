import { useEffect, useState } from "react"
import { ArrowRight, Building2, MapPinned, ShieldCheck, UsersRound } from "lucide-react"
import { Link } from "react-router-dom"
import { api, getApiError } from "../lib/api"
import Alert from "../components/Alert"

const AdminDashboard = () => {
  const [users, setUsers] = useState([])
  const [yardSummary, setYardSummary] = useState({ areaCount: 0, blockCount: 0, totalAreaCapacityTeu: 0, totalTeuSlots: 0 })
  const [bookingSummary, setBookingSummary] = useState({})
  const [error, setError] = useState("")

  const loadData = async () => {
    try {
      const usersResponse = await api.get("/admin/users")
      setUsers(usersResponse.data.users || [])
    } catch (err) {
      setError(getApiError(err))
    }

    try {
      const yardResponse = await api.get("/admin/yard/summary")
      setYardSummary(yardResponse.data.summary || { areaCount: 0, blockCount: 0, totalAreaCapacityTeu: 0, totalTeuSlots: 0 })
    } catch (err) {
      setYardSummary({ areaCount: 0, blockCount: 0, totalAreaCapacityTeu: 0, totalTeuSlots: 0, availableSlots: 0 })
    }

    try {
      const bookingResponse = await api.get("/admin/bookings/summary")
      setBookingSummary(bookingResponse.data.summary || {})
    } catch (err) {
      setBookingSummary({})
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const clients = users.filter((user) => user.userType === "client")
  const pendingClients = clients.filter((user) => user.status === "pending" || user.status === "resubmitted")

  const cards = [
    { label: "Pending Bookings", value: bookingSummary.pending || 0, icon: ShieldCheck, helper: "Waiting for admin action" },
    { label: "Gate-Out Requests", value: bookingSummary.gateOutRequested || 0, icon: Building2, helper: "Ready for release review" },
    { label: "Current Inventory", value: yardSummary.occupiedSlots || 0, icon: UsersRound, helper: "Occupied yard slots" },
    { label: "Available Yard Capacity", value: yardSummary.availableSlots || 0, icon: MapPinned, helper: "Open slots" },
  ]

  return (
    <div className="space-y-6">
      <Alert type="error">{error}</Alert>

      <section className="card overflow-hidden p-0">
        <div className="relative overflow-hidden bg-slate-950 px-6 py-7 text-white sm:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(20,184,166,.34),transparent_32%),radial-gradient(circle_at_92%_0%,rgba(59,130,246,.20),transparent_28%)]" />
          <div className="surface-grid absolute inset-0 opacity-20" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.22em] text-teal-100">Operations command center</div>
              <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Admin Dashboard</h1>
              <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-300">
                Review bookings, monitor yard capacity, verify clients, and keep container movement aligned from Gate-In to Gate-Out.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/admin/clients" className="btn-secondary !border-white/[0.15] !bg-white/10 !text-white hover:!bg-white/[0.15]">
                Client Verification <ArrowRight size={17} />
              </Link>
              <Link to="/admin/inventory" className="btn-primary">
                Inventory Board <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="card card-hover p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-slate-500">{card.label}</div>
                  <div className="mt-2 text-3xl font-black tracking-tight text-slate-950">{card.value}</div>
                  <div className="mt-1 text-xs font-bold text-slate-400">{card.helper}</div>
                </div>
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-teal-50 text-teal-700 ring-1 ring-teal-100">
                  <Icon size={22} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="card p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-950">Pending approvals and recent accounts</h2>
              <p className="mt-1 text-sm font-medium text-slate-500">Latest users that need monitoring or verification.</p>
            </div>
            <div className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700 ring-1 ring-amber-100">
              {pendingClients.length} pending clients
            </div>
          </div>

          <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.slice(0, 8).map((user) => (
                  <tr key={user.id} className="transition hover:bg-slate-50">
                    <td className="px-4 py-3 font-black text-slate-950">{user.name}</td>
                    <td className="px-4 py-3 font-semibold text-slate-600">{user.email}</td>
                    <td className="px-4 py-3 font-semibold capitalize text-slate-600">{user.userType}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black capitalize text-slate-700 ring-1 ring-slate-200">{user.status}</span>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-sm font-bold text-slate-500">No accounts found yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card p-5 sm:p-6">
          <h2 className="text-lg font-black text-slate-950">Yard Summary</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">Capacity snapshot based on configured yard data.</p>
          <div className="mt-5 space-y-3">
            {[
              { label: "Areas", value: yardSummary.areaCount },
              { label: "Area Capacity TEU", value: yardSummary.totalAreaCapacityTeu || 0 },
              { label: "Inventory Block TEU", value: yardSummary.totalTeuSlots || 0 },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-bold text-slate-500">{item.label}</div>
                <div className="mt-1 text-2xl font-black text-slate-950">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
