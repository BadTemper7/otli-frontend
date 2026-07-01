import { Navigate, Route, Routes } from "react-router-dom"
import ProtectedRoute from "./components/ProtectedRoute"
import ClientVerifiedRoute from "./components/ClientVerifiedRoute"
import AdminLayout from "./layouts/AdminLayout"
import ClientLayout from "./layouts/ClientLayout"
import LoginPage from "./pages/LoginPage"
import ForgotPasswordPage from "./pages/ForgotPasswordPage"
import ClientRegisterPage from "./pages/ClientRegisterPage"
import AdminDashboard from "./pages/AdminDashboard"
import AdminAccounts from "./pages/AdminAccounts"
import AdminClients from "./pages/AdminClients"
import AdminFlowOverview from "./pages/AdminFlowOverview"
import AdminYardSetup from "./pages/AdminYardSetup"
import AdminYardAreas from "./pages/AdminYardAreas"
import AdminInventory from "./pages/AdminInventory"
import AdminPreAdvice from "./pages/AdminPreAdvice"
import AdminGateIn from "./pages/AdminGateIn"
import AdminBilling from "./pages/AdminBilling"
import AdminGateOut from "./pages/AdminGateOut"
import AdminStorageMonitoring from "./pages/AdminStorageMonitoring"
import ClientPreAdvice from "./pages/ClientPreAdvice"
import ClientDashboard from "./pages/ClientDashboard"
import ClientAccountStatus from "./pages/ClientAccountStatus"
import PlaceholderPage from "./pages/PlaceholderPage"
import HomePage from "./pages/HomePage"
import ClientBookings from "./pages/ClientBookings"
import AdminBookings from "./pages/AdminBookings"
import BookingLookupPage from "./pages/BookingLookupPage"

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/booking-status" element={<BookingLookupPage />} />

      <Route path="/admin/login" element={<LoginPage type="admin" />} />
      <Route path="/admin/forgot-password" element={<ForgotPasswordPage type="admin" />} />

      <Route path="/client/login" element={<LoginPage type="client" />} />
      <Route path="/client/register" element={<ClientRegisterPage />} />
      <Route path="/client/forgot-password" element={<ForgotPasswordPage type="client" />} />

      <Route element={<ProtectedRoute userType="admin" />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="flow" element={<AdminFlowOverview />} />
          <Route path="accounts" element={<AdminAccounts />} />
          <Route path="clients" element={<AdminClients />} />
          <Route path="yard-setup" element={<AdminYardSetup />} />
          <Route path="yard-areas" element={<AdminYardAreas />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="yard-map" element={<PlaceholderPage title="Yard Map" moduleName="Yard CMS" description="View the full yard layout using configured areas and draggable inventory blocks. This will become the live visual map for occupancy and available capacity." checklist={["Area selector", "Block occupancy overlay", "Available or occupied location state", "Blocked location state", "Print yard map", "Export occupancy"]} />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="pre-advice" element={<AdminPreAdvice />} />
          <Route path="gate-appointments" element={<PlaceholderPage title="Gate Appointment Setup" moduleName="Operations CMS" description="Configure available gate schedules, truck limits per time slot, blocked dates, rescheduling rules, and appointment calendar capacity." checklist={["Time slot setup", "Truck limit per slot", "Blocked dates", "Appointment calendar", "Reschedule tool", "Gate capacity report"]} />} />
          <Route path="gate-in" element={<AdminGateIn />} />
          <Route path="storage-monitoring" element={<AdminStorageMonitoring />} />
          <Route path="rate-setup" element={<PlaceholderPage title="Rate Setup" moduleName="Billing CMS" description="Create and manage billing rates by description, unit, container size, container type, rate amount, effective date, and status." checklist={["Rate description", "Unit", "Container size", "Container type", "Rate", "Effective date"]} />} />
          <Route path="billing" element={<AdminBilling />} />
          <Route path="payment-verification" element={<Navigate to="/admin/billing" replace />} />
          <Route path="gate-out" element={<AdminGateOut />} />
          <Route path="blacklist" element={<PlaceholderPage title="Blacklist Management" moduleName="Control CMS" description="Manage blacklisted containers, clients, trucks, and drivers to block invalid pre-advice, gate-in, billing, or gate-out transactions." checklist={["Blacklist type", "Reference number", "Reason", "Status", "Remove blacklist", "History"]} />} />
          <Route path="charge-holds" element={<PlaceholderPage title="Charge Hold Management" moduleName="Control CMS" description="Place containers on hold, remove holds, add hold reasons, and review hold history for billing or operational restrictions." checklist={["Container search", "Hold reason", "Hold type", "Release hold", "History", "Remarks"]} />} />
          <Route path="reports" element={<PlaceholderPage title="Reports Module" moduleName="Reports CMS" description="Generate operational and financial reports for gate-in, gate-out, inventory, storage aging, billing, payments, revenue, customers, shipping lines, and yard occupancy." checklist={["Date filter", "Customer filter", "Shipping line filter", "Excel export", "PDF export", "Print report"]} />} />
          <Route path="audit-trail" element={<PlaceholderPage title="Audit Trail" moduleName="System CMS" description="Track account verification, pre-advice approvals, gate-in encoding, yard location assignment, billing computation, payment verification, gate-out release, rate changes, and user access changes." checklist={["User", "Module", "Action", "Before and after values", "Timestamp", "IP address"]} />} />
          <Route path="settings" element={<PlaceholderPage title="System Settings" moduleName="System CMS" description="Manage global system settings, email configuration labels, document rules, module defaults, and environment-driven setup options." checklist={["Document rules", "Email labels", "Default statuses", "File size limit", "Allowed file types", "Notification rules"]} />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute userType="client" />}>
        <Route path="/client" element={<ClientLayout />}>
          <Route index element={<Navigate to="/client/dashboard" replace />} />
          <Route path="dashboard" element={<ClientDashboard />} />
          <Route path="account-status" element={<ClientAccountStatus />} />
          <Route element={<ClientVerifiedRoute />}>
            <Route path="pre-advice" element={<ClientPreAdvice />} />
            <Route path="bookings" element={<ClientBookings showCreateForm={true} />} />
            <Route path="billing" element={<Navigate to="/client/containers" replace />} />
            <Route path="gate-out" element={<Navigate to="/client/containers" replace />} />
            <Route path="containers" element={<ClientBookings showCreateForm={false} />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/client/login" replace />} />
    </Routes>
  )
}

export default App
