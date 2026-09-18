"use client";

import Link from "next/link";
import ContactTray from "@/components/ContactTray";
import HeroScatter from "@/components/HeroScatter";
import Transition from "@/components/Transition";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { About, Education, Experience } from "@/types/notion";

type Props = {
  about: About;
  education: Education[];
  experience: Experience[];
};

const formatDateRange = (
  startDate: string,
  endDate: string,
  current: boolean
) => {
  if (!startDate) return "";
  const start = new Date(startDate).getFullYear();
  if (current) return `${start} - Present`;
  if (!endDate) return `${start}`;
  const end = new Date(endDate).getFullYear();
  return `${start} - ${end}`;
};

/** Small caps label that opens every section below the hero. */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs uppercase tracking-[0.25em] text-brand">{children}</p>
  );
}

export default function HomeContent({ about, education, experience }: Props) {
  // Notion's short "aboutText" is often empty; the opening of the longer bio
  // reads well as the headline statement, so fall back to it.
  const statement =
    about.aboutText?.trim() ||
    about.about?.split(/(?<=[.!?])\s+/).slice(0, 2).join(" ") ||
    "";

  return (
    <Transition>
      <div className="w-full text-neutral-900">
        {/* HERO — full-bleed so the scatter can run to the edges */}
        <HeroScatter name={about.name} jobTitle={about.jobTitle} />

        <div className="mx-auto max-w-[1600px] px-6">
          {/* INTRO STATEMENT */}
          <motion.section
            className="border-t border-neutral-200/80 py-16 sm:py-20 lg:py-24"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
          >
            {statement && (
              <p className="max-w-4xl text-2xl leading-[1.2] tracking-[-0.02em] sm:text-3xl lg:text-5xl">
                {statement}
              </p>
            )}

            {about.skills?.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-2">
                {about.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="rounded-full border border-neutral-200 bg-white/70 px-4 py-1.5 text-xs uppercase tracking-[0.15em] text-neutral-600"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}

            <Link
              href="/works"
              className="group mt-12 inline-flex items-center gap-3 rounded-full bg-neutral-900 px-7 py-3.5 text-base text-white transition-colors duration-300 hover:bg-brand-ink"
            >
              View works
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.section>

          {/* ABOUT */}
          {about.about && (
            <motion.section
              className="grid grid-cols-1 gap-8 border-t border-neutral-200/80 py-16 sm:py-20 lg:grid-cols-[18rem_1fr] lg:gap-16 lg:py-24"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
            >
              <div className="space-y-3">
                <SectionLabel>About</SectionLabel>
                <h2 className="text-2xl font-medium tracking-tight sm:text-3xl">
                  Background
                </h2>
              </div>

              <p className="max-w-3xl whitespace-pre-line text-base leading-relaxed text-neutral-600 sm:text-lg">
                {about.about}
              </p>
            </motion.section>
          )}

          {/* EDUCATION */}
          {education.length > 0 && (
            <motion.section
              className="grid grid-cols-1 gap-8 border-t border-neutral-200/80 py-16 sm:py-20 lg:grid-cols-[18rem_1fr] lg:gap-16 lg:py-24"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
            >
              <div className="space-y-3">
                <SectionLabel>Education</SectionLabel>
                <h2 className="text-2xl font-medium tracking-tight sm:text-3xl">
                  Studies
                </h2>
              </div>

              <div className="divide-y divide-neutral-200/80">
                {education.map((edu, index) => (
                  <motion.div
                    key={edu.id}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: index * 0.04 }}
                    className="grid grid-cols-1 gap-2 py-7 first:pt-0 sm:grid-cols-[1fr_12rem]"
                  >
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">
                        {edu.degree}
                        {edu.fieldOfStudy && ` in ${edu.fieldOfStudy}`}
                      </h3>
                      <p className="text-sm text-neutral-500">{edu.school}</p>
                      {edu.description && (
                        <p className="max-w-2xl pt-1 text-sm leading-relaxed text-neutral-600">
                          {edu.description}
                        </p>
                      )}
                    </div>

                    <p className="text-xs uppercase tracking-[0.2em] text-neutral-400 sm:text-right">
                      {formatDateRange(edu.startDate, edu.endDate, edu.current)}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* EXPERIENCE */}
          {experience.length > 0 && (
            <motion.section
              className="grid grid-cols-1 gap-8 border-t border-neutral-200/80 py-16 sm:py-20 lg:grid-cols-[18rem_1fr] lg:gap-16 lg:py-24"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
            >
              <div className="space-y-3">
                <SectionLabel>Experience</SectionLabel>
                <h2 className="text-2xl font-medium tracking-tight sm:text-3xl">
                  Practice
                </h2>
              </div>

              <div className="divide-y divide-neutral-200/80">
                {experience.map((exp, index) => (
                  <motion.div
                    key={exp.id}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: index * 0.04 }}
                    className="grid grid-cols-1 gap-2 py-7 first:pt-0 sm:grid-cols-[1fr_12rem]"
                  >
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">{exp.role}</h3>
                      <p className="text-sm text-neutral-500">{exp.company}</p>
                      {exp.summary && (
                        <p className="max-w-2xl pt-1 text-sm leading-relaxed text-neutral-600">
                          {exp.summary}
                        </p>
                      )}
                    </div>

                    <p className="text-xs uppercase tracking-[0.2em] text-neutral-400 sm:text-right">
                      {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* CONTACT */}
          <motion.div
            className="border-t border-neutral-200/80 py-16 sm:py-20 lg:py-24"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <ContactTray resumeUrl={about.resume} />
          </motion.div>
        </div>
      </div>
    </Transition>
  );
}
