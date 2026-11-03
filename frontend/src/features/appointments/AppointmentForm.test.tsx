import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { AppointmentForm } from "./AppointmentForm";
import { createAppointment } from "./appointmentService";

// vi.mock is hoisted above the imports, so the test data lives inside the factories.
vi.mock("../auth/useAuth", () => ({
  useAuth: () => ({ user: { role: "DOCTOR", doctorId: "d1" } }),
}));
vi.mock("../patients/usePatients", () => ({
  usePatients: () => ({
    data: [
      { id: "1", firstName: "Anna", lastName: "Andersson", dateOfBirth: "1985-03-12" },
      { id: "2", firstName: "Anna", lastName: "Berg", dateOfBirth: "1990-07-01" },
    ],
    isError: false,
    refetch: vi.fn(),
  }),
}));
vi.mock("../doctors/useDoctors", () => ({
  useDoctors: () => ({ data: [], isError: false, refetch: vi.fn() }),
}));
vi.mock("../appointmentTypes/useAppointmentTypes", () => ({
  useAppointmentTypes: () => ({ data: [{ id: "t1", name: "Consultation", duration: 30 }] }),
}));
vi.mock("./appointmentService", () => ({
  createAppointment: vi.fn().mockResolvedValue({}),
}));

function renderForm() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <AppointmentForm defaultDate={new Date(2030, 0, 15)} onSuccess={vi.fn()} onCancel={vi.fn()} />
    </QueryClientProvider>
  );
}

describe("AppointmentForm", () => {
  it("books the patient chosen by searching", async () => {
    const user = userEvent.setup();
    renderForm();

    const patient = screen.getByRole("combobox", { name: "Patient" });
    await user.type(patient, "anna 1990");
    await user.click(screen.getByRole("option", { name: /Anna Berg/ }));
    expect(patient).toHaveValue("Anna Berg");

    await user.selectOptions(screen.getByLabelText("Appointment type"), "t1");
    fireEvent.change(screen.getByLabelText("Time"), { target: { value: "10:00" } });
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(vi.mocked(createAppointment).mock.calls[0][0]).toMatchObject({
      patientId: "2",
      doctorId: "d1",
      appointmentTypeId: "t1",
    });
  });

  it("marks the patient field when no patient is chosen", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: "Save" }));

    const patient = screen.getByRole("combobox", { name: "Patient" });
    expect(patient).toHaveAttribute("aria-invalid", "true");
    expect(patient).not.toHaveAccessibleDescription("");
  });
});
