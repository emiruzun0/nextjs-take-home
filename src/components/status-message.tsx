import type { ReactNode } from "react";

type Props = {
  title: string;
  children?: ReactNode;
};

// Used for the empty, not-found and error states.
export function StatusMessage({ title, children }: Props) {
  return (
    <div role="status" className="rounded-lg border border-dashed border-neutral-300 p-6 text-center">
      <p className="font-medium">{title}</p>
      {children && <div className="mt-2 text-sm text-neutral-600">{children}</div>}
    </div>
  );
}
