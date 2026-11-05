import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { Button } from "../../components/Button";
import type { ButtonVariant } from "../../components/buttonStyles";
import { Modal } from "../../components/Modal";
import { PatientForm } from "./PatientForm";

// The patient form in a modal. A new patient opens their page.
export function AddPatientButton({ variant = "secondary" }: { variant?: ButtonVariant }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);

  return (
    <>
      <Button variant={variant} onClick={() => setIsOpen(true)}>
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
