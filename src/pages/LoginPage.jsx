import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react"
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
  const [showPassword, setShowPassword] = useState(false)

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
      title={isAdmin ? "Welcome back, admin" : "Welcome back"}
      subtitle={isAdmin ? "Sign in with your dashboard-created admin account to manage operations." : "Check account status, manage containers, and submit booking requests after approval."}
    >
      <form onSubmit={handleSubmit} className="card card-hover space-y-5 p-5 sm:p-6">
        <Alert type="error">{error}</Alert>

        <div className="rounded-3xl border border-teal-100 bg-teal-50/70 p-4 text-sm font-semibold leading-6 text-teal-900">
          {isAdmin ? "Admin access is limited to authorized OTLI team accounts." : "Use the email you submitted during client registration."}
        </div>

        <div>
          <label className="mb-2 block text-sm font-black text-slate-700">Email address</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              className="input !pl-11"
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              placeholder="name@example.com"
              autoComplete="email"
              required
            />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label className="block text-sm font-black text-slate-700">Password</label>
            <Link className="text-xs font-black text-teal-700 hover:text-teal-900" to={isAdmin ? "/admin/forgot-password" : "/client/forgot-password"}>
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              className="input !px-11"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button className="btn-primary w-full" disabled={loading}>
          <LockKeyhole size={18} />
          {loading ? "Signing in..." : "Sign in"}
        </button>

        {!isAdmin && (
          <div className="rounded-2xl bg-slate-50 p-4 text-center text-sm font-semibold text-slate-600">
            No company account yet?{" "}
            <Link className="font-black text-teal-700 hover:text-teal-900" to="/client/register">
              Register client
            </Link>
          </div>
        )}
      </form>
    </AuthShell>
  )
}

export default LoginPage
