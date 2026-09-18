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
        <section className="mx-auto max-w-[1600px] px-6 pt-20 pb-14 sm:pt-24">
          <motion.p
            className="text-xs uppercase tracking-[0.25em] text-brand"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Selected work
          </motion.p>
          <motion.h1
            className="mt-4 max-w-3xl text-4xl font-medium tracking-[-0.03em] md:text-6xl"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            Spatial explorations in form, context, and fabrication.
          </motion.h1>
        </section>

        <section className="mx-auto max-w-[1600px] border-t border-neutral-200/80 px-6 pt-14 pb-32">
          <motion.div
            className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3"
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
                  <Link href={`/works/${work.id}`} className="block">
                    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-neutral-200/80 bg-white">
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

                      {/* Ring on hover, rather than a dark scrim — the caption
                          below the tile already carries the title. */}
                      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-transparent transition duration-500 group-hover:ring-brand/60" />
                    </div>

                    <div className="mt-4 flex items-baseline justify-between gap-4">
                      <h2 className="text-base font-medium transition-colors group-hover:text-brand-ink">
                        {work.title}
                      </h2>
                      <p className="shrink-0 text-xs uppercase tracking-[0.2em] text-neutral-400">
                        {work.date}
                      </p>
                    </div>

                    {work.location && (
                      <p className="mt-1 text-sm text-neutral-500">
                        {work.location}
                      </p>
                    )}
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
