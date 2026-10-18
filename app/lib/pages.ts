// The portal's pages and their URLs. Each page has a real address, so refresh,
// the back button and shared links all land where they should.

export type Role = "Viewer" | "Applier" | "Approver";

export const PAGES = {
  Calendar: "/",
  "Past events": "/past-events",
  Outcomes: "/outcomes",
  Suggestions: "/suggestions",
  "My applications": "/my-applications",
  "New booking": "/new-booking",
  Overview: "/overview",
  Applications: "/applications",
} as const;

export type PageName = keyof typeof PAGES;

const BY_SLUG = new Map<string, PageName>(
  (Object.entries(PAGES) as [PageName, string][]).map(([name, path]) => [path.slice(1), name]),
);

/** The page for a URL segment ("" is the calendar), or null if there is none. */
export function pageForSlug(slug: string | undefined): PageName | null {
  return BY_SLUG.get(slug ?? "") ?? null;
}

// Pages that belong to one role. Opening one switches the preview role to it,
// so a shared link to /applications opens as an approver would see it. Calendar
// and Suggestions are for everyone and keep the current role.
// TODO(auth): replace with the signed-in user's real role.
export const PAGE_ROLE: Partial<Record<PageName, Role>> = {
  "Past events": "Viewer",
  Outcomes: "Viewer",
  "My applications": "Applier",
  "New booking": "Applier",
  Overview: "Approver",
  Applications: "Approver",
};

export const ROLE_HOME: Record<Role, string> = {
  Viewer: PAGES.Calendar,
  Applier: PAGES.Calendar,
  Approver: PAGES.Overview,
};
