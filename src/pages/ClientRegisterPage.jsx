import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { CheckCircle2, FileUp, Mail } from "lucide-react"
import AuthShell from "../components/AuthShell"
import Alert from "../components/Alert"
import OtpInput from "../components/OtpInput"
import { api, getApiError } from "../lib/api"
import { useAuth } from "../context/AuthContext"

const initialForm = {
  companyName: "",
  companyAddress: "",
  companyType: "trucking",
  companyTypeOther: "",
  phoneNumber: "",
  representativeFirstName: "",
  representativeMiddleName: "",
  representativeLastName: "",
  representativePosition: "",
  email: "",
  password: "",
  confirmPassword: "",
}

const documentFields = [
  { name: "businessPermit", label: "Business Permit", required: true },
  { name: "birCertificate", label: "BIR Certificate", required: true },
  { name: "validId", label: "Valid ID", required: true },
  { name: "authorizationLetter", label: "Authorization Letter", required: false },
  { name: "otherDocument", label: "Other Document", required: false },
]

const ClientRegisterPage = () => {
  const navigate = useNavigate()
  const { saveSession } = useAuth()
  const [step, setStep] = useState("form")
  const [form, setForm] = useState(initialForm)
  const [files, setFiles] = useState({})
  const [otp, setOtp] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const requestOtp = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    try {
      const data = new FormData()
      Object.entries(form).forEach(([key, value]) => data.append(key, value))
      Object.entries(files).forEach(([key, file]) => {
        if (file) data.append(key, file)
      })

      const response = await api.post("/auth/client/register/request-otp", data, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      setMessage(response.data.message)
      setStep("otp")
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    try {
      const { data } = await api.post("/auth/client/register/verify-otp", {
        email: form.email,
        otp,
      })

      setMessage(data.message)

      if (data.token && data.user) {
        saveSession({ token: data.token, user: data.user })
        navigate("/client/dashboard")
      }
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setLoading(false)
    }
  }

  const resendOtp = async () => {
    setLoading(true)
    setError("")
    setMessage("")

    try {
      const { data } = await api.post("/auth/client/register/resend-otp", { email: form.email })
      setMessage(data.message)
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Client Registration"
      title="Register your company"
      subtitle="Submit your company details and required documents. Email OTP verification is required before review."
    >
      <div className="card space-y-4 p-5">
        <Alert type="success">{message}</Alert>
        <Alert type="error">{error}</Alert>

        {step === "form" ? (
          <form onSubmit={requestOtp} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-bold text-slate-700">Company name</label>
                <input className="input" value={form.companyName} onChange={(event) => updateField("companyName", event.target.value)} required />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-bold text-slate-700">Company address</label>
                <input className="input" value={form.companyAddress} onChange={(event) => updateField("companyAddress", event.target.value)} required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold text-slate-700">Company type</label>
                <select className="input" value={form.companyType} onChange={(event) => updateField("companyType", event.target.value)}>
                  <option value="trucking">Trucking</option>
                  <option value="shipping">Shipping</option>
                  <option value="brokerage">Brokerage</option>
                  <option value="forwarder">Forwarder</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold text-slate-700">Phone number</label>
                <input className="input" value={form.phoneNumber} onChange={(event) => updateField("phoneNumber", event.target.value)} required />
              </div>
              {form.companyType === "other" && (
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-bold text-slate-700">Other company type</label>
                  <input className="input" value={form.companyTypeOther} onChange={(event) => updateField("companyTypeOther", event.target.value)} />
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 pt-4">
              <div className="mb-3 text-sm font-black uppercase tracking-wide text-slate-500">Representative</div>
              <div className="grid gap-4 sm:grid-cols-2">
                <input className="input" placeholder="First name" value={form.representativeFirstName} onChange={(event) => updateField("representativeFirstName", event.target.value)} required />
                <input className="input" placeholder="Middle name" value={form.representativeMiddleName} onChange={(event) => updateField("representativeMiddleName", event.target.value)} />
                <input className="input" placeholder="Last name" value={form.representativeLastName} onChange={(event) => updateField("representativeLastName", event.target.value)} required />
                <input className="input" placeholder="Position" value={form.representativePosition} onChange={(event) => updateField("representativePosition", event.target.value)} required />
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <div className="mb-3 text-sm font-black uppercase tracking-wide text-slate-500">Login details</div>
              <div className="grid gap-4 sm:grid-cols-2">
                <input className="input sm:col-span-2" type="email" placeholder="Email address" value={form.email} onChange={(event) => updateField("email", event.target.value)} required />
                <input className="input" type="password" placeholder="Password" value={form.password} onChange={(event) => updateField("password", event.target.value)} required />
                <input className="input" type="password" placeholder="Confirm password" value={form.confirmPassword} onChange={(event) => updateField("confirmPassword", event.target.value)} required />
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-wide text-slate-500">
                <FileUp size={16} />
                Documents
              </div>
              <div className="space-y-3">
                {documentFields.map((item) => (
                  <label key={item.name} className="block rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-3">
                    <div className="text-sm font-bold text-slate-700">{item.label} {item.required && <span className="text-red-600">*</span>}</div>
                    <input
                      className="mt-2 block w-full text-sm"
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                      required={item.required}
                      onChange={(event) => setFiles((prev) => ({ ...prev, [item.name]: event.target.files?.[0] }))}
                    />
                  </label>
                ))}
              </div>
            </div>

            <button className="btn-primary w-full" disabled={loading}>
              <Mail size={18} />
              {loading ? "Submitting..." : "Submit and Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOtp} className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              OTP was sent to <span className="font-black text-slate-950">{form.email}</span>. Enter it below to finish your registration.
            </div>
            <OtpInput value={otp} onChange={setOtp} disabled={loading} />
            <button className="btn-primary w-full" disabled={loading || otp.length !== 6}>
              <CheckCircle2 size={18} />
              {loading ? "Verifying..." : "Verify Registration"}
            </button>
            <button type="button" onClick={resendOtp} className="btn-secondary w-full" disabled={loading}>
              Resend OTP
            </button>
          </form>
        )}

        <Link className="block text-center text-sm font-bold text-teal-700 hover:text-teal-900" to="/client/login">
          Already registered? Login
        </Link>
      </div>
    </AuthShell>
  )
}

export default ClientRegisterPage
