import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const verifiedStatuses = ["active", "verified"]

const ClientVerifiedRoute = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50">
        <div className="card px-6 py-5 text-sm font-semibold text-slate-600">Loading OTLI portal...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/client/login" replace />
  }

  if (user.userType !== "client") {
    return <Navigate to="/admin/dashboard" replace />
  }

  if (!verifiedStatuses.includes(user.status)) {
    return <Navigate to="/client/account-status" replace />
  }

  return <Outlet />
}

export default ClientVerifiedRoute
