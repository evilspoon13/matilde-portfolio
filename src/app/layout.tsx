import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";

import "./globals.css";

const grotesk = Space_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Matilde Crisp",
  description: "Portfolio",
};

/**
 * The document shell and nothing else.
 *
 * The site chrome — nav, footer, background image, and the content query that
 * feeds them — lives in (site)/layout.tsx, so /admin does not inherit a
 * database read or render the public navigation.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${grotesk.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
