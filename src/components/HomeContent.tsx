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
    <p className="text-sm uppercase tracking-[0.25em] text-brand sm:text-base">
      {children}
    </p>
  );
}

export default function HomeContent({ about, education, experience }: Props) {
  // Notion's short "aboutText" is often empty; the opening of the longer bio
  // reads well as the headline statement, so fall back to it — and when we do,
  // the About section picks up from where the headline left off instead of
  // repeating those sentences.
  const bioSentences = about.about?.split(/(?<=[.!?])\s+/) ?? [];
  const usingBioOpening = !about.aboutText?.trim() && bioSentences.length > 0;
  const statement = usingBioOpening
    ? bioSentences.slice(0, 2).join(" ")
    : about.aboutText?.trim() ?? "";
  const bio = usingBioOpening
    ? bioSentences.slice(2).join(" ")
    : about.about ?? "";

  return (
    <Transition>
      <div className="w-full text-neutral-900">
        {/* HERO — full-bleed so the scatter can run to the edges */}
        <HeroScatter name={about.name} jobTitle={about.jobTitle} />

        <div className="w-full px-6 sm:px-10 lg:px-[3vw]">
          {/* INTRO STATEMENT */}
          <motion.section
            className="border-t border-neutral-200/80 py-20 sm:py-24 lg:py-32"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
          >
            {statement && (
              <p className="max-w-[22ch] text-[clamp(2.25rem,4.7vw,8rem)] leading-[1.02] tracking-[-0.035em] lg:max-w-[30ch]">
                {statement}
              </p>
            )}

            {about.skills?.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-2">
                {about.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="rounded-full border border-neutral-200 bg-white/70 px-7 py-3 text-base uppercase tracking-[0.15em] text-neutral-600 sm:text-lg"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}

            <Link
              href="/works"
              className="group mt-14 inline-flex items-center gap-4 rounded-full bg-neutral-900 px-12 py-6 text-xl text-white transition-colors duration-300 hover:bg-brand-ink sm:text-2xl"
            >
              View works
              <ArrowRight className="h-6 w-6 transition-transform duration-300 group-hover:translate-x-1 sm:h-7 sm:w-7" />
            </Link>
          </motion.section>

          {/* ABOUT */}
          {bio && (
            <motion.section
              className="border-t border-neutral-200/80 py-20 sm:py-24 lg:py-32"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
            >
              <SectionLabel>About</SectionLabel>
              <h2 className="mt-5 text-[clamp(3rem,9vw,14rem)] font-normal leading-[0.9] tracking-[-0.05em]">
                Background
              </h2>

              <p className="mt-12 max-w-[42ch] whitespace-pre-line text-[clamp(1.25rem,1.9vw,2.25rem)] leading-[1.4] text-neutral-600 lg:mt-16">
                {bio}
              </p>
            </motion.section>
          )}

          {/* EDUCATION */}
          {education.length > 0 && (
            <motion.section
              className="border-t border-neutral-200/80 py-20 sm:py-24 lg:py-32"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
            >
              <SectionLabel>Education</SectionLabel>
              <h2 className="mt-5 text-[clamp(3rem,9vw,14rem)] font-normal leading-[0.9] tracking-[-0.05em]">
                Studies
              </h2>

              <div className="mt-12 divide-y divide-neutral-200/80 lg:mt-16">
                {education.map((edu, index) => (
                  <motion.div
                    key={edu.id}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: index * 0.04 }}
                    className="grid grid-cols-1 gap-4 py-10 first:pt-0 sm:grid-cols-[1fr_16rem] lg:py-14"
                  >
                    <div className="space-y-2">
                      <h3 className="text-[clamp(1.5rem,2.6vw,3rem)] font-normal leading-[1.1] tracking-[-0.02em]">
                        {edu.degree}
                        {edu.fieldOfStudy && ` in ${edu.fieldOfStudy}`}
                      </h3>
                      <p className="text-[clamp(1.125rem,1.4vw,1.75rem)] text-neutral-500">
                        {edu.school}
                      </p>
                      {edu.description && (
                        <p className="max-w-[52ch] pt-3 text-[clamp(1rem,1.15vw,1.375rem)] leading-relaxed text-neutral-600">
                          {edu.description}
                        </p>
                      )}
                    </div>

                    <p className="text-[clamp(0.8rem,0.95vw,1.125rem)] uppercase tracking-[0.2em] text-neutral-400 sm:text-right">
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
              className="border-t border-neutral-200/80 py-20 sm:py-24 lg:py-32"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
            >
              <SectionLabel>Experience</SectionLabel>
              <h2 className="mt-5 text-[clamp(3rem,9vw,14rem)] font-normal leading-[0.9] tracking-[-0.05em]">
                Practice
              </h2>

              <div className="mt-12 divide-y divide-neutral-200/80 lg:mt-16">
                {experience.map((exp, index) => (
                  <motion.div
                    key={exp.id}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: index * 0.04 }}
                    className="grid grid-cols-1 gap-4 py-10 first:pt-0 sm:grid-cols-[1fr_16rem] lg:py-14"
                  >
                    <div className="space-y-2">
                      <h3 className="text-[clamp(1.5rem,2.6vw,3rem)] font-normal leading-[1.1] tracking-[-0.02em]">
                        {exp.role}
                      </h3>
                      <p className="text-[clamp(1.125rem,1.4vw,1.75rem)] text-neutral-500">
                        {exp.company}
                      </p>
                      {exp.summary && (
                        <p className="max-w-[52ch] pt-3 text-[clamp(1rem,1.15vw,1.375rem)] leading-relaxed text-neutral-600">
                          {exp.summary}
                        </p>
                      )}
                    </div>

                    <p className="text-[clamp(0.8rem,0.95vw,1.125rem)] uppercase tracking-[0.2em] text-neutral-400 sm:text-right">
                      {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* CONTACT */}
          <motion.div
            className="border-t border-neutral-200/80 py-20 sm:py-24 lg:py-32"
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
