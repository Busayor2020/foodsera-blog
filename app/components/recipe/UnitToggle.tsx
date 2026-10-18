import type { UnitSystem } from "~/lib/format/quantity";

interface UnitToggleProps {
  units: UnitSystem;
  onChange: (units: UnitSystem) => void;
}

const OPTIONS: [UnitSystem, string][] = [
  ["us", "Cups"],
  ["metric", "Metric"],
];

/** Cups or Metric. */
export function UnitToggle({ units, onChange }: UnitToggleProps) {
  return (
    <div
      role="group"
      aria-label="Measurement units"
      className="flex gap-0.5 rounded-full border border-line bg-cream p-0.75"
    >
      {OPTIONS.map(([value, label]) => {
        const active = units === value;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(value)}
            className={`min-h-11 rounded-full px-4 text-sm font-bold ${active ? "bg-charcoal text-white" : "bg-transparent text-charcoal"}`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
