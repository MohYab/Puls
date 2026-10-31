import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { Button } from "../../components/Button";
import { Modal } from "../../components/Modal";
import { PatientForm } from "./PatientForm";

// The same form as on the patient list. A new patient opens their page.
export function AddPatientButton() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);

  return (
    <>
      <Button variant="secondary" onClick={() => setIsOpen(true)}>
        <UserPlus aria-hidden="true" className="size-4" />
        Add patient
      </Button>
      {isOpen && (
        <Modal title="New patient" onClose={close}>
          <PatientForm
            patient={null}
            onSuccess={(created) => navigate(`/patients/${created.id}`)}
            onCancel={close}
          />
        </Modal>
      )}
    </>
  );
}