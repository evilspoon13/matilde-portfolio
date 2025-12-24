"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface ProjectTileProps {
    id: string;
    title: string;
    date: string;
    image: string;
    link: string;
}

export default function ProjectTile({ id, title, date, image, link }: ProjectTileProps) {
    const [imageError, setImageError] = useState(false);
    
    // Normalize protocol-relative URLs to https
    const normalizedImage = image?.startsWith('//') ? `https:${image}` : image;

    return (
        <Link 
            href={link}
            className="group relative aspect-square overflow-hidden rounded-lg border border-white/30 bg-black/50 backdrop-blur-sm shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-white/60 hover:shadow-xl"
        >
            {/* Project Image */}
            <div className="absolute inset-0">
                {!imageError && normalizedImage ? (
                    <Image
                        src={normalizedImage}
                        alt={title}
                        fill
                        className="object-cover transition-all duration-500 group-hover:scale-105 group-hover:opacity-40"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                        <svg className="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}
            </div>

            {/* Overlay with project info - shows on hover */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-4">
                <h3 className="text-xl md:text-2xl font-semibold text-white mb-2 text-center">
                    {title}
                </h3>
                <p className="text-sm md:text-base text-gray-300">
                    {date}
                </p>
            </div>
        </Link>
    );
}