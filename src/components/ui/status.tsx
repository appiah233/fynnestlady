import type { ReactNode } from "react";

export function Badge({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={`ui-badge ${className}`.trim()}>{children}</span>;
}

export function Alert({
  children,
  tone = "info",
  className = "",
}: {
  children: ReactNode;
  tone?: "info" | "success" | "error";
  className?: string;
}) {
  return (
    <div
      className={`ui-alert ${className}`.trim()}
      data-tone={tone}
      role={tone === "error" ? "alert" : "status"}
    >
      {children}
    </div>
  );
}

export function EmptyState({
  title,
  children,
  className = "",
}: {
  title: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`ui-empty ${className}`.trim()}>
      <h2 className="font-display text-subheading mb-2">{title}</h2>
      {children}
    </div>
  );
}
