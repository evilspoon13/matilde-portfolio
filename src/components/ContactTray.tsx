"use client";

import { RiLinkedinBoxFill, RiMailLine, RiFileTextLine } from "react-icons/ri";

type Props = {
  resumeUrl?: string;
};

export default function ContactTray({ resumeUrl }: Props) {
  const links = [
    {
      id: "email",
      label: "Email",
      href: "mailto:matilde.crisp@tamu.edu",
      icon: <RiMailLine className="h-4 w-4" />,
      external: false,
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/matilde-crisp-a34a25254/",
      icon: <RiLinkedinBoxFill className="h-4 w-4" />,
      external: true,
    },
    {
      id: "resume",
      label: "Resume",
      href: resumeUrl || "#",
      icon: <RiFileTextLine className="h-4 w-4" />,
      external: true,
    },
  ];

  return (
    <div className="flex flex-col gap-10 rounded-3xl bg-brand-soft px-8 py-12 sm:px-12 sm:py-14 lg:flex-row lg:items-center lg:justify-between">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.25em] text-brand-ink">
          Contact
        </p>
        <h2 className="max-w-xl text-2xl font-medium leading-tight tracking-tight sm:text-4xl">
          Open to studio work, internships, and collaborations.
        </h2>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.href}
            target={link.external ? "_blank" : undefined}
            rel={link.external ? "noopener noreferrer" : undefined}
            className={`inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-sm transition-colors duration-300 ${
              link.id === "email"
                ? "bg-brand text-white hover:bg-brand-ink"
                : "border border-brand/30 bg-white/70 text-neutral-700 hover:border-brand hover:text-neutral-900"
            }`}
          >
            {link.icon}
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}
