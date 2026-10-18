import { Accordion } from "~/components/ui/Accordion";
import type { Faq } from "~/lib/content/types";

interface FaqAccordionProps {
  heading: string;
  faqs: Faq[];
}

/** Recipe questions. The first answer starts open, as in the design. */
export function FaqAccordion({ heading, faqs }: FaqAccordionProps) {
  if (faqs.length === 0) return null;
  return (
    <section aria-labelledby="faq" className="flex flex-col gap-3">
      <h2 id="faq" className="mb-1 text-3xl">
        {heading}
      </h2>
      <Accordion
        defaultOpen={0}
        items={faqs.map((faq) => ({ title: faq.q, content: <p>{faq.a}</p> }))}
      />
    </section>
  );
}
