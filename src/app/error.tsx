"use client";

import { StatusMessage } from "@/components/status-message";

// Catches anything unexpected, so the user never sees a blank page. Expected
// failures (city not found, service down) are handled in ForecastPage instead.
export default function ErrorPage({ retry }: { error: unknown; retry: () => void }) {
  return (
    <main className="mx-auto max-w-4xl p-4 sm:p-6">
      <StatusMessage title="Something went wrong.">
        <button type="button" onClick={retry} className="mt-3 rounded border border-neutral-900 px-4 py-2">
          Try again
        </button>
      </StatusMessage>
    </main>
  );
}
