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

// Bookable hours. A booking can start and end at any time inside them, and a
// day can hold several bookings as long as none overlap. The database enforces
// both (see the events table); these are for forms to check before submitting.
export const AUDITORIUM_OPENS = "07:00";
export const AUDITORIUM_CLOSES = "19:00";

/** "7:5" or "07:05:00" -> "07:05", so times compare as strings. */
function hhmm(t: string): string {
  const [h, m] = t.split(":");
  return `${h.padStart(2, "0")}:${(m ?? "0").padStart(2, "0")}`;
}

/** Whether a start/end pair is a valid booking: in order and within hours. */
export function isWithinHours(start: string, end: string): boolean {
  const s = hhmm(start);
  const e = hhmm(end);
  return s >= AUDITORIUM_OPENS && e <= AUDITORIUM_CLOSES && s < e;
}

/**
 * Whether two slots on the same day overlap. Slots are half-open, so one
 * booking may end at 12:00 and the next start at 12:00.
 */
export function slotsOverlap(a: { start: string; end: string }, b: { start: string; end: string }): boolean {
  return hhmm(a.start) < hhmm(b.end) && hhmm(b.start) < hhmm(a.end);
}

/** "14:05:00" -> "02:05 PM" */
export function formatTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const suffix = h < 12 ? "AM" : "PM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")} ${suffix}`;
}

/** "09:30 AM – 04:00 PM" */
export function formatTimeRange(start: string, end: string): string {
  return `${formatTime(start)} – ${formatTime(end)}`;
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
