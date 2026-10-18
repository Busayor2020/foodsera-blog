import { data } from "react-router";

import { TermErrorBoundary } from "~/components/term/TermErrorBoundary";
import { TermPage } from "~/components/term/TermPage";
import { getTermPage } from "~/lib/content";
import { keepDataWhenOnlySearchChanges } from "~/lib/revalidate";
import { termAds, termMeta } from "~/lib/term-page";

import type { Route } from "./+types/category";

export function loader({ params }: Route.LoaderArgs) {
  const page = getTermPage("category", params.slug);
  if (!page) throw data("Category not found", { status: 404 });
  return page;
}

export const handle = { ads: termAds };

export const shouldRevalidate = keepDataWhenOnlySearchChanges;

export function meta({ loaderData }: Route.MetaArgs) {
  return termMeta(loaderData, "Category not found");
}

export default function CategoryPage({ loaderData }: Route.ComponentProps) {
  return <TermPage key={loaderData.path} page={loaderData} />;
}

export const ErrorBoundary = TermErrorBoundary;
