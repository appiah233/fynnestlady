import Link from "next/link";

type LinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "quiet" | "muted";
  prefetch?: boolean;
};

export function LinkText({
  href,
  children,
  className = "",
  variant = "primary",
  prefetch = true,
}: LinkProps) {
  const base =
    variant === "muted"
      ? "text-ink-muted"
      : variant === "quiet"
      ? "text-ink"
      : "ui-link";

  return (
    <Link href={href} prefetch={prefetch} className={base}>
      <span className={className}>{children}</span>
    </Link>
  );
}

export function ExternalLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={["ui-link", className].filter(Boolean).join(" ").trim()}
    >
      {children}
    </a>
  );
}
