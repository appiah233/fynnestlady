export function Section({
  children,
  className = "",
  paddingY = "py-16",
  background,
}: {
  children: React.ReactNode;
  className?: string;
  paddingY?: string;
  background?: "panel" | "raised" | "muted" | null;
}) {
  const surface =
    background === "panel"
      ? "surface-panel"
      : background === "raised"
      ? "surface-raised"
      : background === "muted"
      ? "surface-muted"
      : "";

  return (
    <section
      className={[
        surface,
        "relative",
        paddingY,
        className,
      ].filter(Boolean).join(" ").trim()}
    >
      {children}
    </section>
  );
}

export function SectionHeader({
  heading,
  headingTag = "h2",
  intro,
  className = "",
  center = false,
}: {
  heading: string;
  headingTag?: "h2" | "h3";
  intro?: string;
  className?: string;
  center?: boolean;
}) {
  const Tag = headingTag === "h3" ? "h3" : "h2";
  return (
    <div
      className={[
        "mb-12",
        center ? "text-center" : "",
        className,
      ].filter(Boolean).join(" ").trim()}
    >
      <Tag className="font-display text-heading mb-3">{heading}</Tag>
      {intro && (
        <p className="text-body-sm text-ink-muted max-w-[48ch] mx-auto">{intro}</p>
      )}
    </div>
  );
}
