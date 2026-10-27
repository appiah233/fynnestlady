export function Skeleton({
  className = "",
  variant = "block",
}: {
  className?: string;
  variant?: "block" | "circle" | "text" | "badge";
}) {
  const sizes = {
    block: "h-32 w-full",
    circle: "h-16 w-16 rounded-full",
    text: "h-4 w-32 rounded-sm",
    badge: "h-6 w-20 rounded-full",
  };

  return (
    <span
      className={[
        "ui-skeleton block",
        sizes[variant],
        className,
      ].filter(Boolean).join(" ").trim()}
      aria-hidden="true"
    />
  );
}
