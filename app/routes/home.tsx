import type { Route } from "./+types/home";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Foodsera | Nigerian recipes, step by step" },
    {
      name: "description",
      content:
        "Tested Nigerian recipes with step-by-step photos, from egusi soup to party jollof rice.",
    },
  ];
}

// Placeholder until the homepage is built in Phase 4.
export default function Home() {
  return (
    <div className="max-w-page mx-auto px-5 py-14">
      <h1 className="text-display">Foodsera</h1>
    </div>
  );
}
