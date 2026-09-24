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
      icon: <RiMailLine className="h-5 w-5" />,
      external: false,
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/matilde-crisp-a34a25254/",
      icon: <RiLinkedinBoxFill className="h-5 w-5" />,
      external: true,
    },
    {
      id: "resume",
      label: "Resume",
      href: resumeUrl || "#",
      icon: <RiFileTextLine className="h-5 w-5" />,
      external: true,
    },
  ];

  return (
    <div className="flex flex-col gap-12 rounded-3xl bg-brand-soft px-8 py-14 sm:px-14 sm:py-20 lg:flex-row lg:items-center lg:justify-between">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.25em] text-brand-ink sm:text-base">
          Contact
        </p>
        <h2 className="max-w-[16ch] text-[clamp(2rem,3.6vw,5rem)] font-normal leading-[1.05] tracking-[-0.03em]">
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
            className={`inline-flex items-center gap-3 rounded-full px-8 py-4 text-base transition-colors duration-300 sm:text-lg ${
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
