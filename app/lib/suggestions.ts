// Shared between server and client: the suggestion box vocabulary.

export const SUGGESTION_CATEGORIES = [
  "General",
  "Events",
  "Facilities",
  "Booking process",
  "Accessibility",
] as const;

export type SuggestionCategory = (typeof SUGGESTION_CATEGORIES)[number];

export const SUGGESTION_STATUS_LABELS = {
  open: "Open",
  under_consideration: "Under consideration",
  planned: "Planned",
  declined: "Declined",
  hidden: "Hidden",
} as const;

export type SuggestionStatus = keyof typeof SUGGESTION_STATUS_LABELS;

export const SUGGESTION_MIN_LENGTH = 8;
export const SUGGESTION_MAX_LENGTH = 1000;

export interface SuggestionView {
  id: string;
  text: string;
  category: string;
  status: SuggestionStatus;
  statusLabel: string;
  date: string;
}
