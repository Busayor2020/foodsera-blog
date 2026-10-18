/** 45 -> "45 min", 60 -> "1 hr", 80 -> "1 hr 20 min", as in the design. */
export function formatMinutes(total: number): string {
  const minutes = Math.max(0, Math.round(total));
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  return rest === 0 ? `${hours} hr` : `${hours} hr ${rest} min`;
}

/** ISO 8601 duration for structured data: 80 -> "PT1H20M", 45 -> "PT45M". */
export function toIsoDuration(total: number): string {
  const minutes = Math.max(0, Math.round(total));
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (minutes === 0) return "PT0M";
  return `PT${hours ? `${hours}H` : ""}${rest ? `${rest}M` : ""}`;
}
