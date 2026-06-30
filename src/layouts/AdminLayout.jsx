import { NavLink, Outlet, useNavigate } from "react-router-dom"
import {
  Banknote,
  BellRing,
  Boxes,
  CalendarClock,
  ClipboardCheck,
  ClipboardList,
  FileBarChart,
  Flag,
  GanttChartSquare,
  History,
  LayoutDashboard,
  LogOut,
  Map,
  ReceiptText,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Truck,
  UsersRound,
  Warehouse,
  Workflow,
} from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { useSocket } from "../hooks/useSocket"

const navGroups = [
  {
    label: "Main",
    items: [
      { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/admin/flow", label: "System Flow", icon: Workflow },
    ],
  },
  {
    label: "Accounts",
    items: [
      { to: "/admin/clients", label: "Client Verification", icon: ShieldCheck },
      { to: "/admin/accounts", label: "User Management", icon: UsersRound },
    ],
  },
  {
    label: "Operations",
    items: [
      { to: "/admin/pre-advice", label: "Pre-advice Module", icon: ClipboardList },
      { to: "/admin/gate-in", label: "Gate-In Module", icon: ClipboardCheck },
    ],
  },
  {
    label: "Yard CMS",
    items: [
      { to: "/admin/yard-areas", label: "Yard Area Setup", icon: Warehouse },
      { to: "/admin/inventory", label: "Inventory Module", icon: Boxes },
      { to: "/admin/yard-map", label: "Yard Map", icon: Map },
      { to: "/admin/storage-monitoring", label: "Storage Monitoring", icon: GanttChartSquare },
    ],
  },
  {
    label: "Billing and Release",
    items: [
      { to: "/admin/rate-setup", label: "Rate Setup", icon: ReceiptText },
      { to: "/admin/billing", label: "Billing Module", icon: Banknote },
      { to: "/admin/gate-out", label: "Gate-Out Module", icon: Truck },
    ],
  },
  {
    label: "Controls",
    items: [
      { to: "/admin/blacklist", label: "Blacklist", icon: ShieldAlert },
      { to: "/admin/charge-holds", label: "Charge Holds", icon: Flag },
      { to: "/admin/reports", label: "Reports", icon: FileBarChart },
      { to: "/admin/audit-trail", label: "Audit Trail", icon: History },
      { to: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
]

const AdminLayout = () => {
  const navigate = useNavigate()
  const { user, token, logout } = useAuth()
  const { connected, events } = useSocket({ token, enabled: user?.userType === "admin" })

  const handleLogout = () => {
    logout()
    navigate("/admin/login")
  }

  return (
    <div className="min-h-screen bg-slate-100 lg:grid lg:grid-cols-[300px_1fr]">
      <aside className="hidden border-r border-slate-200 bg-slate-950 text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:overflow-hidden">
        <div className="border-b border-white/10 p-6">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-teal-500 text-lg font-black">O</div>
            <div>
              <div className="font-black">OTLI Admin</div>
              <div className="text-xs text-slate-400">Mega Port Terminal CMS</div>
            </div>
          </div>
        </div>

        <nav className="admin-sidebar-scroll min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-4">
          {navGroups.map((group) => (
            <div key={group.label}>
              <div className="mb-2 px-4 text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">{group.label}</div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                          isActive ? "bg-teal-500 text-white" : "text-slate-300 hover:bg-white/10 hover:text-white"
                        }`
                      }
                    >
                      <Icon size={18} />
                      {item.label}
                    </NavLink>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-slate-300 hover:bg-white/10 hover:text-white">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <main className="min-w-0">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-slate-500">Welcome back</div>
              <h1 className="text-xl font-black text-slate-950">{user?.name}</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black ${connected ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                <BellRing size={14} />
                {connected ? "Live" : "Offline"}
              </span>
              <button onClick={handleLogout} className="btn-secondary lg:hidden">Logout</button>
            </div>
          </div>
        </header>

        {events.length > 0 && (
          <div className="mx-4 mt-4 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800 lg:mx-8">
            Latest update: {events[0].type}
          </div>
        )}

        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default AdminLayout
