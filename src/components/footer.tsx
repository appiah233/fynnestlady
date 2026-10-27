import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface-muted)] py-12 sm:py-16">
      <div className="container-page space-y-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3 sm:col-span-2">
            <Link
              href="/"
              className="inline-flex items-center gap-3 no-underline"
            >
              <Logo width={48} height={48} />
              <span className="font-display text-subheading text-ink">
                Fynnestlady Skincare
              </span>
            </Link>
            <p className="text-body-sm text-ink-muted max-w-[34rem] m-0">
              Your Skin. Your Needs. Your Fynnest Glow. 12 Years of Experience.
              A Personal Approach to Your Skin.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-utility font-bold uppercase tracking-wider text-ink m-0">
              Shop
            </h2>
            <ul className="space-y-2 list-none p-0 m-0 text-body-sm">
              <li>
                <Link href="/shop" className="ui-link">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/shop?view=concern" className="ui-link">
                  Shop by Concern
                </Link>
              </li>
              <li>
                <Link href="/shop?concern=acne-breakouts" className="ui-link">
                  Acne &amp; Breakouts
                </Link>
              </li>
              <li>
                <Link href="/shop?concern=dark-spots" className="ui-link">
                  Dark Spots &amp; Tone
                </Link>
              </li>
              <li>
                <Link href="/cart" className="ui-link">
                  Your Cart
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-utility font-bold uppercase tracking-wider text-ink m-0">
              Brand &amp; Account
            </h2>
            <ul className="space-y-2 list-none p-0 m-0 text-body-sm">
              <li>
                <Link href="/about" className="ui-link">
                  About Fynnestlady
                </Link>
              </li>
              <li>
                <Link href="/sign-in" className="ui-link">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/sign-up" className="ui-link">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-hairline pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-caption text-ink-muted">
          <p className="m-0">
            &copy; {new Date().getFullYear()} Fynnestlady Skincare. Be the
            Fynnest. Feel the Fynnest Effect.
          </p>
          <p className="m-0">
            You&rsquo;re the Fynnest&hellip;Be it.
          </p>
        </div>
      </div>
    </footer>
  );
}
