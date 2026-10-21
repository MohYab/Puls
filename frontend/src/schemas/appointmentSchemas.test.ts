import { describe, expect, it } from "vitest";
import { appointmentTimeSchema, correctionFormSchema } from "./appointmentSchemas";

describe("appointmentTimeSchema (opening hours 07:00–17:00)", () => {
  it.each(["07:00", "12:30", "16:55"])("accepts %s", (time) => {
    expect(appointmentTimeSchema.safeParse(time).success).toBe(true);
  });

  it.each(["06:59", "17:00", "18:00", ""])("rejects %s", (time) => {
    expect(appointmentTimeSchema.safeParse(time).success).toBe(false);
  });
});

describe("correctionFormSchema", () => {
  it("requires a reason of at least 10 characters", () => {
    expect(correctionFormSchema.safeParse({ status: "COMPLETED", reason: "." }).success).toBe(
      false
    );
    expect(
      correctionFormSchema.safeParse({ status: "COMPLETED", reason: "Patient attended after all" })
        .success
    ).toBe(true);
  });

  it("does not count spaces around the reason", () => {
    expect(
      correctionFormSchema.safeParse({ status: "COMPLETED", reason: "   short    " }).success
    ).toBe(false);
  });
});
