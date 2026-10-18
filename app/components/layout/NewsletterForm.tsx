import { useId, useState, type SubmitEvent } from "react";

import { subscribe, type SubscribeResult } from "~/lib/newsletter";

type Variant = "footer" | "sidebar" | "feature";

interface NewsletterFormProps {
  /**
   * "footer" sits on charcoal, "sidebar" on the green sidebar box and
   * "feature" in the big green homepage band.
   */
  variant: Variant;
}

const STYLES: Record<
  Variant,
  {
    label: string;
    row: string;
    input: string;
    button: string;
    status: string;
    success: string;
  }
> = {
  footer: {
    label: "text-sm text-footer-muted",
    row: "flex flex-col gap-2",
    input: "min-h-12 rounded-field bg-cream px-3.5",
    button: "min-h-12 rounded-field",
    status: "rounded-field bg-ugu px-3.5 py-3 text-white",
    success: "Thank you. Check your inbox to confirm.",
  },
  sidebar: {
    label: "text-sm text-white",
    row: "flex flex-col gap-2",
    input: "min-h-12 rounded-field bg-white px-3.5",
    button: "min-h-12 rounded-field",
    status: "rounded-field bg-paper px-3.5 py-3 text-charcoal",
    success: "Thank you. Check your inbox to confirm.",
  },
  feature: {
    label: "font-semibold",
    row: "flex flex-wrap gap-2.5",
    input: "min-h-13.5 min-w-0 flex-[1_1_220px] rounded-full bg-white px-4.5",
    button: "min-h-13.5 flex-none rounded-full px-7",
    status: "rounded-card bg-paper px-5 py-4.5 font-semibold text-charcoal",
    success: "You are in. Check your inbox to confirm your email.",
  },
};

/** Shown until a newsletter provider is connected and accepts sign-ups. */
export const NEWSLETTER_UNAVAILABLE =
  "Thanks. The newsletter hasn't started yet, so we couldn't sign you up. Please try again soon.";

/** Email sign-up. The success message only appears after a real sign-up. */
export function NewsletterForm({ variant }: NewsletterFormProps) {
  const [result, setResult] = useState<SubscribeResult | null>(null);
  const [sending, setSending] = useState(false);
  const id = useId();
  const styles = STYLES[variant];

  const onSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") ?? "");
    setSending(true);
    try {
      setResult(await subscribe(email));
    } catch {
      setResult("unavailable");
    } finally {
      setSending(false);
    }
  };

  if (result) {
    return (
      <p role="status" className={styles.status}>
        {result === "subscribed" ? styles.success : NEWSLETTER_UNAVAILABLE}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2">
      <label htmlFor={id} className={styles.label}>
        Email address
      </label>
      <div className={styles.row}>
        <input
          id={id}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className={`text-charcoal ${styles.input}`}
        />
        <button
          type="submit"
          disabled={sending}
          className={`bg-plantain font-bold text-charcoal disabled:opacity-60 ${styles.button}`}
        >
          Subscribe
        </button>
      </div>
      {variant === "footer" && (
        <span className="text-eyebrow text-footer-fine">
          No spam. Unsubscribe anytime.
        </span>
      )}
    </form>
  );
}
