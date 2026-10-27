export function Card({
  children,
  className = "",
  variant = "panel",
  shadow,
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "panel" | "raised";
  shadow?: "sm" | "md" | "lg";
}) {
  const base =
    variant === "raised" ? "ui-card--raised" : "ui-card--panel";
  const shadowClass = shadow ? `shadow-${shadow}` : "";

  return (
    <div
      className={[base, shadowClass, className].filter(Boolean).join(" ").trim()}
    >
      {children}
    </div>
  );
}

export function CardMedia({
  children,
  className = "",
  aspect = "4/3",
}: {
  children: React.ReactNode;
  className?: string;
  aspect?: string;
}) {
  return (
    <div
      className={[
        "relative ui-overflow-clip",
        aspect === "square" ? "aspect-square" : `aspect-[${aspect}]`,
        className,
      ].filter(Boolean).join(" ").trim()}
    >
      {children}
    </div>
  );
}

export function CardBody({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`ui-card__body ui-card__body--loose ${className}`}>
      {children}
    </div>
  );
}
