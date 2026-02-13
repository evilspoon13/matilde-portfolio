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
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-neutral-500 text-lg tracking-wide">
            Loading...
          </p>
        </div>
      </Transition>
    );
  }

  if (!aboutData) {
    return (
      <Transition>
        <div className="min-h-screen flex items-center justify-center">
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
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center pt-24 pb-32">

            {aboutData.profileImage && (
              <motion.div
                className="relative aspect-square w-full max-w-md mx-auto lg:mx-0 overflow-hidden rounded-3xl border border-neutral-200 shadow-[0_20px_60px_rgba(0,0,0,0.05)]"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
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
              className="space-y-10"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <div className="space-y-5">
                <h1 className="text-4xl md:text-6xl font-semibold tracking-tight">
                  {aboutData.name}
                </h1>

                <p className="text-xl text-neutral-500">
                  {aboutData.jobTitle}
                </p>
              </div>

              {aboutData.aboutText && (
                <p className="text-lg leading-relaxed text-neutral-700 max-w-xl">
                  {aboutData.aboutText}
                </p>
              )}

              {aboutData.skills?.length > 0 && (
                <div className="flex flex-wrap gap-x-5 gap-y-3 text-sm uppercase tracking-[0.15em] text-neutral-500">
                  {aboutData.skills.map((skill, index) => (
                    <span key={index}>{skill}</span>
                  ))}
                </div>
              )}

              <Link
                href="/works"
                className="group inline-flex items-center gap-4 text-2xl font-medium tracking-tight"
              >
                <span className="border-b border-neutral-900 group-hover:pr-6 transition-all duration-300">
                  View Selected Works
                </span>

                <ArrowRight className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-2" />
              </Link>
            </motion.div>
          </section>

          {/* Divider */}
          <div className="border-t border-neutral-200 my-24" />

          {/* EDUCATION + EXPERIENCE */}
          <div
            ref={contentRef}
            className="grid grid-cols-1 lg:grid-cols-2 gap-20 pb-44"
          >

            {/* EDUCATION */}
            {education.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="
                  bg-white
                  border border-neutral-200
                  rounded-3xl
                  px-12 py-14
                  shadow-[0_20px_60px_rgba(0,0,0,0.04)]
                ">

                  <h2 className="text-2xl font-semibold tracking-tight mb-14">
                    Education
                  </h2>

                  <div className="space-y-14">
                    {education.map((edu, index) => (
                      <motion.div
                        key={edu.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.5,
                          delay: index * 0.05,
                        }}
                        className="space-y-4"
                      >
                        <h3 className="text-lg font-medium">
                          {edu.degree}
                          {edu.fieldOfStudy && ` in ${edu.fieldOfStudy}`}
                        </h3>

                        <p className="text-neutral-500">
                          {edu.school}
                        </p>

                        <p className="text-sm uppercase tracking-[0.2em] text-neutral-400">
                          {formatDateRange(
                            edu.startDate,
                            edu.endDate,
                            edu.current
                          )}
                        </p>

                        {edu.description && (
                          <p className="text-neutral-700 text-sm leading-relaxed pt-3 max-w-xl">
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
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="
                  bg-white
                  border border-neutral-200
                  rounded-3xl
                  px-12 py-14
                  shadow-[0_20px_60px_rgba(0,0,0,0.04)]
                ">

                  <h2 className="text-2xl font-semibold tracking-tight mb-14">
                    Experience
                  </h2>

                  <div className="space-y-14">
                    {experience.map((exp, index) => (
                      <motion.div
                        key={exp.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.5,
                          delay: index * 0.05,
                        }}
                        className="space-y-4"
                      >
                        <h3 className="text-lg font-medium">
                          {exp.role}
                        </h3>

                        <p className="text-neutral-500">
                          {exp.company}
                        </p>

                        <p className="text-sm uppercase tracking-[0.2em] text-neutral-400">
                          {formatDateRange(
                            exp.startDate,
                            exp.endDate,
                            exp.current
                          )}
                        </p>

                        {exp.summary && (
                          <p className="text-neutral-700 text-sm leading-relaxed pt-3 max-w-xl">
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

          {/* CONTACT */}
          <motion.div
            className="pb-36"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <ContactTray />
          </motion.div>

        </div>
      </div>
    </Transition>
  );
}
