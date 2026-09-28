import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { DecadeChartSection, DecadeChartSkeleton } from '@/components/species/DecadeChartSection';
import { StatsSection, StatsSkeleton } from '@/components/species/StatsSection';
import { getSpeciesBySlug, SPECIES } from '@/lib/species';

export function generateStaticParams() {
  return SPECIES.map((s) => ({ slug: s.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<'/species/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const species = getSpeciesBySlug(slug);
  if (!species) return {};

  return {
    title: species.commonName,
    description: `Recorded sightings of the ${species.commonName.toLowerCase()} (${species.scientificName}), from 18th-century whaling logbooks to modern surveys.`,
  };
}

export default async function SpeciesPage({ params }: PageProps<'/species/[slug]'>) {
  const { slug } = await params;
  const species = getSpeciesBySlug(slug);

  if (!species) notFound();

  return (
    <main className='mx-auto w-full max-w-6xl px-4 py-10 flex flex-col gap-10'>
      {/* Header renders instantly — it only uses local data. */}
      <header className='flex flex-col gap-3'>
        <Link href='/' className='self-start text-sm text-gray-400 hover:text-gray-200 underline-offset-4 hover:underline'>
          ← All species
        </Link>
        <h1 className='text-3xl font-semibold'>{species.commonName}</h1>
        <p className='italic text-gray-400'>{species.scientificName}</p>
        <ul className='flex flex-wrap gap-2 text-sm' aria-label='Classification'>
          <li className='bg-gray-800 rounded-md py-1 px-2'>{species.group}</li>
          <li className='bg-gray-800 rounded-md py-1 px-2'>{species.family}</li>
        </ul>
      </header>

      <section aria-labelledby='stats-heading' className='flex flex-col gap-4'>
        <h2 id='stats-heading' className='text-xl font-semibold'>
          At a glance
        </h2>
        <Suspense fallback={<StatsSkeleton />}>
          <StatsSection scientificName={species.scientificName} />
        </Suspense>
      </section>

      <section aria-labelledby='chart-heading' className='flex flex-col gap-4'>
        <h2 id='chart-heading' className='text-xl font-semibold'>
          Records per decade
        </h2>
        <Suspense fallback={<DecadeChartSkeleton />}>
          <DecadeChartSection scientificName={species.scientificName} />
        </Suspense>
      </section>
    </main>
  );
}
