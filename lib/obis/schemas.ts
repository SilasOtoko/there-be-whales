import { z } from "zod";

/**
 * Zod schemas for the OBIS v3 API responses we use.
 *
 * Only the fields the app needs are listed. Zod strips everything
 * else by default, so extra fields OBIS adds later won't break us —
 * and won't bloat the data we pass to components either.
 *
 * Scientific records are messy: many fields are missing or null on
 * some records, so most fields are `.nullish()` (null OR undefined).
 */

/** One sighting / occurrence record. */
export const OccurrenceSchema = z.object({
  id: z.string(),
  scientificName: z.string().nullish(),
  decimalLatitude: z.number().min(-90).max(90),
  decimalLongitude: z.number().min(-180).max(180),
  /** Raw Darwin Core date; can be "1851-03-02", "1851", "1851-03/1851-05"… */
  eventDate: z.string().nullish(),
  /** Year OBIS parsed out of eventDate. Missing when it couldn't. */
  date_year: z.number().int().nullish(),
  dataset_id: z.string().nullish(),
  country: z.string().nullish(),
  basisOfRecord: z.string().nullish(),
});

/** GET /v3/occurrence */
export const OccurrenceResponseSchema = z.object({
  total: z.number().int().nonnegative(),
  results: z.array(OccurrenceSchema),
});

/** One row of GET /v3/statistics/years */
export const YearCountSchema = z.object({
  year: z.number().int(),
  records: z.number().int().nonnegative(),
});

export const YearCountsResponseSchema = z.array(YearCountSchema);

// Types inferred from the schemas — the schema is the single source of truth.
export type Occurrence = z.infer<typeof OccurrenceSchema>;
export type OccurrenceResponse = z.infer<typeof OccurrenceResponseSchema>;
export type YearCount = z.infer<typeof YearCountSchema>;
