"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";


export default function NavBar(){
    const pathname = usePathname();

    const isActive = (path: string) => {
        if (path === '/') {
            return pathname === '/';
        }
        return pathname.startsWith(path);
    };

    return (
        <div className="w-full flex justify-center py-8 px-4 md:px-6 lg:px-8">
            <div className="bg-black/70 backdrop-blur-sm rounded-xl px-6 py-6 md:px-12 md:py-8 lg:px-16 lg:py-10 flex items-center gap-6 shadow-2xl w-full max-w-7xl">
                
                {/* Navigation Links - All in one row */}
                <nav className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-10 w-full">
                    <Link 
                        href="/" 
                        className="text-white hover:text-gray-300 transition-colors font-semibold text-xl md:text-2xl lg:text-3xl relative group"
                    >
                        Home
                        <span className={`absolute left-0 bottom-0 h-0.5 md:h-1 bg-white transition-all duration-300 ${isActive('/') ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                    </Link>
                     <Link 
                        href="/works" 
                        className="text-white hover:text-gray-300 transition-colors font-semibold text-xl md:text-2xl lg:text-3xl relative group"
                    >
                        Works
                        <span className={`absolute left-0 bottom-0 h-0.5 md:h-1 bg-white transition-all duration-300 ${isActive('/works') ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                    </Link>
                    <Link 
                        href="/portfolio" 
                        className="text-white hover:text-gray-300 transition-colors font-semibold text-xl md:text-2xl lg:text-3xl relative group"
                    >
                        Portfolio
                        <span className={`absolute left-0 bottom-0 h-0.5 md:h-1 bg-white transition-all duration-300 ${isActive('/portfolio') ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                    </Link>
                </nav>
            </div>
        </div>
    );
}