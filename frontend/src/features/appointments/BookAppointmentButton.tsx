import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "../../components/Button";
import { Modal } from "../../components/Modal";
import { AppointmentForm } from "../appointments/AppointmentForm";

interface BookAppointmentButtonProps {
  /** Admins: the doctor to preselect. Doctors always book for themselves. */
  doctorId?: string;
  /** The patient to preselect, e.g. on the patient page. */
  patientId?: string;
}

// The same booking form as in the calendar.
export function BookAppointmentButton({ doctorId, patientId }: BookAppointmentButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <Plus aria-hidden="true" className="size-4" />
        Book appointment
      </Button>
      {isOpen && (
        <Modal title="Book appointment" onClose={close}>
          <AppointmentForm
            defaultDate={new Date()}
            defaultPatientId={patientId}
            defaultDoctorId={doctorId}
            onSuccess={close}
            onCancel={close}
          />
        </Modal>
      )}
    </>
  );
}
