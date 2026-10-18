import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { driverFor, pglitePath } from "./app/.server/db/driver";

// Migrations prefer the direct (unpooled) Neon URL when one is set; Neon's
// pooler does not support everything a migration may run.
const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set (see .env.example)");

export default defineConfig({
  schema: "./app/.server/db/schema/index.ts",
  out: "./app/.server/db/migrations",
  dialect: "postgresql",
  ...(driverFor(url) === "pglite"
    ? { driver: "pglite", dbCredentials: { url: pglitePath(url) } }
    : { dbCredentials: { url } }),
});
