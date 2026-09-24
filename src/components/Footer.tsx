import Link from "next/link";
import { RiLinkedinBoxFill, RiMailLine, RiFileTextLine } from "react-icons/ri";

type Props = {
  resumeUrl?: string;
};

const LINKS = [
  { href: "/works", label: "Works" },
  { href: "/portfolio", label: "Portfolio" },
];

export default function Footer({ resumeUrl }: Props) {
  return (
    <footer className="w-full border-t border-neutral-200/80 bg-white/60">
      <div className="w-full px-6 py-16 sm:px-10 lg:px-[3vw]">
        <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm space-y-3">
            <Link
              href="/"
              className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-900 transition-opacity hover:opacity-60"
            >
              Matilde Crisp
            </Link>
            <p className="text-sm leading-relaxed text-neutral-500">
              Architecture honors student at Texas A&amp;M University, working on
              sustainable, context-responsive design.
            </p>
          </div>

          <div className="flex flex-col gap-10 sm:flex-row sm:gap-20">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.25em] text-neutral-400">
                Pages
              </p>
              <div className="flex flex-col gap-3">
                {LINKS.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="text-sm text-neutral-600 transition-colors hover:text-neutral-900"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.25em] text-neutral-400">
                Elsewhere
              </p>
              <div className="flex flex-col gap-3">
                <a
                  href="mailto:matilde.crisp@tamu.edu"
                  className="group flex items-center gap-3 text-sm text-neutral-600 transition-colors hover:text-neutral-900"
                >
                  <RiMailLine className="h-4 w-4 text-neutral-400 transition-colors group-hover:text-brand" />
                  Email
                </a>
                <a
                  href="https://www.linkedin.com/in/matilde-crisp-a34a25254/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 text-sm text-neutral-600 transition-colors hover:text-neutral-900"
                >
                  <RiLinkedinBoxFill className="h-4 w-4 text-neutral-400 transition-colors group-hover:text-brand" />
                  LinkedIn
                </a>
                <a
                  href={resumeUrl || "/portfolio"}
                  target={resumeUrl ? "_blank" : undefined}
                  rel={resumeUrl ? "noopener noreferrer" : undefined}
                  className="group flex items-center gap-3 text-sm text-neutral-600 transition-colors hover:text-neutral-900"
                >
                  <RiFileTextLine className="h-4 w-4 text-neutral-400 transition-colors group-hover:text-brand" />
                  Resume
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 border-t border-neutral-200/80 pt-6 text-xs tracking-wide text-neutral-400">
          © {new Date().getFullYear()} Matilde Crisp
        </div>
      </div>
    </footer>
  );
}
