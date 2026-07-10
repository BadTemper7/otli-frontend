import { useEffect, useMemo, useState } from "react"
import { NavLink, Outlet, useNavigate } from "react-router-dom"
import {
  Banknote,
  Bell,
  BellRing,
  Boxes,
  CalendarClock,
  CheckCheck,
  ClipboardCheck,
  ClipboardList,
  Circle,
  ExternalLink,
  GanttChartSquare,
  LayoutDashboard,
  LogOut,
  Menu,
  ReceiptText,
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
      { to: "/admin/storage-monitoring", label: "Storage Monitoring", icon: GanttChartSquare },
    ],
  },
  {
    label: "Billing and Release",
    items: [
      { to: "/admin/rate-setup", label: "Rate Setup", icon: ReceiptText },
      { to: "/admin/payment-verification", label: "Payment Verification", icon: Banknote },
      { to: "/admin/gate-out", label: "Gate-Out Module", icon: Truck },
    ],
  },
]

const permissionByPath = {
  "/admin/dashboard": "dashboard",
  "/admin/flow": "dashboard",
  "/admin/clients": "clientVerification",
  "/admin/accounts": "userManagement",
  "/admin/pre-advice": "preAdvice",
  "/admin/bookings": "bookings",
  "/admin/gate-in": "gateIn",
  "/admin/yard-areas": "yardSetup",
  "/admin/inventory": "inventory",
  "/admin/storage-monitoring": "storageMonitoring",
  "/admin/rate-setup": "rateSetup",
  "/admin/payment-verification": "paymentVerification",
  "/admin/gate-out": "gateOut",
}

const eventTitles = {
  "client:registered": "New client registration",
  "client:approved": "Client approved",
  "client:rejected": "Client rejected",
  "account:updated": "Account updated",
  "admin:user_created": "Admin user created",
  "admin:user_updated": "Admin user updated",
  "admin:user_deleted": "Admin user deleted",
  "billing_rate:created": "Billing rate created",
  "billing_rate:updated": "Billing rate updated",
  "billing_rate:deleted": "Billing rate deleted",
  "billing_rate:reference_applied": "Reference rates applied",
  "preAdvice:submitted": "Pre-advice submitted",
  "preAdvice:confirmed": "Pre-advice confirmed",
  "preAdvice:rejected": "Pre-advice rejected",
  "gateIn:completed": "Gate-in completed",
  "booking:submitted": "New booking submitted",
  "booking:resubmitted": "Booking resubmitted",
  "booking:approved": "Booking approved",
  "booking:rejected": "Booking rejected",
  "booking:gate_in_approved": "Booking gate-in approved",
  "booking:stored": "Container marked stored",
  "booking:billing_operation_updated": "Billing operation updated",
  "booking:payment_submitted": "Payment submitted",
  "booking:payment_approved": "Payment approved",
  "booking:payment_rejected": "Payment rejected",
  "booking:gate_out_requested": "Gate-out requested",
  "booking:gate_out_approved": "Gate-out approved",
  "booking:completed": "Gate-out completed",
  "booking:relocated": "Container relocated",
  "inventory:container_assigned": "Container assigned",
  "inventory:container_created": "Container added to inventory",
  "inventory:updated": "Inventory updated",
  "storage:updated": "Storage updated",
  "yard:area_created": "Yard area created",
  "yard:area_updated": "Yard area updated",
  "yard:area_deleted": "Yard area deleted",
  "yard:block_created": "Yard block created",
  "yard:block_updated": "Yard block updated",
  "yard:block_deleted": "Yard block deleted",
  "yard:slot_reserved": "Yard slot reserved",
  "yard:slot_released": "Yard slot released",
  "yard:slot_relocated": "Yard slot relocated",
}

const getNotificationTarget = (type) => {
  if (type.startsWith("client:")) return "/admin/clients"
  if (type.startsWith("admin:user") || type.startsWith("account:")) return "/admin/accounts"
  if (type.startsWith("billing_rate:")) return "/admin/rate-setup"
  if (type.startsWith("preAdvice:")) return "/admin/pre-advice"
  if (type.startsWith("gateIn:") || type === "booking:gate_in_approved") return "/admin/gate-in"
  if (type.includes("payment_")) return "/admin/payment-verification"
  if (type.includes("gate_out") || type === "booking:completed") return "/admin/gate-out"
  if (type === "booking:stored" || type === "booking:relocated" || type.startsWith("inventory:") || type.startsWith("storage:")) return "/admin/inventory"
  if (type.startsWith("yard:")) return "/admin/yard-areas"
  if (type.startsWith("booking:")) return "/admin/bookings"
  return "/admin/dashboard"
}

const getPayloadReference = (payload = {}) => {
  return (
    payload.bookingNumber ||
    payload.referenceNumber ||
    payload.containerNumber ||
    payload.companyName ||
    payload.name ||
    payload.email ||
    payload.description ||
    payload.chargeCode ||
    ""
  )
}

const buildNotification = (event) => {
  if (!event || event.type === "socket:connected") return null

  const title = eventTitles[event.type] || event.type.replace(/[:_]/g, " ")
  const reference = getPayloadReference(event.payload)

  return {
    id: `${event.type}-${event.time}-${Math.random().toString(16).slice(2)}`,
    type: event.type,
    title,
    message: reference ? `${title}: ${reference}` : title,
    to: getNotificationTarget(event.type),
    time: event.time,
    read: false,
  }
}

const formatTime = (isoDate) => {
  if (!isoDate) return "Just now"
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  }).format(new Date(isoDate))
}

const canOpenModule = (user, item) => {
  if (["super_admin", "admin"].includes(user?.role)) return true
  const moduleName = permissionByPath[item.to]
  if (!moduleName) return false
  return Boolean(user?.permissions?.[moduleName]?.view)
}

const SidebarContent = ({ user, onNavigate }) => {
  const visibleGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => canOpenModule(user, item)),
    }))
    .filter((group) => group.items.length > 0)

  return (
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
        {visibleGroups.map((group) => (
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
}

const AdminLayout = () => {
  const navigate = useNavigate()
  const { user, token, logout } = useAuth()
  const { connected, events } = useSocket({ token, enabled: user?.userType === "admin" })
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])

  const notificationStorageKey = useMemo(() => `otli_admin_notifications:${user?.id || "default"}`, [user?.id])
  const unreadCount = notifications.filter((notification) => !notification.read).length

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(notificationStorageKey) || "[]")
      setNotifications(Array.isArray(saved) ? saved.slice(0, 30) : [])
    } catch {
      setNotifications([])
    }
  }, [notificationStorageKey])

  useEffect(() => {
    localStorage.setItem(notificationStorageKey, JSON.stringify(notifications.slice(0, 30)))
  }, [notificationStorageKey, notifications])

  useEffect(() => {
    const latestEvent = events[0]
    const nextNotification = buildNotification(latestEvent)
    if (!nextNotification) return

    setNotifications((current) => [nextNotification, ...current].slice(0, 30))
  }, [events])

  const handleLogout = () => {
    logout()
    navigate("/admin/login")
  }

  const openNotification = (notification) => {
    setNotifications((current) => current.map((item) => (item.id === notification.id ? { ...item, read: true } : item)))
    setNotificationsOpen(false)
    navigate(notification.to)
  }

  const markAllRead = () => {
    setNotifications((current) => current.map((notification) => ({ ...notification, read: true })))
  }

  const clearNotifications = () => {
    setNotifications([])
    setNotificationsOpen(false)
  }

  return (
    <div className="min-h-screen bg-slate-100 lg:grid lg:grid-cols-[304px_1fr]">
      <aside className="hidden border-r border-white/10 bg-slate-950 text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:overflow-hidden">
        <SidebarContent user={user} />
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
            <SidebarContent user={user} onNavigate={() => setMobileOpen(false)} />
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
              <span className={`hidden items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black sm:inline-flex ${connected ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200" : "bg-slate-200 text-slate-600"}`}>
                <BellRing size={14} />
                {connected ? "Live" : "Offline"}
              </span>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNotificationsOpen((current) => !current)}
                  className="relative grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-950"
                  aria-label="Open admin notifications"
                >
                  <Bell size={19} />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1.5 text-[10px] font-black text-white ring-2 ring-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[calc(100vw-2rem)] max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/15">
                    <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-4">
                      <div>
                        <div className="text-sm font-black text-slate-950">Admin Notifications</div>
                        <div className="mt-0.5 text-xs font-semibold text-slate-500">Click an item to open its module.</div>
                      </div>
                      {notifications.length > 0 && (
                        <button type="button" onClick={markAllRead} className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-200">
                          <CheckCheck size={14} /> Read
                        </button>
                      )}
                    </div>

                    <div className="max-h-[420px] overflow-y-auto p-2">
                      {notifications.length === 0 ? (
                        <div className="grid place-items-center rounded-3xl bg-slate-50 px-5 py-10 text-center">
                          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-slate-400 shadow-sm">
                            <Bell size={22} />
                          </div>
                          <div className="mt-3 text-sm font-black text-slate-700">No notifications yet</div>
                          <div className="mt-1 max-w-xs text-xs font-semibold leading-5 text-slate-500">New bookings, payment submissions, gate-out requests, client registrations, and rate setup actions will appear here.</div>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <button
                            key={notification.id}
                            type="button"
                            onClick={() => openNotification(notification)}
                            className={`mb-2 flex w-full items-start gap-3 rounded-2xl p-3 text-left transition ${notification.read ? "bg-white hover:bg-slate-50" : "bg-teal-50 hover:bg-teal-100"}`}
                          >
                            <span className={`mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-xl ${notification.read ? "bg-slate-100 text-slate-400" : "bg-teal-600 text-white"}`}>
                              {notification.read ? <Circle size={13} /> : <BellRing size={15} />}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-black text-slate-950">{notification.title}</span>
                              <span className="mt-0.5 block truncate text-xs font-semibold text-slate-600">{notification.message}</span>
                              <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wide text-teal-700">
                                <ExternalLink size={12} /> {formatTime(notification.time)}
                              </span>
                            </span>
                          </button>
                        ))
                      )}
                    </div>

                    {notifications.length > 0 && (
                      <div className="border-t border-slate-100 p-3">
                        <button type="button" onClick={clearNotifications} className="w-full rounded-2xl px-3 py-2 text-sm font-black text-red-600 hover:bg-red-50">
                          Clear notifications
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button onClick={handleLogout} className="btn-secondary hidden sm:inline-flex lg:hidden">Logout</button>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default AdminLayout
