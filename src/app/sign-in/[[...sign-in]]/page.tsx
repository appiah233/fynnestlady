import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { Logo } from "@/components/ui/logo";
import { isClerkConfigured } from "@/lib/env";

export default function SignInPage() {
  const configured = isClerkConfigured();

  return (
    <section className="py-16 sm:py-24">
      <div className="container-page flex flex-col items-center">
        <div className="mb-8 flex flex-col items-center text-center space-y-3">
          <Logo width={96} height={96} />
          <h1 className="font-display text-heading m-0">
            Sign in to Fynnestlady
          </h1>
          <p className="text-body-sm text-ink-muted max-w-[28rem] m-0">
            Access your saved skincare preferences, addresses, and order history.
          </p>
        </div>

        {configured ? (
          <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
        ) : (
          <div className="ui-card--panel shadow-sm p-6 sm:p-8 max-w-[28rem] w-full space-y-4">
            <p className="text-utility font-bold text-primary uppercase tracking-wider m-0">
              Clerk Authentication Preview
            </p>
            <p className="text-body-sm text-ink-muted leading-relaxed m-0">
              Clerk authentication is integrated for this route. Set{" "}
              <code className="font-mono text-xs bg-surface-muted px-1.5 py-0.5 rounded-sm">
                NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
              </code>{" "}
              and{" "}
              <code className="font-mono text-xs bg-surface-muted px-1.5 py-0.5 rounded-sm">
                CLERK_SECRET_KEY
              </code>{" "}
              in your environment to activate live Clerk sign-in.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-hairline">
              <Link href="/sign-up" className="ui-link text-body-sm font-bold">
                Create an account
              </Link>
              <Link href="/shop" className="ui-link text-body-sm">
                Return to Shop &rarr;
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

