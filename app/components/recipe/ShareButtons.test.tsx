import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ShareButtons, whatsAppHref } from "./ShareButtons";

const URL = "https://foodsera.com/recipes/egusi-soup";
const TITLE = "Egusi Soup with Ugu and Assorted Meat";

afterEach(() => {
  vi.restoreAllMocks();
  // @ts-expect-error -- remove the test double
  delete navigator.share;
});

describe("ShareButtons", () => {
  it("uses the device share sheet when there is one", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", {
      value: share,
      configurable: true,
    });
    const user = userEvent.setup();
    render(<ShareButtons title={TITLE} url={URL} />);

    await user.click(screen.getByRole("button", { name: "Share" }));

    expect(share).toHaveBeenCalledWith({ title: TITLE, text: TITLE, url: URL });
  });

  it("copies the link when there is no share sheet", async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, "writeText");
    render(<ShareButtons title={TITLE} url={URL} />);

    await user.click(screen.getByRole("button", { name: "Share" }));

    expect(writeText).toHaveBeenCalledWith(URL);
    expect(
      screen.getByRole("button", { name: "Link copied" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Link copied");
  });

  it("shows the link to copy by hand when copying fails", async () => {
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(
      new Error("denied"),
    );
    render(<ShareButtons title={TITLE} url={URL} />);

    await user.click(screen.getByRole("button", { name: "Share" }));

    expect(screen.getByLabelText("Copy this link")).toHaveValue(URL);
  });

  it("links to WhatsApp with the title and URL", () => {
    render(<ShareButtons title={TITLE} url={URL} />);
    const link = screen.getByRole("link", { name: "WhatsApp" });
    expect(link).toHaveAttribute("href", whatsAppHref(TITLE, URL));
    expect(whatsAppHref(TITLE, URL)).toBe(
      "https://wa.me/?text=Egusi%20Soup%20with%20Ugu%20and%20Assorted%20Meat%20https%3A%2F%2Ffoodsera.com%2Frecipes%2Fegusi-soup",
    );
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
