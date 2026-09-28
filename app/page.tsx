import { SPECIES } from '@/lib/species';
import { getSpeciesStats } from '@/lib/obis';
import Link from 'next/link';

export default async function Home() {
  const stats = await Promise.all(SPECIES.map(async (s) => ({ ...s, stats: await getSpeciesStats(s.scientificName) })));

  return (
    <div className='mx-auto w-full max-w-6xl px-4 py-10 flex flex-col gap-10'>
      <ul className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {stats.map((s) => (
          <li key={s.slug} className='bg-gray-900 border border-transparent rounded-md p-4 flex flex-col gap-2 relative hover:bg-gray-700 transition duration-300 hover:border-gray-200'>
            <Link href={`/species/${s.slug}`} className='after:inset-0 after:absolute'>
              <h3 className='text-lg'>
                {s.commonName} <span className='text-base italic'>({s.scientificName})</span>
              </h3>
            </Link>
            <span className='bg-gray-800 rounded-md inline-block py-1 px-2 self-start'>{s.group}</span>
            <p>
              {s.stats.totalRecords.toLocaleString()} records ({s.stats.firstYear}–{s.stats.lastYear})
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
