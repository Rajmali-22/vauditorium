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
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { instituteEnum, eventTypeEnum, eventStatusEnum } from "./enums";
import { applications } from "./applications";

// What the public calendar shows. A row is created when an application is
// approved, or entered directly for events that predate the portal.
export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    date: date("date", { mode: "string" }).notNull(),
    // Null until the organiser confirms timings ("time to be confirmed").
    startTime: time("start_time"),
    endTime: time("end_time"),
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
    // One auditorium, one confirmed event per day. Enforced here rather than
    // only in the form, so two approvals racing for the same date cannot both
    // land. Cancelled rows are excluded so a freed date can be booked again.
    uniqueIndex("events_one_confirmed_per_day")
      .on(t.date)
      .where(sql`status = 'confirmed'`),
    index("events_date_idx").on(t.date),
  ],
);
