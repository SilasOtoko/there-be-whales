import { SPECIES } from '@/lib/species';

export default function Loading() {
  return (
    <main className='mx-auto w-full max-w-6xl px-4 py-10'>
      <p role='status' className='sr-only'>
        Loading whale species…
      </p>

      <div aria-hidden='true' className='mb-8 space-y-3'>
        <div className='h-8 w-56 rounded bg-foreground/10 motion-safe:animate-pulse' />
        <div className='h-4 w-80 max-w-full rounded bg-foreground/10 motion-safe:animate-pulse' />
      </div>

      <ul aria-hidden='true' className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {SPECIES.map((s) => (
          <li key={s.slug} className='rounded-lg border border-foreground/10 p-5'>
            <div className='motion-safe:animate-pulse space-y-4'>
              <div className='flex items-start justify-between gap-3'>
                <div className='h-5 w-2/3 rounded bg-foreground/10' />
                <div className='h-5 w-14 rounded-full bg-foreground/10' />
              </div>
              <div className='h-4 w-1/2 rounded bg-foreground/10' />
              <div className='grid grid-cols-3 gap-3 pt-2'>
                {[0, 1, 2].map((i) => (
                  <div key={i} className='space-y-2'>
                    <div className='h-3 w-full rounded bg-foreground/10' />
                    <div className='h-5 w-3/4 rounded bg-foreground/10' />
                  </div>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
