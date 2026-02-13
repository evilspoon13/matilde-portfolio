"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <div className="w-full flex justify-center py-10 px-6">

      {/* Elevated surface */}
      <div className="
        bg-white
        border border-neutral-200
        rounded-3xl
        px-10 py-6
        w-full max-w-5xl
        shadow-[0_10px_40px_rgba(0,0,0,0.06)]
      ">

        <nav className="flex items-center justify-center gap-10">

          {[
            { href: "/", label: "Home" },
            { href: "/works", label: "Works" },
            { href: "/portfolio", label: "Portfolio" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="relative text-sm uppercase tracking-[0.25em] text-neutral-600 hover:text-black transition-colors group"
            >
              {label}
              <span
                className={`
                  absolute left-0 -bottom-2 h-px bg-black transition-all duration-300
                  ${isActive(href) ? "w-full" : "w-0 group-hover:w-full"}
                `}
              />
            </Link>
          ))}

        </nav>
      </div>

    </div>
  );
}
