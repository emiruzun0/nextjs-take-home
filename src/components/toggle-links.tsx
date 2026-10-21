import Link from "next/link";

type Option = {
  label: string;
  href: string;
  selected: boolean;
};

type Props = {
  label: string;
  options: Option[];
};

// A row of links that look like toggle buttons. Each link points at the URL
// the page would have after the click, so no client-side state is needed.
export function ToggleLinks({ label, options }: Props) {
  return (
    <nav aria-label={label} className="flex flex-wrap gap-2">
      {options.map((option) => (
        <Link
          key={option.label}
          href={option.href}
          scroll={false}
          aria-current={option.selected ? "true" : undefined}
          className={`rounded-full border px-3 py-1 text-sm ${
            option.selected ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300"
          }`}
        >
          {option.label}
        </Link>
      ))}
    </nav>
  );
}
