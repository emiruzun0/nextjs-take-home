// Shown while the server fetches the forecast.
export default function Loading() {
  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-4 p-4 sm:p-6" aria-busy="true">
      <p role="status" className="sr-only">
        Loading forecast…
      </p>
      <div className="h-8 w-48 animate-pulse rounded bg-neutral-200" />
      <div className="h-10 animate-pulse rounded bg-neutral-200" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-36 animate-pulse rounded-lg bg-neutral-100" />
      ))}
    </main>
  );
}
