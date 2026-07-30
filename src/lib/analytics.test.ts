import { describe, expect, it } from "vitest";
import {
  getBarrierStats,
  getRecentDayStats,
  getSupportComparisons,
  getSupportStats
} from "./analytics";
import type { Adjustment, CheckIn, WorkContext } from "../types";

const adjustment: Adjustment = {
  id: "support-1",
  title: "Written agenda",
  barrier: "Unclear expectations",
  status: "Trying",
  hypothesis: "",
  setup: "",
  successLooksLike: "",
  startedAt: "2026-07-01",
  reviewDate: "2026-08-01",
  effectiveness: 0,
  effort: 0,
  notes: "",
  includeInPassport: false,
  createdAt: "2026-07-01T00:00:00.000Z",
  updatedAt: "2026-07-01T00:00:00.000Z"
};

const checkIn = (
  id: string,
  supportIds: string[],
  friction: number,
  before: number,
  after: number,
  context: WorkContext = "Meeting",
  recordedAt = "2026-07-15T18:00:00.000Z"
): CheckIn => ({
  id,
  recordedAt,
  context,
  activity: "Planning",
  barrier: "Unclear expectations",
  friction,
  capacityBefore: before,
  capacityAfter: after,
  supportIds,
  supportLabels: supportIds.length ? ["Written agenda"] : [],
  note: "",
  win: ""
});

describe("pattern analytics", () => {
  it("groups barriers and calculates capacity change", () => {
    const values = [
      checkIn("a", [], 4, 4, 2),
      checkIn("b", ["support-1"], 2, 3, 4)
    ];
    expect(getBarrierStats(values)[0]).toMatchObject({
      barrier: "Unclear expectations",
      count: 2,
      averageFriction: 3,
      capacityChange: -0.5
    });
  });

  it("marks a repeated low-friction support as promising", () => {
    const values = [
      checkIn("a", ["support-1"], 2, 3, 4),
      checkIn("b", ["support-1"], 1, 4, 4),
      checkIn("baseline", [], 4, 3, 2)
    ];
    expect(getSupportStats(values, [adjustment])[0]).toMatchObject({
      uses: 2,
      averageFriction: 1.5,
      signal: "Promising"
    });
  });

  it("does not call low-friction uses promising when the matched baseline is better", () => {
    const values = [
      checkIn("a", ["support-1"], 2, 3, 4),
      checkIn("b", ["support-1"], 2, 4, 4),
      checkIn("baseline", [], 1, 3, 4)
    ];
    expect(getSupportStats(values, [adjustment])[0].signal).toBe("Mixed");
  });

  it("always returns a complete recent-day series", () => {
    expect(getRecentDayStats([], 7)).toHaveLength(7);
  });

  it("compares matched barrier moments with and without a support", () => {
    const values = [
      checkIn("a", ["support-1"], 2, 3, 4),
      checkIn("b", ["support-1"], 1, 4, 4),
      checkIn("c", [], 4, 3, 1)
    ];
    expect(getSupportComparisons(values, [adjustment])[0]).toMatchObject({
      withCount: 2,
      withoutCount: 1,
      withFriction: 1.5,
      withoutFriction: 4,
      difference: 2.5,
      confidence: "Early clue"
    });
  });

  it("excludes a no-support moment from a different work context", () => {
    const values = [
      checkIn("a", ["support-1"], 2, 3, 4, "Meeting"),
      checkIn("b", [], 4, 3, 1, "Meeting"),
      checkIn("c", [], 5, 3, 1, "Focused work")
    ];
    expect(getSupportComparisons(values, [adjustment])[0]).toMatchObject({
      withCount: 1,
      withoutCount: 1,
      withoutFriction: 4
    });
  });

  it("excludes linked observations after a trial review date", () => {
    const values = [
      checkIn("during", ["support-1"], 2, 3, 4),
      checkIn(
        "after",
        ["support-1"],
        1,
        3,
        4,
        "Meeting",
        "2026-08-05T18:00:00.000Z"
      ),
      checkIn("baseline", [], 4, 3, 2)
    ];
    expect(getSupportComparisons(values, [adjustment])[0]).toMatchObject({
      withCount: 1,
      withoutCount: 1
    });
  });
});
