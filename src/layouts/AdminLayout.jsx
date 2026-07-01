import { useState } from "react"
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
  Menu,
  ReceiptText,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Truck,
  UsersRound,
  Warehouse,
  Workflow,
  X,
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
      { to: "/admin/bookings", label: "Booking Module", icon: CalendarClock },
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

const SidebarContent = ({ onNavigate }) => (
  <>
    <div className="border-b border-white/10 p-5">
      <div className="rounded-3xl border border-white/10 bg-white px-4 py-3 shadow-xl shadow-black/10">
        <img src="/images/otli-logo.webp" alt="OTLI" className="h-10 w-auto object-contain" />
      </div>
      <div className="mt-4">
        <div className="font-black text-white">OTLI Admin</div>
        <div className="text-xs font-semibold text-slate-400">Mega Port Terminal CMS</div>
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
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                      isActive
                        ? "bg-teal-500 text-white shadow-lg shadow-teal-950/30"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`
                  }
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/[0.08] transition group-hover:bg-white/[0.12]">
                    <Icon size={18} />
                  </span>
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                </NavLink>
              )
            })}
          </div>
        </div>
      ))}
    </nav>
  </>
)

const AdminLayout = () => {
  const navigate = useNavigate()
  const { user, token, logout } = useAuth()
  const { connected, events } = useSocket({ token, enabled: user?.userType === "admin" })
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/admin/login")
  }

  return (
    <div className="min-h-screen bg-slate-100 lg:grid lg:grid-cols-[304px_1fr]">
      <aside className="hidden border-r border-white/10 bg-slate-950 text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:overflow-hidden">
        <SidebarContent />
        <div className="border-t border-white/10 p-4">
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" aria-label="Close menu" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex h-full w-[86vw] max-w-[330px] flex-col overflow-hidden bg-slate-950 text-white shadow-2xl">
            <div className="absolute right-3 top-3 z-10">
              <button onClick={() => setMobileOpen(false)} className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 text-white">
                <X size={20} />
              </button>
            </div>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
            <div className="border-t border-white/10 p-4">
              <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-slate-300 hover:bg-white/10 hover:text-white">
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      <main className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/[0.85] px-4 py-3 shadow-sm shadow-slate-200/50 backdrop-blur-xl lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <button onClick={() => setMobileOpen(true)} className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-slate-100 text-slate-700 lg:hidden" aria-label="Open menu">
                <Menu size={20} />
              </button>
              <div className="min-w-0">
                <div className="text-xs font-black uppercase tracking-[0.18em] text-teal-700">Welcome back</div>
                <h1 className="truncate text-xl font-black text-slate-950">{user?.name || "Admin"}</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black ${connected ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200" : "bg-slate-200 text-slate-600"}`}>
                <BellRing size={14} />
                {connected ? "Live" : "Offline"}
              </span>
              <button onClick={handleLogout} className="btn-secondary hidden sm:inline-flex lg:hidden">Logout</button>
            </div>
          </div>
        </header>

        {events.length > 0 && (
          <div className="mx-4 mt-4 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-bold text-teal-800 shadow-sm lg:mx-8">
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
