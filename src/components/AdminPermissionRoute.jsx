import { Link } from "react-router-dom"
import { LockKeyhole } from "lucide-react"
import { useAuth } from "../context/AuthContext"

const AdminPermissionRoute = ({ moduleName, action = "view", children }) => {
  const { user } = useAuth()

  if (["super_admin", "admin"].includes(user?.role)) return children

  const allowed = Boolean(user?.permissions?.[moduleName]?.[action])
  if (allowed) return children

  return (
    <div className="card grid min-h-[520px] place-items-center p-8 text-center">
      <div className="max-w-md">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-amber-50 text-amber-700">
          <LockKeyhole size={28} />
        </div>
        <h1 className="mt-5 text-2xl font-black text-slate-950">Module access needed</h1>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
          Your staff account does not have permission to open this admin module. Ask a Super Admin or Admin to update your module access.
        </p>
        <Link to="/admin/dashboard" className="btn-primary mt-5 inline-flex">Back to Dashboard</Link>
      </div>
    </div>
  )
}

export default AdminPermissionRoute
