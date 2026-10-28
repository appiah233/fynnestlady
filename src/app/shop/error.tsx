"use client";

export default function ShopError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container-page py-16" role="alert">
      <h1 className="font-display text-heading">The shop is temporarily unavailable</h1>
      <p className="text-body text-ink-muted">We couldn’t load the catalogue. Please try again.</p>
      <button className="ui-button mt-6" type="button" onClick={() => reset()}>
        Try again
      </button>
    </div>
  );
}
