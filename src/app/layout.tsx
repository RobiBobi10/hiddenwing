import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlightAI — Family Edition",
  description: "Find the best trip for you, not just the cheapest flight.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
