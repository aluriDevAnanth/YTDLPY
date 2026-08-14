import { Navigate } from "react-router";
import { useAuthStore } from "../../context/authStore";

export default function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();

  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
