import { Card } from "../../components/Card";
import { StatusBadge } from "../../components/StatusBadge";
import { formatDate, formatTime } from "../../utils/date";
import { usePatientAppointments } from "./usePatients";

export function AppointmentHistory({ patientId }: { patientId: string }) {
  const { data: appointments, isPending, isError, refetch } = usePatientAppointments(patientId);

  return (
    <Card title="Appointment history">
      {isPending && <p className="text-sm text-gray-600">Loading appointments...</p>}

      {isError && (
        <div role="alert" className="text-sm">
          <p className="text-red-700">Could not load appointment history.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-2 rounded border border-red-300 px-3 py-1.5 text-red-700"
          >
            Try again
          </button>
        </div>
      )}

      {appointments && appointments.length === 0 && (
        <p className="text-sm text-gray-600">This patient has no appointments yet.</p>
      )}

      {appointments && appointments.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b text-gray-500">
              <tr>
                <th scope="col" className="py-2 pr-4 font-medium">
                  Date
                </th>
                <th scope="col" className="py-2 pr-4 font-medium">
                  Time
                </th>
                <th scope="col" className="py-2 pr-4 font-medium">
                  Doctor
                </th>
                <th scope="col" className="py-2 pr-4 font-medium">
                  Type
                </th>
                <th scope="col" className="py-2 font-medium">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td className="py-2 pr-4 text-gray-900">{formatDate(appointment.startTime)}</td>
                  <td className="py-2 pr-4 text-gray-700">{formatTime(appointment.startTime)}</td>
                  <td className="py-2 pr-4 text-gray-700">{appointment.doctor.user.name}</td>
                  <td className="py-2 pr-4 text-gray-700">{appointment.appointmentType.name}</td>
                  <td className="py-2">
                    <StatusBadge status={appointment.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
