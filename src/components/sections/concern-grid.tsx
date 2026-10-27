import Link from "next/link";
import { CONCERN_LABELS, type ProductConcern } from "@/lib/data/products";

const CONCERN_DESCRIPTIONS: Record<ProductConcern, string> = {
  "acne-breakouts":
    "Targeted daily cleansers and clarifying treatments developed for breakout-prone skin.",
  "dark-spots":
    "Tone-balancing care designed to help visibly fade dark marks with consistent use.",
  "uneven-tone":
    "Gentle, barrier-respecting formulas that support a more uniform complexion.",
  blemishes:
    "Lightweight serums and non-stripping care to help keep pores clear and calm.",
  radiance:
    "Hydrating, glow-focused routines to help restore a refreshed Fynnest Glow.",
  everyday:
    "Essential daily cleansers, moisturisers, and broad-spectrum SPF for healthy maintenance.",
};

export function ConcernGrid() {
  const concerns = Object.entries(CONCERN_LABELS) as Array<
    [ProductConcern, string]
  >;

  return (
    <section className="surface-raised border-b border-hairline py-20 sm:py-24">
      <div className="container-page">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
          <div className="space-y-3 max-w-[44rem]">
            <p className="text-utility font-bold uppercase tracking-[0.16em] text-primary m-0">
              Personalised Discovery
            </p>
            <h2 className="font-display text-heading m-0">Shop by Concern</h2>
            <p className="text-body text-ink-muted m-0">
              Every skin is different. Begin with your primary concern to explore
              suitable skincare formulas. Concern guides are informational and do
              not replace medical diagnosis.
            </p>
          </div>
          <Link
            href="/shop?view=concern"
            className="text-utility font-bold text-primary hover:underline inline-flex items-center gap-1.5 min-h-11"
          >
            All concern guides <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {concerns.map(([concernKey, label]) => (
            <Link
              key={concernKey}
              href={`/shop?concern=${concernKey}`}
              className="ui-card--panel shadow-sm p-6 sm:p-8 hover:shadow-md hover:border-primary transition-all duration-200 no-underline flex flex-col justify-between gap-4"
            >
              <div className="space-y-2">
                <p className="text-caption font-bold uppercase tracking-wider text-primary m-0">
                  Concern Focus
                </p>
                <h3 className="font-display text-subheading text-ink m-0">
                  {label}
                </h3>
                <p className="text-body-sm text-ink-muted leading-relaxed m-0">
                  {CONCERN_DESCRIPTIONS[concernKey]}
                </p>
              </div>
              <span className="text-utility font-bold text-primary inline-flex items-center gap-1 pt-2">
                Explore {label.toLowerCase()} <span aria-hidden="true">&rarr;</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
