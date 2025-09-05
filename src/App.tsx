import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthPage from "./components/Auth/AuthPage";
import DashboardLayout from "./components/Dashboard/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import AppointmentBooking from "./components/Dashboard/AppointmentBooking";
import AdminDashboard from "./components/Dashboard/AdminDashboard";
import RequestsPage from "./pages/dashboard/RequestsPage";
import NewRequestPage from "./pages/dashboard/NewRequestPage";
import AppointmentsPage from "./pages/dashboard/AppointmentsPage";
import CasesPage from "./pages/dashboard/CasesPage";
import DocumentsPage from "./pages/dashboard/DocumentsPage";
import MessagesPage from "./pages/dashboard/MessagesPage";
import ProfilePage from "./pages/dashboard/ProfilePage";
import DatabaseManagement from "./pages/admin/DatabaseManagement";
import SystemSettings from "./pages/admin/SystemSettings";
import SecurityManagement from "./pages/admin/SecurityManagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ErrorBoundary>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<DashboardHome />} />
              <Route path="requests" element={<RequestsPage />} />
              <Route path="requests/new" element={<NewRequestPage />} />
              <Route path="appointments" element={<AppointmentsPage />} />
              <Route path="appointments/new" element={<AppointmentBooking />} />
              <Route path="cases" element={<CasesPage />} />
              <Route path="documents" element={<DocumentsPage />} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="admin" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="admin/database" element={
                <ProtectedRoute requiredRole="admin">
                  <DatabaseManagement />
                </ProtectedRoute>
              } />
              <Route path="admin/settings" element={
                <ProtectedRoute requiredRole="admin">
                  <SystemSettings />
                </ProtectedRoute>
              } />
              <Route path="admin/security" element={
                <ProtectedRoute requiredRole="admin">
                  <SecurityManagement />
                </ProtectedRoute>
              } />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ErrorBoundary>
  </QueryClientProvider>
);

export default App;