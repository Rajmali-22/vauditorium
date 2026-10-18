import { and, asc, eq, gte, lte } from "drizzle-orm";
import { getDb } from "../index";
import { events } from "../schema";

export type CalendarEventRow = typeof events.$inferSelect;

/**
 * Confirmed events between two dates, inclusive, in date order. This is the
 * public calendar: cancelled events and unapproved applications never appear.
 */
export async function listCalendarEvents(from: string, to: string): Promise<CalendarEventRow[]> {
  const db = await getDb();
  return db
    .select()
    .from(events)
    .where(and(eq(events.status, "confirmed"), gte(events.date, from), lte(events.date, to)))
    .orderBy(asc(events.date), asc(events.startTime));
}
