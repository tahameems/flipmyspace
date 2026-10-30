import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlipMySpace — Architectural AI Spatial Staging",
  description: "Functional, precise room staging and architectural remodeling powered by spatial AI. Designed with Bauhaus principles: form follows function, absolute clarity, universal accessibility.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-[#f7f6f2] text-[#1a1917] antialiased selection:bg-[#1a1917] selection:text-[#f7f6f2]">
        {children}
      </body>
    </html>
  );
}
