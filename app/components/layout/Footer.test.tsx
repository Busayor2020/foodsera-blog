import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { NAV } from "~/test/fixtures";
import { renderWithRouter } from "~/test/render";

import { Footer } from "./Footer";

describe("Footer", () => {
  it("hides social icons that have no URL", () => {
    renderWithRouter(
      <Footer
        categories={NAV.categories}
        socialLinks={[
          {
            network: "instagram",
            label: "Foodsera on Instagram",
            href: "https://instagram.com/foodsera",
          },
          { network: "tiktok", label: "Foodsera on TikTok", href: "" },
        ]}
      />,
    );
    expect(
      screen.getByRole("link", { name: "Foodsera on Instagram" }),
    ).toHaveAttribute("href", "https://instagram.com/foodsera");
    expect(
      screen.queryByRole("link", { name: "Foodsera on TikTok" }),
    ).toBeNull();
  });

  it("shows no social links when none are configured", () => {
    renderWithRouter(<Footer categories={NAV.categories} socialLinks={[]} />);
    expect(screen.queryByRole("link", { name: /Foodsera on/ })).toBeNull();
  });

  it("confirms a newsletter sign-up", async () => {
    const user = userEvent.setup();
    renderWithRouter(<Footer categories={NAV.categories} socialLinks={[]} />);

    await user.type(screen.getByLabelText("Email address"), "ada@example.com");
    await user.click(screen.getByRole("button", { name: "Subscribe" }));

    expect(screen.getByRole("status")).toHaveTextContent(
      "Thank you. Check your inbox to confirm.",
    );
  });
});
