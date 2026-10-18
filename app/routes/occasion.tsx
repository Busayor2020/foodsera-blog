import { data } from "react-router";

import { TermErrorBoundary } from "~/components/term/TermErrorBoundary";
import { TermPage } from "~/components/term/TermPage";
import { getTermPage } from "~/lib/content";
import { keepDataWhenOnlySearchChanges } from "~/lib/revalidate";
import { termAds, termMeta } from "~/lib/term-page";

import type { Route } from "./+types/occasion";

export function loader({ params }: Route.LoaderArgs) {
  const page = getTermPage("occasion", params.slug);
  if (!page) throw data("Occasion not found", { status: 404 });
  return page;
}

export const handle = { ads: termAds };

export const shouldRevalidate = keepDataWhenOnlySearchChanges;

export function meta({ loaderData }: Route.MetaArgs) {
  return termMeta(loaderData, "Occasion not found");
}

export default function OccasionPage({ loaderData }: Route.ComponentProps) {
  return <TermPage key={loaderData.path} page={loaderData} />;
}

export const ErrorBoundary = TermErrorBoundary;
