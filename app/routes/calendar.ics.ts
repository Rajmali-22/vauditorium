import { listCalendarEvents } from "~/.server/db/queries/events";
import { addMonths, istDate } from "~/lib/events";

// GET /calendar.ics: the confirmed schedule as an iCalendar file, for
// Google Calendar, Outlook or Apple Calendar. Times are Asia/Kolkata.

const escape = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1");
const stamp = (date: string, time: string) => `${date.replace(/-/g, "")}T${time.slice(0, 5).replace(":", "")}00`;

// RFC 5545 caps lines at 75 octets; longer ones continue with a leading space.
function fold(line: string): string {
  const out: string[] = [];
  for (let i = 0; i < line.length; i += 73) out.push((i ? " " : "") + line.slice(i, i + 73));
  return out.join("\r\n");
}

export async function loader() {
  const today = istDate();
  const rows = await listCalendarEvents(addMonths(today, -12), addMonths(today, 12));
  const now = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//VOSS Labs//VAuditorium//EN",
    "CALSCALE:GREGORIAN",
    "X-WR-CALNAME:V-Auditorium",
    "X-WR-TIMEZONE:Asia/Kolkata",
    ...rows.flatMap((e) => [
      "BEGIN:VEVENT",
      `UID:${e.id}@vauditorium`,
      `DTSTAMP:${now}`,
      `DTSTART;TZID=Asia/Kolkata:${stamp(e.date, e.startTime)}`,
      `DTEND;TZID=Asia/Kolkata:${stamp(e.date, e.endTime)}`,
      `SUMMARY:${escape(e.title)}`,
      `DESCRIPTION:${escape(`${e.institute} · ${e.organizer}\n${e.description}`)}`,
      "LOCATION:V-Auditorium",
      ...(e.livestreamUrl ? [`URL:${escape(e.livestreamUrl)}`] : []),
      "END:VEVENT",
    ]),
    "END:VCALENDAR",
  ];

  return new Response(lines.map(fold).join("\r\n") + "\r\n", {
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "content-disposition": 'attachment; filename="v-auditorium.ics"',
      "cache-control": "public, max-age=300",
    },
  });
}
