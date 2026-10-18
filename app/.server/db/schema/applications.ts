import {
  pgTable,
  uuid,
  integer,
  text,
  date,
  time,
  boolean,
  bigint,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import {
  instituteEnum,
  eventTypeEnum,
  applicationStatusEnum,
  documentKindEnum,
  messageKindEnum,
  authorRoleEnum,
} from "./enums";

// A request to book the auditorium. It reaches the calendar only once approved,
// when an events row is created from it (events.application_id).
export const applications = pgTable(
  "applications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Human-facing reference, shown as VA-001. Never reused, never edited.
    number: integer("number").notNull().unique().generatedAlwaysAsIdentity(),
    title: text("title").notNull(),
    institute: instituteEnum("institute").notNull(),
    type: eventTypeEnum("type").notNull(),
    date: date("date", { mode: "string" }).notNull(),
    startTime: time("start_time"),
    endTime: time("end_time"),
    purpose: text("purpose").notNull(),
    requirements: text("requirements"),
    equipment: text("equipment"),
    expectedAttendees: integer("expected_attendees"),
    livestreamRequested: boolean("livestream_requested").notNull().default(false),
    // The committee, student body or institute body applying.
    organizer: text("organizer").notNull(),
    contactName: text("contact_name").notNull(),
    contactEmail: text("contact_email").notNull(),
    contactPhone: text("contact_phone"),
    status: applicationStatusEnum("status").notNull().default("submitted"),
    submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
    decidedAt: timestamp("decided_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("applications_status_idx").on(t.status, t.submittedAt),
    index("applications_date_idx").on(t.date),
  ],
);

// Permission letters and supporting documents. The bytes live in object
// storage; this row is the pointer and what the approver sees in the list.
export const applicationDocuments = pgTable(
  "application_documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    applicationId: uuid("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    kind: documentKindEnum("kind").notNull().default("other"),
    fileName: text("file_name").notNull(),
    contentType: text("content_type").notNull(),
    sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
    storageKey: text("storage_key").notNull().unique(),
    uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("application_documents_app_idx").on(t.applicationId)],
);

// The approval trail: queries, answers, document requests and decisions, in
// order, kept with the application they belong to.
export const applicationMessages = pgTable(
  "application_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    applicationId: uuid("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    kind: messageKindEnum("kind").notNull(),
    authorRole: authorRoleEnum("author_role").notNull(),
    authorName: text("author_name").notNull(),
    body: text("body").notNull(),
    // Set on status_change rows: what the application moved to.
    toStatus: applicationStatusEnum("to_status"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("application_messages_app_idx").on(t.applicationId, t.createdAt)],
);
