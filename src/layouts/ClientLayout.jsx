import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { LogOut } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { useSocket } from "../hooks/useSocket"

const verifiedClientLinks = [
  { to: "/client/dashboard", label: "Dashboard" },
  { to: "/client/account-status", label: "Account Status" },
  { to: "/client/containers", label: "My Containers" },
]

const pendingClientLinks = [
  { to: "/client/account-status", label: "Account Status" },
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
      <nav className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-teal-700 text-lg font-black text-white">O</div>
            <div>
              <div className="font-black text-slate-950">OTLI Client Portal</div>
              <div className="text-xs font-semibold text-slate-500">{user?.companyName || user?.name}</div>
            </div>
          </div>

          <div className="hidden items-center gap-2 overflow-x-auto md:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-xl px-3 py-2 text-sm font-bold ${isActive ? "bg-teal-50 text-teal-700" : "text-slate-600 hover:bg-slate-100"}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-black capitalize text-slate-700 sm:inline-flex">
              {user?.status || "pending"}
            </span>
            <span className={`rounded-full px-3 py-1 text-xs font-black ${connected ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
              {connected ? "Live" : "Offline"}
            </span>
            <button onClick={handleLogout} className="btn-secondary !px-3">
              <LogOut size={17} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        <div className="border-t border-slate-100 px-4 pb-3 md:hidden">
          <div className="flex gap-2 overflow-x-auto">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-xl px-3 py-2 text-xs font-black ${isActive ? "bg-teal-50 text-teal-700" : "bg-slate-100 text-slate-600"}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}

export default ClientLayout
