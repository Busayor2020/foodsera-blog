import { useId, useState, type SubmitEvent } from "react";

interface NewsletterFormProps {
  /** "footer" sits on charcoal; "sidebar" sits on the green sidebar box. */
  variant: "footer" | "sidebar";
}

const STYLES = {
  footer: {
    label: "text-sm text-footer-muted",
    input: "bg-cream",
    status: "bg-ugu text-white",
  },
  sidebar: {
    label: "text-sm text-white",
    input: "bg-white",
    status: "bg-paper text-charcoal",
  },
};

/** Email sign-up. UI only until there is a newsletter provider. */
export function NewsletterForm({ variant }: NewsletterFormProps) {
  const [subscribed, setSubscribed] = useState(false);
  const id = useId();
  const styles = STYLES[variant];

  const onSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    // TODO(backend): send the address to the newsletter provider.
    setSubscribed(true);
  };

  if (subscribed) {
    return (
      <p role="status" className={`rounded-field px-3.5 py-3 ${styles.status}`}>
        Thank you. Check your inbox to confirm.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2">
      <label htmlFor={id} className={styles.label}>
        Email address
      </label>
      <input
        id={id}
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="you@example.com"
        className={`min-h-12 rounded-field px-3.5 text-charcoal ${styles.input}`}
      />
      <button
        type="submit"
        className="min-h-12 rounded-field bg-plantain font-bold text-charcoal"
      >
        Subscribe
      </button>
      {variant === "footer" && (
        <span className="text-eyebrow text-footer-fine">
          No spam. Unsubscribe anytime.
        </span>
      )}
    </form>
  );
}
