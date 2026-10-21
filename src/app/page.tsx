import { ForecastPage } from "@/frontend/forecast-page";
import { parseQuery } from "@/frontend/query";

export default async function Home({ searchParams }: PageProps<"/">) {
  return <ForecastPage query={parseQuery(await searchParams)} />;
}
