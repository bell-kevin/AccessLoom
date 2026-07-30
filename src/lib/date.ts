const calendarDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const pad = (value: number): string => String(value).padStart(2, "0");

export const localDateKey = (value = new Date()): string =>
  `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;

export const parseDisplayDate = (value: string): Date => {
  if (!calendarDatePattern.test(value)) return new Date(value);
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
};

export const shiftCalendarDate = (value: string, days: number): string => {
  const date = parseDisplayDate(value);
  if (Number.isNaN(date.getTime())) return value;
  date.setDate(date.getDate() + days);
  return localDateKey(date);
};

const formatDate = (
  value: string,
  options: Intl.DateTimeFormatOptions
): string => {
  const date = parseDisplayDate(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat(undefined, options).format(date);
};

export const formatShortDate = (value: string): string =>
  formatDate(value, {
    month: "short",
    day: "numeric"
  });

export const formatLongDate = (value: string): string =>
  formatDate(value, {
    weekday: "short",
    month: "long",
    day: "numeric"
  });

export const toDateInput = (value?: string): string => {
  if (!value) return "";
  if (calendarDatePattern.test(value)) return value;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : localDateKey(date);
};

export const daysUntil = (value: string): number => {
  const today = new Date();
  const target = parseDisplayDate(value);
  if (Number.isNaN(target.getTime())) return Number.NaN;
  const todayOrdinal = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const targetOrdinal = Date.UTC(
    target.getFullYear(),
    target.getMonth(),
    target.getDate()
  );
  return Math.round((targetOrdinal - todayOrdinal) / 86_400_000);
};

export const relativeDate = (value: string): string => {
  const days = daysUntil(value);
  if (!Number.isFinite(days)) return "date unavailable";
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days === -1) return "yesterday";
  if (days > 1) return `in ${days} days`;
  return `${Math.abs(days)} days ago`;
};
