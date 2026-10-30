import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StatusSummary } from "./StatusSummary";

describe("StatusSummary", () => {
  it("shows every status with its count, also when it is 0", () => {
    render(
      <StatusSummary
        counts={{ SCHEDULED: 3, CONFIRMED: 0, COMPLETED: 2, NO_SHOW: 1, CANCELLED: 0 }}
        isLoading={false}
        isError={false}
        onRetry={() => {}}
      />
    );

    const labels = screen.getAllByRole("term").map((term) => term.textContent);
    const values = screen.getAllByRole("definition").map((value) => value.textContent);

    expect(labels).toEqual(["Scheduled", "Confirmed", "Completed", "No-show", "Cancelled"]);
    expect(values).toEqual(["3", "0", "2", "1", "0"]);
  });

  it("offers to try again when loading failed", async () => {
    const onRetry = vi.fn();
    render(<StatusSummary counts={undefined} isLoading={false} isError onRetry={onRetry} />);

    await userEvent.click(screen.getByRole("button", { name: /try again/i }));

    expect(onRetry).toHaveBeenCalled();
    expect(screen.queryByRole("term")).not.toBeInTheDocument();
  });
});