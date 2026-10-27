import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export function HeroSection() {
  return (
    <section
      aria-label="Hero"
      className="relative surface-panel border-b border-hairline overflow-hidden"
    >
      <div className="container-page relative">
        <div className="grid gap-10 items-center py-20 sm:py-24 lg:py-32 lg:grid-cols-12">
          <div className="lg:col-span-7 space-y-6 max-w-[46rem]">
            <p className="text-utility font-bold uppercase tracking-[0.16em] text-primary m-0">
              Fynnestlady Skincare
            </p>
            <h1 className="font-display text-display m-0">
              Your Skin.<br />
              Your Needs.<br />
              Your Fynnest Glow.
            </h1>
            <p className="text-body text-ink-muted leading-relaxed m-0">
              12 Years of Experience. A Personal Approach to Your Skin. Specialising
              in acne-focused skincare, complexion improvement, and thoughtful
              daily care.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                href="/shop"
                className="inline-flex min-h-11 items-center justify-center gap-2 min-w-[12rem] bg-primary text-primary-foreground rounded-sm px-6 py-3.5 font-bold text-utility uppercase tracking-wider transition-colors hover:bg-primary-hover focus-visible:outline-primary focus-visible:outline-2 focus-visible:outline-offset-2 no-underline"
              >
                Shop Skincare <span aria-hidden="true">&rarr;</span>
              </Link>
              <Link
                href="/shop?view=concern"
                className="inline-flex min-h-11 items-center justify-center gap-2 min-w-[12rem] border border-primary text-primary rounded-sm px-6 py-3.5 font-bold text-utility uppercase tracking-wider transition-colors hover:bg-primary-soft focus-visible:outline-primary focus-visible:outline-2 focus-visible:outline-offset-2 no-underline"
              >
                Explore by Concern <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 flex items-center justify-center rounded-[var(--radius-lg)] bg-surface-raised border border-hairline p-8 sm:p-10">
            <div className="text-center space-y-4">
              <div className="inline-flex rounded-[var(--radius-md)] bg-white p-4 border border-hairline shadow-sm">
                <Logo
                  width={180}
                  height={180}
                  alt="Fynnestlady Skincare — You're the Fynnest...Be it."
                />
              </div>
              <p className="font-display text-subheading text-ink m-0">
                Be the Fynnest. Feel the Fynnest Effect.
              </p>
              <p className="text-caption text-ink-muted m-0">
                Acne Care &middot; Complexion Improvement &middot; Daily Essentials
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
