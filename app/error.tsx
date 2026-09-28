'use client';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div role='alert'>
      <p>We couldn&apos;t load whale data right now.</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
