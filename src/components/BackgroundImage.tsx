"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function BackgroundImage() {
    const [backgroundUrl, setBackgroundUrl] = useState<string>("");

    useEffect(() => {
        const fetchBackground = async () => {
            try {
                const res = await fetch('/api/about');
                const data = await res.json();
                if (data?.background) {
                    setBackgroundUrl(data.background);
                }
            } catch (error) {
                console.error('Error fetching background:', error);
            }
        };
        fetchBackground();
    }, []);

    if (!backgroundUrl) return null;

    return (
        <div className="fixed inset-0 z-0 pointer-events-none">
            <Image
                src={backgroundUrl}
                alt=""
                fill
                className="object-cover opacity-25"
                priority
                unoptimized
            />
        </div>
    );
}
