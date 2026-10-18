import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { NAV } from "~/test/fixtures";
import { renderWithRouter } from "~/test/render";

import { Header } from "./Header";

function getDialog() {
  return document.querySelector("dialog") as HTMLDialogElement;
}

describe("MobileMenu", () => {
  it("opens as a modal dialog with the menu links", async () => {
    const user = userEvent.setup();
    renderWithRouter(<Header nav={NAV} />);
    const button = screen.getByRole("button", { name: "Open menu" });

    await user.click(button);

    const dialog = getDialog();
    expect(dialog).toHaveAttribute("open");
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(
      within(dialog).getByRole("link", { name: "All recipes A–Z" }),
    ).toHaveAttribute("href", "/recipes");
    expect(
      within(dialog).getByRole("link", { name: "Efik / Ibibio" }),
    ).toHaveAttribute("href", "/region/efik-ibibio");
  });

  it("closes on Escape and returns focus to the menu button", async () => {
    const user = userEvent.setup();
    renderWithRouter(<Header nav={NAV} />);
    const button = screen.getByRole("button", { name: "Open menu" });

    await user.click(button);
    await user.keyboard("{Escape}");

    expect(getDialog()).not.toHaveAttribute("open");
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveFocus();
  });

  it("closes with the close button", async () => {
    const user = userEvent.setup();
    renderWithRouter(<Header nav={NAV} />);

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.click(screen.getByRole("button", { name: "Close menu" }));

    expect(getDialog()).not.toHaveAttribute("open");
  });

  it("closes when a link is chosen", async () => {
    const user = userEvent.setup();
    renderWithRouter(<Header nav={NAV} />, { path: "/about" });

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.click(
      within(getDialog()).getByRole("link", { name: "Christmas" }),
    );

    expect(getDialog()).not.toHaveAttribute("open");
  });
});
