import Link from "next/link";

const GUIDES = [
  {
    eyebrow: "Routine Foundations",
    title: "Consistent Skincare Over Overnight Promises",
    summary:
      "Why gentle cleansing, targeted treatment, and daily sun protection work best when practiced consistently over weeks.",
    href: "/about",
  },
  {
    eyebrow: "Acne & Blemish Care",
    title: "Supporting Breakout-Prone Skin Without Stripping",
    summary:
      "Balancing clarifying actives with barrier hydration so blemish-prone skin stays comfortable and resilient.",
    href: "/shop?concern=acne-breakouts",
  },
  {
    eyebrow: "Complexion & Tone",
    title: "Why Daily SPF Is Essential for Dark Spot Care",
    summary:
      "How broad-spectrum sun protection helps prevent UV-driven hyperpigmentation while tone-balancing serums work.",
    href: "/shop?concern=dark-spots",
  },
];

export function EducationSection() {
  return (
    <section className="border-b border-hairline bg-background py-20 sm:py-24">
      <div className="container-page">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
          <div className="space-y-3 max-w-[44rem]">
            <p className="text-utility font-bold uppercase tracking-[0.16em] text-primary m-0">
              Skincare Guidance
            </p>
            <h2 className="font-display text-heading m-0">
              Understanding What Your Skin Needs
            </h2>
            <p className="text-body text-ink-muted m-0">
              Educational resources to help you build a calm, informed routine.
              Content is informational and does not constitute medical advice.
            </p>
          </div>
          <Link
            href="/about"
            className="text-utility font-bold text-primary hover:underline inline-flex items-center gap-1.5 min-h-11"
          >
            Read our philosophy <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {GUIDES.map((guide) => (
            <article
              key={guide.title}
              className="ui-card--panel p-6 sm:p-8 flex flex-col justify-between gap-6"
            >
              <div className="space-y-3">
                <p className="text-caption font-bold uppercase tracking-wider text-primary m-0">
                  {guide.eyebrow}
                </p>
                <h3 className="font-display text-subheading m-0">
                  {guide.title}
                </h3>
                <p className="text-body-sm text-ink-muted leading-relaxed m-0">
                  {guide.summary}
                </p>
              </div>
              <Link
                href={guide.href}
                className="text-utility font-bold text-primary hover:underline inline-flex items-center gap-1"
              >
                Explore guide <span aria-hidden="true">&rarr;</span>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
