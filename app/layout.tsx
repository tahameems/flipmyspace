import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import AuthModal from "@/app/components/AuthModal";

export const metadata: Metadata = {
  title: "Relive — Imagine your home, anew. Visualise before you transform.",
  description: "Visualise your space before you transform it. Relive transforms unfurnished rooms with architectural precision, authentic lighting, and curated interior styles.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-[#faf7f2] text-[#1c1917] antialiased selection:bg-[#c25e37]/20 selection:text-[#8c3817]">
        <AuthProvider>
          {children}
          <AuthModal />
        </AuthProvider>
      </body>
    </html>
  );
}
