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
  <div className="fixed inset-0 -z-10 pointer-events-none">

    {/* Image */}
    <Image
      src={backgroundUrl}
      alt=""
      fill
      priority
      sizes="100vw"
      quality={100}
      className="object-cover brightness-90 contrast-105 saturate-90 select-none"
    />

    {/* Soft overlay to control whiteness */}
    <div className="absolute inset-0 bg-white/40" />

  </div>
);


}
