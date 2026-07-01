import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Building2, CheckCircle2, FileText, FileUp, LockKeyhole, Mail, UserRound } from "lucide-react"
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

  const validateBeforeOtp = () => {
    const requiredFields = [
      ["Company name", form.companyName],
      ["Company address", form.companyAddress],
      ["Phone number", form.phoneNumber],
      ["Representative first name", form.representativeFirstName],
      ["Representative last name", form.representativeLastName],
      ["Representative position", form.representativePosition],
      ["Email", form.email],
      ["Password", form.password],
      ["Confirm password", form.confirmPassword],
    ]

    const missingField = requiredFields.find(([, value]) => !String(value || "").trim())
    if (missingField) {
      return `${missingField[0]} is required before sending OTP.`
    }

    if (form.companyType === "other" && !form.companyTypeOther.trim()) {
      return "Other company type is required."
    }

    if (form.password.length < 6) {
      return "Password must be at least 6 characters."
    }

    if (form.password !== form.confirmPassword) {
      return "Password and confirm password do not match."
    }

    const missingDocument = documentFields.find((item) => item.required && !files[item.name])
    if (missingDocument) {
      return `${missingDocument.label} is required before sending OTP.`
    }

    return ""
  }

  const requestOtp = async (event) => {
    event.preventDefault()
    setError("")
    setMessage("")

    const validationError = validateBeforeOtp()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)

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
        const isVerifiedClient = ["active", "verified"].includes(data.user.status)
        navigate(isVerifiedClient ? "/client/dashboard" : "/client/account-status", { replace: true })
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
      subtitle="Complete the company profile, upload requirements, then verify your email using the OTP code."
      wide
    >
      <div className="card card-hover space-y-5 p-5 sm:p-6">
        <Alert type="success">{message}</Alert>
        <Alert type="error">{error}</Alert>

        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { label: "Company details", active: step === "form", icon: Building2 },
            { label: "Email verification", active: step === "otp", icon: Mail },
          ].map((item, index) => {
            const Icon = item.icon
            return (
              <div key={item.label} className={`rounded-2xl border p-4 ${item.active ? "border-teal-200 bg-teal-50 text-teal-900" : "border-slate-200 bg-slate-50 text-slate-500"}`}>
                <div className="flex items-center gap-3">
                  <div className={`grid h-9 w-9 place-items-center rounded-xl ${item.active ? "bg-teal-600 text-white" : "bg-white text-slate-500"}`}>
                    <Icon size={17} />
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase tracking-wide">Step {index + 1}</div>
                    <div className="text-sm font-black">{item.label}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {step === "form" ? (
          <form onSubmit={requestOtp} className="space-y-5">
            <section className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
              <div className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-wide text-slate-500">
                <Building2 size={16} />
                Company Details
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-black text-slate-700">Company name</label>
                  <input className="input" value={form.companyName} onChange={(event) => updateField("companyName", event.target.value)} required />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-black text-slate-700">Company address</label>
                  <input className="input" value={form.companyAddress} onChange={(event) => updateField("companyAddress", event.target.value)} required />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-black text-slate-700">Company type</label>
                  <select className="input" value={form.companyType} onChange={(event) => updateField("companyType", event.target.value)}>
                    <option value="trucking">Trucking</option>
                    <option value="shipping">Shipping</option>
                    <option value="brokerage">Brokerage</option>
                    <option value="forwarder">Forwarder</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-black text-slate-700">Phone number</label>
                  <input className="input" value={form.phoneNumber} onChange={(event) => updateField("phoneNumber", event.target.value)} placeholder="09XXXXXXXXX" required />
                </div>
                {form.companyType === "other" && (
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-black text-slate-700">Other company type</label>
                    <input className="input" value={form.companyTypeOther} onChange={(event) => updateField("companyTypeOther", event.target.value)} required />
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5">
              <div className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-wide text-slate-500">
                <UserRound size={16} />
                Representative
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <input className="input" placeholder="First name" value={form.representativeFirstName} onChange={(event) => updateField("representativeFirstName", event.target.value)} required />
                <input className="input" placeholder="Middle name" value={form.representativeMiddleName} onChange={(event) => updateField("representativeMiddleName", event.target.value)} />
                <input className="input" placeholder="Last name" value={form.representativeLastName} onChange={(event) => updateField("representativeLastName", event.target.value)} required />
                <input className="input" placeholder="Position" value={form.representativePosition} onChange={(event) => updateField("representativePosition", event.target.value)} required />
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5">
              <div className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-wide text-slate-500">
                <LockKeyhole size={16} />
                Login Details
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <input className="input sm:col-span-2" type="email" placeholder="Email address" value={form.email} onChange={(event) => updateField("email", event.target.value)} required />
                <input className="input" type="password" placeholder="Password" value={form.password} onChange={(event) => updateField("password", event.target.value)} required />
                <input className="input" type="password" placeholder="Confirm password" value={form.confirmPassword} onChange={(event) => updateField("confirmPassword", event.target.value)} required />
              </div>
              <p className="mt-3 text-xs font-semibold text-slate-500">Password must be at least 6 characters.</p>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
              <div className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-wide text-slate-500">
                <FileUp size={16} />
                Documents
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {documentFields.map((item) => {
                  const selectedFile = files[item.name]
                  return (
                    <label key={item.name} className="group block cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-white p-4 transition hover:border-teal-300 hover:bg-teal-50/50">
                      <div className="flex items-start gap-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500 group-hover:bg-teal-100 group-hover:text-teal-700">
                          <FileText size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-black text-slate-700">
                            {item.label} {item.required && <span className="text-red-600">*</span>}
                          </div>
                          <div className="mt-1 truncate text-xs font-semibold text-slate-500">
                            {selectedFile ? selectedFile.name : "PDF, DOC, JPG, PNG, or WEBP"}
                          </div>
                        </div>
                      </div>
                      <input
                        className="sr-only"
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                        required={item.required}
                        onChange={(event) => setFiles((prev) => ({ ...prev, [item.name]: event.target.files?.[0] }))}
                      />
                    </label>
                  )
                })}
              </div>
            </section>

            <button className="btn-primary w-full" disabled={loading}>
              <Mail size={18} />
              {loading ? "Submitting..." : "Submit and Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOtp} className="space-y-5">
            <div className="rounded-3xl border border-teal-200 bg-teal-50 p-5 text-sm font-semibold leading-6 text-teal-900">
              OTP was sent to <span className="font-black">{form.email}</span>. Enter the 6-digit code to finish your registration.
            </div>
            <OtpInput value={otp} onChange={setOtp} disabled={loading} />
            <button className="btn-primary w-full" disabled={loading || otp.length !== 6}>
              <CheckCircle2 size={18} />
              {loading ? "Verifying..." : "Verify Registration"}
            </button>
            <div className="grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => setStep("form")} className="btn-secondary w-full" disabled={loading}>
                <ArrowLeft size={17} />
                Edit details
              </button>
              <button type="button" onClick={resendOtp} className="btn-secondary w-full" disabled={loading}>
                Resend OTP
              </button>
            </div>
          </form>
        )}

        <Link className="block text-center text-sm font-black text-teal-700 hover:text-teal-900" to="/client/login">
          Already registered? Login
        </Link>
      </div>
    </AuthShell>
  )
}

export default ClientRegisterPage
