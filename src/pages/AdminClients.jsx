import { useEffect, useState } from "react"
import Alert from "../components/Alert"
import { api, getApiError } from "../lib/api"

const statusClass = (status) => {
  if (status === "verified" || status === "active") return "bg-emerald-100 text-emerald-700"
  if (status === "pending" || status === "resubmitted") return "bg-amber-100 text-amber-700"
  if (status === "rejected") return "bg-red-100 text-red-700"
  return "bg-slate-100 text-slate-700"
}

const AdminClients = () => {
  const [clients, setClients] = useState([])
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [rejectReasons, setRejectReasons] = useState({})

  const loadClients = async () => {
    try {
      const { data } = await api.get("/admin/client-registrations")
      setClients(data.users || [])
    } catch (err) {
      setError(getApiError(err))
    }
  }

  useEffect(() => {
    loadClients()
  }, [])

  const verifyClient = async (id) => {
    setError("")
    setMessage("")
    try {
      const { data } = await api.patch(`/admin/clients/${id}/approve`)
      setMessage(data.message)
      await loadClients()
    } catch (err) {
      setError(getApiError(err))
    }
  }

  const rejectClient = async (id) => {
    setError("")
    setMessage("")
    const reason = rejectReasons[id] || ""

    if (!reason.trim()) {
      setError("Please add a rejection reason before rejecting the client.")
      return
    }

    try {
      const { data } = await api.patch(`/admin/clients/${id}/reject`, { reason })
      setMessage(data.message)
      setRejectReasons((prev) => ({ ...prev, [id]: "" }))
      await loadClients()
    } catch (err) {
      setError(getApiError(err))
    }
  }

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-sm font-black uppercase tracking-wide text-teal-700">Account Flow</div>
            <h2 className="mt-1 text-2xl font-black text-slate-950">Client Verification</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              After email OTP registration, client accounts stay pending verification until admin reviews the company information and uploaded documents.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-black text-slate-700">
            Pending: {clients.filter((client) => client.status === "pending" || client.status === "resubmitted").length}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <Alert type="success">{message}</Alert>
          <Alert type="error">{error}</Alert>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Representative</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Documents</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {clients.map((client) => (
                <tr key={client.id} className="align-top">
                  <td className="px-4 py-4">
                    <div className="font-black text-slate-950">{client.companyName}</div>
                    <div className="mt-1 text-xs font-semibold text-slate-500">{client.companyAddress}</div>
                    <div className="mt-1 text-xs font-semibold text-slate-500">{client.companyType}{client.companyTypeOther ? `, ${client.companyTypeOther}` : ""}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-bold text-slate-700">{client.name}</div>
                    <div className="mt-1 text-xs font-semibold text-slate-500">{client.representativePosition}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-semibold text-slate-600">{client.email}</div>
                    <div className="mt-1 text-xs font-semibold text-slate-500">{client.phoneNumber}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex max-w-[240px] flex-wrap gap-2">
                      {(client.documents || []).map((doc) => (
                        <a key={doc.publicId} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-teal-700 hover:bg-teal-50" href={doc.secureUrl || doc.url} target="_blank" rel="noreferrer">
                          {doc.label}
                        </a>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-black capitalize ${statusClass(client.status)}`}>{client.status}</span>
                    {client.rejectionReason && <div className="mt-2 max-w-[220px] text-xs font-semibold leading-5 text-red-600">Reason: {client.rejectionReason}</div>}
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-2">
                      <button className="w-full rounded-xl bg-emerald-600 px-3 py-2 text-xs font-black text-white disabled:opacity-50" disabled={client.status === "verified" || client.status === "active"} onClick={() => verifyClient(client.id)}>
                        Verify Account
                      </button>
                      <textarea
                        className="input min-h-[76px] !rounded-xl !p-3 text-xs"
                        placeholder="Rejection reason"
                        value={rejectReasons[client.id] || ""}
                        onChange={(event) => setRejectReasons((prev) => ({ ...prev, [client.id]: event.target.value }))}
                        disabled={client.status === "verified" || client.status === "active"}
                      />
                      <button className="w-full rounded-xl bg-red-600 px-3 py-2 text-xs font-black text-white disabled:opacity-50" disabled={client.status === "verified" || client.status === "active"} onClick={() => rejectClient(client.id)}>
                        Reject Account
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {clients.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-4 py-10 text-center font-bold text-slate-500">No client registrations found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminClients
