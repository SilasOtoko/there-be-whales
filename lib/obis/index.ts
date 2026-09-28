/**
 * Typed functions for the OBIS API. Import from "@/lib/obis".
 *
 * These use Next's extended fetch caching, so call them from Server
 * Components, Route Handlers or Server Actions — not Client Components.
 */
import { obisFetch } from "./client";
import {
  OccurrenceResponseSchema,
  YearCountsResponseSchema,
  type Occurrence,
  type YearCount,
} from "./schemas";

export { ObisRequestError, ObisValidationError } from "./client";
export type { Occurrence, YearCount } from "./schemas";

/** OBIS dataset: "Historical distribution of whales shown by logbook records 1785-1913". */
export const WHALING_LOGBOOK_DATASET_ID = "a9848680-b804-455a-b6b5-2c5c1d0dbcde";

/**
 * Only request the fields we use. OBIS records carry dozens of fields,
 * and trimming them keeps responses small (and under Next's cache size limit).
 */
const OCCURRENCE_FIELDS = [
  "id",
  "scientificName",
  "decimalLatitude",
  "decimalLongitude",
  "eventDate",
  "date_year",
  "dataset_id",
  "country",
  "basisOfRecord",
].join(",");

/** OBIS caps page size at 10,000. */
const MAX_PAGE_SIZE = 10_000;

// ─── Year counts ──────────────────────────────────────────────────────────────

/** Records per year for a species, sorted oldest → newest. Feeds the timeline chart. */
export async function getYearCounts(scientificName: string): Promise<YearCount[]> {
  const rows = await obisFetch(
    "/statistics/years",
    { scientificname: scientificName },
    YearCountsResponseSchema,
  );
  return rows.toSorted((a, b) => a.year - b.year);
}

/** Roll yearly counts up into decades: 1850 → all records from 1850–1859. */
export function toDecadeCounts(years: YearCount[]): { decade: number; records: number }[] {
  const byDecade = new Map<number, number>();
  for (const { year, records } of years) {
    const decade = Math.floor(year / 10) * 10;
    byDecade.set(decade, (byDecade.get(decade) ?? 0) + records);
  }
  return [...byDecade]
    .map(([decade, records]) => ({ decade, records }))
    .sort((a, b) => a.decade - b.decade);
}

// ─── Species stats ────────────────────────────────────────────────────────────

export interface SpeciesStats {
  /** All records in OBIS for this species, including ones with no usable date. */
  totalRecords: number;
  /** Records from the 1785–1913 whaling logbook dataset. */
  logbookRecords: number;
  firstYear: number | null;
  lastYear: number | null;
  /** Year with the most records — useful for a "peak" callout. */
  peakYear: { year: number; records: number } | null;
}

/** Headline numbers for a species card. Runs its three requests in parallel. */
export async function getSpeciesStats(scientificName: string): Promise<SpeciesStats> {
  const [years, all, logbook] = await Promise.all([
    getYearCounts(scientificName),
    // size: 0 → we only want `total`, not the records themselves.
    obisFetch("/occurrence", { scientificname: scientificName, size: 0 }, OccurrenceResponseSchema),
    obisFetch(
      "/occurrence",
      { scientificname: scientificName, datasetid: WHALING_LOGBOOK_DATASET_ID, size: 0 },
      OccurrenceResponseSchema,
    ),
  ]);

  const peakYear = years.reduce<YearCount | null>(
    (peak, row) => (peak === null || row.records > peak.records ? row : peak),
    null,
  );

  return {
    totalRecords: all.total,
    logbookRecords: logbook.total,
    firstYear: years.at(0)?.year ?? null,
    lastYear: years.at(-1)?.year ?? null,
    peakYear,
  };
}

// ─── Occurrences ──────────────────────────────────────────────────────────────

export interface OccurrenceQuery {
  scientificName: string;
  /** Inclusive, e.g. 1785 */
  startYear?: number;
  /** Inclusive, e.g. 1913 */
  endYear?: number;
  /** Limit to one dataset, e.g. WHALING_LOGBOOK_DATASET_ID */
  datasetId?: string;
  /** WKT polygon to limit to an area, e.g. "POLYGON((...))" */
  geometry?: string;
  /** Records per page (1–10,000). */
  size?: number;
  /** Cursor: pass the previous page's `nextCursor` to get the next page. */
  after?: string;
}

export interface OccurrencePage {
  /** Total records matching the query, across all pages. */
  total: number;
  results: Occurrence[];
  /** Pass as `after` for the next page. `null` means this was the last page. */
  nextCursor: string | null;
}

/**
 * One page of sighting records.
 *
 * Uses cursor paging (`after` = id of the last record you received) rather
 * than offsets, which stays fast deep into large result sets.
 */
export async function getOccurrences({
  scientificName,
  startYear,
  endYear,
  datasetId,
  geometry,
  size = 1_000,
  after,
}: OccurrenceQuery): Promise<OccurrencePage> {
  const pageSize = Math.min(Math.max(1, Math.floor(size)), MAX_PAGE_SIZE);

  const data = await obisFetch(
    "/occurrence",
    {
      scientificname: scientificName,
      startdate: startYear !== undefined ? `${startYear}-01-01` : undefined,
      enddate: endYear !== undefined ? `${endYear}-12-31` : undefined,
      datasetid: datasetId,
      geometry,
      size: pageSize,
      after,
      fields: OCCURRENCE_FIELDS,
    },
    OccurrenceResponseSchema,
  );

  const last = data.results.at(-1);
  return {
    total: data.total,
    results: data.results,
    nextCursor: data.results.length === pageSize && last ? last.id : null,
  };
}
