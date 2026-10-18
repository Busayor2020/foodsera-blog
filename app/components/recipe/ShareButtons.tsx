import { MessageCircle, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const cardButton =
  "flex min-h-11 items-center gap-2 rounded-full border-[1.5px] border-charcoal bg-paper px-4.5 text-md font-bold text-charcoal no-underline hover:text-charcoal";

interface ShareButtonsProps {
  title: string;
  url: string;
}

export function whatsAppHref(title: string, url: string): string {
  return `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`;
}

/**
 * Share uses the device share sheet where there is one, and otherwise copies
 * the link. WhatsApp is a plain link, so it works without JavaScript.
 */
export function ShareButtons({ title, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [manual, setManual] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const field = useRef<HTMLInputElement>(null);

  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (manual) field.current?.select();
  }, [manual]);

  const share = async () => {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text: title, url });
        return;
      } catch (error) {
        // The reader closed the share sheet.
        if ((error as Error).name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setManual(true);
    }
  };

  return (
    <>
      <button type="button" onClick={share} className={cardButton}>
        <Share2 size={17} strokeWidth={2} aria-hidden="true" />
        {copied ? "Link copied" : "Share"}
      </button>
      <a
        href={whatsAppHref(title, url)}
        target="_blank"
        rel="noopener noreferrer"
        className={cardButton}
      >
        <MessageCircle size={17} strokeWidth={2} aria-hidden="true" />
        WhatsApp
      </a>
      <span role="status" className="sr-only">
        {copied ? "Link copied" : ""}
      </span>
      {manual && (
        <label className="flex w-full flex-col gap-1 text-sm">
          Copy this link
          <input
            ref={field}
            readOnly
            value={url}
            onFocus={(event) => event.currentTarget.select()}
            className="min-h-11 rounded-field border-[1.5px] border-field-line bg-white px-3"
          />
        </label>
      )}
    </>
  );
}
