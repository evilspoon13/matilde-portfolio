import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import BackgroundImage from "@/components/BackgroundImage";
import { getAbout } from "@/lib/notion";

const grotesk = Space_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Matilde Crisp",
  description: "Portfolio",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetched once per render and shared with the footer/background, rather than
  // each of them hitting /api/about from the browser after hydration.
  const about = await getAbout();

  return (
    <html lang="en">
      <body
        className={`${grotesk.variable} font-sans antialiased`}
      >
        <BackgroundImage src={about?.background} />
        <div className="relative z-10 flex flex-col min-h-screen bg-[#f7f8fa]/90 overflow-x-hidden">
            <NavBar/>
            <main className="flex-grow">
              {children}
            </main>
            <Footer resumeUrl={about?.resume} />
        </div>
      </body>
    </html>
  );
}
