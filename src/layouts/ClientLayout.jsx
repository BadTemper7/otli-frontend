import { useEffect, useMemo, useState } from "react"
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import { Boxes, CalendarPlus, ChevronDown, Home, LogIn, LogOut, Settings, ShieldCheck, UserCircle, UserPlus } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { useSocket } from "../hooks/useSocket"

const verifiedClientLinks = [
  { to: "/bookings", label: "Make Booking", icon: CalendarPlus },
]

const pendingClientLinks = []

const publicLinks = [
  { to: "/", label: "Home", icon: Home },
  { to: "/booking-status", label: "Track Booking", icon: ShieldCheck },
]

const fullWidthRoutes = ["/", "/login", "/register", "/forgot-password"]
const isVerifiedClient = (status) => ["active", "verified"].includes(status)

const ClientLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, token, logout } = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)
  const { connected } = useSocket({ token, enabled: user?.userType === "client" })

  const isLoggedInClient = user?.userType === "client"
  const links = useMemo(() => {
    if (!isLoggedInClient) return publicLinks
    return [...publicLinks, ...(isVerifiedClient(user?.status) ? verifiedClientLinks : pendingClientLinks)]
  }, [isLoggedInClient, user?.status])

  const useFullWidth = fullWidthRoutes.includes(location.pathname)
  const profileName = user?.companyName || user?.name || user?.email || "Client"

  useEffect(() => {
    setProfileOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <nav className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/[0.92] shadow-sm shadow-slate-200/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <img src="/images/otli-logo.webp" alt="OTLI" className="h-9 w-auto object-contain" />
            </div>
            <div className="hidden min-w-0 sm:block">
              <div className="truncate font-black text-slate-950">One True Logistics Inc.</div>
              <div className="truncate text-xs font-semibold text-slate-500">Client Yard Booking Portal</div>
            </div>
          </Link>

          <div className="hidden items-center gap-2 overflow-x-auto lg:flex">
            {links.map((link) => {
              const Icon = link.icon
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === "/"}
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

          {!isLoggedInClient ? (
            <div className="flex items-center gap-2">
              <Link to="/register" className="hidden rounded-2xl px-4 py-2.5 text-sm font-black text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 sm:inline-flex">
                <UserPlus size={16} /> Register
              </Link>
              <Link to="/login" className="btn-primary !min-h-10 !rounded-2xl !px-4 !py-2.5 text-sm">
                <LogIn size={16} /> Login
              </Link>
            </div>
          ) : (
            <div className="relative flex items-center gap-2 sm:gap-3">
              <span className="hidden rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black capitalize text-slate-700 ring-1 ring-slate-200 sm:inline-flex">
                {user?.status || "pending"}
              </span>
              <span className={`hidden rounded-full px-3 py-1.5 text-xs font-black sm:inline-flex ${connected ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200" : "bg-slate-200 text-slate-600"}`}>
                {connected ? "Live" : "Offline"}
              </span>
              <button
                type="button"
                onClick={() => setProfileOpen((current) => !current)}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-950"
                aria-expanded={profileOpen}
              >
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-teal-50 text-teal-700">
                  <UserCircle size={19} />
                </span>
                <span className="hidden max-w-36 truncate md:inline">{profileName}</span>
                <ChevronDown size={16} className={`transition ${profileOpen ? "rotate-180" : ""}`} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-[calc(100%+0.65rem)] w-64 overflow-hidden rounded-3xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-900/12">
                  <div className="border-b border-slate-100 px-3 py-3">
                    <div className="truncate text-sm font-black text-slate-950">{profileName}</div>
                    <div className="mt-0.5 truncate text-xs font-semibold text-slate-500">{user?.email || "Client account"}</div>
                  </div>
                  <Link to="/profile" className="mt-2 flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">
                    <UserCircle size={17} /> Profile
                  </Link>
                  <Link to="/my-bookings" className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">
                    <Boxes size={17} /> Bookings
                  </Link>
                  <Link to="/settings" className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">
                    <Settings size={17} /> Settings
                  </Link>
                  <button type="button" onClick={handleLogout} className="mt-2 flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-bold text-red-600 transition hover:bg-red-50">
                    <LogOut size={17} /> Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 px-4 pb-3 pt-2 lg:hidden">
          <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto pb-1">
            {links.map((link) => {
              const Icon = link.icon
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === "/"}
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

      <main className={useFullWidth ? "min-h-[calc(100vh-73px)]" : "mx-auto max-w-7xl px-4 py-6 sm:py-8"}>
        <Outlet />
      </main>
    </div>
  )
}

export default ClientLayout
