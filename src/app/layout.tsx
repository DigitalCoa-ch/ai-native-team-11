import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Team 11 — AI Native",
  description: "Welcome to Team 11",
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