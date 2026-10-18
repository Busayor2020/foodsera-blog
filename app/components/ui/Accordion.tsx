import { ChevronDown } from "lucide-react";
import { useId, useState, type ReactNode } from "react";

export interface AccordionItem {
  title: string;
  content: ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  /** Index of the item open at first. */
  defaultOpen?: number;
}

/**
 * Each item is a heading with a button that shows or hides its panel. Closed
 * panels use the hidden attribute, so their text is still in the prerendered
 * HTML for search engines.
 */
export function Accordion({ items, defaultOpen = -1 }: AccordionProps) {
  const [open, setOpen] = useState<number>(defaultOpen);
  const baseId = useId();

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, i) => {
        const isOpen = open === i;
        const buttonId = `${baseId}-button-${i}`;
        const panelId = `${baseId}-panel-${i}`;
        return (
          <div
            key={item.title}
            className="rounded-tile border border-line bg-paper"
          >
            <h3 className="font-sans text-[length:inherit]">
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="flex min-h-14 w-full items-center justify-between gap-4 rounded-tile px-4.5 py-3.5 text-left font-bold text-charcoal"
              >
                <span>{item.title}</span>
                <ChevronDown
                  size={20}
                  strokeWidth={2.2}
                  aria-hidden="true"
                  className={`flex-none transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className="px-4.5 pb-4.5 text-ink-soft"
            >
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
