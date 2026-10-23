import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePageTitle } from "./usePageTitle";

describe("usePageTitle", () => {
  it("sets the tab title with the app name", () => {
    renderHook(() => usePageTitle("Calendar"));

    expect(document.title).toBe("Calendar – Puls");
  });

  it("updates the title when the page title changes", () => {
    const { rerender } = renderHook(({ title }) => usePageTitle(title), {
      initialProps: { title: "Patients" },
    });

    rerender({ title: "Patient" });

    expect(document.title).toBe("Patient – Puls");
  });
});
