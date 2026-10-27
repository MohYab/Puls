import { Outlet } from "react-router-dom";
import { useClinic } from "../features/clinic/useClinic";

export function AuthLayout() {
  const { data: clinic } = useClinic();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50 px-4 py-8">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-gray-900">Puls</h1>
        <p className="mt-1 text-sm text-gray-600">
          {clinic?.name ?? "Appointments and visit documentation"}
        </p>
      </div>

      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-sm">
        <Outlet />
      </div>
    </main>
  );
}
