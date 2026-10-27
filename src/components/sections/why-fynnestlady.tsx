const PILLARS = [
  {
    title: "Experience That Matters",
    body: "With 12 years in skincare, we bring experience and a focused approach to helping customers navigate their skincare concerns.",
  },
  {
    title: "Skincare With a Purpose",
    body: "We specialise in acne care and complexion improvement, offering products for specific skincare concerns and everyday skin maintenance.",
  },
  {
    title: "A Personal Approach",
    body: "We recognise that your skin is unique. We encourage you to share your concerns so we can help you explore suitable products for your needs.",
  },
  {
    title: "Your Confidence Matters",
    body: "We want you to feel informed, supported, and confident in the skincare choices you make—without unrealistic overnight promises.",
  },
];

export function WhyFynnestlady() {
  return (
    <section className="surface-panel border-b border-hairline py-20 sm:py-24">
      <div className="container-page">
        <div className="space-y-3 max-w-[44rem] mb-12">
          <p className="text-utility font-bold uppercase tracking-[0.16em] text-primary m-0">
            What Makes Fynnestlady Different
          </p>
          <h2 className="font-display text-heading m-0">
            Thoughtful Product Choices. Consistent Care.
          </h2>
          <p className="text-body text-ink-muted m-0">
            12 Years of Experience. A Personal Approach to Your Skin.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((pillar) => (
            <article
              key={pillar.title}
              className="ui-card--raised p-6 sm:p-7 space-y-3"
            >
              <h3 className="font-display text-subheading m-0">
                {pillar.title}
              </h3>
              <p className="text-body-sm text-ink-muted leading-relaxed m-0">
                {pillar.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
