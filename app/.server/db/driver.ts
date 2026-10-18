// Which Postgres driver a connection string needs.
//
// Production runs on Neon over HTTP: stateless, nothing held open between
// requests, the right shape for a serverless deploy. That driver speaks Neon's
// HTTP endpoint, not the Postgres wire protocol, so it cannot reach a Postgres
// on a contributor's machine. Two local options cover that:
//
//   pglite:./.pglite                       in-process Postgres (WASM), no Docker
//   postgres://user:pass@localhost:5432/db  any local Postgres, via node-postgres
//
// The rule is deliberately conservative: Neon unless the URL is unmistakably
// local. Sniffing for ".neon.tech" instead would silently swap the driver under
// anyone self-hosting, and production is not the place to discover that.

export type Driver = "neon" | "pg" | "pglite";

const LOCAL_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "::1",
  "0.0.0.0",
  "host.docker.internal",
  // docker-compose service names, for running the app in a container.
  "postgres",
  "db",
]);

export function driverFor(url: string): Driver {
  if (url.startsWith("pglite:")) return "pglite";
  if (process.env.DATABASE_DRIVER === "pg") return "pg";
  if (process.env.DATABASE_DRIVER === "neon") return "neon";
  try {
    return LOCAL_HOSTS.has(new URL(url).hostname) ? "pg" : "neon";
  } catch {
    return "neon";
  }
}

/** "pglite:./.pglite" -> "./.pglite" */
export function pglitePath(url: string): string {
  return url.slice("pglite:".length) || "./.pglite";
}
