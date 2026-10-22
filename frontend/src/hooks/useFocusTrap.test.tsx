import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "../components/Modal";

function PageWithModal() {
  return (
    <>
      <button type="button">Outside</button>
      <Modal title="Edit" onClose={vi.fn()}>
        <input aria-label="Name" />
        <button type="button" disabled>
          Disabled
        </button>
        <button type="button">Save</button>
      </Modal>
    </>
  );
}

function NestedModals() {
  const [isInnerOpen, setIsInnerOpen] = useState(false);
  return (
    <Modal title="Outer" onClose={vi.fn()}>
      <button type="button" onClick={() => setIsInnerOpen(true)}>
        Open inner
      </button>
      {isInnerOpen && (
        <Modal title="Inner" onClose={() => setIsInnerOpen(false)}>
          <button type="button">Inner action</button>
        </Modal>
      )}
    </Modal>
  );
}

describe("useFocusTrap (through Modal)", () => {
  it("keeps Tab inside the dialog, skips disabled buttons and wraps around", async () => {
    const user = userEvent.setup();
    render(<PageWithModal />);

    await user.tab();
    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
    await user.tab();
    expect(screen.getByLabelText("Name")).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Save" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();

    expect(screen.getByRole("button", { name: "Outside" })).not.toHaveFocus();
  });

  it("wraps backwards with Shift+Tab", async () => {
    const user = userEvent.setup();
    render(<PageWithModal />);

    await user.tab();
    await user.tab({ shift: true });

    expect(screen.getByRole("button", { name: "Save" })).toHaveFocus();
  });

  it("only traps the topmost dialog when one is opened on top of another", async () => {
    const user = userEvent.setup();
    render(<NestedModals />);

    await user.click(screen.getByRole("button", { name: "Open inner" }));
    const inner = screen.getByRole("dialog", { name: "Inner" });

    await user.tab();
    expect(within(inner).getByRole("button", { name: "Close" })).toHaveFocus();
    await user.tab();
    expect(within(inner).getByRole("button", { name: "Inner action" })).toHaveFocus();
    await user.tab();
    expect(within(inner).getByRole("button", { name: "Close" })).toHaveFocus();

    expect(screen.getByRole("button", { name: "Open inner" })).not.toHaveFocus();
  });
});