import type { Route } from "./+types/api.suggestions";
import { SUGGESTIONS_PER_HOUR, createSuggestion, recentFromSender } from "~/.server/db/queries/suggestions";
import { senderHash } from "~/.server/rate-limit";
import { firstError, formObject, suggestionSchema } from "~/.server/validation";

// POST /api/suggestions: anyone may post to the suggestion box. Without
// accounts, spam is held off by a honeypot field and a per-sender hourly limit.
export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") return new Response(null, { status: 405 });

  const parsed = suggestionSchema.safeParse(formObject(await request.formData()));
  if (!parsed.success) return Response.json({ error: firstError(parsed.error) }, { status: 400 });

  // A filled honeypot is a bot. Answer as if it worked so it learns nothing.
  if (parsed.data.website) return Response.json({ ok: true }, { status: 201 });

  const sender = senderHash(request);
  if ((await recentFromSender(sender)) >= SUGGESTIONS_PER_HOUR) {
    return Response.json(
      { error: "You have sent several suggestions recently. Please try again in an hour." },
      { status: 429, headers: { "retry-after": "3600" } },
    );
  }

  const id = await createSuggestion({ body: parsed.data.text, category: parsed.data.category, senderHash: sender });
  return Response.json({ id }, { status: 201 });
}
