import { useEffect, useMemo, useState } from "react"
import { CreditCard, FileUp, PackageCheck, RefreshCw, RotateCcw, Send, Truck } from "lucide-react"
import Alert from "../components/Alert"
import { api, getApiError } from "../lib/api"

const initialBookingForm = {
  containerNumber: "",
  containerSize: "20",
  containerType: "dry",
  containerLoadStatus: "empty",
  shippingLine: "",
  truckPlateNumber: "",
  driverName: "",
  driverLicenseNumber: "",
  blNumber: "",
  vesselVoyage: "",
  cargoDescription: "",
  weight: "",
  expectedArrivalDate: "",
  clientRemarks: "",
}

const statusLabels = {
  pending_admin_approval: "Pending Admin Approval",
  approved_area_assigned: "Approved / Area Assigned",
  rejected: "Rejected",
  gate_in_approved: "Gate-In Approved",
  stored_in_assigned_area: "Stored in Assigned Area",
  gate_out_requested: "Gate-Out Requested",
  gate_out_approved: "Gate-Out Approved",
  completed_gate_out_done: "Completed / Gate-Out Done",
  cancelled: "Cancelled",
}

const billingLabels = {
  unpaid: "Unpaid",
  payment_submitted: "Payment Submitted",
  payment_under_review: "Payment Under Review",
  payment_rejected: "Payment Rejected",
  paid_approved: "Paid / Approved",
}

const statusClass = (status) => {
  if (["completed_gate_out_done", "stored_in_assigned_area", "paid_approved"].includes(status)) return "bg-emerald-50 text-emerald-700"
  if (["approved_area_assigned", "gate_in_approved", "gate_out_approved"].includes(status)) return "bg-blue-50 text-blue-700"
  if (["rejected", "cancelled", "payment_rejected"].includes(status)) return "bg-red-50 text-red-700"
  return "bg-amber-50 text-amber-700"
}

const Field = ({ label, children }) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">{label}</span>
    {children}
  </label>
)

const formatDate = (value) => {
  if (!value) return "-"
  return new Date(value).toLocaleString()
}

const ClientBookings = ({ showCreateForm = true }) => {
  const [bookings, setBookings] = useState([])
  const [form, setForm] = useState(initialBookingForm)
  const [resubmittingBookingId, setResubmittingBookingId] = useState("")
  const [paymentForm, setPaymentForm] = useState({ bookingId: "", paymentAmount: "", paymentReferenceNumber: "", paymentDate: "", paymentRemarks: "" })
  const [paymentFile, setPaymentFile] = useState(null)
  const [gateOutRemarks, setGateOutRemarks] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [alert, setAlert] = useState({ type: "", message: "" })

  const eligiblePaymentBookings = useMemo(() => bookings.filter((booking) => booking.status === "stored_in_assigned_area" && ["unpaid", "payment_rejected"].includes(booking.billingStatus)), [bookings])
  const selectedPaymentBooking = useMemo(() => eligiblePaymentBookings.find((booking) => booking.id === paymentForm.bookingId), [eligiblePaymentBookings, paymentForm.bookingId])

  const loadBookings = async () => {
    try {
      setLoading(true)
      const { data } = await api.get("/client/bookings")
      setBookings(data.bookings || [])
      const eligible = (data.bookings || []).find((booking) => booking.status === "stored_in_assigned_area" && ["unpaid", "payment_rejected"].includes(booking.billingStatus))
      if (!paymentForm.bookingId && eligible) {
        setPaymentForm((current) => ({ ...current, bookingId: eligible.id }))
      }
    } catch (error) {
      setAlert({ type: "error", message: getApiError(error) })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBookings()
  }, [])

  useEffect(() => {
    const handleRealtime = (event) => {
      const eventType = event.detail?.type || ""
      if (!eventType.startsWith("booking:")) return
      loadBookings()
    }

    window.addEventListener("otli:realtime", handleRealtime)
    return () => window.removeEventListener("otli:realtime", handleRealtime)
  }, [paymentForm.bookingId])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const submitBooking = async (event) => {
    event.preventDefault()
    setAlert({ type: "", message: "" })

    try {
      setSubmitting(true)
      if (resubmittingBookingId) {
        await api.patch(`/client/bookings/${resubmittingBookingId}/resubmit`, form)
        setAlert({ type: "success", message: "Booking resubmitted. Admin will review and re-assign the yard location." })
      } else {
        await api.post("/client/bookings", form)
        setAlert({ type: "success", message: "Booking submitted. Please wait for admin approval and area assignment." })
      }
      setForm(initialBookingForm)
      setResubmittingBookingId("")
      await loadBookings()
    } catch (error) {
      setAlert({ type: "error", message: getApiError(error) })
    } finally {
      setSubmitting(false)
    }
  }

  const submitPayment = async (event) => {
    event.preventDefault()
    setAlert({ type: "", message: "" })

    if (!paymentForm.bookingId) {
      setAlert({ type: "error", message: "Select a booking before submitting payment." })
      return
    }

    try {
      setSubmitting(true)
      const formData = new FormData()
      formData.append("paymentAmount", paymentForm.paymentAmount)
      formData.append("paymentReferenceNumber", paymentForm.paymentReferenceNumber)
      formData.append("paymentDate", paymentForm.paymentDate)
      formData.append("paymentRemarks", paymentForm.paymentRemarks)
      if (paymentFile) formData.append("paymentProof", paymentFile)

      await api.post(`/client/bookings/${paymentForm.bookingId}/payment`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      setAlert({ type: "success", message: "Payment proof submitted. Please wait for admin verification." })
      setPaymentForm({ bookingId: paymentForm.bookingId, paymentAmount: "", paymentReferenceNumber: "", paymentDate: "", paymentRemarks: "" })
      setPaymentFile(null)
      event.target.reset()
      await loadBookings()
    } catch (error) {
      setAlert({ type: "error", message: getApiError(error) })
    } finally {
      setSubmitting(false)
    }
  }

  const startResubmit = (booking) => {
    setResubmittingBookingId(booking.id)
    setForm({
      containerNumber: booking.containerNumber || "",
      containerSize: String(booking.containerSize || "20"),
      containerType: booking.containerType || "dry",
      containerLoadStatus: booking.containerLoadStatus || "empty",
      shippingLine: booking.shippingLine || "",
      truckPlateNumber: booking.truckPlateNumber || "",
      driverName: booking.driverName || "",
      driverLicenseNumber: booking.driverLicenseNumber || "",
      blNumber: booking.blNumber || "",
      vesselVoyage: booking.vesselVoyage || "",
      cargoDescription: booking.cargoDescription || "",
      weight: booking.weight || "",
      expectedArrivalDate: booking.expectedArrivalDate ? new Date(booking.expectedArrivalDate).toISOString().slice(0, 16) : "",
      clientRemarks: booking.clientRemarks || "",
    })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const cancelResubmit = () => {
    setResubmittingBookingId("")
    setForm(initialBookingForm)
  }

  const requestGateOut = async (bookingId) => {
    setAlert({ type: "", message: "" })

    try {
      setSubmitting(true)
      await api.post(`/client/bookings/${bookingId}/gate-out-request`, { remarks: gateOutRemarks })
      setAlert({ type: "success", message: "Gate-out request submitted. Please wait for admin approval." })
      setGateOutRemarks("")
      await loadBookings()
    } catch (error) {
      setAlert({ type: "error", message: getApiError(error) })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-teal-700">
          <Truck size={14} /> {showCreateForm ? "Client Booking" : "My Containers"}
        </div>
        <h1 className="mt-3 text-3xl font-black text-slate-950">{showCreateForm ? "Container Yard Booking" : "Container Status, Payment, and Gate-Out"}</h1>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
          {showCreateForm
            ? "Submit a booking request with container, truck, and driver details. Admin will check yard capacity, assign an area, then update the booking through Gate-In, storage, billing, Gate-Out, and completion."
            : "Track your containers. Add Payment is shown only once the container is stored in inventory. Gate-Out Request becomes available only after payment is Paid / Approved."}
        </p>
      </div>

      <Alert type={alert.type}>{alert.message}</Alert>

      <div className={showCreateForm ? "grid gap-6 xl:grid-cols-[480px_1fr]" : "grid gap-6"}>
        {showCreateForm && (
        <form onSubmit={submitBooking} className="card p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-black text-slate-950">{resubmittingBookingId ? "Resubmit Rejected Booking" : "New Booking Request"}</h2>
            {resubmittingBookingId && <button type="button" onClick={cancelResubmit} className="text-xs font-black uppercase text-slate-500 underline">Cancel resubmit</button>}
          </div>
          <div className="mt-5 grid gap-4">
            <Field label="Container Number">
              <input className="input uppercase" name="containerNumber" value={form.containerNumber} onChange={handleChange} placeholder="ABCD1234567" required />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Container Size">
                <select className="input" name="containerSize" value={form.containerSize} onChange={handleChange} required>
                  <option value="20">20ft</option>
                  <option value="40">40ft</option>
                  <option value="45">45ft</option>
                </select>
              </Field>
              <Field label="Container Type">
                <select className="input" name="containerType" value={form.containerType} onChange={handleChange} required>
                  <option value="dry">Dry</option>
                  <option value="reefer">Reefer</option>
                  <option value="tank">Tank</option>
                  <option value="open_top">Open Top</option>
                  <option value="flat_rack">Flat Rack</option>
                </select>
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Load Status">
                <select className="input" name="containerLoadStatus" value={form.containerLoadStatus} onChange={handleChange}>
                  <option value="empty">Empty</option>
                  <option value="laden">Laden</option>
                </select>
              </Field>
              <Field label="Expected Arrival Date">
                <input className="input" type="datetime-local" name="expectedArrivalDate" value={form.expectedArrivalDate} onChange={handleChange} required />
              </Field>
            </div>
            <Field label="Shipping Line">
              <input className="input" name="shippingLine" value={form.shippingLine} onChange={handleChange} required />
            </Field>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-black uppercase tracking-wide text-slate-500">Driver and Truck Details</div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Truck Plate Number">
                  <input className="input uppercase" name="truckPlateNumber" value={form.truckPlateNumber} onChange={handleChange} placeholder="ABC 1234" required />
                </Field>
                <Field label="Driver Name">
                  <input className="input" name="driverName" value={form.driverName} onChange={handleChange} placeholder="Driver full name" required />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Driver License Number">
                    <input className="input" name="driverLicenseNumber" value={form.driverLicenseNumber} onChange={handleChange} placeholder="Optional" />
                  </Field>
                </div>
              </div>
            </div>
            <Field label="BL Number">
              <input className="input" name="blNumber" value={form.blNumber} onChange={handleChange} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Vessel / Voyage">
                <input className="input" name="vesselVoyage" value={form.vesselVoyage} onChange={handleChange} />
              </Field>
              <Field label="Weight">
                <input className="input" type="number" name="weight" value={form.weight} onChange={handleChange} />
              </Field>
            </div>
            <Field label="Cargo Description">
              <textarea className="input min-h-[86px]" name="cargoDescription" value={form.cargoDescription} onChange={handleChange} />
            </Field>
            <Field label="Remarks">
              <textarea className="input min-h-[86px]" name="clientRemarks" value={form.clientRemarks} onChange={handleChange} />
            </Field>
            <button className="btn-primary" disabled={submitting}>
              <Send size={17} /> {resubmittingBookingId ? "Resubmit Booking" : "Submit Booking"}
            </button>
          </div>
        </form>
        )}

        <div className="space-y-6">
          <div className="card p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-black text-slate-950">My Bookings</h2>
              <button type="button" onClick={loadBookings} className="btn-secondary !px-3" disabled={loading}>
                <RefreshCw size={16} /> Refresh
              </button>
            </div>
            <div className="mt-5 space-y-4">
              {bookings.length === 0 && !loading && <div className="rounded-2xl bg-slate-50 p-5 text-sm font-semibold text-slate-500">No bookings yet.</div>}
              {bookings.map((booking) => {
                const canPay = booking.status === "stored_in_assigned_area" && ["unpaid", "payment_rejected"].includes(booking.billingStatus)
                const canGateOut = booking.status === "stored_in_assigned_area" && booking.billingStatus === "paid_approved"

                return (
                  <div key={booking.id} className="rounded-3xl border border-slate-200 bg-white p-5">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="text-sm font-black text-slate-500">{booking.bookingReference}</div>
                        <div className="mt-1 text-xl font-black text-slate-950">{booking.containerNumber}</div>
                        <div className="mt-1 text-sm font-semibold text-slate-500">{booking.containerSize}ft • {booking.containerType?.replace("_", " ")} • {booking.shippingLine}</div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className={`rounded-full px-3 py-1 text-xs font-black ${statusClass(booking.status)}`}>{statusLabels[booking.status] || booking.status}</span>
                        <span className={`rounded-full px-3 py-1 text-xs font-black ${statusClass(booking.billingStatus)}`}>{billingLabels[booking.billingStatus] || booking.billingStatus}</span>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm md:grid-cols-3">
                      <div><span className="font-black text-slate-500">Booking No.:</span> {booking.bookingNumber || "Generated after approval"}</div>
                      <div><span className="font-black text-slate-500">Area:</span> {booking.assignedAreaName || "Pending"}</div>
                      <div><span className="font-black text-slate-500">Slot:</span> {booking.assignedSlotNumber || "Pending"}</div>
                      <div><span className="font-black text-slate-500">Truck Plate:</span> {booking.truckPlateNumber || "-"}</div>
                      <div><span className="font-black text-slate-500">Driver:</span> {booking.driverName || "-"}</div>
                      <div><span className="font-black text-slate-500">Driver License:</span> {booking.driverLicenseNumber || "-"}</div>
                      <div><span className="font-black text-slate-500">Expected Arrival:</span> {formatDate(booking.expectedArrivalDate)}</div>
                      <div><span className="font-black text-slate-500">Gate-In:</span> {formatDate(booking.gateInApprovedAt)}</div>
                      <div><span className="font-black text-slate-500">Stored:</span> {formatDate(booking.storedAt)}</div>
                    </div>

                    {booking.qrCodeValue && (
                      <div className="mt-4 rounded-2xl border border-teal-100 bg-teal-50 p-4 text-sm">
                        <div className="text-xs font-black uppercase tracking-wide text-teal-700">Booking QR Value</div>
                        <div className="mt-1 break-all font-black text-slate-900">{booking.qrCodeValue}</div>
                      </div>
                    )}

                    {booking.rejectionReason && <Alert type="error">Rejected: {booking.rejectionReason}</Alert>}
                    {booking.paymentRejectionReason && <div className="mt-3"><Alert type="error">Payment rejected: {booking.paymentRejectionReason}</Alert></div>}

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      {booking.status === "rejected" && (
                        <button type="button" onClick={() => startResubmit(booking)} className="btn-secondary">
                          <RotateCcw size={16} /> Edit and Resubmit
                        </button>
                      )}
                      {canPay && (
                        <button type="button" onClick={() => setPaymentForm((current) => ({ ...current, bookingId: booking.id }))} className="btn-secondary">
                          <CreditCard size={16} /> Add Payment
                        </button>
                      )}
                      {canGateOut && (
                        <button type="button" onClick={() => requestGateOut(booking.id)} className="btn-primary" disabled={submitting}>
                          <Truck size={16} /> Request Gate-Out
                        </button>
                      )}
                      {!canPay && !canGateOut && booking.status === "stored_in_assigned_area" && booking.billingStatus !== "paid_approved" && (
                        <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">Payment is already submitted or under review. Gate-Out is locked until payment is Paid / Approved.</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {selectedPaymentBooking ? (
          <form onSubmit={submitPayment} className="card p-5">
            <div className="flex items-center gap-2">
              <FileUp size={18} className="text-teal-700" />
              <h2 className="text-lg font-black text-slate-950">Submit Payment Proof</h2>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="Booking">
                <select className="input" value={paymentForm.bookingId} onChange={(event) => setPaymentForm((current) => ({ ...current, bookingId: event.target.value }))}>
                  <option value="">Select booking</option>
                  {eligiblePaymentBookings.map((booking) => (
                    <option key={booking.id} value={booking.id}>{booking.bookingReference} • {booking.containerNumber}</option>
                  ))}
                </select>
              </Field>
              <Field label="Payment Amount">
                <input className="input" type="number" value={paymentForm.paymentAmount} onChange={(event) => setPaymentForm((current) => ({ ...current, paymentAmount: event.target.value }))} required />
              </Field>
              <Field label="Reference Number">
                <input className="input" value={paymentForm.paymentReferenceNumber} onChange={(event) => setPaymentForm((current) => ({ ...current, paymentReferenceNumber: event.target.value }))} required />
              </Field>
              <Field label="Payment Date">
                <input className="input" type="date" value={paymentForm.paymentDate} onChange={(event) => setPaymentForm((current) => ({ ...current, paymentDate: event.target.value }))} />
              </Field>
              <Field label="Payment Proof">
                <input className="input" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx" onChange={(event) => setPaymentFile(event.target.files?.[0] || null)} required />
              </Field>
              <Field label="Remarks">
                <input className="input" value={paymentForm.paymentRemarks} onChange={(event) => setPaymentForm((current) => ({ ...current, paymentRemarks: event.target.value }))} />
              </Field>
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button className="btn-primary" disabled={submitting || !selectedPaymentBooking}>
                <PackageCheck size={16} /> Submit Payment Proof
              </button>
              <input className="input sm:max-w-md" placeholder="Optional gate-out remarks" value={gateOutRemarks} onChange={(event) => setGateOutRemarks(event.target.value)} />
            </div>
          </form>
          ) : (
            <div className="card p-5">
              <div className="flex items-center gap-2">
                <FileUp size={18} className="text-teal-700" />
                <h2 className="text-lg font-black text-slate-950">Submit Payment Proof</h2>
              </div>
              <div className="mt-4 rounded-2xl bg-slate-50 p-5 text-sm font-semibold text-slate-500">
                Add Payment will show once a container is stored in inventory and billing is unpaid or payment was rejected.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ClientBookings
