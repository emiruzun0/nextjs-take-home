"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

// Asks the server to render the page again. Failed requests aren't cached,
// so this really does call Open-Meteo again.
export function RetryButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => router.refresh())}
      disabled={isPending}
      className="mt-3 rounded border border-neutral-900 px-4 py-2 disabled:opacity-50"
    >
      {isPending ? "Trying again…" : "Try again"}
    </button>
  );
}
