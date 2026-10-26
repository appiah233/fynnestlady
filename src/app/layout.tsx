import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fynnestlady Skincare",
  description: "Your Skin. Your Needs. Your Fynnest Glow.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GH">
      <body>{children}</body>
    </html>
  );
}
