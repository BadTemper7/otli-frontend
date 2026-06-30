export const adminFlowModules = [
  {
    group: "Control Center",
    items: [
      {
        key: "dashboard",
        title: "Admin Dashboard",
        path: "/admin/dashboard",
        description: "Monitor pending bookings, Gate-Out requests, current inventory, available yard capacity, occupancy, revenue, and pending account verification.",
        status: "Active",
      },
      {
        key: "auditTrail",
        title: "Audit Trail",
        path: "/admin/audit-trail",
        description: "Track booking approval, yard assignment, Gate-In inspection, storage, billing, payment verification, Gate-Out release, and user access changes.",
        status: "CMS placeholder",
      },
    ],
  },
  {
    group: "Account Flow",
    items: [
      {
        key: "clientVerification",
        title: "Client Verification",
        path: "/admin/clients",
        description: "Review pending registrations, verify clients, reject with a reason, and check resubmitted applications.",
        status: "Active",
      },
      {
        key: "userManagement",
        title: "User Management",
        path: "/admin/accounts",
        description: "Create admin users, assign module access, activate or deactivate users, and manage role permissions.",
        status: "Active",
      },
    ],
  },
  {
    group: "Booking and Gate Operations",
    items: [
      {
        key: "bookings",
        title: "Booking Management",
        path: "/admin/bookings",
        description: "Review booking requests, check yard capacity, assign areas and blocks, approve Gate-In, mark storage, verify payment, approve Gate-Out, and complete release.",
        status: "Active",
      },
      {
        key: "gateAppointment",
        title: "Gate Appointment Setup",
        path: "/admin/gate-appointments",
        description: "Set gate slots, truck capacity per schedule, blocked dates, and appointment calendar rules.",
        status: "CMS placeholder",
      },
      {
        key: "gateIn",
        title: "Gate-In Management",
        path: "/admin/bookings",
        description: "Search approved bookings, verify container details, inspect condition, encode truck and driver details, and approve Gate-In.",
        status: "Active",
      },
    ],
  },
  {
    group: "Yard and Inventory CMS",
    items: [
      {
        key: "yardSetup",
        title: "Yard Area Setup",
        path: "/admin/yard-areas",
        description: "Create yard areas using area name, lines, rows, high, container size, capacity TEU, status, and color.",
        status: "Active",
      },
      {
        key: "inventory",
        title: "Inventory Board",
        path: "/admin/inventory",
        description: "Select a yard area, create container blocks, drag/drop blocks for the CMS layout, and view containers that came from Gate-In approved bookings.",
        status: "Active",
      },
      {
        key: "storageMonitoring",
        title: "Storage Monitoring",
        path: "/admin/storage-monitoring",
        description: "Track free days, chargeable days, overstaying containers, aging, occupancy, and storage status.",
        status: "CMS placeholder",
      },
    ],
  },
  {
    group: "Billing and Release",
    items: [
      {
        key: "rateSetup",
        title: "Rate Setup",
        path: "/admin/rate-setup",
        description: "Manage billing rates by description, unit, container size, container type, rate, effective date, and status.",
        status: "CMS placeholder",
      },
      {
        key: "billing",
        title: "Billing Management",
        path: "/admin/billing",
        description: "Compute charges, add manual charges, generate billing summaries, generate invoices, and monitor paid or unpaid records.",
        status: "CMS placeholder",
      },
      {
        key: "paymentVerification",
        title: "Payment Verification",
        path: "/admin/bookings",
        description: "Review proof of payment, match payment reference numbers and amounts, approve or reject payments, and unlock client Gate-Out requests.",
        status: "Active",
      },
      {
        key: "gateOut",
        title: "Gate-Out Management",
        path: "/admin/bookings",
        description: "Validate release requests, confirm payment clearance, perform final inspection, and mark the booking as Completed / Gate-Out Done.",
        status: "Active",
      },
    ],
  },
  {
    group: "Controls and Reports",
    items: [
      {
        key: "blacklist",
        title: "Blacklist Management",
        path: "/admin/blacklist",
        description: "Manage blacklisted containers, clients, trucks, and drivers to block invalid transactions.",
        status: "CMS placeholder",
      },
      {
        key: "chargeHold",
        title: "Charge Hold Management",
        path: "/admin/charge-holds",
        description: "Place containers on hold, remove holds, add hold reasons, and review hold history.",
        status: "CMS placeholder",
      },
      {
        key: "reports",
        title: "Reports Module",
        path: "/admin/reports",
        description: "Generate booking, Gate-In, Gate-Out, inventory, storage aging, billing, payment, revenue, customer, and yard occupancy reports.",
        status: "CMS placeholder",
      },
    ],
  },
]

export const flattenedAdminFlowModules = adminFlowModules.flatMap((group) => group.items)

export const statusGroups = [
  {
    title: "Client Account Status",
    items: ["Pending Verification", "Rejected", "Resubmitted", "Verified", "Suspended"],
  },
  {
    title: "Booking Status",
    items: ["Pending Admin Approval", "Approved / Area Assigned", "Gate-In Approved", "Stored in Assigned Area", "Gate-Out Requested", "Gate-Out Approved", "Completed / Gate-Out Done"],
  },
  {
    title: "Billing Status",
    items: ["Unpaid", "Payment Submitted", "Payment Under Review", "Paid / Approved"],
  },
  {
    title: "Yard Status",
    items: ["Available", "Reserved", "Occupied", "Blocked", "Maintenance"],
  },
]
