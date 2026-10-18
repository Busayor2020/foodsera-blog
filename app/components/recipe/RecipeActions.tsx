import { ArrowDown, Printer } from "lucide-react";

export const pillButton =
  "flex min-h-12 items-center gap-2 rounded-full px-5.5 font-bold no-underline";
export const outlinePill = `${pillButton} border-[1.5px] border-charcoal bg-paper text-charcoal hover:text-charcoal`;

export function printRecipe() {
  window.print();
}

/** Jump to Recipe and Print Recipe, under the quick facts. */
export function RecipeActions() {
  return (
    <div className="flex flex-wrap gap-3">
      <a
        href="#recipe"
        className={`${pillButton} bg-palm text-white hover:text-white hover:brightness-95`}
      >
        <ArrowDown size={18} strokeWidth={2.2} aria-hidden="true" />
        Jump to Recipe
      </a>
      <button type="button" onClick={printRecipe} className={outlinePill}>
        <Printer size={18} strokeWidth={2} aria-hidden="true" />
        Print Recipe
      </button>
    </div>
  );
}
