import { isRouteErrorResponse } from "react-router";

import NotFound from "~/routes/404";

/** Unknown term slugs show the 404 page; anything else a short apology. */
export function TermErrorBoundary({ error }: { error: unknown }) {
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFound />;
  return (
    <div className="mx-auto max-w-narrow px-5 py-14">
      <h1 className="text-display">This page didn't load</h1>
      <p className="mt-4 text-lead text-ink-soft">
        Sorry, something went wrong. Try again in a moment.
      </p>
    </div>
  );
}
