"use client";

import Image from "next/image";
import Link from "next/link";
import ContactTray from "@/components/ContactTray";
import Transition from "@/components/Transition";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { ArrowRight } from "lucide-react";

interface EducationItem {
  id: string;
  degree: string;
  school: string;
  fieldOfStudy: string;
  level: string;
  startDate: string;
  endDate: string;
  current: boolean;
  location: string;
  gpa: string;
  description: string;
}

interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  location: string;
  employmentType: string;
  startDate: string;
  endDate: string;
  current: boolean;
  skills: string[];
  summary: string;
  highlights: string[];
}

interface AboutData {
  id: string;
  name: string;
  jobTitle: string;
  profileImage: string;
  aboutText: string;
  about: string;
  skills: string[];
}

export default function Home() {
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [education, setEducation] = useState<EducationItem[]>([]);
  const [experience, setExperience] = useState<ExperienceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aboutRes, educationRes, experienceRes] = await Promise.all([
          fetch("/api/about"),
          fetch("/api/education"),
          fetch("/api/experience"),
        ]);

        const aboutData = await aboutRes.json();
        const educationData = await educationRes.json();
        const experienceData = await experienceRes.json();

        setAboutData(aboutData);
        setEducation(Array.isArray(educationData) ? educationData : []);
        setExperience(Array.isArray(experienceData) ? experienceData : []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  if (loading) {
    return (
      <Transition>
        <div className="min-h-screen flex items-center justify-center px-6">
          <p className="text-neutral-500 text-lg tracking-wide">Loading...</p>
        </div>
      </Transition>
    );
  }

  if (!aboutData) {
    return (
      <Transition>
        <div className="min-h-screen flex items-center justify-center px-6">
          <p className="text-neutral-500 text-lg tracking-wide">
            Unable to load content
          </p>
        </div>
      </Transition>
    );
  }

  return (
    <Transition>
      <div className="w-full text-neutral-900">
        <div className="max-w-7xl mx-auto px-6">

          {/* HERO */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center pt-16 sm:pt-20 lg:pt-24 pb-16 sm:pb-20 lg:pb-32">

            {aboutData.profileImage && (
              <motion.div
                className="
                  relative aspect-square w-full max-w-sm sm:max-w-md mx-auto lg:mx-0
                  overflow-hidden rounded-3xl
                  border border-neutral-200
                  shadow-[0_20px_60px_rgba(0,0,0,0.05)]
                "
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
              >
                <Image
                  src={aboutData.profileImage}
                  alt={aboutData.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </motion.div>
            )}

            <motion.div
              className="space-y-8 sm:space-y-10"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08 }}
            >
              <div className="space-y-4 sm:space-y-5">
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-semibold tracking-tight">
                  {aboutData.name}
                </h1>

                <p className="text-lg sm:text-xl text-neutral-500">
                  {aboutData.jobTitle}
                </p>
              </div>

              {aboutData.aboutText && (
                <p className="text-base sm:text-lg leading-relaxed text-neutral-700 max-w-xl">
                  {aboutData.aboutText}
                </p>
              )}

              {aboutData.skills?.length > 0 && (
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs sm:text-sm uppercase tracking-[0.15em] text-neutral-500">
                  {aboutData.skills.map((skill, index) => (
                    <span key={index}>{skill}</span>
                  ))}
                </div>
              )}

              {/* CTA */}
              <Link
                href="/works"
                className="group inline-flex items-center gap-3 sm:gap-4 text-xl sm:text-2xl font-medium tracking-tight"
              >
                <span className="border-b border-neutral-900 group-hover:pr-6 transition-all duration-300">
                  View Works
                </span>
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover:translate-x-2" />
              </Link>
            </motion.div>
          </section>

          {/* Divider */}
          <div className="border-t border-neutral-200 my-16 sm:my-20 lg:my-24" />

          {/* ABOUT */}
          {aboutData.about && (
            <motion.section
              className="pb-16 sm:pb-20 lg:pb-24"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
            >
              <div
                className="
                  bg-white
                  border border-neutral-200
                  rounded-3xl
                  px-7 py-9 sm:px-10 sm:py-12 lg:px-12 lg:py-14
                  shadow-[0_20px_60px_rgba(0,0,0,0.04)]
                "
              >
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight mb-6 sm:mb-8">
                  About
                </h2>
                <p className="text-base sm:text-lg leading-relaxed text-neutral-700 whitespace-pre-line">
                  {aboutData.about}
                </p>
              </div>
            </motion.section>
          )}

          {/* EDUCATION + EXPERIENCE */}
          <div
            ref={contentRef}
            className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-12 lg:gap-20 pb-24 sm:pb-32 lg:pb-44"
          >
            {/* Shared container styles */}
            {/* EDUCATION */}
            {education.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55 }}
              >
                <div
                  className="
                    bg-white
                    border border-neutral-200
                    rounded-3xl
                    px-7 py-9 sm:px-10 sm:py-12 lg:px-12 lg:py-14
                    shadow-[0_20px_60px_rgba(0,0,0,0.04)]
                  "
                >
                  <h2 className="text-xl sm:text-2xl font-semibold tracking-tight mb-10 sm:mb-12 lg:mb-14">
                    Education
                  </h2>

                  <div className="space-y-10 sm:space-y-12 lg:space-y-14">
                    {education.map((edu, index) => (
                      <motion.div
                        key={edu.id}
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.45, delay: index * 0.04 }}
                        className="space-y-3 sm:space-y-4"
                      >
                        <h3 className="text-base sm:text-lg font-medium">
                          {edu.degree}
                          {edu.fieldOfStudy && ` in ${edu.fieldOfStudy}`}
                        </h3>

                        <p className="text-neutral-500 text-sm sm:text-base">
                          {edu.school}
                        </p>

                        <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-neutral-400">
                          {formatDateRange(edu.startDate, edu.endDate, edu.current)}
                        </p>

                        {edu.description && (
                          <p className="text-neutral-700 text-sm leading-relaxed pt-2 max-w-xl">
                            {edu.description}
                          </p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.section>
            )}

            {/* EXPERIENCE */}
            {experience.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: 0.06 }}
              >
                <div
                  className="
                    bg-white
                    border border-neutral-200
                    rounded-3xl
                    px-7 py-9 sm:px-10 sm:py-12 lg:px-12 lg:py-14
                    shadow-[0_20px_60px_rgba(0,0,0,0.04)]
                  "
                >
                  <h2 className="text-xl sm:text-2xl font-semibold tracking-tight mb-10 sm:mb-12 lg:mb-14">
                    Experience
                  </h2>

                  <div className="space-y-10 sm:space-y-12 lg:space-y-14">
                    {experience.map((exp, index) => (
                      <motion.div
                        key={exp.id}
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.45, delay: index * 0.04 }}
                        className="space-y-3 sm:space-y-4"
                      >
                        <h3 className="text-base sm:text-lg font-medium">
                          {exp.role}
                        </h3>

                        <p className="text-neutral-500 text-sm sm:text-base">
                          {exp.company}
                        </p>

                        <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-neutral-400">
                          {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                        </p>

                        {exp.summary && (
                          <p className="text-neutral-700 text-sm leading-relaxed pt-2 max-w-xl">
                            {exp.summary}
                          </p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.section>
            )}
          </div>

          {/* CONTACT (hide on small screens like Portfolio) */}
          <motion.div
            className="hidden md:block pb-32 lg:pb-36"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <ContactTray />
          </motion.div>

          {/* Mobile spacer so footer doesn't feel glued */}
          <div className="md:hidden h-10" />

        </div>
      </div>
    </Transition>
  );
}
