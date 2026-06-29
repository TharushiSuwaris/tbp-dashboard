import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TBP Family Office Intelligence Engine",
  description: "TBP Global Family Office Discovery & Stewardship Intelligence Engine — Capital Advisory & Family Office Circle Intelligence Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body style={{ margin: 0, minHeight: "100vh" }}>{children}</body>
    </html>
  );
}
