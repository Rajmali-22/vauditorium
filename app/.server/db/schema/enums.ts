import { pgEnum } from "drizzle-orm/pg-core";

// The five VDT institutes that share V-Auditorium.
export const instituteEnum = pgEnum("institute", ["VIT", "VSIT", "VP", "VIIE", "VMMS"]);

export const eventTypeEnum = pgEnum("event_type", [
  "academic",
  "talk",
  "ceremony",
  "workshop",
  "competition",
  "induction",
  "other",
]);

// An event on the calendar is confirmed until someone cancels it. "Past" is not
// a status: it is derived from the date, so nothing has to flip it at midnight.
export const eventStatusEnum = pgEnum("event_status", ["confirmed", "cancelled"]);

// Lifecycle of a booking application. It may loop between under_review and
// changes_requested any number of times before a decision.
//
//   submitted -> under_review -> approved | declined
//                     ^   |
//                     |   v
//              changes_requested
//
// withdrawn is the applier pulling it back at any point before a decision.
export const applicationStatusEnum = pgEnum("application_status", [
  "submitted",
  "under_review",
  "changes_requested",
  "approved",
  "declined",
  "withdrawn",
]);

export const documentKindEnum = pgEnum("document_kind", [
  "permission_letter",
  "proposal",
  "other",
]);

// One entry on an application's approval trail. status_change rows record who
// moved it and why, so the trail reads as a conversation with decisions in it.
export const messageKindEnum = pgEnum("message_kind", [
  "comment",
  "query",
  "documents_requested",
  "status_change",
]);

// Who wrote a trail entry. Replaced by a user reference once auth lands.
export const authorRoleEnum = pgEnum("author_role", ["applier", "approver"]);

export const suggestionStatusEnum = pgEnum("suggestion_status", [
  "open",
  "under_consideration",
  "planned",
  "declined",
]);
