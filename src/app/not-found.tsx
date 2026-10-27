import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export default function NotFound() {
  return (
    <section className="py-16 sm:py-24">
      <div className="container-page flex flex-col items-center text-center space-y-6">
        <Logo width={84} height={84} />
        <div className="space-y-2 max-w-[32rem]">
          <p className="text-utility font-bold uppercase tracking-wider text-primary m-0">
            404 &bull; Page Not Found
          </p>
          <h1 className="font-display text-heading m-0">
            We couldn&rsquo;t find that skincare page
          </h1>
          <p className="text-body-sm text-ink-muted m-0">
            The page you requested may have moved or no longer exists. Explore
            our verified Fynnestlady formulations below.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link href="/shop" className="ui-button">
            Explore the Shop
          </Link>
          <Link href="/" className="ui-button ui-button--secondary">
            Return Home
          </Link>
        </div>
      </div>
    </section>
  );
}

