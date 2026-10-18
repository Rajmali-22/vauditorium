import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { suggestionStatusEnum } from "./enums";

// The public suggestion box. Anonymous: anyone may post, and nothing about the
// sender is stored except a keyed hash of their IP, used only to rate-limit.
export const suggestions = pgTable(
  "suggestions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    body: text("body").notNull(),
    category: text("category").notNull().default("General"),
    status: suggestionStatusEnum("status").notNull().default("open"),
    // HMAC of the sender's IP. Not reversible to the address; see
    // app/.server/rate-limit.ts.
    senderHash: text("sender_hash"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("suggestions_created_idx").on(t.createdAt),
    index("suggestions_sender_idx").on(t.senderHash, t.createdAt),
  ],
);
