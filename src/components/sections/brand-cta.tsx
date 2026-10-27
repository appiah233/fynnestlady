import Link from "next/link";

export function BrandCTA() {
  return (
    <section className="surface-panel border-b border-hairline py-20 sm:py-24 lg:py-32">
      <div className="container-page">
        <div className="text-center max-w-[46rem] mx-auto space-y-6">
          <h2 className="font-display text-display m-0">
            Be the Fynnest. Feel the Fynnest Effect.
          </h2>
          <p className="text-body text-ink-muted leading-relaxed m-0">
            Your Skin. Your Needs. Your Fynnest Glow.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/shop"
              className="inline-flex min-h-11 items-center justify-center gap-2 min-w-[14rem] bg-primary text-primary-foreground rounded-sm px-6 py-4 font-bold text-utility uppercase tracking-wider transition-colors hover:bg-primary-hover focus-visible:outline-primary focus-visible:outline-2 focus-visible:outline-offset-2 no-underline"
            >
              Explore Skincare <span aria-hidden="true">&rarr;</span>
            </Link>
            <Link
              href="/about"
              className="inline-flex min-h-11 items-center justify-center gap-2 min-w-[14rem] border border-primary text-primary rounded-sm px-6 py-4 font-bold text-utility uppercase tracking-wider transition-colors hover:bg-primary-soft focus-visible:outline-primary focus-visible:outline-2 focus-visible:outline-offset-2 no-underline"
            >
              Our Approach <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
