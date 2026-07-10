import { Navigate, Route, Routes } from "react-router-dom"
import { useAuth } from "./context/AuthContext"
import ProtectedRoute from "./components/ProtectedRoute"
import ClientVerifiedRoute from "./components/ClientVerifiedRoute"
import AdminPermissionRoute from "./components/AdminPermissionRoute"
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
import AdminRateSetup from "./pages/AdminRateSetup"
import AdminGateOut from "./pages/AdminGateOut"
import AdminStorageMonitoring from "./pages/AdminStorageMonitoring"
import ClientPreAdvice from "./pages/ClientPreAdvice"
import ClientAccountStatus from "./pages/ClientAccountStatus"
import ClientSettings from "./pages/ClientSettings"
import PlaceholderPage from "./pages/PlaceholderPage"
import HomePage from "./pages/HomePage"
import ClientBookings from "./pages/ClientBookings"
import AdminBookings from "./pages/AdminBookings"
import BookingLookupPage from "./pages/BookingLookupPage"
import FormFieldValidation from "./components/FormFieldValidation"

const App = () => {
  const { user } = useAuth()
  const isLoggedInClient = user?.userType === "client"
  const clientHomePath = ["active", "verified"].includes(user?.status) ? "/bookings" : "/profile"

  return (
    <>
      <FormFieldValidation />
      <Routes>
      <Route path="/admin/login" element={<LoginPage type="admin" />} />
      <Route path="/admin/forgot-password" element={<ForgotPasswordPage type="admin" />} />

      <Route element={<ProtectedRoute userType="admin" />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminPermissionRoute moduleName="dashboard"><AdminDashboard /></AdminPermissionRoute>} />
          <Route path="flow" element={<AdminPermissionRoute moduleName="dashboard"><AdminFlowOverview /></AdminPermissionRoute>} />
          <Route path="accounts" element={<AdminPermissionRoute moduleName="userManagement"><AdminAccounts /></AdminPermissionRoute>} />
          <Route path="clients" element={<AdminPermissionRoute moduleName="clientVerification"><AdminClients /></AdminPermissionRoute>} />
          <Route path="yard-setup" element={<AdminPermissionRoute moduleName="yardSetup"><AdminYardSetup /></AdminPermissionRoute>} />
          <Route path="yard-areas" element={<AdminPermissionRoute moduleName="yardSetup"><AdminYardAreas /></AdminPermissionRoute>} />
          <Route path="inventory" element={<AdminPermissionRoute moduleName="inventory"><AdminInventory /></AdminPermissionRoute>} />
          <Route path="yard-map" element={<PlaceholderPage title="Yard Map" moduleName="Yard CMS" description="View the full yard layout using configured areas and draggable inventory blocks. This will become the live visual map for occupancy and available capacity." checklist={["Area selector", "Block occupancy overlay", "Available or occupied location state", "Blocked location state", "Print yard map", "Export occupancy"]} />} />
          <Route path="bookings" element={<AdminPermissionRoute moduleName="bookings"><AdminBookings /></AdminPermissionRoute>} />
          <Route path="pre-advice" element={<AdminPermissionRoute moduleName="preAdvice"><AdminPreAdvice /></AdminPermissionRoute>} />
          <Route path="gate-appointments" element={<PlaceholderPage title="Gate Appointment Setup" moduleName="Operations CMS" description="Configure available gate schedules, truck limits per time slot, blocked dates, rescheduling rules, and appointment calendar capacity." checklist={["Time slot setup", "Truck limit per slot", "Blocked dates", "Appointment calendar", "Reschedule tool", "Gate capacity report"]} />} />
          <Route path="gate-in" element={<AdminPermissionRoute moduleName="gateIn"><AdminGateIn /></AdminPermissionRoute>} />
          <Route path="storage-monitoring" element={<AdminPermissionRoute moduleName="storageMonitoring"><AdminStorageMonitoring /></AdminPermissionRoute>} />
          <Route path="rate-setup" element={<AdminPermissionRoute moduleName="rateSetup"><AdminRateSetup /></AdminPermissionRoute>} />
          <Route path="billing" element={<Navigate to="/admin/payment-verification" replace />} />
          <Route path="payment-verification" element={<AdminPermissionRoute moduleName="paymentVerification"><AdminBilling /></AdminPermissionRoute>} />
          <Route path="gate-out" element={<AdminPermissionRoute moduleName="gateOut"><AdminGateOut /></AdminPermissionRoute>} />
          <Route path="blacklist" element={<PlaceholderPage title="Blacklist Management" moduleName="Control CMS" description="Manage blacklisted containers, clients, trucks, and drivers to block invalid pre-advice, gate-in, billing, or gate-out transactions." checklist={["Blacklist type", "Reference number", "Reason", "Status", "Remove blacklist", "History"]} />} />
          <Route path="charge-holds" element={<PlaceholderPage title="Charge Hold Management" moduleName="Control CMS" description="Place containers on hold, remove holds, add hold reasons, and review hold history for billing or operational restrictions." checklist={["Container search", "Hold reason", "Hold type", "Release hold", "History", "Remarks"]} />} />
          <Route path="reports" element={<PlaceholderPage title="Reports Module" moduleName="Reports CMS" description="Generate operational and financial reports for gate-in, gate-out, inventory, storage aging, billing, payments, revenue, customers, shipping lines, and yard occupancy." checklist={["Date filter", "Customer filter", "Shipping line filter", "Excel export", "PDF export", "Print report"]} />} />
          <Route path="audit-trail" element={<PlaceholderPage title="Audit Trail" moduleName="System CMS" description="Track account verification, pre-advice approvals, gate-in encoding, yard location assignment, billing computation, payment verification, gate-out release, rate changes, and user access changes." checklist={["User", "Module", "Action", "Before and after values", "Timestamp", "IP address"]} />} />
          <Route path="settings" element={<PlaceholderPage title="System Settings" moduleName="System CMS" description="Manage global system settings, email configuration labels, document rules, module defaults, and environment-driven setup options." checklist={["Document rules", "Email labels", "Default statuses", "File size limit", "Allowed file types", "Notification rules"]} />} />
        </Route>
      </Route>

      <Route path="/client" element={<Navigate to="/bookings" replace />} />
      <Route path="/client/login" element={<Navigate to="/login" replace />} />
      <Route path="/client/register" element={<Navigate to="/register" replace />} />
      <Route path="/client/forgot-password" element={<Navigate to="/forgot-password" replace />} />
      <Route path="/client/dashboard" element={<Navigate to="/bookings" replace />} />
      <Route path="/client/account-status" element={<Navigate to="/profile" replace />} />
      <Route path="/client/pre-advice" element={<Navigate to="/pre-advice" replace />} />
      <Route path="/client/bookings" element={<Navigate to="/bookings" replace />} />
      <Route path="/client/my-bookings" element={<Navigate to="/my-bookings" replace />} />
      <Route path="/client/containers" element={<Navigate to="/my-bookings" replace />} />

      <Route path="/" element={<ClientLayout />}>
        <Route index element={<HomePage />} />
        <Route path="booking-status" element={<BookingLookupPage />} />
        <Route path="login" element={<LoginPage type="client" />} />
        <Route path="register" element={isLoggedInClient ? <Navigate to={clientHomePath} replace /> : <ClientRegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage type="client" />} />

        <Route element={<ProtectedRoute userType="client" />}>
          <Route path="dashboard" element={<Navigate to="/bookings" replace />} />
          <Route path="account-status" element={<Navigate to="/profile" replace />} />
          <Route path="profile" element={<ClientAccountStatus />} />
          <Route path="settings" element={<ClientSettings />} />
          <Route element={<ClientVerifiedRoute />}>
            <Route path="pre-advice" element={<ClientPreAdvice />} />
            <Route path="bookings" element={<ClientBookings mode="create" />} />
            <Route path="my-bookings" element={<ClientBookings mode="list" />} />
            <Route path="billing" element={<Navigate to="/my-bookings" replace />} />
            <Route path="gate-out" element={<Navigate to="/my-bookings" replace />} />
            <Route path="containers" element={<Navigate to="/my-bookings" replace />} />
          </Route>
        </Route>
      </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  )
}

export default App
