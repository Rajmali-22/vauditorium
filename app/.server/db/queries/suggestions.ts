import { and, count, desc, eq, gt, ne, sql } from "drizzle-orm";
import { getDb } from "../index";
import { suggestions } from "../schema";
import { SUGGESTION_STATUS_LABELS, type SuggestionStatus, type SuggestionView } from "~/lib/suggestions";

// Five suggestions an hour per sender is generous for a person and useless to
// a script.
export const SUGGESTIONS_PER_HOUR = 5;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

/** The public list: newest first, hidden ones left out. */
export async function listSuggestions(limit = 100): Promise<SuggestionView[]> {
  const db = await getDb();
  const rows = await db
    .select()
    .from(suggestions)
    .where(ne(suggestions.status, "hidden"))
    .orderBy(desc(suggestions.createdAt))
    .limit(limit);
  return rows.map((s) => ({
    id: s.id,
    text: s.body,
    category: s.category,
    status: s.status,
    statusLabel: SUGGESTION_STATUS_LABELS[s.status],
    date: fmtDate(s.createdAt),
  }));
}

/** How many suggestions this sender has posted in the last hour. */
export async function recentFromSender(senderHash: string): Promise<number> {
  const db = await getDb();
  const [row] = await db
    .select({ n: count() })
    .from(suggestions)
    .where(and(eq(suggestions.senderHash, senderHash), gt(suggestions.createdAt, sql`now() - interval '1 hour'`)));
  return row.n;
}

export async function createSuggestion(input: { body: string; category: string; senderHash: string }): Promise<string> {
  const db = await getDb();
  const [row] = await db.insert(suggestions).values(input).returning({ id: suggestions.id });
  return row.id;
}

/** Returns false if there is no such suggestion. */
export async function setSuggestionStatus(id: string, status: SuggestionStatus): Promise<boolean> {
  if (!UUID.test(id)) return false;
  const db = await getDb();
  const rows = await db
    .update(suggestions)
    .set({ status })
    .where(eq(suggestions.id, id))
    .returning({ id: suggestions.id });
  return rows.length > 0;
}
