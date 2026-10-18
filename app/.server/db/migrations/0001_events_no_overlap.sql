-- No two confirmed events may overlap in time. Several bookings a day are
-- fine; 10:00-12:00 and 12:00-14:00 both stand, since ranges are half-open.
-- Cancelled events are excluded, so cancelling one frees its slot.
--
-- An exclusion constraint, not a unique index, because "overlaps" is not
-- equality. Drizzle cannot express these, which is why this file is written
-- by hand. It needs only core GiST support, no extension, so it runs the same
-- on Neon, a local Postgres and PGlite.
--
-- Guarded so that re-running it is a no-op.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'events_no_overlap') THEN
    ALTER TABLE "events" ADD CONSTRAINT "events_no_overlap"
      EXCLUDE USING gist (tsrange("date" + "start_time", "date" + "end_time", '[)') WITH &&)
      WHERE ("status" = 'confirmed');
  END IF;
END $$;
