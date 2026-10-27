"use client";

import { useState, type FormEvent } from "react";
import { TextField } from "@/components/ui/text-field";
import { Button } from "@/components/ui/button";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Enter a valid email address (for example, name@example.com).");
      setSubmitted(false);
      return;
    }
    setError(undefined);
    setSubmitted(true);
  };

  return (
    <section className="surface-muted border-t border-hairline py-16 sm:py-20">
      <div className="container-page">
        <div className="max-w-[38rem] space-y-6">
          <div className="space-y-3">
            <p className="text-utility font-bold uppercase tracking-[0.16em] text-primary m-0">
              Stay Informed
            </p>
            <h2 className="font-display text-heading m-0">
              Join the Fynnest Glow
            </h2>
            <p className="text-body text-ink-muted m-0">
              Receive educational skincare notes and collection updates when
              verified releases launch.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col sm:flex-row sm:items-start gap-3"
          >
            <div className="flex-1">
              <TextField
                id="newsletter-email"
                name="email"
                type="email"
                autoComplete="email"
                label="Email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(undefined);
                }}
                placeholder="you@example.com"
                hint="Development preview: email delivery is not connected yet."
                error={error}
              />
            </div>
            <div className="sm:pt-7">
              <Button type="submit" variant="primary">
                Notify me
              </Button>
            </div>
          </form>

          {submitted && (
            <p
              role="status"
              aria-live="polite"
              className="text-body-sm font-bold text-success m-0"
            >
              Thank you — your interest has been recorded in this preview session.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
