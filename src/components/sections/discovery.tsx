import Link from "next/link";

export function DiscoverySection() {
  return (
    <section className="border-y border-hairline bg-background py-20 sm:py-24 lg:py-32">
      <div className="container-page">
        <div className="ui-card--panel shadow-sm overflow-hidden md:grid md:grid-cols-2">
          <div className="ui-overflow-clip aspect-[4/3] md:aspect-auto bg-surface-muted flex flex-col items-center justify-center p-8 text-center">
            <p className="font-display text-subheading text-ink m-0">
              Every Skin Is Different
            </p>
            <p className="text-caption text-ink-muted mt-2 m-0">
              Skin discovery preview &mdash; development fixture
            </p>
          </div>
          <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center space-y-6">
            <h2 className="font-display text-heading m-0">
              Let&rsquo;s understand your skin.
            </h2>
            <p className="text-body text-ink-muted leading-relaxed m-0">
              Finding the right skincare products shouldn&rsquo;t feel overwhelming.
              Start by identifying your primary skin concerns and exploring
              formulas aligned with your routine goals.
            </p>
            <p className="text-body-sm text-ink-muted m-0">
              Guidance is informational and does not diagnose skin conditions.
            </p>
            <div>
              <Link
                href="/shop?view=concern"
                className="inline-flex min-h-11 items-center justify-center gap-2 bg-primary text-primary-foreground rounded-sm px-5 py-3 font-bold text-utility uppercase tracking-wider transition-colors hover:bg-primary-hover no-underline"
              >
                Explore by Concern <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
