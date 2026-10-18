import { NewsletterForm } from "~/components/layout/NewsletterForm";

/** The big green newsletter band at the end of the homepage. */
export function NewsletterBand() {
  return (
    <section
      aria-labelledby="news"
      className="mx-auto flex w-[calc(100%-40px)] max-w-page flex-wrap items-center gap-x-12 gap-y-6 rounded-hero bg-ugu p-[clamp(28px,5vw,56px)] text-white"
    >
      <div className="flex flex-[1_1_380px] flex-col gap-2.5">
        <h2 id="news" className="text-band">
          Get a new Nigerian recipe every week
        </h2>
        <p className="text-ugu-soft">
          One tested recipe in your inbox every Friday, with a shopping list. No
          spam, unsubscribe anytime.
        </p>
      </div>
      <div className="flex-[1_1_340px]">
        <NewsletterForm variant="feature" />
      </div>
    </section>
  );
}
