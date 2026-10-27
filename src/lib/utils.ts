export function cn(...inputs: Array<string | false | null | undefined>): string {
  return inputs.filter(Boolean).join(" ").trim();
}

export function formatPrice(priceMinorOrMajor: number, currency: "GHS" = "GHS"): string {
  const major =
    Number.isInteger(priceMinorOrMajor) && priceMinorOrMajor >= 1000
      ? priceMinorOrMajor / 100
      : priceMinorOrMajor;
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(major);
}
