// Fills a local database with the demo data the UI was designed against.
//
//   npm run db:seed
//
// It deletes everything first, so it refuses to run against anything that is
// not a local database. There is no flag to override that.

import "dotenv/config";
import { driverFor } from "./driver";
import { getDb } from "./index";
import { applicationDocuments, applicationMessages, applications, events, suggestions } from "./schema";

const url = process.env.DATABASE_URL ?? "";
if (driverFor(url) === "neon") {
  console.error("Refusing to seed: DATABASE_URL is not a local database.");
  process.exit(1);
}

const db = await getDb();

await db.delete(events);
await db.delete(applications); // cascades to documents and messages
await db.delete(suggestions);

await db.insert(events).values([
  { date: "2026-10-17", startTime: "10:00", endTime: "12:30", title: "Welcome to VDT", institute: "VIT", type: "induction", organizer: "Central Student Council", expectedAttendees: 400, description: "An introduction to campus life, student services and institute communities.", equipment: "Full AV setup", livestreamRequested: true, livestreamUrl: "https://www.youtube.com/@vosslabs", outcome: "Event completed successfully" },
  { date: "2026-10-20", startTime: "09:30", endTime: "16:00", title: "Annual Research Symposium", institute: "VIT", type: "academic", organizer: "Research Cell", expectedAttendees: 280, description: "A full-day showcase of student and faculty research, presentations and poster sessions.", equipment: "Projector, microphones, recording", livestreamRequested: true },
  // A second booking the same day, back to back with the symposium.
  { date: "2026-10-20", startTime: "16:00", endTime: "18:30", title: "Robotics Club Demo Evening", institute: "VSIT", type: "other", organizer: "Robotics Club", expectedAttendees: 150, description: "Student teams demonstrate this semester's robots.", equipment: "Stage, sound system" },
  { date: "2026-10-22", startTime: "14:00", endTime: "17:00", title: "Industry Connect: Future of AI", institute: "VSIT", type: "talk", organizer: "IT Forum", expectedAttendees: 180, description: "Guest talks and a panel discussion with industry professionals.", equipment: "Projector, 4 microphones", livestreamRequested: true },
  { date: "2026-10-25", startTime: "07:00", endTime: "19:00", title: "Inter-college Hackathon", institute: "VIIE", type: "competition", organizer: "Innovation Council", expectedAttendees: 350, description: "A collaborative build event bringing together teams from across institutes.", equipment: "Wi-Fi, projector, sound system" },
  { date: "2026-10-28", startTime: "10:00", endTime: "13:00", title: "Scholarship Felicitation", institute: "VMMS", type: "ceremony", organizer: "Student Affairs", expectedAttendees: 220, description: "Recognising scholarship recipients and celebrating academic achievement.", equipment: "Stage, microphones, lectern", livestreamRequested: true },
  { date: "2026-11-03", startTime: "10:00", endTime: "15:00", title: "Design Thinking Workshop", institute: "VP", type: "workshop", organizer: "Design Club", expectedAttendees: 120, description: "A practical workshop on human-centred problem solving.", equipment: "Projector, movable seating" },
]);

// Applications in flight, for the booking and approval phases.
const [leadership, alumni] = await db
  .insert(applications)
  .values([
    { title: "Leadership & Motivation Talk", institute: "VSIT", type: "talk", date: "2026-10-30", startTime: "11:00", endTime: "13:00", purpose: "An invited speaker session for students and faculty.", equipment: "Projector, 3 microphones, livestream", expectedAttendees: 240, livestreamRequested: true, organizer: "Student Council", contactName: "Riya Shah", contactEmail: "council@vsit.edu", status: "changes_requested", submittedAt: new Date("2026-10-15T10:00:00+05:30") },
    { title: "Alumni Networking Evening", institute: "VIT", type: "other", date: "2026-11-06", startTime: "17:00", endTime: "19:00", purpose: "A networking evening connecting alumni, current students and faculty.", equipment: "Stage, microphones, projector", expectedAttendees: 300, organizer: "Alumni Relations Cell", contactName: "Dev Patel", contactEmail: "alumni@vit.edu", status: "submitted", submittedAt: new Date("2026-10-16T10:00:00+05:30") },
  ])
  .returning({ id: applications.id });

await db.insert(applicationDocuments).values([
  { applicationId: leadership.id, kind: "proposal", fileName: "Event outline.pdf", contentType: "application/pdf", sizeBytes: 182_000, storageKey: "seed/event-outline.pdf" },
  { applicationId: alumni.id, kind: "proposal", fileName: "Alumni evening brief.pdf", contentType: "application/pdf", sizeBytes: 240_000, storageKey: "seed/alumni-brief.pdf" },
  { applicationId: alumni.id, kind: "permission_letter", fileName: "Permission letter.pdf", contentType: "application/pdf", sizeBytes: 96_000, storageKey: "seed/alumni-permission.pdf" },
]);

await db.insert(applicationMessages).values([
  { applicationId: leadership.id, kind: "documents_requested", authorRole: "approver", authorName: "VDT approver", body: "Please attach the signed institute permission letter.", toStatus: "changes_requested" },
]);

await db.insert(suggestions).values([
  { body: "Add a dedicated student club showcase day", category: "Events", status: "under_consideration" },
]);

console.log("Seeded 7 events, 2 applications, 1 suggestion.");
process.exit(0);
