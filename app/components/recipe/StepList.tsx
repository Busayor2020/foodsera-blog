import { AdPosition } from "~/components/ads/AdPosition";
import type { Step } from "~/lib/content/types";
import { RECIPE_STEP } from "~/lib/images";

interface StepListProps {
  heading: string;
  steps: Step[];
}

function StepItem({ step, n }: { step: Step; n: number }) {
  return (
    <li id={`step-${n}`} className="flex scroll-mt-4 flex-col gap-3.5">
      <div className="flex items-start gap-3.5">
        <span
          aria-hidden="true"
          className="mt-0.5 flex size-10 flex-none items-center justify-center rounded-full bg-palm font-bold text-white"
        >
          {n}
        </span>
        <div className="flex flex-col gap-1.5">
          <h3 className="text-step">
            <span className="sr-only">Step {n}: </span>
            {step.title}
          </h3>
          <p>{step.text}</p>
        </div>
      </div>
      {step.image && (
        <figure className="flex flex-col gap-2">
          <img
            src={step.image}
            alt={step.imageAlt}
            width={RECIPE_STEP.width}
            height={RECIPE_STEP.height}
            loading="lazy"
            decoding="async"
            className="aspect-video w-full rounded-tile object-cover"
          />
          {step.caption && (
            <figcaption className="text-sm text-muted">
              {step.caption}
            </figcaption>
          )}
        </figure>
      )}
    </li>
  );
}

/**
 * The method, step by step. The steps are split into two lists around the
 * mid-method ad position, so the ad sits between whole step blocks (never
 * between a step's photo and its text) and isn't counted as a step.
 */
export function StepList({ heading, steps }: StepListProps) {
  const middle = Math.ceil(steps.length / 2);
  const halves = [steps.slice(0, middle), steps.slice(middle)];
  return (
    <section aria-labelledby="method" className="flex flex-col gap-8">
      <h2 id="method" className="text-4xl">
        {heading}
      </h2>
      <ol className="flex flex-col gap-8">
        {halves[0].map((step, i) => (
          <StepItem key={step.title} step={step} n={i + 1} />
        ))}
      </ol>
      {halves[1].length > 0 && (
        <>
          <AdPosition name="recipe-steps-mid" />
          <ol start={middle + 1} className="flex flex-col gap-8">
            {halves[1].map((step, i) => (
              <StepItem key={step.title} step={step} n={middle + i + 1} />
            ))}
          </ol>
        </>
      )}
    </section>
  );
}
