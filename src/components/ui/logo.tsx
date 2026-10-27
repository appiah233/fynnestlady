import Image from "next/image";

type LogoProps = {
  width?: number;
  height?: number;
  className?: string;
  alt?: string;
};

export function Logo({
  width = 56,
  height = 56,
  className = "",
  alt = "Fynnestlady Skincare — You're the Fynnest...Be it.",
}: LogoProps) {
  return (
    <Image
      src="/logo.jpeg"
      alt={alt}
      width={width}
      height={height}
      className={["block object-contain rounded-sm", className]
        .filter(Boolean)
        .join(" ")
        .trim()}
      priority
      unoptimized
    />
  );
}
