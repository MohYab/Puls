import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "./StatusBadge";

describe("StatusBadge", () => {
  it("shows a readable label for the status", () => {
    render(<StatusBadge status="NO_SHOW" />);

    expect(screen.getByText("No-show")).toBeInTheDocument();
  });
});
