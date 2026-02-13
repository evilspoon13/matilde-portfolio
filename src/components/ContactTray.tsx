"use client";

import { useState, useEffect } from "react";
import {
  RiLinkedinBoxFill,
  RiMailLine,
  RiFileTextLine
} from "react-icons/ri";

interface ContactOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  href: string;
}

export default function ContactTray() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
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

  const contactOptions: ContactOption[] = [
    {
      id: "resume",
      name: "Resume",
      icon: <RiFileTextLine className="w-full h-full" />,
      href: resumeUrl || "#",
    },
    {
      id: "email",
      name: "Email",
      icon: <RiMailLine className="w-full h-full" />,
      href: "mailto:matilde.crisp@tamu.edu",
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      icon: <RiLinkedinBoxFill className="w-full h-full" />,
      href: "https://www.linkedin.com/in/matilde-crisp-a34a25254/",
    },
  ];

  return (
    <div className="w-full flex justify-center px-6 py-20">

      {/* Elevated container */}
      <div className="
        w-full max-w-5xl
        bg-white
        border border-neutral-200
        rounded-3xl
        px-12 py-10
        shadow-[0_20px_60px_rgba(0,0,0,0.05)]
      ">

        <div className="flex justify-center items-center gap-16">

          {contactOptions.map((option) => (
            <a
              key={option.id}
              href={option.href}
              target={["linkedin", "resume"].includes(option.id) ? "_blank" : undefined}
              rel={["linkedin", "resume"].includes(option.id) ? "noopener noreferrer" : undefined}
              onMouseEnter={() => setHoveredId(option.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="group flex flex-col items-center gap-4 transition-all duration-300"
            >

              {/* Icon surface */}
              <div
                className={`
                  w-14 h-14 flex items-center justify-center
                  rounded-2xl
                  border border-neutral-200
                  bg-neutral-50
                  text-neutral-600
                  transition-all duration-300
                  ${hoveredId === option.id
                    ? "text-black bg-white shadow-md -translate-y-1"
                    : ""
                  }
                `}
              >
                {option.icon}
              </div>

              {/* Label */}
              <span
                className={`
                  text-xs tracking-[0.25em] uppercase
                  transition-all duration-300
                  ${hoveredId === option.id
                    ? "text-black opacity-100"
                    : "text-neutral-500 opacity-70"
                  }
                `}
              >
                {option.name}
              </span>

            </a>
          ))}

        </div>
      </div>
    </div>
  );
}
