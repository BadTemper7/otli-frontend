import { useEffect, useMemo, useState } from "react"
import { CreditCard, FileUp, Info, PackageCheck, RefreshCw, RotateCcw, Send, Truck, X } from "lucide-react"
import Alert from "../components/Alert"
import ModernFileInput from "../components/ModernFileInput"
import ModernDateInput from "../components/ModernDateInput"
import { api, getApiError } from "../lib/api"

const initialBookingForm = {
  containerNumber: "",
  containerSize: "20",
  containerType: "dry",
  containerLoadStatus: "empty",
  serviceType: "container_yard",
  shippingLine: "",
  truckPlateNumber: "",
  driverName: "",
  driverLicenseNumber: "",
  blNumber: "",
  vesselVoyage: "",
  cargoDescription: "",
  weight: "",
  inDate: "",
  clientRemarks: "",
}

const initialPaymentForm = {
  bookingId: "",
  paymentAmount: "",
  paymentDate: "",
  paymentRemarks: "",
}

const initialGateOutForm = {
  outDate: "",
  remarks: "",
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
  if (["completed_gate_out_done", "stored_in_assigned_area", "paid_approved"].includes(status)) return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
  if (["approved_area_assigned", "gate_in_approved", "gate_out_approved"].includes(status)) return "bg-blue-50 text-blue-700 ring-1 ring-blue-100"
  if (["rejected", "cancelled", "payment_rejected"].includes(status)) return "bg-red-50 text-red-700 ring-1 ring-red-100"
  return "bg-amber-50 text-amber-700 ring-1 ring-amber-100"
}

const Field = ({ label, children }) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">{label}</span>
    {children}
  </label>
)

const DetailItem = ({ label, value }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-3">
    <div className="text-[11px] font-black uppercase tracking-wide text-slate-400">{label}</div>
    <div className="mt-1 break-words text-sm font-bold text-slate-800">{value || "-"}</div>
  </div>
)

const formatDate = (value) => {
  if (!value) return "-"
  return new Date(value).toLocaleString()
}

const getBookingInDate = (booking = {}) => booking.inDate || booking.expectedArrivalDate
const getBookingOutDate = (booking = {}) => booking.outDate

const calculateStorageDays = (startValue, endValue) => {
  if (!startValue || !endValue) return 0
  const start = new Date(startValue)
  const end = new Date(endValue)
  const diffMs = end.getTime() - start.getTime()
  if (!Number.isFinite(diffMs) || diffMs <= 0) return 0
  return Math.max(Math.ceil(diffMs / (24 * 60 * 60 * 1000)), 1)
}

const PaymentModal = ({ booking, paymentForm, paymentFile, submitting, onClose, onSubmit, onFormChange, onFileChange }) => {
  if (!booking) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
      <form onSubmit={onSubmit} className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-950/20 sm:p-6">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-teal-700">
              <FileUp size={14} /> Payment Modal
            </div>
            <h2 className="mt-3 text-2xl font-black text-slate-950">Submit Payment Proof</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              {booking.bookingReference} • {booking.containerNumber}
            </p>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-950">
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4">
            <div className="text-xs font-black uppercase tracking-wide text-teal-700">Total Bill Before Payment</div>
            <div className="mt-1 text-2xl font-black text-slate-950">PHP {Number(booking.billingTotal || booking.paymentAmount || 0).toLocaleString()}</div>
            <div className="mt-1 text-xs font-bold text-slate-500">Computed from active Rate Setup before payment. Client cannot manually change this amount.</div>
            <div className="mt-3 rounded-xl bg-white/75 px-3 py-2 text-xs font-black text-slate-600">
              In: {formatDate(getBookingInDate(booking))} • Date Out: {formatDate(getBookingOutDate(booking))} • {booking.billingDays || calculateStorageDays(getBookingInDate(booking), getBookingOutDate(booking)) || 0} billing day(s)
            </div>
          </div>
          <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4">
            <div className="text-xs font-black uppercase tracking-wide text-teal-700">Reference Number</div>
            <div className="mt-1 text-sm font-bold text-slate-700">Auto-generated after submission</div>
          </div>
          {(booking.billingLineItems || []).length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
              <div className="text-xs font-black uppercase tracking-wide text-slate-500">Billing Breakdown</div>
              <div className="mt-3 space-y-2">
                {(booking.billingLineItems || []).map((item, index) => (
                  <div key={`${item.chargeCode}-${index}`} className="flex flex-col justify-between gap-1 rounded-xl bg-white px-3 py-2 text-sm font-bold text-slate-700 sm:flex-row">
                    <span>{item.description || item.chargeCode} • {item.quantity} x PHP {Number(item.rateAmount || 0).toLocaleString()}</span>
                    <span>PHP {Number(item.amount || 0).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <ModernDateInput
            label="Payment Date"
            name="paymentDate"
            type="date"
            value={paymentForm.paymentDate}
            onChange={(event) => onFormChange({ paymentDate: event.target.value })}
            required
          />
          <Field label="Remarks">
            <input className="input" value={paymentForm.paymentRemarks} onChange={(event) => onFormChange({ paymentRemarks: event.target.value })} placeholder="Optional" />
          </Field>
          <div className="md:col-span-2">
            <ModernFileInput
              name="paymentProof"
              label="Payment Proof"
              required
              file={paymentFile}
              onChange={onFileChange}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="btn-secondary" disabled={submitting}>Cancel</button>
          <button className="btn-primary" disabled={submitting}>
            <PackageCheck size={16} /> Submit Payment Proof
          </button>
        </div>
      </form>
    </div>
  )
}

const ClientBookings = ({ showCreateForm = true, mode }) => {
  const pageMode = mode || (showCreateForm ? "create" : "list")
  const isCreateMode = pageMode === "create"

  const [bookings, setBookings] = useState([])
  const [selectedBookingId, setSelectedBookingId] = useState("")
  const [form, setForm] = useState(initialBookingForm)
  const [resubmittingBookingId, setResubmittingBookingId] = useState("")
  const [paymentForm, setPaymentForm] = useState(initialPaymentForm)
  const [paymentFile, setPaymentFile] = useState(null)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [gateOutForm, setGateOutForm] = useState(initialGateOutForm)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [alert, setAlert] = useState({ type: "", message: "" })

  const selectedBooking = useMemo(() => bookings.find((booking) => booking.id === selectedBookingId) || bookings[0], [bookings, selectedBookingId])
  const selectedPaymentBooking = useMemo(() => bookings.find((booking) => booking.id === paymentForm.bookingId), [bookings, paymentForm.bookingId])

  const loadBookings = async () => {
    try {
      setLoading(true)
      const { data } = await api.get("/client/bookings")
      const nextBookings = data.bookings || []
      setBookings(nextBookings)
      setSelectedBookingId((current) => current || nextBookings[0]?.id || "")
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
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const submitBooking = async (event) => {
    event.preventDefault()
    setAlert({ type: "", message: "" })

    if (!form.inDate) {
      setAlert({ type: "error", message: "Please select a valid In Date." })
      return
    }

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
      formData.append("paymentDate", paymentForm.paymentDate)
      formData.append("paymentRemarks", paymentForm.paymentRemarks)
      if (paymentFile) formData.append("paymentProof", paymentFile)

      await api.post(`/client/bookings/${paymentForm.bookingId}/payment`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      setAlert({ type: "success", message: "Payment proof submitted. Please wait for admin verification." })
      setPaymentForm(initialPaymentForm)
      setPaymentFile(null)
      setPaymentModalOpen(false)
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
      serviceType: booking.serviceType || "container_yard",
      shippingLine: booking.shippingLine || "",
      truckPlateNumber: booking.truckPlateNumber || "",
      driverName: booking.driverName || "",
      driverLicenseNumber: booking.driverLicenseNumber || "",
      blNumber: booking.blNumber || "",
      vesselVoyage: booking.vesselVoyage || "",
      cargoDescription: booking.cargoDescription || "",
      weight: booking.weight || "",
      inDate: getBookingInDate(booking) ? new Date(getBookingInDate(booking)).toISOString().slice(0, 16) : "",
      clientRemarks: booking.clientRemarks || "",
    })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const cancelResubmit = () => {
    setResubmittingBookingId("")
    setForm(initialBookingForm)
  }

  const openPaymentModal = (booking) => {
    setPaymentForm({ ...initialPaymentForm, bookingId: booking.id })
    setPaymentFile(null)
    setPaymentModalOpen(true)
  }

  const requestGateOut = async (bookingId) => {
    setAlert({ type: "", message: "" })

    const booking = bookings.find((item) => item.id === bookingId)
    const days = calculateStorageDays(getBookingInDate(booking), gateOutForm.outDate)
    if (!days) {
      setAlert({ type: "error", message: "Please select a valid Date Out. Date Out must be later than the In Date." })
      return
    }

    try {
      setSubmitting(true)
      await api.post(`/client/bookings/${bookingId}/gate-out-request`, { outDate: gateOutForm.outDate, remarks: gateOutForm.remarks })
      setAlert({ type: "success", message: "Date Out submitted. Your final bill is ready for payment." })
      setGateOutForm(initialGateOutForm)
      await loadBookings()
    } catch (error) {
      setAlert({ type: "error", message: getApiError(error) })
    } finally {
      setSubmitting(false)
    }
  }

  const renderBookingForm = () => (
    <form onSubmit={submitBooking} className="card p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-950">{resubmittingBookingId ? "Resubmit Rejected Booking" : "New Booking Request"}</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">Enter the container, truck, and driver details for yard booking approval.</p>
        </div>
        {resubmittingBookingId && <button type="button" onClick={cancelResubmit} className="text-xs font-black uppercase text-slate-500 underline">Cancel resubmit</button>}
      </div>
      <div className="mt-5 grid gap-4">
        <Field label="Container Number">
          <input className="input uppercase" name="containerNumber" value={form.containerNumber} onChange={handleChange} placeholder="ABCD1234567" pattern="[A-Za-z]{4}[0-9]{7}" title="Container number must use 4 letters followed by 7 numbers, example: ABCD1234567." required />
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
          <ModernDateInput
            label="In Date"
            name="inDate"
            value={form.inDate}
            onChange={handleChange}
            required
            hint="Planned gate-in / start of storage"
          />
        </div>
        <div className="rounded-[1.15rem] border border-teal-100 bg-teal-50 p-4">
          <div className="text-xs font-black uppercase tracking-wide text-teal-700">Date Out</div>
          <div className="mt-1 text-sm font-bold text-slate-600">Date Out will be submitted later when you request Gate-Out from Account → Bookings.</div>
          <div className="mt-1 text-xs font-bold text-slate-500">The final bill will compute from In Date to Date Out before payment upload.</div>
        </div>
        <Field label="Service Type">
          <select className="input" name="serviceType" value={form.serviceType} onChange={handleChange} required>
            <option value="container_yard">Container Yard Operation</option>
            <option value="stripping_stuffing_mano">Stripping / Stuffing (with Mano)</option>
          </select>
        </Field>
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
            <input className="input" type="number" name="weight" min="0" step="0.01" value={form.weight} onChange={handleChange} />
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
  )

  const renderCreateMode = () => (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      {renderBookingForm()}
      <aside className="space-y-5">
        <div className="card p-5">
          <div className="flex items-center gap-2 text-sm font-black text-teal-700">
            <Info size={17} /> Booking Flow
          </div>
          <div className="mt-4 space-y-3 text-sm font-semibold text-slate-600">
            <div className="rounded-2xl bg-slate-50 p-4">1. Submit the booking request with In Date only.</div>
            <div className="rounded-2xl bg-slate-50 p-4">2. Admin reviews the request and assigns yard area.</div>
            <div className="rounded-2xl bg-slate-50 p-4">3. Track booking status from Account → Bookings.</div>
            <div className="rounded-2xl bg-slate-50 p-4">4. When the container is ready for release, submit Date Out from Account → Bookings to compute the final bill.</div>
            <div className="rounded-2xl bg-slate-50 p-4">5. Add payment after Date Out is submitted and the final bill is shown.</div>
          </div>
        </div>
      </aside>
    </div>
  )

  const renderBookingDetails = () => {
    if (!selectedBooking) {
      return <div className="card p-6 text-sm font-semibold text-slate-500">Select a booking to view details.</div>
    }

    const computedBillingAmount = Number(selectedBooking.billingTotal || selectedBooking.paymentAmount || 0)
    const canPay = ["gate_out_requested", "gate_out_approved"].includes(selectedBooking.status) && computedBillingAmount > 0 && ["unpaid", "payment_rejected"].includes(selectedBooking.billingStatus)
    const canRequestGateOut = selectedBooking.status === "stored_in_assigned_area" && selectedBooking.billingStatus === "unpaid"

    return (
      <div className="card p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-sm font-black text-slate-500">{selectedBooking.bookingReference}</div>
            <h2 className="mt-1 text-2xl font-black text-slate-950">{selectedBooking.containerNumber}</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              {selectedBooking.containerSize}ft • {selectedBooking.containerType?.replace("_", " ")} • {selectedBooking.serviceType === "stripping_stuffing_mano" ? "Stripping / Stuffing with Mano" : "Container Yard Operation"} • {selectedBooking.shippingLine}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-black ${statusClass(selectedBooking.status)}`}>{statusLabels[selectedBooking.status] || selectedBooking.status}</span>
            <span className={`rounded-full px-3 py-1 text-xs font-black ${statusClass(selectedBooking.billingStatus)}`}>{billingLabels[selectedBooking.billingStatus] || selectedBooking.billingStatus}</span>
          </div>
        </div>

        {selectedBooking.rejectionReason && <div className="mt-4"><Alert type="error">Rejected: {selectedBooking.rejectionReason}</Alert></div>}
        {selectedBooking.paymentRejectionReason && <div className="mt-4"><Alert type="error">Payment rejected: {selectedBooking.paymentRejectionReason}</Alert></div>}

        <div className="mt-5 grid gap-3 rounded-3xl bg-slate-50 p-4 md:grid-cols-2 xl:grid-cols-3">
          <DetailItem label="Booking No." value={selectedBooking.bookingNumber || "Generated after approval"} />
          <DetailItem label="Area" value={selectedBooking.assignedAreaName || "Pending"} />
          <DetailItem label="Slot" value={selectedBooking.assignedSlotNumber || "Pending"} />
          <DetailItem label="Truck Plate" value={selectedBooking.truckPlateNumber} />
          <DetailItem label="Driver" value={selectedBooking.driverName} />
          <DetailItem label="Driver License" value={selectedBooking.driverLicenseNumber} />
          <DetailItem label="In Date" value={formatDate(getBookingInDate(selectedBooking))} />
          <DetailItem label="Requested Date Out" value={formatDate(getBookingOutDate(selectedBooking))} />
          <DetailItem label="Billing Days" value={selectedBooking.billingDays || calculateStorageDays(getBookingInDate(selectedBooking), getBookingOutDate(selectedBooking)) || "Pending Date Out"} />
          <DetailItem label="Gate-In" value={formatDate(selectedBooking.gateInApprovedAt)} />
          <DetailItem label="Stored" value={formatDate(selectedBooking.storedAt)} />
          <DetailItem label="BL Number" value={selectedBooking.blNumber} />
          <DetailItem label="Vessel / Voyage" value={selectedBooking.vesselVoyage} />
          <DetailItem label="Weight" value={selectedBooking.weight} />
          <DetailItem label="Service Type" value={selectedBooking.serviceType === "stripping_stuffing_mano" ? "Stripping / Stuffing with Mano" : "Container Yard Operation"} />
        </div>

        <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-4">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <div className="text-xs font-black uppercase tracking-wide text-slate-400">Total Bill Before Payment</div>
              <div className="mt-1 text-2xl font-black text-slate-950">PHP {Number(selectedBooking.billingTotal || selectedBooking.paymentAmount || 0).toLocaleString()}</div>
            </div>
            <div className="text-xs font-bold text-slate-500">Visible before payment after Date Out is submitted. Computed from Rate Setup {selectedBooking.billingComputedAt ? `on ${formatDate(selectedBooking.billingComputedAt)}` : "after gate-out request"}</div>
          </div>
          {(selectedBooking.billingLineItems || []).length > 0 && (
            <div className="mt-3 space-y-2">
              {(selectedBooking.billingLineItems || []).map((item, index) => (
                <div key={`${item.chargeCode}-${index}`} className="flex flex-col justify-between gap-1 rounded-2xl bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 sm:flex-row">
                  <span>{item.description || item.chargeCode} • {item.quantity} x PHP {Number(item.rateAmount || 0).toLocaleString()}</span>
                  <span>PHP {Number(item.amount || 0).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedBooking.qrCodeValue && (
          <div className="mt-4 rounded-2xl border border-teal-100 bg-teal-50 p-4 text-sm">
            <div className="text-xs font-black uppercase tracking-wide text-teal-700">Booking QR Value</div>
            <div className="mt-1 break-all font-black text-slate-900">{selectedBooking.qrCodeValue}</div>
          </div>
        )}

        <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:flex-wrap sm:items-center">
          {selectedBooking.status === "rejected" && (
            <button type="button" onClick={() => startResubmit(selectedBooking)} className="btn-secondary">
              <RotateCcw size={16} /> Edit and Resubmit
            </button>
          )}
          {canPay && (
            <button type="button" onClick={() => openPaymentModal(selectedBooking)} className="btn-primary">
              <CreditCard size={16} /> Add Payment
            </button>
          )}
          {canRequestGateOut && (
            <div className="grid w-full gap-3 rounded-3xl border border-teal-100 bg-teal-50 p-4 sm:grid-cols-[minmax(220px,1fr)_minmax(220px,1fr)_auto] sm:items-end">
              <ModernDateInput
                label="Date Out"
                name="outDate"
                value={gateOutForm.outDate}
                onChange={(event) => setGateOutForm((current) => ({ ...current, outDate: event.target.value }))}
                min={getBookingInDate(selectedBooking) ? new Date(getBookingInDate(selectedBooking)).toISOString().slice(0, 16) : undefined}
                required
                hint="Used to compute final storage bill"
              />
              <Field label="Gate-Out Remarks">
                <input className="input" placeholder="Optional" value={gateOutForm.remarks} onChange={(event) => setGateOutForm((current) => ({ ...current, remarks: event.target.value }))} />
              </Field>
              <button type="button" onClick={() => requestGateOut(selectedBooking.id)} className="btn-primary" disabled={submitting}>
                <Truck size={16} /> Submit Date Out
              </button>
            </div>
          )}
          {!canPay && !canRequestGateOut && selectedBooking.status === "stored_in_assigned_area" && selectedBooking.billingStatus !== "paid_approved" && (
            <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">
              Submit Date Out first from the Gate-Out request section to compute the final bill before payment.
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderListMode = () => (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <div className="card p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-black text-slate-950">Booking List</h2>
          <button type="button" onClick={loadBookings} className="btn-secondary !min-h-10 !px-3" disabled={loading}>
            <RefreshCw size={16} />
          </button>
        </div>
        <div className="mt-5 space-y-3">
          {bookings.length === 0 && !loading && <div className="rounded-2xl bg-slate-50 p-5 text-sm font-semibold text-slate-500">No bookings yet.</div>}
          {bookings.map((booking) => (
            <button
              key={booking.id}
              type="button"
              onClick={() => setSelectedBookingId(booking.id)}
              className={`w-full rounded-3xl border p-4 text-left transition ${selectedBooking?.id === booking.id ? "border-teal-200 bg-teal-50 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-black text-slate-500">{booking.bookingReference}</div>
                  <div className="mt-1 text-base font-black text-slate-950">{booking.containerNumber}</div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${statusClass(booking.status)}`}>{statusLabels[booking.status] || booking.status}</span>
              </div>
              <div className="mt-2 text-xs font-semibold text-slate-500">{booking.containerSize}ft • {booking.shippingLine || "Shipping line pending"}</div>
              <div className="mt-1 text-xs font-semibold text-slate-500">In: {formatDate(getBookingInDate(booking))} • Date Out: {formatDate(getBookingOutDate(booking))}</div>
              <div className="mt-3 text-xs font-black text-slate-500">Billing: <span className="text-slate-800">{billingLabels[booking.billingStatus] || booking.billingStatus}</span></div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {resubmittingBookingId && renderBookingForm()}
        {renderBookingDetails()}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="card overflow-hidden p-6">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-500 via-cyan-400 to-blue-500" />
        <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-teal-700">
          <Truck size={14} /> {isCreateMode ? "Client Booking" : "Account Bookings"}
        </div>
        <h1 className="mt-3 text-3xl font-black text-slate-950">{isCreateMode ? "Create New Yard Booking" : "My Bookings and Statuses"}</h1>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
          {isCreateMode
            ? "Use this page to create a booking request. To view booking status, payment, and gate-out actions, open Account → Bookings from the profile dropdown."
            : "Select a booking to view full details. Add Payment opens as a modal once the container is stored and the billing status is unpaid or payment was rejected."}
        </p>
      </div>

      <Alert type={alert.type}>{alert.message}</Alert>

      {isCreateMode ? renderCreateMode() : renderListMode()}

      {paymentModalOpen && (
        <PaymentModal
          booking={selectedPaymentBooking}
          paymentForm={paymentForm}
          paymentFile={paymentFile}
          submitting={submitting}
          onClose={() => setPaymentModalOpen(false)}
          onSubmit={submitPayment}
          onFormChange={(patch) => setPaymentForm((current) => ({ ...current, ...patch }))}
          onFileChange={(event) => setPaymentFile(event.target.files?.[0] || null)}
        />
      )}
    </div>
  )
}

export default ClientBookings
