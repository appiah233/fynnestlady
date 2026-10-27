import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { Logo } from "@/components/ui/logo";
import { isClerkConfigured } from "@/lib/env";

export default function SignUpPage() {
  const configured = isClerkConfigured();

  return (
    <section className="py-16 sm:py-24">
      <div className="container-page flex flex-col items-center">
        <div className="mb-8 flex flex-col items-center text-center space-y-3">
          <Logo width={96} height={96} />
          <h1 className="font-display text-heading m-0">
            Create your Fynnestlady account
          </h1>
          <p className="text-body-sm text-ink-muted max-w-[28rem] m-0">
            Your Skin. Your Needs. Your Fynnest Glow.
          </p>
        </div>

        {configured ? (
          <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
        ) : (
          <div className="ui-card--panel shadow-sm p-6 sm:p-8 max-w-[28rem] w-full space-y-4">
            <p className="text-utility font-bold text-primary uppercase tracking-wider m-0">
              Clerk Authentication Preview
            </p>
            <p className="text-body-sm text-ink-muted leading-relaxed m-0">
              Clerk registration is integrated for this route. Set{" "}
              <code className="font-mono text-xs bg-surface-muted px-1.5 py-0.5 rounded-sm">
                NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
              </code>{" "}
              and{" "}
              <code className="font-mono text-xs bg-surface-muted px-1.5 py-0.5 rounded-sm">
                CLERK_SECRET_KEY
              </code>{" "}
              in your environment to activate live Clerk sign-up.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-hairline">
              <Link href="/sign-in" className="ui-link text-body-sm font-bold">
                Already have an account? Sign in
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

