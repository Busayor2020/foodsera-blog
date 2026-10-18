import type { ExplainedIngredient } from "~/lib/content/types";

export function IngredientsExplained({
  items,
}: {
  items: ExplainedIngredient[];
}) {
  if (items.length === 0) return null;
  return (
    <section
      aria-labelledby="explained"
      className="flex flex-col gap-4.5 rounded-panel border border-ugu-line bg-ugu-soft p-6"
    >
      <div className="flex flex-col gap-1">
        <h2 id="explained" className="text-2xl">
          Ingredients explained
        </h2>
        <p className="text-md text-ugu-ink">
          Local names, what they are, and what to use if you are cooking outside
          Nigeria.
        </p>
      </div>
      <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-3">
        {items.map((item) => (
          <li
            key={item.local}
            className="flex flex-col gap-1 rounded-field bg-paper px-4 py-3.5 text-md leading-normal"
          >
            <span className="text-base font-bold">
              {item.local}{" "}
              {item.aka && (
                <span className="font-medium text-muted">({item.aka})</span>
              )}
            </span>
            <span>{item.meaning}</span>
            {item.substitute && (
              <span className="text-ugu-deep">
                <strong>Abroad:</strong> {item.substitute}
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
