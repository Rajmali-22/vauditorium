# Deploys

Production deploys run from `.github/workflows/deploy.yml`, not from Vercel's git
integration, the same way [verp](https://github.com/voss-labs/verp) does it. The
point is ordering: the schema is migrated first, and the deploy only happens if
that succeeded.

## What happens on a push to main

1. Migrations in `app/.server/db/migrations` are applied to the production database.
2. `npm run db:check` confirms every migration file is recorded as applied.
3. The Vercel deploy hook is called.

If step 1 or 2 fails, step 3 does not run and production stays on the previous
build. Failing closed is deliberate: an old build against an old schema works,
a new build against an old schema does not.

`vercel.json` sets `git.deploymentEnabled.main` to `false` so Vercel does not
also deploy on push. Preview deploys for pull requests are untouched.

## Pull requests

`.github/workflows/ci.yml` runs on every pull request:

- type check and production build;
- migrations applied to an empty Postgres, then applied again to prove a
  re-run is harmless, then checked against the ledger;
- the seed, which proves the demo data satisfies every constraint.

## Setup

Two secrets on the `production-database` GitHub environment
(Settings, Environments, `production-database`):

| Secret                    | Where it comes from                                                                   |
| ------------------------- | ------------------------------------------------------------------------------------- |
| `PRODUCTION_DATABASE_URL` | The Neon **direct** (unpooled) connection string; migrations need it                 |
| `VERCEL_DEPLOY_HOOK_URL`  | Vercel project, Settings, Git, Deploy Hooks — create one for `main`                   |

Until both secrets exist the workflow does nothing and says so in its run
summary. Add required reviewers on the environment if a deploy should wait for
a human; the secrets are scoped to it, so nothing else in CI can read the
production connection string.

And on the Vercel project:

| Variable             | Value                                                              |
| -------------------- | ------------------------------------------------------------------ |
| `DATABASE_URL`       | The Neon **pooled** connection string                              |
| `R2_*` (four)        | The private document bucket; see [documents.md](documents.md)      |
| `SENDER_HASH_SECRET` | A long random string; keys the suggestion box's rate-limit hashes |

The app refuses to start the affected feature, rather than falling back to
something unsafe, when the R2 variables or `SENDER_HASH_SECRET` are missing in
production.

## Writing migrations

Change the schema in `app/.server/db/schema/`, run `npm run db:generate`, and
commit the SQL it writes. For what Drizzle cannot express (exclusion
constraints, backfills), `npx drizzle-kit generate --custom --name <what>`
creates an empty file to write by hand; see `0001_events_no_overlap.sql`.

Write hand-written migrations so a re-run is a no-op (`IF NOT EXISTS`, or a
`DO` block that checks `pg_constraint`). CI applies them twice to hold that.
