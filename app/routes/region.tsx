import { data } from "react-router";

import { TermErrorBoundary } from "~/components/term/TermErrorBoundary";
import { TermPage } from "~/components/term/TermPage";
import { getTermPage } from "~/lib/content";
import { keepDataWhenOnlySearchChanges } from "~/lib/revalidate";
import { termAds, termMeta } from "~/lib/term-page";

import type { Route } from "./+types/region";

export function loader({ params }: Route.LoaderArgs) {
  const page = getTermPage("region", params.slug);
  if (!page) throw data("Region not found", { status: 404 });
  return page;
}

export const handle = { ads: termAds };

export const shouldRevalidate = keepDataWhenOnlySearchChanges;

export function meta({ loaderData }: Route.MetaArgs) {
  return termMeta(loaderData, "Region not found");
}

export default function RegionPage({ loaderData }: Route.ComponentProps) {
  return <TermPage key={loaderData.path} page={loaderData} />;
}

export const ErrorBoundary = TermErrorBoundary;
