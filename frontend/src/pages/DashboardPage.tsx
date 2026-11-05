import { useAuth } from "../features/auth/useAuth";
import { AdminDashboard } from "../features/dashboard/AdminDashboard";
import { DoctorDashboard } from "../features/dashboard/DoctorDashboard";
import { usePageTitle } from "../hooks/usePageTitle";

export default function DashboardPage() {
  usePageTitle("Dashboard");
  const { user } = useAuth();

  // Each dashboard owns its header. Admins never render the doctor's dashboard,
  // which asks for /appointments/to-document (403 for admins).
  return user?.role === "ADMIN" ? <AdminDashboard /> : <DoctorDashboard />;
}
