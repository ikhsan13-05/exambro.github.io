import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginUjian from "./pages/LoginUjian";
import ExamRoom from "./pages/ExamRoom";
import LockedPage from "./pages/LockedPage";
import FinishPage from "./pages/FinishPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUnlock from "./pages/AdminUnlock";
import AdminLogin from "./pages/AdminLogin";
import AdminExamSettings from "./pages/AdminExamSettings";
import AdminClassSettings from "./pages/AdminClassSettings";
import AdminMonitoring from "./pages/AdminMonitoring";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import InvalidSessionPage from "./pages/InvalidSessionPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginUjian />} />
        <Route path="/exam" element={<ExamRoom />} />
        <Route path="/locked" element={<LockedPage />} />
        <Route path="/finish" element={<FinishPage />} />
        <Route path="/invalid-session" element={<InvalidSessionPage />} />

        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/settings"
          element={
            <ProtectedAdminRoute>
              <AdminExamSettings />
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/classes"
          element={
            <ProtectedAdminRoute>
              <AdminClassSettings />
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/monitoring"
          element={
            <ProtectedAdminRoute>
              <AdminMonitoring />
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/unlock"
          element={
            <ProtectedAdminRoute>
              <AdminUnlock />
            </ProtectedAdminRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
