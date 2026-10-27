export function BrandExperience() {
  return (
    <section id="about" className="surface-muted py-20 sm:py-24 lg:py-32">
      <div className="container-page">
        <div className="grid gap-12 md:grid-cols-2 items-center">
          <div className="space-y-6 max-w-[44rem]">
            <h2 className="font-display text-heading">
              12 Years of Experience.
            </h2>
            <p className="font-display text-heading text-primary">
              A Personal Approach to Your Skin.
            </p>
            <p className="text-body text-ink-muted leading-relaxed">
              Your Skin. Your Needs. Your Fynnest Glow.
            </p>
            <p className="text-body text-ink-muted leading-relaxed">
              Be the Fynnest. Feel the Fynnest Effect.
            </p>
          </div>
          <div className="relative hidden lg:block">
            <ImageHeroPlaceholder />
          </div>
        </div>
      </div>
    </section>
  );
}

function ImageHeroPlaceholder() {
  return (
    <div className="aspect-[4/3] bg-surface rounded-[var(--radius-lg)] border border-hairline flex items-center justify-center">
      <span className="text-caption text-ink-muted">
        Editorial imagery placeholder — development fixture
      </span>
    </div>
  );
}
