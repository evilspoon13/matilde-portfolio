import Link from "next/link";

import { adminQueries } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [about, education, experience, works] = await Promise.all([
    adminQueries.about(),
    adminQueries.education(),
    adminQueries.experience(),
    adminQueries.works(),
  ]);

  const cards = [
    { href: "/admin/about", label: "About", detail: about?.name ?? "Not set" },
    {
      href: "/admin/education",
      label: "Education",
      detail: `${education.length} ${education.length === 1 ? "entry" : "entries"}`,
    },
    {
      href: "/admin/experience",
      label: "Experience",
      detail: `${experience.length} ${experience.length === 1 ? "entry" : "entries"}`,
    },
    {
      href: "/admin/works",
      label: "Works",
      detail: `${works.length} projects · ${works.reduce(
        (total, work) => total + work.images.length,
        0
      )} images`,
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-medium tracking-tight">Content</h1>
      <p className="mt-2 text-neutral-500">
        Changes appear on the site as soon as they are saved.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-xl border border-neutral-200 bg-white p-6 transition-colors hover:border-brand"
          >
            <p className="text-xs uppercase tracking-[0.25em] text-brand">
              {card.label}
            </p>
            <p className="mt-3 text-lg">{card.detail}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
