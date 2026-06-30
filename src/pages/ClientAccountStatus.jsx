import { useEffect, useMemo, useState } from "react"
import { AlertTriangle, CheckCircle2, Clock3, FileText, RefreshCw, XCircle } from "lucide-react"
import Alert from "../components/Alert"
import { useAuth } from "../context/AuthContext"
import { api, getApiError } from "../lib/api"

const statusDetails = {
  pending: {
    icon: Clock3,
    title: "Pending Admin Verification",
    badge: "bg-amber-50 text-amber-700 ring-amber-200",
    message: "Your email is verified and your application was submitted. Please wait while admin reviews your company details and uploaded documents.",
  },
  resubmitted: {
    icon: RefreshCw,
    title: "Resubmitted for Review",
    badge: "bg-blue-50 text-blue-700 ring-blue-200",
    message: "Your corrected application was resubmitted. Please wait for admin to review the updated details and documents.",
  },
  rejected: {
    icon: XCircle,
    title: "Application Rejected",
    badge: "bg-red-50 text-red-700 ring-red-200",
    message: "Your account was rejected by admin. Review the reason below, then contact admin or resubmit once the resubmission form is enabled.",
  },
  suspended: {
    icon: AlertTriangle,
    title: "Account Suspended",
    badge: "bg-slate-100 text-slate-700 ring-slate-200",
    message: "Your account is currently suspended. Please contact OTLI admin for assistance.",
  },
  verified: {
    icon: CheckCircle2,
    title: "Verified Account",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    message: "Your account is verified. You can now access the Booking module.",
  },
  active: {
    icon: CheckCircle2,
    title: "Active Account",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    message: "Your account is active. You can now access the Booking module.",
  },
}

const ClientAccountStatus = () => {
  const { user, refreshMe } = useAuth()
  const [serverStatus, setServerStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState({ type: "", message: "" })

  const currentUser = serverStatus?.user || user
  const canAccessBookings = serverStatus?.canAccessBookings ?? ["active", "verified"].includes(currentUser?.status)

  const details = useMemo(() => {
    return statusDetails[currentUser?.status] || statusDetails.pending
  }, [currentUser?.status])

  const Icon = details.icon

  const loadStatus = async () => {
    try {
      setLoading(true)
      setAlert({ type: "", message: "" })
      const { data } = await api.get("/client/account-status")
      setServerStatus(data)
      await refreshMe()
    } catch (error) {
      setAlert({ type: "error", message: getApiError(error) })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStatus()
  }, [])

  return (
    <div className="space-y-6">
      <div className="card overflow-hidden">
        <div className="border-b border-slate-100 bg-gradient-to-br from-teal-50 to-white p-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-wide text-teal-700 ring-1 ring-teal-100">
            <FileText size={14} />
            Client Account Status
          </div>
          <h1 className="mt-3 text-3xl font-black text-slate-950">{currentUser?.companyName || "Client Application"}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            You can login even while your account is waiting for verification. Operational modules will open after admin verifies your client account.
          </p>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[340px_1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <div className="flex items-start gap-4">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-teal-50 text-teal-700">
                <Icon size={26} />
              </div>
              <div>
                <div className={`inline-flex rounded-full px-3 py-1 text-xs font-black capitalize ring-1 ${details.badge}`}>
                  {currentUser?.status || "pending"}
                </div>
                <h2 className="mt-3 text-xl font-black text-slate-950">{details.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{details.message}</p>
              </div>
            </div>

            <button onClick={loadStatus} className="btn-secondary mt-5 w-full" disabled={loading}>
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              {loading ? "Checking..." : "Refresh status"}
            </button>
          </div>

          <div className="space-y-4">
            <Alert type={alert.type}>{alert.message}</Alert>

            {currentUser?.status === "rejected" && currentUser?.rejectionReason && (
              <Alert type="error">Rejection reason: {currentUser.rejectionReason}</Alert>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="text-xs font-black uppercase tracking-wide text-slate-500">Company</div>
                <div className="mt-2 text-lg font-black text-slate-950">{currentUser?.companyName || "-"}</div>
                <div className="mt-1 text-sm text-slate-600">{currentUser?.companyAddress || "No address saved"}</div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="text-xs font-black uppercase tracking-wide text-slate-500">Representative</div>
                <div className="mt-2 text-lg font-black text-slate-950">
                  {[currentUser?.representativeFirstName, currentUser?.representativeMiddleName, currentUser?.representativeLastName].filter(Boolean).join(" ") || currentUser?.name || "-"}
                </div>
                <div className="mt-1 text-sm text-slate-600">{currentUser?.representativePosition || "No position saved"}</div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="text-xs font-black uppercase tracking-wide text-slate-500">Module Access</div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div className={`rounded-2xl p-4 ${canAccessBookings ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>
                  <div className="font-black">Booking Module</div>
                  <div className="mt-1 text-sm font-semibold">{canAccessBookings ? "Available" : "Locked until account is verified"}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 text-slate-700">
                  <div className="font-black">Billing, Gate-Out, Containers</div>
                  <div className="mt-1 text-sm font-semibold">Available after approved operational transactions</div>
                </div>
              </div>
            </div>

            {canAccessBookings && (
              <a href="/client/bookings" className="btn-primary inline-flex">
                Go to Bookings
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClientAccountStatus
