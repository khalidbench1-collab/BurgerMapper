import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BurgerMapper",
  description:
    "Describe what you need to get done in Berlin — or add an official letter — and get a clear, source-aware route. An independent guide, not a government service.",
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
