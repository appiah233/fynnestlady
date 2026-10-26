import type { ReactNode } from "react";

export function Badge({ children }: { children: ReactNode }) {
  return <span className="ui-badge">{children}</span>;
}

export function Alert({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "success" | "error" }) {
  return <div className="ui-alert" data-tone={tone} role={tone === "error" ? "alert" : "status"}>{children}</div>;
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return <div className="ui-empty"><h2 className="font-display">{title}</h2>{children}</div>;
}
