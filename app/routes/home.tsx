import type { Route } from "./+types/home";
import VAuditorium from "../vauditorium/VAuditorium";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "VAuditorium — VDT Portal" },
    { name: "description", content: "Shared auditorium booking and event calendar for the VDT community of institutes." },
  ];
}

export default function Home() {
  return <VAuditorium />;
}
