import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../features/auth/useAuth";
import { AdminDashboard } from "../features/dashboard/AdminDashboard";
import { DoctorDashboard } from "../features/dashboard/DoctorDashboard";
import { usePageTitle } from "../hooks/usePageTitle";
import { formatLongDate } from "../utils/date";

export default function DashboardPage() {
  usePageTitle("Dashboard");
  const { user } = useAuth();

  return (
    <div>
      <PageHeader title="Dashboard" description={formatLongDate(new Date())} />
      {/* Admins never render the doctor's dashboard, which asks for notes-related data (403). */}
      {user?.role === "ADMIN" ? <AdminDashboard /> : <DoctorDashboard />}
    </div>
  );
}