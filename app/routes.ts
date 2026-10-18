import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("api/applications", "routes/api.applications.ts"),
  route("api/applications/:id/documents", "routes/api.applications.$id.documents.ts"),
  route("api/applications/:id/review", "routes/api.applications.$id.review.ts"),
  route("api/applications/:id/reply", "routes/api.applications.$id.reply.ts"),
  route("api/suggestions", "routes/api.suggestions.ts"),
  route("api/suggestions/:id/status", "routes/api.suggestions.$id.status.ts"),
  route("documents/:id", "routes/documents.$id.ts"),
  route("calendar.ics", "routes/calendar.ics.ts"),
  // Every portal page is the same screen at its own URL; see app/lib/pages.ts.
  route(":page", "routes/home.tsx", { id: "page" }),
] satisfies RouteConfig;
