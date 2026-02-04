"use client";

import Image from "next/image";
import Link from "next/link";
import ContactTray from "@/components/ContactTray";
import Transition from "@/components/Transition";
import { motion, useScroll, useTransform } from "framer-motion";
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
    const heroRef = useRef<HTMLDivElement>(null);
    const [hasScrolled, setHasScrolled] = useState(false);
    
    const { scrollYProgress } = useScroll();
    const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

    useEffect(() => {
        const handleScroll = () => {
            if (!hasScrolled && window.scrollY > 50) {
                setHasScrolled(true);
                contentRef.current?.scrollIntoView({ behavior: 'smooth' });
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [hasScrolled]);

    const fetchData = async () => {
        try {
            // Fetch all data from API routes
            const [aboutRes, educationRes, experienceRes] = await Promise.all([
                fetch('/api/about'),
                fetch('/api/education'),
                fetch('/api/experience')
            ]);

            const aboutData = await aboutRes.json();
            const educationData = await educationRes.json();
            const experienceData = await experienceRes.json();

            console.log('Education data:', educationData);
            console.log('Experience data:', experienceData);

            setAboutData(aboutData);
            setEducation(Array.isArray(educationData) ? educationData : []);
            setExperience(Array.isArray(experienceData) ? experienceData : []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Helper function to format date range
    const formatDateRange = (startDate: string, endDate: string, current: boolean) => {
        if (!startDate) return '';
        const start = new Date(startDate).getFullYear();
        if (current) return `${start} - Present`;
        if (!endDate) return `${start}`;
        const end = new Date(endDate).getFullYear();
        return `${start} - ${end}`;
    };

    if (loading) {
        return (
            <Transition>
                <div className="w-full min-h-screen flex items-center justify-center">
                    <div className="text-2xl text-gray-600">Loading...</div>
                </div>
            </Transition>
        );
    }

    if (!aboutData) {
        return (
            <Transition>
                <div className="w-full min-h-screen flex items-center justify-center">
                    <div className="text-2xl text-gray-600">Unable to load about information</div>
                </div>
            </Transition>
        );
    }

    const scrollToContent = () => {
        contentRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <Transition>
            <div className="w-full">
                <div className="max-w-7xl mx-auto px-6 py-8">

                    {/* Hero + About Section */}
                    <motion.section
                        ref={heroRef}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[50vh]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6 }}
                    >
                        {/* Left - Profile Image */}
                        {aboutData.profileImage && (
                            <motion.div
                                className="relative aspect-square max-w-md mx-auto lg:mx-0 w-full"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.6 }}
                            >
                                <Image
                                    src={aboutData.profileImage}
                                    alt={aboutData.name}
                                    fill
                                    className="object-cover rounded-2xl shadow-2xl"
                                    unoptimized
                                />
                            </motion.div>
                        )}

                        {/* Right - Name, Title, About */}
                        <motion.div
                            className="space-y-6 text-center lg:text-left"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <div>
                                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight">
                                    {aboutData.name}
                                </h1>
                                <p className="text-2xl md:text-3xl text-gray-600 font-light mt-2">
                                    {aboutData.jobTitle}
                                </p>
                            </div>

                            {aboutData.aboutText && (
                                <p className="text-lg text-gray-700 leading-relaxed">
                                    {aboutData.aboutText}
                                </p>
                            )}

                            {/* Skills */}
                            {aboutData.skills && aboutData.skills.length > 0 && (
                                <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                                    {aboutData.skills.map((skill, index) => (
                                        <span
                                            key={index}
                                            className="bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-center lg:justify-start">
                                <Link
                                    href="/works"
                                    className="group inline-flex items-center gap-2 bg-gray-900 text-white font-semibold text-lg px-8 py-4 rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    View My Work
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </motion.div>
                    </motion.section>

                    {/* Education & Experience Grid */}
                    <div ref={contentRef} className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mt-12">

                        {/* Education */}
                        {education.length > 0 && (
                            <motion.section
                                className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                            >
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                    Education
                                </h2>

                                <div className="space-y-6">
                                    {education.map((edu, index) => (
                                        <motion.div
                                            key={edu.id}
                                            className="relative pl-6 border-l-2 border-gray-300 hover:border-gray-900 transition-colors"
                                            initial={{ opacity: 0, x: -10 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.4, delay: index * 0.1 }}
                                        >
                                            <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-gray-900"></div>
                                            <h3 className="text-lg font-bold text-gray-900">
                                                {edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}
                                            </h3>
                                            <p className="text-gray-600 font-medium">
                                                {edu.school}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {formatDateRange(edu.startDate, edu.endDate, edu.current)}
                                            </p>
                                            {edu.description && (
                                                <p className="text-gray-700 text-sm mt-2">
                                                    {edu.description}
                                                </p>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.section>
                        )}

                        {/* Experience */}
                        {experience.length > 0 && (
                            <motion.section
                                className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                            >
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                    Experience
                                </h2>

                                <div className="space-y-6">
                                    {experience.map((exp, index) => (
                                        <motion.div
                                            key={exp.id}
                                            className="relative pl-6 border-l-2 border-gray-300 hover:border-gray-900 transition-colors"
                                            initial={{ opacity: 0, x: -10 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.4, delay: index * 0.1 }}
                                        >
                                            <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-gray-900"></div>
                                            <h3 className="text-lg font-bold text-gray-900">
                                                {exp.role}
                                            </h3>
                                            <p className="text-gray-600 font-medium">
                                                {exp.company}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                                            </p>
                                            {exp.summary && (
                                                <p className="text-gray-700 text-sm mt-2">
                                                    {exp.summary}
                                                </p>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.section>
                        )}
                    </div>

                    {/* Contact Tray */}
                    <motion.div
                        className="mt-12"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <ContactTray />
                    </motion.div>

                </div>
            </div>
        </Transition>
    );
}