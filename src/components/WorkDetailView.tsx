"use client";

import Image from "next/image";
import Transition from "@/components/Transition";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Work } from "@/types/notion";

type Props = {
  work: Work;
};

/** Matches the 1 / 2 / 3 / 4 masonry columns below. */
const GALLERY_SIZES =
  "(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw";

export default function WorkDetailView({ work }: Props) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <Transition>
      <div className="w-full text-neutral-900">

        {/* Back */}
        <div className="mx-auto max-w-[1600px] px-6 pt-16">
          <a
            href="/works"
            className="text-xs uppercase tracking-[0.25em] text-neutral-400 transition-colors hover:text-brand"
          >
            ← Back to works
          </a>
        </div>

        {/* Header Card */}
        <section className="mx-auto max-w-[1600px] px-6 pt-8 pb-14">
          <div>
            <div className="grid grid-cols-1 gap-10 border-b border-neutral-200/80 pb-14 md:grid-cols-2 md:gap-16">

              {/* Left: Title, metadata, PDF link */}
              <div>
                <motion.h1
                  className="text-4xl font-medium leading-[1.05] tracking-[-0.03em] md:text-6xl"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  {work.title}
                </motion.h1>

                <motion.div
                  className="mt-5 text-xs uppercase tracking-[0.25em] text-brand"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {work.date}
                  {work.location && ` • ${work.location}`}
                  {work.client && ` • ${work.client}`}
                </motion.div>

                {work.pdf && (
                  <motion.div
                    className="mt-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    <a
                      href={work.pdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block rounded-full bg-neutral-900 px-6 py-3 text-sm text-white transition-colors duration-300 hover:bg-brand-ink"
                    >
                      View Project PDF
                    </a>
                  </motion.div>
                )}
              </div>

              {/* Right: Description and details */}
              <div>
                <motion.p
                  className="text-lg leading-relaxed text-neutral-700 whitespace-pre-line"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {work.description}
                </motion.p>

                {work.details?.length > 0 && (
                  <motion.ul
                    className="space-y-3 mt-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    {work.details.map((detail, index) => (
                      <li key={index} className="text-neutral-600 flex gap-3">
                        <span className="text-neutral-400">•</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </div>

            </div>

          </div>
        </section>

        {/* Gallery */}
        {work.images.length > 0 && (
          <section className="mx-auto max-w-[1600px] px-6 pb-36">

            <motion.div
              className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-8 space-y-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              {work.images.map((img, index) => (
                <motion.div
                  key={index}
                  className="break-inside-avoid group cursor-pointer"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.04 }}
                  onClick={() => setSelectedImage(img)}
                >
                  <div className="relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-white transition-colors duration-500 group-hover:border-brand/50">
                    <Image
                      src={img}
                      alt={`${work.title} ${index + 1}`}
                      width={900}
                      height={1200}
                      sizes={GALLERY_SIZES}
                      priority={index < 4}
                      className="w-full h-auto transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>

          </section>
        )}

        {/* Lightbox */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
            >
              <motion.div
                className="relative max-w-6xl w-full h-[90vh]"
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
              >
                <Image
                  src={selectedImage}
                  alt="Expanded"
                  fill
                  sizes="100vw"
                  className="object-contain"
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </Transition>
  );
}
