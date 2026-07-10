import { useState } from "react"
import { Eye, EyeOff, KeyRound, LockKeyhole, RefreshCw, ShieldCheck } from "lucide-react"
import Alert from "../components/Alert"
import { api, getApiError } from "../lib/api"
import { useAuth } from "../context/AuthContext"

const passwordInitialState = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
}

const ClientSettings = () => {
  const { user } = useAuth()
  const [form, setForm] = useState(passwordInitialState)
  const [showPasswords, setShowPasswords] = useState(false)
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState({ type: "", message: "" })

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      setLoading(true)
      setAlert({ type: "", message: "" })
      const { data } = await api.patch("/auth/change-password", form)
      setForm(passwordInitialState)
      setAlert({ type: "success", message: data.message || "Password changed successfully." })
    } catch (error) {
      setAlert({ type: "error", message: getApiError(error) })
    } finally {
      setLoading(false)
    }
  }

  const inputType = showPasswords ? "text" : "password"

  return (
    <div className="space-y-6">
      <Alert type={alert.type}>{alert.message}</Alert>

      <div className="card overflow-hidden">
        <div className="border-b border-slate-100 bg-gradient-to-br from-teal-50 via-white to-slate-50 p-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-wide text-teal-700 ring-1 ring-teal-100">
            <ShieldCheck size={14} /> Client Settings
          </div>
          <h1 className="mt-3 text-3xl font-black text-slate-950">Account Settings</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Manage your OTLI client account security. Use a strong password and avoid sharing your login access.
          </p>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[340px_1fr]">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-teal-100 text-teal-700">
              <KeyRound size={26} />
            </div>
            <h2 className="mt-4 text-xl font-black text-slate-950">Change Password</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              This updates the password for <span className="font-bold text-slate-800">{user?.email || "your client login"}</span>.
            </p>
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-800">
              For security, enter your current password before saving a new one.
            </div>
          </div>

          <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-950">Password Security</h3>
                <p className="mt-1 text-sm text-slate-500">Minimum 6 characters.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPasswords((current) => !current)}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-200"
              >
                {showPasswords ? <EyeOff size={15} /> : <Eye size={15} />}
                {showPasswords ? "Hide" : "Show"}
              </button>
            </div>

            <div className="mt-5 grid gap-4">
              <label className="block">
                <span className="text-sm font-black text-slate-700">Current Password</span>
                <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-teal-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-teal-100">
                  <LockKeyhole size={18} className="text-slate-400" />
                  <input
                    type={inputType}
                    name="currentPassword"
                    value={form.currentPassword}
                    onChange={handleChange}
                    className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                    placeholder="Enter current password"
                    autoComplete="current-password"
                    required
                  />
                </div>
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-black text-slate-700">New Password</span>
                  <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-teal-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-teal-100">
                    <KeyRound size={18} className="text-slate-400" />
                    <input
                      type={inputType}
                      name="newPassword"
                      value={form.newPassword}
                      onChange={handleChange}
                      className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                      placeholder="Enter new password"
                      autoComplete="new-password"
                      minLength={6}
                      required
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="text-sm font-black text-slate-700">Confirm New Password</span>
                  <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-teal-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-teal-100">
                    <KeyRound size={18} className="text-slate-400" />
                    <input
                      type={inputType}
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                      placeholder="Repeat new password"
                      autoComplete="new-password"
                      minLength={6}
                      required
                    />
                  </div>
                </label>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-end">
              <button type="button" onClick={() => setForm(passwordInitialState)} className="btn-secondary" disabled={loading}>
                Clear
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                {loading ? "Saving..." : "Change Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ClientSettings
