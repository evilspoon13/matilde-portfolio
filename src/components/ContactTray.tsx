"use client";

import { useState } from "react";
import { RiLinkedinBoxFill, RiMailLine, RiFileTextLine, RiGithubFill, RiPhoneLine } from "react-icons/ri";

interface ContactOption {
    id: string;
    name: string;
    icon: React.ReactNode;
    href: string;
    hoverColor: string;
}

export default function ContactTray() {
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const contactOptions: ContactOption[] = [
        {
            id: "resume",
            name: "Resume",
            icon: <RiFileTextLine className="w-full h-full" />,
            href: "https://your-resume-link.com",
            hoverColor: "hover:text-gray-600"
        },
        {
            id: "email",
            name: "Email",
            icon: <RiMailLine className="w-full h-full" />,
            href: "mailto:matilde.crisp@tamu.edu",
            hoverColor: "hover:text-gray-600"
        },
        {
            id: "linkedin",
            name: "LinkedIn",
            icon: <RiLinkedinBoxFill className="w-full h-full" />,
            href: "https://www.linkedin.com/in/matilde-crisp-a34a25254/",
            hoverColor: "hover:text-gray-700"
        }
    ];

    return (
        <div className="w-full flex justify-center px-4 md:px-6 lg:px-8 py-8">
            <div className="bg-white/60 backdrop-blur-xl border border-gray-300/50 rounded-2xl px-8 py-4 shadow-2xl w-full max-w-7xl">
                <div className="flex items-end justify-center gap-4">
                    {contactOptions.map((option) => (
                        <a
                            key={option.id}
                            href={option.href}
                            target={["linkedin", "phone", "resume"].includes(option.id) ? "_blank" : undefined}
                            rel={["linkedin", "phone", "resume"].includes(option.id) ? "noopener noreferrer" : undefined}
                            onMouseEnter={() => setHoveredId(option.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            className={`
                                group relative flex flex-col items-center justify-end
                                transition-all duration-300 ease-out
                                ${hoveredId === option.id 
                                    ? 'scale-125 -translate-y-2' 
                                    : hoveredId 
                                        ? 'scale-95' 
                                        : 'scale-100'
                                }
                            `}
                        >
                            {/* Icon Container */}
                            <div className={`
                                relative bg-gradient-to-br from-gray-100 to-gray-200 
                                rounded-2xl p-4 shadow-lg
                                transition-all duration-300
                                ${hoveredId === option.id ? 'shadow-2xl' : ''}
                            `}>
                                <div className={`
                                    w-12 h-12 md:w-14 md:h-14 text-gray-700 transition-all duration-300
                                    ${option.hoverColor}
                                `}>
                                    {option.icon}
                                </div>
                            </div>

                            {/* Label - appears on hover */}
                            <div className={`
                                absolute -top-8 left-1/2 transform -translate-x-1/2
                                bg-gray-900 text-white text-xs font-medium px-3 py-1 rounded-lg
                                whitespace-nowrap transition-all duration-200
                                ${hoveredId === option.id 
                                    ? 'opacity-100 translate-y-0' 
                                    : 'opacity-0 translate-y-2 pointer-events-none'
                                }
                            `}>
                                {option.name}
                                {/* Arrow */}
                                <div className="absolute left-1/2 transform -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}