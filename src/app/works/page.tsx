"use client";

import Image from "next/image";
import Link from "next/link";
import Transition from "@/components/Transition";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Work {
  id: string;
  title: string;
  date: string;
  description: string;
  images: string[];
  details: string[];
  location: string;
  client: string;
  pdf: string;
}

export default function Works() {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorks = async () => {
    try {
      const response = await fetch("/api/works");
      const data = await response.json();
      setWorks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching works:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorks();
  }, []);

  if (loading) {
    return (
      <Transition>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-neutral-500 text-lg tracking-wide">
            Loading projects...
          </p>
        </div>
      </Transition>
    );
  }

  return (
    <Transition>
      <div className="w-full text-neutral-900">

        {/* Header */}
        <section className="max-w-7xl mx-auto px-6 pt-20 pb-20 space-y-6">
          <motion.h1
            className="text-4xl md:text-6xl font-semibold tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Works
          </motion.h1>
          <motion.p
            className="text-sm uppercase tracking-[0.25em] text-neutral-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Spacial explorations in form, context, and fabrication
          </motion.p>
        </section>

        <section className="max-w-[1800px] mx-auto px-6 pb-32">

  <motion.div
    className="
      grid
      grid-cols-1
      sm:grid-cols-2
      lg:grid-cols-3
      xl:grid-cols-4
      gap-6
    "
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 1 }}
  >
    {works.map((work, index) => {

      const validImages =
        work.images?.filter(
          (img) => typeof img === "string" && img.trim() !== ""
        ) || [];

      const firstImage = validImages[0] || null;

      return (
        <motion.div
          key={work.id}
          className="group cursor-pointer"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: index * 0.05 }}
        >
          <Link href={`/works/${work.id}`}>

            <div className="relative w-full aspect-[4/5] overflow-hidden rounded-xl">

              {firstImage ? (
                <Image
                  src={firstImage}
                  alt={work.title}
                  fill
                  className="
                    object-cover
                    transition-transform
                    duration-700
                    ease-out
                    group-hover:scale-[1.05]
                  "
                />
              ) : (
                <div className="w-full h-full bg-neutral-200" />
              )}

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition duration-500 flex items-end p-6">

                <div className="opacity-0 group-hover:opacity-100 transition duration-500 text-white">

                  <h2 className="text-lg font-medium">
                    {work.title}
                  </h2>

                  <p className="text-xs uppercase tracking-[0.2em] mt-2 text-neutral-200">
                    {work.date}
                    {work.location && ` • ${work.location}`}
                  </p>

                </div>

              </div>

            </div>

          </Link>
        </motion.div>
      );
    })}
  </motion.div>

</section>


      </div>
    </Transition>
  );
}
