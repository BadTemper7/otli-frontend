import { useEffect, useMemo, useState } from "react"
import {
  Banknote,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  CreditCard,
  MapPinned,
  PackageCheck,
  RefreshCw,
  Search,
  ShieldX,
  Truck,
  Warehouse,
} from "lucide-react"
import Alert from "../components/Alert"
import { api, getApiError } from "../lib/api"

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

const moduleConfig = {
  preAdvice: {
    badge: "Pre-advice Module",
    title: "Booking Approval and Yard Assignment",
    description:
      "This is where the admin reviews client booking requests, checks available yard capacity, and assigns the container to an area, block, bay, row, and tier before approval.",
    icon: ClipboardList,
    defaultStatus: "pending_admin_approval",
    defaultBillingStatus: "all",
    primarySection: "approval",
    queueTitle: "Pending Client Bookings",
  },
  gateIn: {
    badge: "Gate-In Module",
    title: "Gate-In Verification and Inspection",
    description:
      "This is where gate staff checks booking details, assigned location, truck and driver details, physical container condition, and approves gate-in.",
    icon: Truck,
    defaultStatus: "approved_area_assigned",
    defaultBillingStatus: "all",
    primarySection: "gateIn",
    queueTitle: "Bookings Ready for Gate-In",
  },
  billing: {
    badge: "Billing Module",
    title: "Payment Review and Billing Verification",
    description:
      "This is where admin reviews payment proof submitted by the client. Billing status is separate from booking status.",
    icon: Banknote,
    defaultStatus: "all",
    defaultBillingStatus: "payment_submitted",
    primarySection: "billing",
    queueTitle: "Payments for Review",
  },
  gateOut: {
    badge: "Gate-Out Module",
    title: "Gate-Out Request and Release Approval",
    description:
      "This is where admin reviews client gate-out requests, confirms payment approval, checks for holds, approves release, and completes gate-out.",
    icon: PackageCheck,
    defaultStatus: "gate_out_requested",
    defaultBillingStatus: "all",
    primarySection: "gateOut",
    queueTitle: "Gate-Out Requests",
  },
}

const statusClass = (status) => {
  if (["stored_in_assigned_area", "completed_gate_out_done", "paid_approved"].includes(status)) return "bg-emerald-50 text-emerald-700"
  if (["approved_area_assigned", "gate_in_approved", "gate_out_approved"].includes(status)) return "bg-blue-50 text-blue-700"
  if (["rejected", "cancelled", "payment_rejected"].includes(status)) return "bg-red-50 text-red-700"
  return "bg-amber-50 text-amber-700"
}

const formatDate = (value) => {
  if (!value) return "-"
  return new Date(value).toLocaleString()
}

const Field = ({ label, children, hint }) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">{label}</span>
    {children}
    {hint && <span className="mt-1 block text-xs font-semibold text-slate-400">{hint}</span>}
  </label>
)

const initialGateIn = {
  actualContainerNumber: "",
  physicalCondition: "Good",
  sealNumber: "",
  truckPlateNumber: "",
  driverName: "",
  driverLicenseNumber: "",
  inspectionRemarks: "",
}

const AdminBookingModule = ({ mode }) => {
  const config = moduleConfig[mode] || moduleConfig.preAdvice
  const HeaderIcon = config.icon

  const [bookings, setBookings] = useState([])
  const [areas, setAreas] = useState([])
  const [blocks, setBlocks] = useState([])
  const [slotAvailability, setSlotAvailability] = useState([])
  const [selectedId, setSelectedId] = useState("")
  const [filters, setFilters] = useState({ status: config.defaultStatus, billingStatus: config.defaultBillingStatus, search: "" })
  const [approval, setApproval] = useState({ areaId: "", blockId: "", bay: 1, row: 1, tier: 1 })
  const [gateIn, setGateIn] = useState(initialGateIn)
  const [rejectReason, setRejectReason] = useState("")
  const [paymentRejectReason, setPaymentRejectReason] = useState("")
  const [remarks, setRemarks] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState({ type: "", message: "" })

  const selectedBooking = useMemo(() => bookings.find((booking) => booking.id === selectedId) || bookings[0] || null, [bookings, selectedId])
  const selectedBlock = useMemo(() => blocks.find((block) => block.id === approval.blockId), [blocks, approval.blockId])
  const usableBlocks = useMemo(() => blocks.filter((block) => !selectedBooking || Number(block.containerSize) === Number(selectedBooking.containerSize)), [blocks, selectedBooking])
  const unavailableSlotKeys = useMemo(() => new Set(slotAvailability.map((slot) => slot.key)), [slotAvailability])
  const selectedSlotKey = `${approval.bay || 1}-${approval.row || 1}-${approval.tier || 1}`
  const selectedSlotTaken = approval.blockId ? unavailableSlotKeys.has(selectedSlotKey) : false
  const bayOptions = useMemo(() => Array.from({ length: selectedBlock?.bayCount || selectedBlock?.lineCount || 1 }, (_, index) => index + 1), [selectedBlock])
  const rowOptions = useMemo(() => Array.from({ length: selectedBlock?.rowCount || 1 }, (_, index) => index + 1), [selectedBlock])
  const tierOptions = useMemo(() => Array.from({ length: selectedBlock?.tierCount || 1 }, (_, index) => index + 1), [selectedBlock])

  const loadBookings = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.status) params.set("status", filters.status)
      if (filters.billingStatus) params.set("billingStatus", filters.billingStatus)
      if (filters.search) params.set("search", filters.search)
      const { data } = await api.get(`/admin/bookings?${params.toString()}`)
      setBookings(data.bookings || [])
      if (data.bookings?.length) {
        setSelectedId((current) => current && data.bookings.some((booking) => booking.id === current) ? current : data.bookings[0].id)
      } else {
        setSelectedId("")
      }
    } catch (error) {
      setAlert({ type: "error", message: getApiError(error) })
    } finally {
      setLoading(false)
    }
  }

  const loadAreas = async () => {
    try {
      const { data } = await api.get("/admin/yard/areas")
      setAreas(data.areas || [])
    } catch (error) {
      setAlert({ type: "error", message: getApiError(error) })
    }
  }

  const loadBlocks = async (areaId) => {
    if (!areaId) {
      setBlocks([])
      return
    }

    try {
      const { data } = await api.get(`/admin/yard/areas/${areaId}/blocks`)
      setBlocks(data.blocks || [])
    } catch (error) {
      setAlert({ type: "error", message: getApiError(error) })
    }
  }


  const loadSlotAvailability = async (blockId) => {
    if (!blockId) {
      setSlotAvailability([])
      return
    }

    try {
      const { data } = await api.get(`/admin/bookings/yard/blocks/${blockId}/slots`)
      setSlotAvailability(data.slots || [])
    } catch (error) {
      setSlotAvailability([])
      setAlert({ type: "error", message: getApiError(error) })
    }
  }

  useEffect(() => {
    setFilters({ status: config.defaultStatus, billingStatus: config.defaultBillingStatus, search: "" })
    setSelectedId("")
    setAlert({ type: "", message: "" })
  }, [mode])

  useEffect(() => {
    loadBookings()
  }, [filters.status, filters.billingStatus])

  useEffect(() => {
    if (config.primarySection === "approval") loadAreas()
  }, [config.primarySection])

  useEffect(() => {
    if (!selectedBooking) return

    setApproval({
      areaId: selectedBooking.assignedArea || "",
      blockId: selectedBooking.assignedBlock || "",
      bay: selectedBooking.assignedBay || 1,
      row: selectedBooking.assignedRow || 1,
      tier: selectedBooking.assignedTier || 1,
    })

    setGateIn({
      actualContainerNumber: selectedBooking.actualContainerNumber || selectedBooking.containerNumber || "",
      physicalCondition: selectedBooking.physicalCondition || "Good",
      sealNumber: selectedBooking.sealNumber || "",
      truckPlateNumber: selectedBooking.truckPlateNumber || "",
      driverName: selectedBooking.driverName || "",
      driverLicenseNumber: selectedBooking.driverLicenseNumber || "",
      inspectionRemarks: selectedBooking.inspectionRemarks || "",
    })
  }, [selectedBooking?.id])

  useEffect(() => {
    if (config.primarySection === "approval") loadBlocks(approval.areaId)
  }, [approval.areaId, config.primarySection])

  useEffect(() => {
    if (config.primarySection === "approval") loadSlotAvailability(approval.blockId)
  }, [approval.blockId, config.primarySection])

  useEffect(() => {
    const handleRealtime = (event) => {
      const eventType = event.detail?.type || ""
      if (!eventType.startsWith("booking:") && !eventType.startsWith("yard:") && !eventType.startsWith("inventory:")) return
      loadBookings()
      if (approval.blockId) loadSlotAvailability(approval.blockId)
    }

    window.addEventListener("otli:realtime", handleRealtime)
    return () => window.removeEventListener("otli:realtime", handleRealtime)
  }, [approval.blockId, config.primarySection, filters.status, filters.billingStatus, filters.search])

  const runAction = async (callback, message) => {
    if (!selectedBooking) return
    setAlert({ type: "", message: "" })
    try {
      setSaving(true)
      await callback()
      setAlert({ type: "success", message })
      await loadBookings()
    } catch (error) {
      setAlert({ type: "error", message: getApiError(error) })
    } finally {
      setSaving(false)
    }
  }

  const approveBooking = () => runAction(
    () => api.patch(`/admin/bookings/${selectedBooking.id}/approve`, approval),
    "Booking approved and yard area assigned."
  )

  const rejectBooking = () => runAction(
    () => api.patch(`/admin/bookings/${selectedBooking.id}/reject`, { reason: rejectReason }),
    "Booking rejected."
  )

  const approveGateIn = () => runAction(
    () => api.patch(`/admin/bookings/${selectedBooking.id}/gate-in`, gateIn),
    "Gate-In approved."
  )

  const markStored = () => runAction(
    () => api.patch(`/admin/bookings/${selectedBooking.id}/store`, { remarks }),
    "Container marked as stored in assigned area."
  )

  const approvePayment = () => runAction(
    () => api.patch(`/admin/bookings/${selectedBooking.id}/payment/approve`, { remarks }),
    "Payment approved. Gate-Out request is now available to the client."
  )

  const rejectPayment = () => runAction(
    () => api.patch(`/admin/bookings/${selectedBooking.id}/payment/reject`, { reason: paymentRejectReason }),
    "Payment rejected."
  )

  const approveGateOut = () => runAction(
    () => api.patch(`/admin/bookings/${selectedBooking.id}/gate-out/approve`, { remarks }),
    "Gate-Out approved."
  )

  const completeGateOut = () => runAction(
    () => api.patch(`/admin/bookings/${selectedBooking.id}/gate-out/complete`, { actualContainerNumber: selectedBooking.containerNumber, remarks }),
    "Container released and booking completed."
  )

  const handleSearch = () => loadBookings()

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-teal-700">
          <HeaderIcon size={14} /> {config.badge}
        </div>
        <h1 className="mt-3 text-3xl font-black text-slate-950">{config.title}</h1>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">{config.description}</p>
      </div>

      <Alert type={alert.type}>{alert.message}</Alert>

      <div className="card p-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input className="input pl-10" placeholder="Search reference, container, shipping line" value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} />
          </div>
          <select className="input" value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
            <option value="all">All booking statuses</option>
            {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <select className="input" value={filters.billingStatus} onChange={(event) => setFilters((current) => ({ ...current, billingStatus: event.target.value }))}>
            <option value="all">All billing statuses</option>
            {Object.entries(billingLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <button type="button" onClick={handleSearch} className="btn-secondary" disabled={loading}><RefreshCw size={16} /> Refresh</button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <div className="card overflow-hidden">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-lg font-black text-slate-950">{config.queueTitle}</h2>
          </div>
          <div className="max-h-[760px] overflow-y-auto p-3">
            {bookings.length === 0 && !loading && <div className="p-5 text-sm font-semibold text-slate-500">No records found for this module.</div>}
            {bookings.map((booking) => (
              <button
                key={booking.id}
                type="button"
                onClick={() => setSelectedId(booking.id)}
                className={`mb-3 w-full rounded-3xl border p-4 text-left transition ${selectedBooking?.id === booking.id ? "border-teal-300 bg-teal-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-black uppercase text-slate-500">{booking.bookingReference}</div>
                    <div className="mt-1 text-lg font-black text-slate-950">{booking.containerNumber}</div>
                    <div className="mt-1 text-sm font-semibold text-slate-500">{booking.clientName}</div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-[11px] font-black ${statusClass(booking.status)}`}>{statusLabels[booking.status] || booking.status}</span>
                </div>
                <div className="mt-3 text-xs font-bold text-slate-500">{booking.containerSize}ft • {booking.containerType?.replace("_", " ")} • {booking.shippingLine}</div>
                <div className="mt-2 text-xs font-bold text-slate-500">Billing: {billingLabels[booking.billingStatus] || booking.billingStatus}</div>
              </button>
            ))}
          </div>
        </div>

        {!selectedBooking ? (
          <div className="card grid min-h-[520px] place-items-center p-8 text-center">
            <div>
              <Warehouse className="mx-auto text-slate-300" size={42} />
              <div className="mt-3 text-xl font-black text-slate-700">Select a booking</div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="card p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="text-sm font-black text-slate-500">{selectedBooking.bookingReference}</div>
                  <h2 className="mt-1 text-2xl font-black text-slate-950">{selectedBooking.containerNumber}</h2>
                  <div className="mt-1 text-sm font-semibold text-slate-500">{selectedBooking.clientName} • {selectedBooking.clientEmail}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-black ${statusClass(selectedBooking.status)}`}>{statusLabels[selectedBooking.status] || selectedBooking.status}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-black ${statusClass(selectedBooking.billingStatus)}`}>{billingLabels[selectedBooking.billingStatus] || selectedBooking.billingStatus}</span>
                </div>
              </div>

              <div className="mt-5 grid gap-3 rounded-3xl bg-slate-50 p-4 text-sm md:grid-cols-3">
                <div><span className="font-black text-slate-500">Size:</span> {selectedBooking.containerSize}ft</div>
                <div><span className="font-black text-slate-500">Type:</span> {selectedBooking.containerType?.replace("_", " ")}</div>
                <div><span className="font-black text-slate-500">Load:</span> {selectedBooking.containerLoadStatus}</div>
                <div><span className="font-black text-slate-500">Shipping Line:</span> {selectedBooking.shippingLine}</div>
                <div><span className="font-black text-slate-500">Expected Arrival:</span> {formatDate(selectedBooking.expectedArrivalDate)}</div>
                <div><span className="font-black text-slate-500">Assigned Slot:</span> {selectedBooking.assignedSlotNumber || "Pending"}</div>
              </div>
            </div>

            {config.primarySection === "approval" && (
              <div className="card p-5">
                <div className="flex items-center gap-2">
                  <MapPinned size={18} className="text-teal-700" />
                  <h3 className="text-lg font-black text-slate-950">Approve Booking and Assign Yard Location</h3>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <Field label="Yard Block / Area">
                    <select className="input" value={approval.areaId} onChange={(event) => setApproval((current) => ({ ...current, areaId: event.target.value, blockId: "", bay: 1, row: 1, tier: 1 }))}>
                      <option value="">Select Alpha, Bravo, Echo, etc.</option>
                      {areas.map((area) => <option key={area.id} value={area.id}>{area.name} • {area.availableSlots} TEU available</option>)}
                    </select>
                  </Field>
                  <Field label="Block Section" hint="Only active matching container-size block sections are shown.">
                    <select className="input" value={approval.blockId} onChange={(event) => setApproval((current) => ({ ...current, blockId: event.target.value, bay: 1, row: 1, tier: 1 }))}>
                      <option value="">Select block section</option>
                      {usableBlocks.map((block) => <option key={block.id} value={block.id}>{block.code} • {block.availableSlots} TEU left • {block.containerSize}ft</option>)}
                    </select>
                  </Field>
                  <Field label="Bay">
                    <select className="input" value={approval.bay} onChange={(event) => setApproval((current) => ({ ...current, bay: event.target.value }))} disabled={!selectedBlock}>
                      {bayOptions.map((value) => <option key={value} value={value}>Bay {value}</option>)}
                    </select>
                  </Field>
                  <Field label="Row">
                    <select className="input" value={approval.row} onChange={(event) => setApproval((current) => ({ ...current, row: event.target.value }))} disabled={!selectedBlock}>
                      {rowOptions.map((value) => <option key={value} value={value}>Row {value}</option>)}
                    </select>
                  </Field>
                  <Field label="Tier / High">
                    <select className="input" value={approval.tier} onChange={(event) => setApproval((current) => ({ ...current, tier: event.target.value }))} disabled={!selectedBlock}>
                      {tierOptions.map((value) => <option key={value} value={value}>Tier {value}</option>)}
                    </select>
                  </Field>
                </div>
                {selectedBlock && (
                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl bg-teal-50 p-4 text-sm font-bold text-teal-800">
                      {selectedBlock.name}: {selectedBlock.occupiedSlots}/{selectedBlock.capacityTeu} TEU used, {selectedBlock.availableSlots} TEU remaining. Selected slot: B{approval.bay}-R{approval.row}-T{approval.tier}.
                    </div>
                    {selectedSlotTaken ? (
                      <div className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">
                        This location is already reserved or occupied. Select another bay, row, or tier.
                      </div>
                    ) : (
                      <div className="rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
                        This location is available. It will be reserved immediately after approval and released only if the booking is rejected, resubmitted, cancelled, or completed.
                      </div>
                    )}
                    {slotAvailability.length > 0 && (
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="text-xs font-black uppercase tracking-wide text-slate-500">Unavailable locations</div>
                        <div className="mt-3 flex max-h-24 flex-wrap gap-2 overflow-y-auto">
                          {slotAvailability.slice(0, 40).map((slot) => (
                            <span key={`${slot.key}-${slot.reference}`} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                              B{slot.bay} R{slot.row} T{slot.tier} • {slot.type}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <button type="button" onClick={approveBooking} className="btn-primary" disabled={saving || selectedBooking.status !== "pending_admin_approval" || !approval.areaId || !approval.blockId || selectedSlotTaken}>
                    <CheckCircle2 size={16} /> Approve / Assign
                  </button>
                  <input className="input sm:max-w-xs" placeholder="Reject reason" value={rejectReason} onChange={(event) => setRejectReason(event.target.value)} />
                  <button type="button" onClick={rejectBooking} className="btn-secondary !text-red-700" disabled={saving || !rejectReason || selectedBooking.status !== "pending_admin_approval"}>
                    <ShieldX size={16} /> Reject
                  </button>
                </div>
              </div>
            )}

            {config.primarySection === "gateIn" && (
              <div className="card p-5">
                <div className="flex items-center gap-2">
                  <ClipboardCheck size={18} className="text-teal-700" />
                  <h3 className="text-lg font-black text-slate-950">Gate-In Check and Inspection</h3>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <Field label="Actual Container Number">
                    <input className="input uppercase" value={gateIn.actualContainerNumber} onChange={(event) => setGateIn((current) => ({ ...current, actualContainerNumber: event.target.value }))} />
                  </Field>
                  <Field label="Physical Condition">
                    <input className="input" value={gateIn.physicalCondition} onChange={(event) => setGateIn((current) => ({ ...current, physicalCondition: event.target.value }))} />
                  </Field>
                  <Field label="Seal Number">
                    <input className="input" value={gateIn.sealNumber} onChange={(event) => setGateIn((current) => ({ ...current, sealNumber: event.target.value }))} />
                  </Field>
                  <Field label="Truck Plate Number">
                    <input className="input" value={gateIn.truckPlateNumber} onChange={(event) => setGateIn((current) => ({ ...current, truckPlateNumber: event.target.value }))} />
                  </Field>
                  <Field label="Driver Name">
                    <input className="input" value={gateIn.driverName} onChange={(event) => setGateIn((current) => ({ ...current, driverName: event.target.value }))} />
                  </Field>
                  <Field label="Driver License">
                    <input className="input" value={gateIn.driverLicenseNumber} onChange={(event) => setGateIn((current) => ({ ...current, driverLicenseNumber: event.target.value }))} />
                  </Field>
                </div>
                <Field label="Inspection Remarks">
                  <textarea className="input mt-4 min-h-[82px]" value={gateIn.inspectionRemarks} onChange={(event) => setGateIn((current) => ({ ...current, inspectionRemarks: event.target.value }))} />
                </Field>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <button type="button" onClick={approveGateIn} className="btn-primary" disabled={saving || selectedBooking.status !== "approved_area_assigned"}>
                    <Truck size={16} /> Approve Gate-In
                  </button>
                  <button type="button" onClick={markStored} className="btn-secondary" disabled={saving || selectedBooking.status !== "gate_in_approved"}>
                    <Warehouse size={16} /> Mark Stored In Assigned Area
                  </button>
                </div>
              </div>
            )}

            {config.primarySection === "billing" && (
              <div className="card p-5">
                <div className="flex items-center gap-2">
                  <CreditCard size={18} className="text-teal-700" />
                  <h3 className="text-lg font-black text-slate-950">Client Payment Submission</h3>
                </div>
                <div className="mt-4 rounded-3xl bg-slate-50 p-4 text-sm">
                  <div><span className="font-black text-slate-500">Amount:</span> PHP {Number(selectedBooking.paymentAmount || 0).toLocaleString()}</div>
                  <div><span className="font-black text-slate-500">Reference:</span> {selectedBooking.paymentReferenceNumber || "-"}</div>
                  <div><span className="font-black text-slate-500">Submitted:</span> {formatDate(selectedBooking.paymentSubmittedAt)}</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(selectedBooking.paymentProofs || []).map((doc, index) => (
                      <a key={`${doc.url}-${index}`} className="rounded-full bg-white px-3 py-1 text-xs font-black text-teal-700 underline" href={doc.secureUrl || doc.url} target="_blank" rel="noreferrer">
                        {doc.label || "Payment Proof"} {index + 1}
                      </a>
                    ))}
                  </div>
                </div>
                <textarea className="input mt-4 min-h-[82px]" placeholder="Remarks" value={remarks} onChange={(event) => setRemarks(event.target.value)} />
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <button type="button" onClick={approvePayment} className="btn-primary" disabled={saving || !["payment_submitted", "payment_under_review", "payment_rejected"].includes(selectedBooking.billingStatus)}>
                    <CheckCircle2 size={16} /> Approve Payment
                  </button>
                  <input className="input sm:max-w-xs" placeholder="Payment rejection reason" value={paymentRejectReason} onChange={(event) => setPaymentRejectReason(event.target.value)} />
                  <button type="button" onClick={rejectPayment} className="btn-secondary !text-red-700" disabled={saving || !paymentRejectReason}>
                    Reject Payment
                  </button>
                </div>
              </div>
            )}

            {config.primarySection === "gateOut" && (
              <div className="card p-5">
                <div className="flex items-center gap-2">
                  <Truck size={18} className="text-teal-700" />
                  <h3 className="text-lg font-black text-slate-950">Gate-Out Request</h3>
                </div>
                <div className="mt-4 rounded-3xl bg-slate-50 p-4 text-sm">
                  <div><span className="font-black text-slate-500">Requested:</span> {formatDate(selectedBooking.gateOutRequestedAt)}</div>
                  <div><span className="font-black text-slate-500">Approved:</span> {formatDate(selectedBooking.gateOutApprovedAt)}</div>
                  <div><span className="font-black text-slate-500">Released:</span> {formatDate(selectedBooking.releasedAt)}</div>
                  <div><span className="font-black text-slate-500">Billing Gate:</span> {selectedBooking.billingStatus === "paid_approved" ? "Ready" : "Payment not approved"}</div>
                </div>
                <textarea className="input mt-4 min-h-[82px]" placeholder="Gate-out remarks" value={remarks} onChange={(event) => setRemarks(event.target.value)} />
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <button type="button" onClick={approveGateOut} className="btn-primary" disabled={saving || selectedBooking.status !== "gate_out_requested" || selectedBooking.billingStatus !== "paid_approved"}>
                    Approve Gate-Out
                  </button>
                  <button type="button" onClick={completeGateOut} className="btn-secondary" disabled={saving || selectedBooking.status !== "gate_out_approved"}>
                    Complete Release
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminBookingModule
