"use client";

import Image from "next/image";
import Transition from "@/components/Transition";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface WorkDetail {
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

export default function WorkDetail() {
  const params = useParams();
  const [work, setWork] = useState<WorkDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchWork = async () => {
    try {
      const response = await fetch(`/api/works/${params.id}`);
      const data = await response.json();
      setWork(data);
    } catch (error) {
      console.error("Error fetching work:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWork();
  }, [params.id]);

  if (loading) {
    return (
      <Transition>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-neutral-500 text-lg tracking-wide">
            Loading project...
          </p>
        </div>
      </Transition>
    );
  }

  if (!work) {
    return (
      <Transition>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-neutral-500 text-lg tracking-wide">
            Project not found
          </p>
        </div>
      </Transition>
    );
  }

  return (
    <Transition>
      <div className="w-full text-neutral-900">

        {/* Back */}
        <div className="max-w-7xl mx-auto px-6 pt-20">
          <a
            href="/works"
            className="text-xs uppercase tracking-[0.25em] text-neutral-400 hover:text-neutral-900 transition-colors"
          >
            Back to Works
          </a>
        </div>

        {/* Header Card */}
        <section className="max-w-7xl mx-auto px-6 pt-10 pb-12">

          <div className="
            bg-white
            border border-neutral-200
            rounded-3xl
            px-6 py-10 md:px-10 md:py-14
            shadow-[0_20px_60px_rgba(0,0,0,0.04)]
          ">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">

              {/* Left: Title, metadata, PDF link */}
              <div>
                <motion.h1
                  className="text-4xl md:text-5xl font-semibold leading-tight tracking-tight"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  {work.title}
                </motion.h1>

                <motion.div
                  className="text-xs uppercase tracking-[0.25em] text-neutral-500 mt-4"
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
                      className="
                        inline-block
                        px-6 py-3
                        border border-neutral-900
                        rounded-full
                        text-sm tracking-wide
                        hover:bg-neutral-900 hover:text-white
                        transition-all duration-300
                      "
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
          <section className="max-w-[1800px] mx-auto px-6 pb-36">

            <motion.div
              className="
                columns-1
                sm:columns-2
                lg:columns-3
                xl:columns-4
                gap-8
                space-y-8
              "
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
                  <div className="relative overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
                    <Image
                      src={img}
                      alt={`${work.title} ${index + 1}`}
                      width={900}
                      height={1200}
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
