import { useState } from "react"
import { Link } from "react-router-dom"
import { KeyRound, Mail } from "lucide-react"
import AuthShell from "../components/AuthShell"
import Alert from "../components/Alert"
import OtpInput from "../components/OtpInput"
import { api, getApiError } from "../lib/api"

const ForgotPasswordPage = ({ type = "admin" }) => {
  const [step, setStep] = useState("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const isAdmin = type === "admin"

  const requestOtp = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    try {
      const { data } = await api.post("/auth/forgot-password", { email })
      setMessage(data.message)
      setStep("reset")
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    try {
      const { data } = await api.post("/auth/reset-password", {
        email,
        otp,
        password,
        confirmPassword,
      })
      setMessage(data.message)
      setOtp("")
      setPassword("")
      setConfirmPassword("")
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      eyebrow={isAdmin ? "Admin Password" : "Client Password"}
      title="Reset your password"
      subtitle="Enter your email, then use the OTP sent to your inbox to create a new password."
    >
      <div className="card space-y-4 p-5">
        <Alert type="success">{message}</Alert>
        <Alert type="error">{error}</Alert>

        {step === "email" ? (
          <form onSubmit={requestOtp} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-bold text-slate-700">Email address</label>
              <input className="input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>
            <button className="btn-primary w-full" disabled={loading}>
              <Mail size={18} />
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={resetPassword} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">OTP code</label>
              <OtpInput value={otp} onChange={setOtp} disabled={loading} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold text-slate-700">New password</label>
              <input className="input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold text-slate-700">Confirm password</label>
              <input className="input" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
            </div>
            <button className="btn-primary w-full" disabled={loading || otp.length !== 6}>
              <KeyRound size={18} />
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        <Link className="block text-center text-sm font-bold text-teal-700 hover:text-teal-900" to={isAdmin ? "/admin/login" : "/client/login"}>
          Back to login
        </Link>
      </div>
    </AuthShell>
  )
}

export default ForgotPasswordPage
