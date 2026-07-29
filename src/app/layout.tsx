import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "SOW Generator",
  description: "Turn discovery call notes into a client-ready statement of work.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${sourceSerif.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <header className="no-print border-b border-sidebar-border bg-sidebar">
          <div className="mx-auto max-w-7xl px-6 py-4 sm:px-10">
            <div className="mx-auto max-w-2xl">
              <span className="text-base font-semibold text-sidebar-foreground">SOW Generator</span>
            </div>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
