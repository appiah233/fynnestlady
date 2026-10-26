import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fynnestlady Skincare",
  description: "Your Skin. Your Needs. Your Fynnest Glow.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GH">
      <body>
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <header className="border-b border-[var(--border)] bg-[var(--surface)]">
          <div className="container-page flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
            <Link className="inline-flex w-fit items-center gap-3 no-underline" href="/" aria-label="Fynnestlady Skincare home">
              <Image
                src="/brand/fynnestlady-logo.jpeg"
                alt=""
                width={64}
                height={64}
                priority
                className="h-14 w-14 rounded-full object-cover"
              />
              <span className="font-display text-xl text-[var(--foreground)]">Fynnestlady</span>
            </Link>
            <nav aria-label="Main navigation" className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-semibold">
              <Link href="/">Home</Link>
              <Link href="/#about">Our approach</Link>
            </nav>
          </div>
        </header>
        {children}
        <footer className="border-t border-[var(--border)] bg-[var(--surface-muted)] py-8">
          <div className="container-page text-sm">
            <p className="font-semibold">Fynnestlady Skincare</p>
            <p>Your Skin. Your Needs. Your Fynnest Glow.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
