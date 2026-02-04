import type { Metadata } from "next";
import { Syne } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import BackgroundImage from "@/components/BackgroundImage";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Matilde Crisp",
  description: "Portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${syne.variable} font-sans antialiased`}
      >
        <BackgroundImage />
        <div className="relative z-10 flex flex-col min-h-screen bg-gradient-to-br from-gray-50/70 to-gray-100/70 overflow-x-hidden">
            <NavBar/>
            <main className="flex-grow">
              {children}
            </main>
            <Footer/>
        </div>
      </body>
    </html>
  );
}