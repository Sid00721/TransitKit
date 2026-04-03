import type { Metadata } from "next";
import localFont from "next/font/local";
import { Nav } from "@/components/Nav";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "TransitKit — The Sydney Transit API Developers Actually Want to Use",
    template: "%s | TransitKit",
  },
  description:
    "Clean REST API for Sydney public transport. Real-time bus departures, nearby stops, and route search. Full CORS support, proper error codes, and clean JSON responses.",
  metadataBase: new URL("https://transitkit.dev"),
  openGraph: {
    title: "TransitKit — The Sydney Transit API Developers Actually Want to Use",
    description:
      "Clean REST API for Sydney public transport. Real-time bus departures, nearby stops, and route search. Full CORS support, proper error codes, and clean JSON responses.",
    url: "https://transitkit.dev",
    siteName: "TransitKit",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TransitKit — The Sydney Transit API Developers Actually Want to Use",
    description:
      "Clean REST API for Sydney public transport. Full CORS support, proper error codes, and clean JSON.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-background text-white`}
      >
        <Nav />
        <main className="pt-16">{children}</main>
      </body>
    </html>
  );
}
