import { describe, expect, it } from "vitest";
import {
  localDateKey,
  shiftCalendarDate,
  toDateInput
} from "./date";

describe("local calendar dates", () => {
  it("keeps date-only form values unchanged", () => {
    expect(toDateInput("2026-07-29")).toBe("2026-07-29");
  });

  it("moves across daylight-saving boundaries as calendar days", () => {
    expect(shiftCalendarDate("2024-03-10", 1)).toBe("2024-03-11");
    expect(shiftCalendarDate("2024-11-03", -1)).toBe("2024-11-02");
  });

  it("builds a key from local date parts instead of UTC serialization", () => {
    const value = new Date(2026, 6, 29, 23, 55);
    expect(localDateKey(value)).toBe("2026-07-29");
  });
});
