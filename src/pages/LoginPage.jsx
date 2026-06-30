import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { LockKeyhole } from "lucide-react"
import AuthShell from "../components/AuthShell"
import Alert from "../components/Alert"
import { useAuth } from "../context/AuthContext"
import { getApiError } from "../lib/api"

const LoginPage = ({ type = "admin" }) => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const isAdmin = type === "admin"

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError("")
    setLoading(true)

    try {
      const data = await login({ ...form, loginType: type })
      const nextUser = data?.user

      if (isAdmin) {
        navigate("/admin/dashboard")
        return
      }

      const isVerifiedClient = ["active", "verified"].includes(nextUser?.status)
      navigate(isVerifiedClient ? "/client/dashboard" : "/client/account-status")
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      eyebrow={isAdmin ? "Admin Login" : "Client Login"}
      title={isAdmin ? "Sign in to Admin" : "Sign in to Client Portal"}
      subtitle={isAdmin ? "Only dashboard-created admin accounts can access this portal." : "Login to check your account status. Bookings open after admin verification."}
    >
      <form onSubmit={handleSubmit} className="card space-y-4 p-5">
        <Alert type="error">{error}</Alert>

        <div>
          <label className="mb-1 block text-sm font-bold text-slate-700">Email address</label>
          <input
            className="input"
            type="email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            placeholder="name@example.com"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-bold text-slate-700">Password</label>
          <input
            className="input"
            type="password"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            placeholder="Enter your password"
            required
          />
        </div>

        <button className="btn-primary w-full" disabled={loading}>
          <LockKeyhole size={18} />
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <div className="flex items-center justify-between text-sm font-semibold">
          <Link className="text-teal-700 hover:text-teal-900" to={isAdmin ? "/admin/forgot-password" : "/client/forgot-password"}>
            Forgot password?
          </Link>
          {!isAdmin && (
            <Link className="text-teal-700 hover:text-teal-900" to="/client/register">
              Register client
            </Link>
          )}
        </div>
      </form>
    </AuthShell>
  )
}

export default LoginPage
