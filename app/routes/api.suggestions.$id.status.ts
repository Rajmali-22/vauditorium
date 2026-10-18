import type { Route } from "./+types/api.suggestions.$id.status";
import { setSuggestionStatus } from "~/.server/db/queries/suggestions";
import { firstError, formObject, suggestionStatusSchema } from "~/.server/validation";

// POST /api/suggestions/:id/status: an approver moves a suggestion along, or
// hides it from the public list.
//
// TODO(auth): require a VDT approver.
export async function action({ request, params }: Route.ActionArgs) {
  if (request.method !== "POST") return new Response(null, { status: 405 });

  const parsed = suggestionStatusSchema.safeParse(formObject(await request.formData()));
  if (!parsed.success) return Response.json({ error: firstError(parsed.error) }, { status: 400 });

  if (!(await setSuggestionStatus(params.id, parsed.data.status))) {
    return Response.json({ error: "Suggestion not found." }, { status: 404 });
  }
  return Response.json({ ok: true });
}
