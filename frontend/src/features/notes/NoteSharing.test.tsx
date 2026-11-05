import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { NoteSharing } from "./NoteSharing";
import type { ClinicalNote } from "../../types/note";

// Created before the vi.mock factories run, so the test can check the call.
const { shareMutate } = vi.hoisted(() => ({ shareMutate: vi.fn() }));

vi.mock("../doctors/useDoctors", () => {
  const doctor = (id: string, name: string) => ({
    id,
    specialization: null,
    user: {
      id: `u-${id}`,
      name,
      email: `${id}@example.com`,
      phone: null,
      isActive: true,
      deactivatedAt: null,
    },
  });
  return {
    useDoctors: () => ({
      data: [doctor("d1", "Erik Lind"), doctor("d2", "Sara Nilsson"), doctor("d3", "Omar Haddad")],
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    }),
  };
});

vi.mock("./useNotes", () => ({
  useNoteShares: () => ({
    data: [
      {
        id: "s1",
        createdAt: "2026-10-01T10:00:00Z",
        doctor: { id: "d2", user: { name: "Sara Nilsson" } },
      },
    ],
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useShareNote: () => ({ mutate: shareMutate, isPending: false, isError: false, isSuccess: false }),
  useRevokeNoteShare: () => ({ mutate: vi.fn(), reset: vi.fn(), isPending: false, isError: false }),
}));

// Erik (d1) wrote the note and it is already shared with Sara (d2).
const note = { id: "n1", doctorId: "d1" } as ClinicalNote;

describe("NoteSharing", () => {
  it("offers only doctors who can be chosen", async () => {
    const user = userEvent.setup();
    render(<NoteSharing note={note} />);

    await user.click(screen.getByRole("combobox", { name: "Doctor" }));
    const names = screen.getAllByRole("option").map((option) => option.textContent);
    expect(names).toEqual(["Omar Haddad"]);
  });

  it("shares with the doctor found by searching, after consent", async () => {
    const user = userEvent.setup();
    render(<NoteSharing note={note} />);

    await user.type(screen.getByRole("combobox", { name: "Doctor" }), "omar");
    await user.click(screen.getByRole("option", { name: /Omar Haddad/ }));
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Share note" }));

    expect(shareMutate).toHaveBeenCalledWith("d3", expect.anything());
  });
});
