"use client";

import ContactTray from "@/components/ContactTray";
import Transition from "@/components/Transition";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Portfolio() {
  const [portfolioUrl, setPortfolioUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await fetch("/api/about");
        const data = await res.json();
        if (data?.portfolio) {
          setPortfolioUrl(data.portfolio);
        }
      } catch (error) {
        console.error("Error fetching portfolio:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  if (loading) {
    return (
      <Transition>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-neutral-500 text-lg tracking-wide">
            Loading portfolio...
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
            Portfolio
          </motion.h1>

          <motion.p
            className="text-neutral-500 max-w-2xl text-lg leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            A curated archive of concepts, builds, and finished projects.
          </motion.p>
        </section>

        {/* Portfolio Link Section */}
        {portfolioUrl && (
          <section className="max-w-7xl mx-auto px-6 pb-32">
            <motion.a
              href={portfolioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-4 text-2xl md:text-3xl font-medium tracking-tight"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="border-b border-neutral-900 group-hover:pr-6 transition-all duration-300">
                View Full Portfolio
              </span>

              <span className="transition-transform duration-300 group-hover:translate-x-2">
                →
              </span>
            </motion.a>
          </section>
        )}

        {/* Contact Tray */}
        <section className="max-w-7xl mx-auto px-6 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <ContactTray />
          </motion.div>
        </section>

      </div>
    </Transition>
  );
}
