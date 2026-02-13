"use client";

import ContactTray from "@/components/ContactTray";
import Transition from "@/components/Transition";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Portfolio() {
  return (
    <Transition>
      <div className="w-full text-neutral-900">

        {/* Header */}
        <section className="max-w-7xl mx-auto px-6 pt-16 md:pt-20 pb-10 md:pb-20 space-y-5 md:space-y-6">
          <motion.h1
            className="text-3xl sm:text-4xl md:text-6xl font-semibold tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            Portfolio
          </motion.h1>

          <motion.p
            className="text-neutral-500 max-w-2xl text-base sm:text-lg leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08 }}
          >
            A curated archive of concepts, builds, and finished projects.
          </motion.p>
        </section>

        {/* CTA -> INTERNAL BOOK VIEW */}
        <section className="max-w-7xl mx-auto px-6 pb-16 md:pb-28">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <Link
              href="/portfolio/view"
              className="
                group inline-flex items-center gap-3 sm:gap-4
                text-xl sm:text-2xl md:text-3xl
                font-medium tracking-tight
                break-words
              "
            >
              <span className="border-b border-neutral-900 group-hover:pr-6 transition-all duration-300">
                Open Portfolio Book
              </span>

              <span className="transition-transform duration-300 group-hover:translate-x-2">
                →
              </span>
            </Link>
          </motion.div>
        </section>

        {/* Contact Tray (desktop/tablet only) */}
        <section className="hidden md:block max-w-7xl mx-auto px-6 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <ContactTray />
          </motion.div>
        </section>

        {/* Mobile spacer so footer doesn't feel glued */}
        <div className="md:hidden h-10" />

      </div>
    </Transition>
  );
}
