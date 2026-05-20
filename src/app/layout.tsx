import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CampusAI Navigator | Your Semester. Automated.",
  description:
    "Turn the chaos of syllabi, lectures, and deadlines into a crystal-clear path to graduation. CampusAI does the heavy lifting so you can focus on learning.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Geist:wght@400;500;600;700;800&display=swap"
        />
      </head>
      <body className="bg-background text-on-surface antialiased font-body-md">
        {children}
      </body>
    </html>
  );
}