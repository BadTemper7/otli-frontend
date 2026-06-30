import { useEffect, useState } from "react"
import { Building2, MapPinned, ShieldCheck, UsersRound } from "lucide-react"
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

  const admins = users.filter((user) => user.userType === "admin")
  const clients = users.filter((user) => user.userType === "client")
  const pendingClients = clients.filter((user) => user.status === "pending" || user.status === "resubmitted")

  const cards = [
    { label: "Pending Bookings", value: bookingSummary.pending || 0, icon: ShieldCheck },
    { label: "Gate-Out Requests", value: bookingSummary.gateOutRequested || 0, icon: Building2 },
    { label: "Current Inventory", value: yardSummary.occupiedSlots || 0, icon: UsersRound },
    { label: "Available Yard Capacity", value: yardSummary.availableSlots || 0, icon: MapPinned },
  ]

  return (
    <div className="space-y-6">
      <Alert type="error">{error}</Alert>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-500">{card.label}</div>
                  <div className="mt-2 text-3xl font-black text-slate-950">{card.value}</div>
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-teal-700">
                  <Icon size={22} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="card p-5">
          <h2 className="text-lg font-black">Pending approvals and recent accounts</h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {users.slice(0, 8).map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-3 font-bold text-slate-950">{user.name}</td>
                    <td className="px-4 py-3 text-slate-600">{user.email}</td>
                    <td className="px-4 py-3 text-slate-600">{user.userType}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">{user.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-lg font-black">Yard Summary</h2>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm font-bold text-slate-500">Areas</div>
              <div className="mt-1 text-2xl font-black text-slate-950">{yardSummary.areaCount}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm font-bold text-slate-500">Area Capacity TEU</div>
              <div className="mt-1 text-2xl font-black text-slate-950">{yardSummary.totalAreaCapacityTeu || 0}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm font-bold text-slate-500">Inventory Block TEU</div>
              <div className="mt-1 text-2xl font-black text-slate-950">{yardSummary.totalTeuSlots || 0}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
