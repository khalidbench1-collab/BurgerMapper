import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BurgerMapper",
  description: "Turn official Berlin letters into clear, source-aware next steps.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
