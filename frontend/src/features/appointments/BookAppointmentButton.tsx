import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "../../components/Button";
import { Modal } from "../../components/Modal";
import { AppointmentForm } from "../appointments/AppointmentForm";

// The same booking form as in the calendar. Doctors get themselves preselected.
export function BookAppointmentButton({ doctorId }: { doctorId?: string }) {
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
            defaultDoctorId={doctorId}
            onSuccess={close}
            onCancel={close}
          />
        </Modal>
      )}
    </>
  );
}
