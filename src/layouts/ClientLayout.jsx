import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { Boxes, Gauge, LogOut, ShieldCheck } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { useSocket } from "../hooks/useSocket"

const verifiedClientLinks = [
  { to: "/client/dashboard", label: "Dashboard", icon: Gauge },
  { to: "/client/account-status", label: "Account Status", icon: ShieldCheck },
  { to: "/client/containers", label: "My Containers", icon: Boxes },
]

const pendingClientLinks = [
  { to: "/client/account-status", label: "Account Status", icon: ShieldCheck },
]

const isVerifiedClient = (status) => ["active", "verified"].includes(status)

const ClientLayout = () => {
  const navigate = useNavigate()
  const { user, token, logout } = useAuth()
  const { connected } = useSocket({ token, enabled: user?.userType === "client" })
  const links = isVerifiedClient(user?.status) ? verifiedClientLinks : pendingClientLinks

  const handleLogout = () => {
    logout()
    navigate("/client/login")
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <nav className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/[0.88] shadow-sm shadow-slate-200/50 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <img src="/images/otli-logo.webp" alt="OTLI" className="h-9 w-auto object-contain" />
            </div>
            <div className="hidden min-w-0 sm:block">
              <div className="truncate font-black text-slate-950">Client Portal</div>
              <div className="truncate text-xs font-semibold text-slate-500">{user?.companyName || user?.name}</div>
            </div>
          </div>

          <div className="hidden items-center gap-2 overflow-x-auto md:flex">
            {links.map((link) => {
              const Icon = link.icon
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-2 whitespace-nowrap rounded-2xl px-3.5 py-2.5 text-sm font-black transition ${
                      isActive ? "bg-teal-50 text-teal-700 ring-1 ring-teal-100" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                    }`
                  }
                >
                  <Icon size={16} />
                  {link.label}
                </NavLink>
              )
            })}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black capitalize text-slate-700 ring-1 ring-slate-200 sm:inline-flex">
              {user?.status || "pending"}
            </span>
            <span className={`rounded-full px-3 py-1.5 text-xs font-black ${connected ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200" : "bg-slate-200 text-slate-600"}`}>
              {connected ? "Live" : "Offline"}
            </span>
            <button onClick={handleLogout} className="btn-secondary !min-h-10 !rounded-2xl !px-3 !py-2">
              <LogOut size={17} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        <div className="border-t border-slate-100 px-4 pb-3 pt-2 md:hidden">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {links.map((link) => {
              const Icon = link.icon
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-2 whitespace-nowrap rounded-2xl px-3 py-2 text-xs font-black ${isActive ? "bg-teal-50 text-teal-700 ring-1 ring-teal-100" : "bg-slate-100 text-slate-600"}`
                  }
                >
                  <Icon size={14} />
                  {link.label}
                </NavLink>
              )
            })}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  )
}

export default ClientLayout
