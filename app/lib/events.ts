// Shared between server and client: how stored event values read on screen.

export const EVENT_TYPE_LABELS = {
  academic: "Academic",
  talk: "Talk",
  ceremony: "Ceremony",
  workshop: "Workshop",
  competition: "Competition",
  induction: "Induction",
  other: "Other",
} as const;

export type EventType = keyof typeof EVENT_TYPE_LABELS;

/** "14:05:00" -> "02:05 PM" */
export function formatTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const suffix = h < 12 ? "AM" : "PM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")} ${suffix}`;
}

/** "09:30 AM – 04:00 PM", or a placeholder while timings are unconfirmed. */
export function formatTimeRange(start: string | null, end: string | null): string {
  if (!start) return "Time to be confirmed";
  return end ? `${formatTime(start)} – ${formatTime(end)}` : `From ${formatTime(start)}`;
}

// The auditorium is in Mumbai. The server runs in UTC, where "today" turns over
// at 05:30 IST, so dates are always taken in India's timezone, never the host's.
const IST_DATE = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** The YYYY-MM-DD date in India for an instant, the format date columns use. */
export function istDate(d: Date = new Date()): string {
  return IST_DATE.format(d);
}

/** Shift a YYYY-MM-DD date by whole months, clamping to the month's last day. */
export function addMonths(iso: string, months: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const target = new Date(Date.UTC(y, m - 1 + months, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(d, lastDay));
  return target.toISOString().slice(0, 10);
}
