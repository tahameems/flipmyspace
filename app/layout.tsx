import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlipMySpace - Instant AI Room Staging & Interior Remodeling",
  description: "Reimagine, furnish, and transform any empty space in seconds with AI. Photorealistic staging, custom aesthetics, and architectural precision.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen text-slate-100 antialiased selection:bg-amber-500/30 selection:text-amber-200">
        {children}
      </body>
    </html>
  );
}
