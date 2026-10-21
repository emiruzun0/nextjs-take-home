import Form from "next/form";

type Props = {
  city: string;
  // Other query params to keep when searching a new city (activities, view).
  keep: Record<string, string>;
};

// A plain GET form: it works without JavaScript, and next/form makes it a
// client-side navigation when JavaScript is on.
export function SearchForm({ city, keep }: Props) {
  return (
    <Form action="/" className="flex gap-2">
      <label htmlFor="city" className="sr-only">
        City
      </label>
      <input
        id="city"
        name="city"
        defaultValue={city}
        placeholder="Search a city, e.g. Austin"
        required
        className="flex-1 rounded border border-neutral-300 px-3 py-2"
      />
      {Object.entries(keep).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <button type="submit" className="rounded bg-neutral-900 px-4 py-2 text-white">
        Search
      </button>
    </Form>
  );
}
