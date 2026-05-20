import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CampusAI Navigator — Student Support System",
  description: "AI-powered student support assistant that organizes assignments, summarizes lectures, and keeps university students on track. Stop stressing, start succeeding.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}