import { getSpeciesStats, type SpeciesStats } from '@/lib/obis';
import { SectionError } from './SectionError';

const fmt = new Intl.NumberFormat('en-US');

export async function StatsSection({ scientificName }: { scientificName: string }) {
  let stats: SpeciesStats;
  try {
    stats = await getSpeciesStats(scientificName);
  } catch (err) {
    console.error(err); // shows in the terminal / Vercel logs with the OBIS URL
    return <SectionError what='the record counts' />;
  }

  const tiles = [
    { label: 'Total records', value: fmt.format(stats.totalRecords) },
    { label: 'Whaling logbook records (1785–1913)', value: fmt.format(stats.logbookRecords) },
    {
      label: 'Years recorded',
      value: stats.firstYear !== null && stats.lastYear !== null ? `${stats.firstYear}–${stats.lastYear}` : '—',
    },
    {
      label: 'Busiest year',
      value: stats.peakYear ? String(stats.peakYear.year) : '—',
      note: stats.peakYear ? `${fmt.format(stats.peakYear.records)} records` : undefined,
    },
  ];

  return (
    <dl className='grid gap-4 grid-cols-2 lg:grid-cols-4'>
      {tiles.map((t) => (
        <div key={t.label} className='bg-gray-900 rounded-md p-4 flex flex-col gap-1'>
          <dt className='text-sm text-gray-400'>{t.label}</dt>
          <dd className='text-2xl font-semibold tabular-nums'>{t.value}</dd>
          {t.note && <dd className='text-sm text-gray-400 tabular-nums'>{t.note}</dd>}
        </div>
      ))}
    </dl>
  );
}

export function StatsSkeleton() {
  return (
    <div aria-hidden='true' className='grid gap-4 grid-cols-2 lg:grid-cols-4'>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className='bg-gray-900 rounded-md p-4 space-y-3 motion-safe:animate-pulse'>
          <div className='h-4 w-2/3 rounded bg-gray-700' />
          <div className='h-7 w-1/2 rounded bg-gray-700' />
        </div>
      ))}
    </div>
  );
}
