import type { Route } from "./+types/home";
import VAuditorium, { type EventItem } from "../vauditorium/VAuditorium";
import { listCalendarEvents } from "~/.server/db/queries/events";
import { EVENT_TYPE_LABELS, addMonths, formatTimeRange, istDate } from "~/lib/events";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "VAuditorium — VDT Portal" },
    { name: "description", content: "Shared auditorium booking and event calendar for the VDT community of institutes." },
  ];
}

// How far either side of today the calendar loads. One auditorium holds at most
// one event a day, so a year each way is a few hundred small rows, and the
// month view, the past-events archive and outcomes can all read from one list.
const WINDOW_MONTHS = 12;

export async function loader({}: Route.LoaderArgs) {
  const today = istDate();
  const rows = await listCalendarEvents(addMonths(today, -WINDOW_MONTHS), addMonths(today, WINDOW_MONTHS));

  const events: EventItem[] = rows.map((e) => ({
    id: e.id,
    date: e.date,
    title: e.title,
    institute: e.institute,
    type: EVENT_TYPE_LABELS[e.type],
    time: formatTimeRange(e.startTime, e.endTime),
    owner: e.organizer,
    attendees: e.expectedAttendees ?? 0,
    status: e.date < today ? "Past event" : "Booked",
    description: e.description,
    equipment: e.equipment,
    stream: e.livestreamRequested || e.livestreamUrl !== null,
    result: e.outcome ?? undefined,
    streamUrl: e.livestreamUrl ?? undefined,
  }));

  return { events };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return <VAuditorium events={loaderData.events} />;
}
