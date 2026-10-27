export default function HomePage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <section className="container-page grid min-h-[55vh] content-center gap-5 py-14 sm:py-20">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--primary)]">Fynnestlady Skincare</p>
        <h1 className="font-display max-w-[18ch] text-4xl sm:text-5xl lg:text-6xl">Your Skin. Your Needs. Your Fynnest Glow.</h1>
        <p className="max-w-[42rem] text-lg text-[var(--muted-foreground)]">12 Years of Experience. A Personal Approach to Your Skin.</p>
      </section>
      <section id="about" className="border-t border-[var(--border)] bg-[var(--surface-muted)] py-12 sm:py-16">
        <div className="container-page grid gap-4">
          <h2 className="font-display text-3xl sm:text-4xl">A personal approach to your skin</h2>
          <p className="max-w-[42rem]">Be the Fynnest. Feel the Fynnest Effect.</p>
        </div>
      </section>
    </main>
  );
}
