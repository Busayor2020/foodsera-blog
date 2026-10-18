import type { MouseEvent } from "react";
import { useNavigate } from "react-router";

/**
 * The Markdown intro, already rendered to HTML at build time (raw HTML is
 * refused there). Links to other pages on the site go through the router
 * instead of reloading the page.
 */
export function RecipeIntro({ html }: { html: string }) {
  const navigate = useNavigate();

  const onClick = (event: MouseEvent<HTMLDivElement>) => {
    const link = (event.target as HTMLElement).closest("a");
    const href = link?.getAttribute("href");
    if (
      !href?.startsWith("/") ||
      href.startsWith("//") ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    navigate(href);
  };

  return (
    // The links inside handle the keyboard; this only intercepts their clicks.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      onClick={onClick}
      className="flex flex-col gap-4 text-lg"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
