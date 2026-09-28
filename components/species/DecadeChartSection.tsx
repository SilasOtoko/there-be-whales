import { getYearCounts, toDecadeCounts } from '@/lib/obis';
import { SectionError } from './SectionError';

const fmt = new Intl.NumberFormat('en-US');

/** Decades covered by the 1785–1913 whaling logbook dataset, shaded on the chart. */
const LOGBOOK_ERA = { from: 1780, to: 1910 };

export async function DecadeChartSection({ scientificName }: { scientificName: string }) {
  let decades: { decade: number; records: number }[];
  try {
    decades = fillGaps(toDecadeCounts(await getYearCounts(scientificName)));
  } catch (err) {
    console.error(err);
    return <SectionError what='the timeline' />;
  }

  if (decades.length === 0) {
    return <p className='text-gray-400'>No dated records for this species.</p>;
  }

  const max = Math.max(...decades.map((d) => d.records));
  const peak = decades.find((d) => d.records === max)!;
  const first = decades[0].decade;
  const last = decades.at(-1)!.decade;

  return (
    <div className='flex flex-col gap-4'>
      <figure aria-label={`Bar chart of records per decade from the ${first}s to the ${last}s. Peak: ${fmt.format(max)} records in the ${peak.decade}s.`} className='bg-gray-900 rounded-md p-4'>
        <div className='flex gap-3'>
          <div aria-hidden='true' className='flex flex-col justify-between text-xs text-gray-500 tabular-nums text-right h-56 pb-6'>
            <span>{fmt.format(max)}</span>
            <span>0</span>
          </div>

          <div className='flex-1 min-w-0'>
            <div className='relative h-50 flex items-end gap-0.5 border-b border-gray-700'>
              {decades.map((d) => {
                const inLogbookEra = d.decade >= LOGBOOK_ERA.from && d.decade <= LOGBOOK_ERA.to;
                return (
                  <div key={d.decade} className={`group relative flex-1 h-full flex items-end ${inLogbookEra ? 'bg-amber-300/10' : ''}`}>
                    <div className='w-full rounded-t bg-sky-400 group-hover:bg-sky-300 transition-colors' style={{ height: d.records === 0 ? 0 : `max(2px, ${(d.records / max) * 100}%)` }} />
                    <div aria-hidden='true' className='pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded bg-gray-100 px-2 py-1 text-xs text-gray-900 opacity-0 group-hover:opacity-100'>
                      <span className='font-semibold'>{d.decade}s</span> · {fmt.format(d.records)} records
                    </div>
                  </div>
                );
              })}
            </div>

            <div aria-hidden='true' className='flex gap-0.5 pt-1 text-xs text-gray-500 tabular-nums'>
              {decades.map((d, i) => (
                <span key={d.decade} className='flex-1 text-center overflow-visible whitespace-nowrap'>
                  {i % 5 === 0 ? d.decade : ''}
                </span>
              ))}
            </div>
          </div>
        </div>

        <figcaption className='mt-3 flex items-center gap-2 text-xs text-gray-400'>
          <span aria-hidden='true' className='inline-block h-3 w-3 rounded-sm bg-amber-300/20' />
          Shaded decades overlap the 1785–1913 whaling logbook records. Those counts reflect where whalers hunted, not how many whales there were.
        </figcaption>
      </figure>

      <details className='bg-gray-900 rounded-md p-4'>
        <summary className='cursor-pointer text-sm text-gray-300'>Show data as a table</summary>
        <table className='mt-3 w-full max-w-sm text-sm tabular-nums'>
          <caption className='sr-only'>Records per decade</caption>
          <thead>
            <tr className='text-left text-gray-400'>
              <th scope='col' className='py-1'>
                Decade
              </th>
              <th scope='col' className='py-1 text-right'>
                Records
              </th>
            </tr>
          </thead>
          <tbody>
            {decades.map((d) => (
              <tr key={d.decade} className='border-t border-gray-800'>
                <th scope='row' className='py-1 text-left font-normal'>
                  {d.decade}s
                </th>
                <td className='py-1 text-right'>{fmt.format(d.records)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}

function fillGaps(decades: { decade: number; records: number }[]) {
  if (decades.length === 0) return decades;
  const counts = new Map(decades.map((d) => [d.decade, d.records]));
  const filled: { decade: number; records: number }[] = [];
  for (let decade = decades[0].decade; decade <= decades.at(-1)!.decade; decade += 10) {
    filled.push({ decade, records: counts.get(decade) ?? 0 });
  }
  return filled;
}

export function DecadeChartSkeleton() {
  return (
    <div aria-hidden='true' className='bg-gray-900 rounded-md p-4'>
      <div className='h-56 flex items-end gap-0.5 motion-safe:animate-pulse'>
        {[30, 45, 60, 40, 25, 20, 35, 50, 70, 90, 85, 65].map((h, i) => (
          <div key={i} className='flex-1 rounded-t bg-gray-700' style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}
