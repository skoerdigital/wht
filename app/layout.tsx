import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "WHT Compliance — Automatyzacja podatku u źródła",
  description: "Prototyp systemu identyfikacji i rozliczania podatku u źródła (WHT).",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl" className={`${inter.variable} h-full`}>
      <body className="min-h-full">
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar />
            <main className="flex-1 overflow-y-auto">
              <div className="mx-auto max-w-7xl px-6 py-8">{children}</div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
