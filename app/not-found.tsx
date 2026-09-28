import Link from 'next/link';

export default function NotFound() {
  return (
    <main className='mx-auto w-full max-w-6xl px-4 py-20 flex flex-col items-start gap-4'>
      <h1 className='text-3xl font-semibold'>No whale here</h1>
      <p className='text-gray-400'>We couldn&apos;t find that page. It may have swum off.</p>
      <Link href='/' className='underline underline-offset-4 hover:text-gray-300'>
        Back to all species
      </Link>
    </main>
  );
}
