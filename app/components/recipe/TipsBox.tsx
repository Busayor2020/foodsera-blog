import type { Tip } from "~/lib/content/types";

const KIND = {
  do: { label: "Do:", mark: "✓", className: "bg-ugu" },
  avoid: { label: "Avoid:", mark: "!", className: "bg-pepper" },
};

/** "Tips and common mistakes": Do items in green, Avoid items in pepper red. */
export function TipsBox({ tips }: { tips: Tip[] }) {
  if (tips.length === 0) return null;
  return (
    <section
      aria-labelledby="tips"
      className="flex flex-col gap-4 rounded-panel border border-plantain-line bg-plantain-soft p-6"
    >
      <h2 id="tips" className="text-2xl">
        Tips and common mistakes
      </h2>
      <ul className="flex flex-col gap-3">
        {tips.map((tip) => {
          const kind = KIND[tip.kind];
          return (
            <li key={tip.text} className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className={`mt-0.5 flex size-6.5 flex-none items-center justify-center rounded-full text-md font-bold text-white ${kind.className}`}
              >
                {kind.mark}
              </span>
              <span>
                <strong>{kind.label}</strong> {tip.text}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
