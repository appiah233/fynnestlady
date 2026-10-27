import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { CartProvider } from "@/components/cart-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Fynnestlady Skincare",
  description: "Your Skin. Your Needs. Your Fynnest Glow.",
  icons: {
    icon: "/logo.jpeg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AuthProvider>
      <html lang="en-GH">
        <body className="min-h-[100vh] flex flex-col">
          <a className="skip-link" href="#main-content">
            Skip to main content
          </a>
          <CartProvider>
            <Suspense
              fallback={
                <div
                  className="min-h-[85px] border-b border-[var(--border)] bg-[var(--surface)]"
                  aria-hidden="true"
                />
              }
            >
              <Header />
            </Suspense>
            <main id="main-content" tabIndex={-1} className="flex-1">
              {children}
            </main>
            <Footer />
          </CartProvider>
        </body>
      </html>
    </AuthProvider>
  );
}
