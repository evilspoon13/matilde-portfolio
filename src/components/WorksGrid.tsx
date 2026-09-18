"use client";

import Image from "next/image";
import Link from "next/link";
import Transition from "@/components/Transition";
import { motion } from "framer-motion";

/** Just what a tile renders — the full Work (with all 54 gallery images) would
 *  otherwise be serialized into the RSC payload for a grid of 5 thumbnails. */
export type WorkTile = {
  id: string;
  title: string;
  date: string;
  location: string;
  image: string | null;
};

type Props = {
  works: WorkTile[];
};

/** Matches the 1 / 2 / 3 / 4 column grid below, so we never fetch a 3840px
 *  source for a ~400px tile. */
const TILE_SIZES =
  "(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw";

export default function WorksGrid({ works }: Props) {
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
            Spatial explorations in form, context, and fabrication
          </motion.p>
        </section>

        <section className="max-w-[1800px] mx-auto px-6 pb-32">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            {works.map((work, index) => {
              const firstImage = work.image;

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
                          sizes={TILE_SIZES}
                          priority={index < 4}
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
