import Link from "next/link";

import { logout } from "./actions/session";
import { Button } from "@/components/ui/button";
import { isAdmin } from "@/lib/require-admin";

// The admin must never render from a cached snapshot.
export const dynamic = "force-dynamic";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/about", label: "About" },
  { href: "/admin/education", label: "Education" },
  { href: "/admin/experience", label: "Experience" },
  { href: "/admin/works", label: "Works" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The login page renders inside this layout too, so the chrome is only shown
  // once there is a session.
  if (!(await isAdmin())) {
    return <div className="min-h-screen bg-[#f7f8fa]">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-neutral-900">
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="flex h-14 w-full items-center justify-between gap-6 px-6">
          <div className="flex items-center gap-8">
            <span className="text-sm font-medium uppercase tracking-[0.2em]">
              Admin
            </span>
            <nav className="flex items-center gap-5">
              {LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm text-neutral-600 transition-colors hover:text-neutral-900"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="text-sm text-neutral-500 transition-colors hover:text-neutral-900"
            >
              View site ↗
            </Link>
            {/* A form, not a link: a prefetch of a GET would log you out. */}
            <form action={logout}>
              <Button type="submit" variant="ghost" size="sm">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
