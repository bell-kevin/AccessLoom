import type {
  Adjustment,
  BarrierCategory,
  CheckIn,
  WorkContext
} from "../types";
import { localDateKey, shiftCalendarDate } from "./date";

export interface BarrierStat {
  barrier: BarrierCategory;
  count: number;
  averageFriction: number;
  capacityChange: number;
}

export interface SupportStat {
  id: string;
  title: string;
  uses: number;
  comparisonUses: number;
  averageFriction: number;
  averageCapacityChange: number;
  signal: "Promising" | "Mixed" | "Needs more data";
}

export interface DayStat {
  key: string;
  label: string;
  average: number;
  count: number;
}

export interface SupportComparison {
  id: string;
  title: string;
  withCount: number;
  withoutCount: number;
  withFriction: number;
  withoutFriction: number;
  difference: number;
  confidence: "Early clue" | "Repeat signal" | "Not comparable yet";
  context: WorkContext | "";
  windowLabel: string;
}

const round = (value: number, digits = 1): number => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

interface ComparableEntries {
  withSupport: CheckIn[];
  withoutSupport: CheckIn[];
  context: WorkContext | "";
  windowLabel: string;
}

const getComparableEntries = (
  adjustment: Adjustment,
  checkIns: CheckIn[]
): ComparableEntries => {
  if (
    adjustment.status === "Trying" &&
    (!adjustment.startedAt || !adjustment.reviewDate)
  ) {
    return {
      withSupport: [],
      withoutSupport: [],
      context: "",
      windowLabel: "Trial dates needed"
    };
  }
  const today = localDateKey();
  const windowEnd =
    adjustment.reviewDate && adjustment.reviewDate < today
      ? adjustment.reviewDate
      : today;
  const baselineStart = adjustment.startedAt
    ? shiftCalendarDate(adjustment.startedAt, -28)
    : "";
  const keyFor = (item: CheckIn): string =>
    localDateKey(new Date(item.recordedAt));
  const withinEnd = (item: CheckIn): boolean => keyFor(item) <= windowEnd;
  const linked = checkIns.filter(
    (item) =>
      item.barrier === adjustment.barrier &&
      item.supportIds.includes(adjustment.id) &&
      withinEnd(item) &&
      (!adjustment.startedAt || keyFor(item) >= adjustment.startedAt)
  );
  const contextCounts = new Map<WorkContext, number>();
  linked.forEach((item) => {
    contextCounts.set(item.context, (contextCounts.get(item.context) ?? 0) + 1);
  });
  const context =
    [...contextCounts.entries()].sort(
      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
    )[0]?.[0] ?? "";
  if (!context) {
    return {
      withSupport: [],
      withoutSupport: [],
      context: "",
      windowLabel: adjustment.startedAt
        ? "Trial plus 28-day baseline"
        : "All recorded dates"
    };
  }
  return {
    withSupport: linked.filter((item) => item.context === context),
    withoutSupport: checkIns.filter(
      (item) =>
        item.barrier === adjustment.barrier &&
        item.context === context &&
        !item.supportIds.includes(adjustment.id) &&
        withinEnd(item) &&
        (!baselineStart || keyFor(item) >= baselineStart)
    ),
    context,
    windowLabel: adjustment.startedAt
      ? "Trial plus 28-day baseline"
      : "All recorded dates"
  };
};

export const getBarrierStats = (checkIns: CheckIn[]): BarrierStat[] => {
  const grouped = new Map<BarrierCategory, CheckIn[]>();
  checkIns.forEach((checkIn) => {
    const values = grouped.get(checkIn.barrier) ?? [];
    values.push(checkIn);
    grouped.set(checkIn.barrier, values);
  });

  return [...grouped.entries()]
    .map(([barrier, values]) => ({
      barrier,
      count: values.length,
      averageFriction: round(
        values.reduce((sum, value) => sum + value.friction, 0) / values.length
      ),
      capacityChange: round(
        values.reduce(
          (sum, value) => sum + value.capacityAfter - value.capacityBefore,
          0
        ) / values.length
      )
    }))
    .sort(
      (a, b) =>
        b.count * b.averageFriction - a.count * a.averageFriction ||
        b.averageFriction - a.averageFriction
    );
};

export const getSupportStats = (
  checkIns: CheckIn[],
  adjustments: Adjustment[]
): SupportStat[] =>
  adjustments
    .map((adjustment) => {
      const uses = checkIns.filter((checkIn) =>
        checkIn.supportIds.includes(adjustment.id)
      );
      const comparable = getComparableEntries(adjustment, checkIns);
      const capacityChange = uses.length
        ? uses.reduce(
            (sum, value) => sum + value.capacityAfter - value.capacityBefore,
            0
          ) / uses.length
        : 0;
      const averageFriction = uses.length
        ? uses.reduce((sum, value) => sum + value.friction, 0) / uses.length
        : 0;
      const comparableWithFriction = comparable.withSupport.length
        ? comparable.withSupport.reduce((sum, value) => sum + value.friction, 0) /
          comparable.withSupport.length
        : 0;
      const comparableWithoutFriction = comparable.withoutSupport.length
        ? comparable.withoutSupport.reduce(
            (sum, value) => sum + value.friction,
            0
          ) / comparable.withoutSupport.length
        : 0;
      const comparableCapacityChange = comparable.withSupport.length
        ? comparable.withSupport.reduce(
            (sum, value) =>
              sum + value.capacityAfter - value.capacityBefore,
            0
          ) / comparable.withSupport.length
        : 0;
      const signal =
        comparable.withSupport.length < 2 ||
        comparable.withoutSupport.length < 1
          ? "Needs more data"
          : comparableWithoutFriction - comparableWithFriction >= 0.5 &&
              comparableCapacityChange >= -0.5
            ? "Promising"
            : "Mixed";
      return {
        id: adjustment.id,
        title: adjustment.title,
        uses: uses.length,
        comparisonUses: comparable.withSupport.length,
        averageFriction: round(averageFriction),
        averageCapacityChange: round(capacityChange),
        signal
      } satisfies SupportStat;
    })
    .sort((a, b) => b.uses - a.uses || a.averageFriction - b.averageFriction);

export const getSupportComparisons = (
  checkIns: CheckIn[],
  adjustments: Adjustment[]
): SupportComparison[] =>
  adjustments
    .map((adjustment) => {
      const { withSupport, withoutSupport, context, windowLabel } =
        getComparableEntries(adjustment, checkIns);
      const withFriction = withSupport.length
        ? withSupport.reduce((sum, item) => sum + item.friction, 0) /
          withSupport.length
        : 0;
      const withoutFriction = withoutSupport.length
        ? withoutSupport.reduce((sum, item) => sum + item.friction, 0) /
          withoutSupport.length
        : 0;
      const confidence =
        withSupport.length >= 3 && withoutSupport.length >= 3
          ? "Repeat signal"
          : withSupport.length >= 1 && withoutSupport.length >= 1
            ? "Early clue"
            : "Not comparable yet";
      return {
        id: adjustment.id,
        title: adjustment.title,
        withCount: withSupport.length,
        withoutCount: withoutSupport.length,
        withFriction: round(withFriction),
        withoutFriction: round(withoutFriction),
        difference: round(withoutFriction - withFriction),
        confidence,
        context,
        windowLabel
      } satisfies SupportComparison;
    })
    .filter((item) => item.withCount > 0)
    .sort((a, b) => b.difference - a.difference || b.withCount - a.withCount);

export const getRecentDayStats = (
  checkIns: CheckIn[],
  days = 7
): DayStat[] => {
  const formatter = new Intl.DateTimeFormat(undefined, { weekday: "short" });
  return Array.from({ length: days }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - index - 1));
    const key = localDateKey(date);
    const values = checkIns.filter(
      (checkIn) => localDateKey(new Date(checkIn.recordedAt)) === key
    );
    return {
      key,
      label: formatter.format(date).slice(0, 2),
      average: values.length
        ? round(values.reduce((sum, value) => sum + value.friction, 0) / values.length)
        : 0,
      count: values.length
    };
  });
};

export const getPatternSummary = (
  checkIns: CheckIn[],
  adjustments: Adjustment[]
): string => {
  if (checkIns.length < 3) {
    return "Three check-ins will reveal your first pattern. There is no score to chase.";
  }
  const topBarrier = getBarrierStats(checkIns)[0];
  const support = getSupportStats(checkIns, adjustments).find(
    (item) => item.signal === "Promising"
  );
  if (topBarrier && support) {
    return `${topBarrier.barrier} is your strongest friction signal. ${support.title} looks promising in ${support.comparisonUses} matched check-ins.`;
  }
  if (topBarrier) {
    return `${topBarrier.barrier} appears most often. Try one small support, then compare the next few check-ins.`;
  }
  return "Your patterns will appear here as you add check-ins.";
};

export const averageFriction = (checkIns: CheckIn[]): number =>
  checkIns.length
    ? round(
        checkIns.reduce((sum, checkIn) => sum + checkIn.friction, 0) /
          checkIns.length
      )
    : 0;
