import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Accordion } from "./Accordion";

const items = [
  { title: "Can I freeze it?", content: <p>Yes, for 3 months.</p> },
  { title: "Can I use spinach?", content: <p>Yes, add it last.</p> },
];

describe("Accordion", () => {
  it("opens the default item and keeps closed answers in the page", () => {
    render(<Accordion items={items} defaultOpen={0} />);
    const first = screen.getByRole("button", { name: "Can I freeze it?" });
    const second = screen.getByRole("button", { name: "Can I use spinach?" });
    expect(first).toHaveAttribute("aria-expanded", "true");
    expect(second).toHaveAttribute("aria-expanded", "false");
    // Hidden, but still in the HTML for search engines.
    const closed = screen.getByText("Yes, add it last.", { selector: "p" });
    expect(closed).not.toBeVisible();
    expect(closed.closest("[role=region]")).toHaveAttribute("hidden");
  });

  it("toggles with Enter and Space and links button and panel", async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} />);
    const second = screen.getByRole("button", { name: "Can I use spinach?" });
    const panel = document.getElementById(
      second.getAttribute("aria-controls") ?? "",
    );
    expect(panel).toHaveAttribute("aria-labelledby", second.id);

    second.focus();
    await user.keyboard("{Enter}");
    expect(second).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Yes, add it last.")).toBeVisible();

    await user.keyboard(" ");
    expect(second).toHaveAttribute("aria-expanded", "false");
    expect(panel).toHaveAttribute("hidden");
  });

  it("opens one item at a time", async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} defaultOpen={0} />);
    await user.click(
      screen.getByRole("button", { name: "Can I use spinach?" }),
    );
    expect(
      screen.getByRole("button", { name: "Can I freeze it?" }),
    ).toHaveAttribute("aria-expanded", "false");
  });
});
