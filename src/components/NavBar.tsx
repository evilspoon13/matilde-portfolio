"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/works", label: "Works" },
  { href: "/portfolio", label: "Portfolio" },
];

export default function NavBar() {
  const pathname = usePathname();
  // The bar is transparent over the hero and gains a surface once you scroll,
  // so the name underneath it stays the first thing you see.
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-neutral-200/80 bg-white/80 backdrop-blur-md"
          : "border-b border-transparent"
      }`}
    >
      <div className="flex h-16 w-full items-center justify-between px-6 sm:px-10 lg:px-[3vw]">
        <Link
          href="/"
          className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-900 transition-opacity hover:opacity-60"
        >
          Matilde Crisp
        </Link>

        <nav className="flex items-center gap-8 sm:gap-10">
          {LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`hidden text-sm transition-colors sm:block ${
                isActive(href)
                  ? "text-neutral-900"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              {label}
            </Link>
          ))}

          <a
            href="mailto:matilde.crisp@tamu.edu"
            className="rounded-full bg-brand px-5 py-2 text-sm text-white transition-colors duration-300 hover:bg-brand-ink"
          >
            Get in touch
          </a>
        </nav>
      </div>
    </header>
  );
}
