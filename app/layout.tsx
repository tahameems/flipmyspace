import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlipMySpace — Warm, Intelligent Room Staging Studio",
  description: "Transform empty rooms into warm, thoughtfully styled spaces in seconds with AI. Architectural precision with designer furniture, natural lighting, and photorealistic 8K staging.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-[#faf7f2] text-[#1c1917] antialiased selection:bg-[#c25e37]/20 selection:text-[#8c3817]">
        {children}
      </body>
    </html>
  );
}
