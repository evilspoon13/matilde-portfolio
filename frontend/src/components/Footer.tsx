"use client";

import Link from "next/link";
import { RiLinkedinBoxFill, RiMailLine } from "react-icons/ri";

export default function Footer(){
    return (
        <footer className="w-full bg-black/70 backdrop-blur-sm border-t-2 border-white py-6 md:py-8 lg:py-10 shadow-2xl">
            <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                    <div className="flex items-center">
                        <Link href="/" className="text-3xl md:text-4xl lg:text-5xl font-bold hover:opacity-80 transition-opacity text-white">
                            
                        </Link>
                    </div>
                    
                    {/* Social links */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 md:gap-8 lg:gap-10">
                        <a 
                            href="https://www.linkedin.com/in/matilde-crisp-a34a25254/" 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white hover:text-blue-400 transition-colors group flex items-center gap-2"
                        >
                            <RiLinkedinBoxFill className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12" />
                            <span className="text-lg md:text-xl lg:text-2xl font-semibold">LinkedIn</span>
                        </a>
                        <a 
                            href="mailto:matilde.crisp@tamu.edu"
                            className="text-white hover:text-gray-300 transition-colors group flex items-center gap-2"
                        >
                            <RiMailLine className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12" />
                            <span className="text-lg md:text-xl lg:text-2xl font-semibold">Email</span>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}