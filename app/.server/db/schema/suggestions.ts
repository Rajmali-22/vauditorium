import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { suggestionStatusEnum } from "./enums";

// The public suggestion box. Anonymous until auth lands.
export const suggestions = pgTable(
  "suggestions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    body: text("body").notNull(),
    category: text("category").notNull().default("General"),
    status: suggestionStatusEnum("status").notNull().default("open"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("suggestions_created_idx").on(t.createdAt)],
);
