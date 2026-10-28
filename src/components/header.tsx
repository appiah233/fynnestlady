"use client";

import Link from "next/link";
import { ShoppingBag, User } from "lucide-react";
import { Show, UserButton } from "@clerk/nextjs";
import { Logo } from "@/components/ui/logo";
import { useCart } from "@/components/cart-provider";
import { isClerkConfigured } from "@/lib/env";

export function Header() {
  const { itemCount } = useCart();
  const clerkReady = isClerkConfigured();

  return (
    <header className="site-header border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="site-announcement">Skincare delivered across Ghana</div>
      <div className="container-page flex flex-wrap items-center justify-between gap-3 py-3">
        <Link
          className="inline-flex min-h-11 items-center gap-3 no-underline"
          href="/"
          aria-label="Fynnestlady Skincare home"
        >
          <Logo width={60} height={60} />
          <div className="flex flex-col leading-tight">
            <span className="font-display text-xl text-ink">Fynnestlady</span>
            <span className="text-[0.7rem] text-ink-muted hidden sm:inline">
              You&rsquo;re the Fynnest&hellip;Be it.
            </span>
          </div>
        </Link>
        <nav aria-label="Main navigation" className="ui-nav-list">
          <Link className="ui-nav-link" href="/">
            Home
          </Link>
          <Link className="ui-nav-link" href="/shop">
            Shop
          </Link>
          <Link className="ui-nav-link" href="/shop?view=concern">
            Shop by Concern
          </Link>
          <Link className="ui-nav-link" href="/about">
            Our Approach
          </Link>
          <Link
            className="ui-nav-link inline-flex items-center gap-1.5"
            href="/cart"
            aria-label={`Cart (${itemCount} ${itemCount === 1 ? "item" : "items"})`}
          >
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            <span>Cart</span>
            {itemCount > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[0.7rem] font-bold text-primary-foreground">
                {itemCount}
              </span>
            )}
          </Link>
          {clerkReady ? (
            <>
              <Show when="signed-out">
                <Link
                  className="ui-nav-link inline-flex items-center gap-1.5"
                  href="/sign-in"
                >
                  <User className="h-4 w-4" aria-hidden="true" />
                  <span>Sign In</span>
                </Link>
              </Show>
              <Show when="signed-in">
                <span className="inline-flex min-h-11 items-center px-2">
                  <UserButton />
                </span>
              </Show>
            </>
          ) : (
            <Link
              className="ui-nav-link inline-flex items-center gap-1.5"
              href="/sign-in"
            >
              <User className="h-4 w-4" aria-hidden="true" />
              <span>Sign In</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
