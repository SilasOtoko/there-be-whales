import { z } from "zod";

export const OBIS_BASE_URL = "https://api.obis.org/v3";

/** Default cache lifetime for OBIS data: 1 day. The data changes slowly. */
export const DEFAULT_REVALIDATE_SECONDS = 60 * 60 * 24;

const REQUEST_TIMEOUT_MS = 15_000;

/** The API responded with a non-2xx status, or the request failed/timed out. */
export class ObisRequestError extends Error {
  constructor(
    message: string,
    readonly url: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "ObisRequestError";
  }
}

/** The API responded, but the body didn't match the schema we expect. */
export class ObisValidationError extends Error {
  constructor(
    readonly url: string,
    readonly issues: z.core.$ZodIssue[],
    readableIssues: string,
  ) {
    super(`OBIS response failed validation for ${url}\n${readableIssues}`);
    this.name = "ObisValidationError";
  }
}

type QueryValue = string | number | undefined;

export function buildObisUrl(path: string, params: Record<string, QueryValue> = {}) {
  const url = new URL(`${OBIS_BASE_URL}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

/**
 * The one place the app talks to OBIS.
 *
 * fetch → check status → parse JSON → validate with Zod → return typed data.
 * Every public function in lib/obis goes through here, so caching, timeouts
 * and error handling are consistent everywhere.
 */
export async function obisFetch<Schema extends z.ZodType>(
  path: string,
  params: Record<string, QueryValue>,
  schema: Schema,
  { revalidate = DEFAULT_REVALIDATE_SECONDS }: { revalidate?: number | false } = {},
): Promise<z.infer<Schema>> {
  const url = buildObisUrl(path, params);

  let res: Response;
  try {
    res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      next: { revalidate },
    });
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    throw new ObisRequestError(`OBIS request failed: ${reason}`, url);
  }

  if (!res.ok) {
    throw new ObisRequestError(`OBIS responded ${res.status} ${res.statusText}`, url, res.status);
  }

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new ObisRequestError("OBIS returned a body that isn't valid JSON", url, res.status);
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    throw new ObisValidationError(url, parsed.error.issues, z.prettifyError(parsed.error));
  }
  return parsed.data;
}
