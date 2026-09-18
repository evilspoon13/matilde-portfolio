"use client";

import ContactTray from "@/components/ContactTray";
import Transition from "@/components/Transition";
import { motion } from "framer-motion";
import Link from "next/link";

type Props = {
  resumeUrl?: string;
};

export default function PortfolioContent({ resumeUrl }: Props) {
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
            Portfolio
          </motion.p>

          <motion.h1
            className="mt-4 max-w-3xl text-4xl font-medium tracking-[-0.03em] md:text-6xl"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            A curated archive of concepts, builds, and finished projects.
          </motion.h1>

          <motion.div
            className="mt-10 flex flex-wrap items-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12 }}
          >
            <Link
              href="/portfolio/view"
              className="group inline-flex items-center gap-3 rounded-full bg-neutral-900 px-7 py-3.5 text-base text-white transition-colors duration-300 hover:bg-brand-ink"
            >
              Open portfolio book
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>

            {resumeUrl && (
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-7 py-3.5 text-base text-neutral-700 transition-colors duration-300 hover:border-brand hover:text-neutral-900"
              >
                Download resume
              </a>
            )}
          </motion.div>
        </section>

        {/* Contact */}
        <section className="mx-auto max-w-[1600px] border-t border-neutral-200/80 px-6 py-16 pb-28 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <ContactTray resumeUrl={resumeUrl} />
          </motion.div>
        </section>

        {/* Mobile spacer so footer doesn't feel glued */}
        <div className="md:hidden h-10" />

      </div>
    </Transition>
  );
}
