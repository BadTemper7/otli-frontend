import { useEffect, useState } from "react"
import Alert from "../components/Alert"
import { api, getApiError } from "../lib/api"

const modules = [
  "dashboard",
  "userManagement",
  "roleAccess",
  "clientVerification",
  "accounts",
  "clients",
  "preAdvice",
  "bookings",
  "gateAppointment",
  "gateIn",
  "yardSetup",
  "inventory",
  "yardMap",
  "storageMonitoring",
  "rateSetup",
  "billing",
  "paymentVerification",
  "gateOut",
  "blacklist",
  "chargeHold",
  "reports",
  "auditTrail",
  "settings",
]
const actions = ["view", "create", "edit", "delete"]

const viewOnlyPermissions = modules.reduce((acc, moduleName) => {
  acc[moduleName] = { view: true, create: false, edit: false, delete: false }
  return acc
}, {})

const fullPermissions = modules.reduce((acc, moduleName) => {
  acc[moduleName] = { view: true, create: true, edit: true, delete: true }
  return acc
}, {})

const getPermissionsForRole = (role) => {
  if (["super_admin", "admin"].includes(role)) return fullPermissions
  return viewOnlyPermissions
}

const AdminAccounts = () => {
  const [users, setUsers] = useState([])
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "admin", permissions: fullPermissions })
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const loadAdmins = async () => {
    try {
      const { data } = await api.get("/admin/users?userType=admin")
      setUsers(data.users || [])
    } catch (err) {
      setError(getApiError(err))
    }
  }

  useEffect(() => {
    loadAdmins()
  }, [])

  const updatePermission = (moduleName, action, checked) => {
    setForm((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [moduleName]: {
          ...prev.permissions[moduleName],
          [action]: checked,
        },
      },
    }))
  }

  const createAdmin = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    try {
      const { data } = await api.post("/admin/users", form)
      setMessage(data.message)
      setForm({ name: "", email: "", password: "", role: "admin", permissions: fullPermissions })
      await loadAdmins()
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_520px]">
      <div className="card p-5">
        <h2 className="text-lg font-black">Admin accounts</h2>
        <p className="mt-1 text-sm text-slate-500">Only existing admins with permission can create new dashboard accounts.</p>

        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-3 font-bold">{user.name}</td>
                  <td className="px-4 py-3 text-slate-600">{user.email}</td>
                  <td className="px-4 py-3 text-slate-600">{user.role}</td>
                  <td className="px-4 py-3 text-slate-600">{user.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <form onSubmit={createAdmin} className="card space-y-4 p-5">
        <h2 className="text-lg font-black">Create admin</h2>
        <Alert type="success">{message}</Alert>
        <Alert type="error">{error}</Alert>

        <input className="input" placeholder="Full name" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} required />
        <input className="input" type="email" placeholder="Email" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} required />
        <input className="input" type="password" placeholder="Password" value={form.password} onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))} required />
        <select
          className="input"
          value={form.role}
          onChange={(event) => {
            const nextRole = event.target.value
            setForm((prev) => ({ ...prev, role: nextRole, permissions: getPermissionsForRole(nextRole) }))
          }}
        >
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
          <option value="super_admin">Super Admin</option>
        </select>

        {form.role === "admin" && (
          <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
            Admin accounts have full operational access to all active admin modules. Use Staff if you need limited module permissions.
          </div>
        )}

        {form.role === "staff" && (
          <div className="max-h-80 overflow-auto rounded-2xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2 text-left">Module</th>
                  {actions.map((action) => <th key={action} className="px-3 py-2 capitalize">{action}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {modules.map((moduleName) => (
                  <tr key={moduleName}>
                    <td className="px-3 py-2 font-bold">{moduleName}</td>
                    {actions.map((action) => (
                      <td key={action} className="px-3 py-2 text-center">
                        <input type="checkbox" checked={form.permissions[moduleName]?.[action] || false} onChange={(event) => updatePermission(moduleName, action, event.target.checked)} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button className="btn-primary w-full" disabled={loading}>{loading ? "Creating..." : "Create admin account"}</button>
      </form>
    </div>
  )
}

export default AdminAccounts
