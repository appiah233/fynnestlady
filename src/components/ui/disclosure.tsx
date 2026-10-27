"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function Disclosure({
  label,
  children,
  className = "",
  openByDefault = false,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  openByDefault?: boolean;
}) {
  const [open, setOpen] = useState(openByDefault);
  return (
    <div className={["border-b border-hairline", className].filter(Boolean).join(" ").trim()}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between py-4 text-left text-utility font-bold hover:text-primary focus-visible:outline-primary focus-visible:outline-2 focus-visible:outline-offset-1"
      >
        <span>{label}</span>
        <ChevronDown className={[
          "w-4 h-4 transition-transform duration-200",
          open ? "rotate-180" : "",
        ].filter(Boolean).join(" ").trim()}
      />
      </button>
      {open && <div className="pt-4 pb-2 text-body text-ink-muted leading-relaxed">{children}</div>}
    </div>
  );
}
