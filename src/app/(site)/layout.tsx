import BackgroundImage from "@/components/BackgroundImage";
import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";
import { getAbout } from "@/lib/content";

/**
 * Chrome for the public site. The route group keeps the URLs unchanged: this
 * still renders /, /works, /works/[id], /portfolio and /portfolio/view.
 */
export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetched once per render and shared with the footer and background.
  const about = await getAbout();

  return (
    <>
      <BackgroundImage src={about?.background} />
      <div className="relative z-10 flex min-h-screen flex-col overflow-x-hidden bg-[#f7f8fa]/90">
        <NavBar />
        <main className="flex-grow">{children}</main>
        <Footer resumeUrl={about?.resume} />
      </div>
    </>
  );
}
