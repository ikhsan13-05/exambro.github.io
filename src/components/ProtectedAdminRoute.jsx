import { Navigate } from "react-router-dom";

export default function ProtectedAdminRoute({ children }) {
  const saved = localStorage.getItem("adminSession");

  if (!saved) {
    return <Navigate to="/admin/login" replace />;
  }

  try {
    const session = JSON.parse(saved);

    if (!session?.isAdmin || !session?.adminPin) {
      localStorage.removeItem("adminSession");
      return <Navigate to="/admin/login" replace />;
    }

    return children;
  } catch {
    localStorage.removeItem("adminSession");
    return <Navigate to="/admin/login" replace />;
  }
}