import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const ProtectedRoute = ({ userType }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50">
        <div className="card px-6 py-5 text-sm font-semibold text-slate-600">Loading OTLI portal...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to={userType === "admin" ? "/admin/login" : "/client/login"} replace />
  }

  if (user.userType !== userType) {
    return <Navigate to={user.userType === "admin" ? "/admin/dashboard" : "/client/dashboard"} replace />
  }

  return <Outlet />
}

export default ProtectedRoute
