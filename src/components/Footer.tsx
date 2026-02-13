"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RiLinkedinBoxFill, RiMailLine, RiFileTextLine } from "react-icons/ri";

export default function Footer() {
  const [resumeUrl, setResumeUrl] = useState<string>("");

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const res = await fetch("/api/about");
        const data = await res.json();
        if (data?.resume) {
          setResumeUrl(data.resume);
        }
      } catch (error) {
        console.error("Error fetching resume:", error);
      }
    };

    fetchResume();
  }, []);

  return (
    <footer className="w-full py-28">
      <div className="max-w-7xl mx-auto px-6">

        {/* Elevated surface */}
        <div
          className="
            bg-white
            border border-neutral-200
            rounded-3xl
            px-12 py-20
            shadow-[0_20px_60px_rgba(0,0,0,0.05)]
          "
        >

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-14">

            {/* Left */}
            <div className="space-y-5">
              <Link
                href="/"
                className="text-2xl font-semibold tracking-tight hover:opacity-70 transition-opacity"
              >
                Matilde Crisp
              </Link>

            </div>

            {/* Right */}
            <div className="flex flex-col sm:flex-row gap-12">

              <a
                href={resumeUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 text-neutral-600 hover:text-black transition-all duration-300"
              >
                <RiFileTextLine className="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-0.5" />
                <span className="text-sm uppercase tracking-[0.25em]">
                  Resume
                </span>
              </a>

              <a
                href="mailto:matilde.crisp@tamu.edu"
                className="group flex items-center gap-3 text-neutral-600 hover:text-black transition-all duration-300"
              >
                <RiMailLine className="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-0.5" />
                <span className="text-sm uppercase tracking-[0.25em]">
                  Email
                </span>
              </a>

              <a
                href="https://www.linkedin.com/in/matilde-crisp-a34a25254/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 text-neutral-600 hover:text-black transition-all duration-300"
              >
                <RiLinkedinBoxFill className="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-0.5" />
                <span className="text-sm uppercase tracking-[0.25em]">
                  LinkedIn
                </span>
              </a>

            </div>
          </div>

          {/* Divider */}
          <div className="mt-16 border-t border-neutral-200 pt-8 text-xs text-neutral-500 tracking-wide">
            © {new Date().getFullYear()} Matilde Crisp
          </div>

        </div>
      </div>
    </footer>
  );
}
