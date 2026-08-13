import TableView from "./components/TableView";
import AdminDashboard from "./components/AdminDashboard";
import { useAuthStore } from "../context/authStore";
export default function Home() {
  const { user } = useAuthStore();
  if (user?.role === "admin") {
    return <AdminDashboard />;
  }
  return <TableView />;
}
