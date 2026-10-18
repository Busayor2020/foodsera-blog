import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import * as newsletter from "~/lib/newsletter";

import { NEWSLETTER_UNAVAILABLE, NewsletterForm } from "./NewsletterForm";

afterEach(() => vi.restoreAllMocks());

async function signUp(variant: "footer" | "sidebar" | "feature") {
  const user = userEvent.setup();
  render(<NewsletterForm variant={variant} />);
  await user.type(screen.getByLabelText("Email address"), "ada@example.com");
  await user.click(screen.getByRole("button", { name: "Subscribe" }));
}

describe("NewsletterForm", () => {
  it.each(["footer", "sidebar", "feature"] as const)(
    "%s: says nothing was signed up while there is no newsletter backend",
    async (variant) => {
      await signUp(variant);
      expect(await screen.findByRole("status")).toHaveTextContent(
        NEWSLETTER_UNAVAILABLE,
      );
      expect(screen.queryByText(/check your inbox/i)).toBeNull();
    },
  );

  it("shows the design's success text only after a real sign-up", async () => {
    const subscribe = vi
      .spyOn(newsletter, "subscribe")
      .mockResolvedValue("subscribed");
    await signUp("feature");
    expect(subscribe).toHaveBeenCalledWith("ada@example.com");
    expect(await screen.findByRole("status")).toHaveTextContent(
      "You are in. Check your inbox to confirm your email.",
    );
  });

  it("treats a failed request as unavailable", async () => {
    vi.spyOn(newsletter, "subscribe").mockRejectedValue(new Error("network"));
    await signUp("footer");
    expect(await screen.findByRole("status")).toHaveTextContent(
      NEWSLETTER_UNAVAILABLE,
    );
  });
});
