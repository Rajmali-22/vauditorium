import {
  pgTable,
  uuid,
  integer,
  text,
  date,
  time,
  boolean,
  timestamp,
  index,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { instituteEnum, eventTypeEnum, eventStatusEnum } from "./enums";
import { applications } from "./applications";

// What the public calendar shows. A row is created when an application is
// approved, or entered directly for events that predate the portal.
//
// A day holds any number of events between 07:00 and 19:00, as long as no two
// confirmed ones overlap. The overlap rule is an exclusion constraint,
// events_no_overlap, in migration 0001: Drizzle cannot express those, so it is
// hand-written SQL. Enforcing it in the database rather than only in the form
// means two approvals racing for the same slot cannot both land.
export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    date: date("date", { mode: "string" }).notNull(),
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
    title: text("title").notNull(),
    institute: instituteEnum("institute").notNull(),
    type: eventTypeEnum("type").notNull(),
    organizer: text("organizer").notNull(),
    description: text("description").notNull().default(""),
    equipment: text("equipment").notNull().default(""),
    expectedAttendees: integer("expected_attendees"),
    livestreamRequested: boolean("livestream_requested").notNull().default(false),
    // YouTube link, filled in once the stream exists.
    livestreamUrl: text("livestream_url"),
    // Results and outcomes after the event, e.g. hackathon winners.
    outcome: text("outcome"),
    status: eventStatusEnum("status").notNull().default("confirmed"),
    applicationId: uuid("application_id")
      .unique()
      .references(() => applications.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    // Keep in step with AUDITORIUM_OPENS / AUDITORIUM_CLOSES in app/lib/events.ts.
    check(
      "events_within_hours",
      sql`${t.startTime} >= '07:00' AND ${t.endTime} <= '19:00' AND ${t.startTime} < ${t.endTime}`,
    ),
    index("events_date_idx").on(t.date, t.startTime),
  ],
);
