/** Shown in place of a single section when its OBIS request fails, so one bad call doesn't blank the page. */
export function SectionError({ what }: { what: string }) {
  return (
    <p role='alert' className='rounded-md border border-gray-700 bg-gray-900 p-4 text-gray-300'>
      We couldn&apos;t load {what} right now. Please try again later.
    </p>
  );
}
