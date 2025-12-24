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
            <div className="w-full scroll-smooth snap-y snap-proximity">
                
                {/* Hero Section - Reduced Height */}
                <motion.section 
                    ref={heroRef}
                    className="relative min-h-[60vh] flex flex-col items-center justify-center px-6 snap-start snap-always pt-20"
                    style={{ opacity, scale }}
                >
                    <div className="text-center space-y-8 max-w-5xl mx-auto">
                        <motion.div 
                            className="space-y-6"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <h1 className="text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold text-gray-900 tracking-tight leading-tight">
                                {aboutData.name}
                            </h1>
                            <p className="text-3xl md:text-4xl lg:text-5xl text-gray-600 font-light">
                                {aboutData.jobTitle}
                            </p>
                        </motion.div>

                        <motion.div
                            className="flex flex-col sm:flex-row gap-5 justify-center items-center pt-8"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            <Link 
                                href="/works"
                                className="group inline-flex items-center gap-3 bg-gray-900 text-white font-semibold text-xl px-12 py-5 rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-xl hover:shadow-2xl"
                            >
                                View My Work
                                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </motion.div>
                    </div>
                </motion.section>

                {/* Content Sections */}
                <div ref={contentRef} className="w-full snap-start">
                    <div className="max-w-6xl mx-auto px-6 pt-12 pb-20 space-y-24">
                        
                        {/* About Text */}
                        <motion.section 
                            className="max-w-4xl mx-auto"
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8 }}
                        >
                            <p className="text-xl md:text-2xl text-gray-700 leading-relaxed text-center font-light">
                                {aboutData.aboutText}
                            </p>
                        </motion.section>

                        {/* Skills */}
                        {aboutData.skills && aboutData.skills.length > 0 && (
                            <motion.section 
                                className="max-w-4xl mx-auto"
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.8 }}
                            >
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10 text-center">Expertise</h2>
                                <div className="flex flex-wrap gap-4 justify-center">
                                    {aboutData.skills.map((skill, index) => (
                                        <motion.span
                                            key={index}
                                            className="bg-gray-900 text-white px-6 py-3 rounded-full text-base font-medium hover:bg-gray-800 transition-colors cursor-pointer"
                                            whileHover={{ scale: 1.1, rotate: 2 }}
                                            whileTap={{ scale: 0.95 }}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.4, delay: index * 0.05 }}
                                        >
                                            {skill}
                                        </motion.span>
                                    ))}
                                </div>
                            </motion.section>
                        )}

                        {/* Education & Experience */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                            
                            {/* Education */}
                            {education.length > 0 && (
                                <motion.section
                                    initial={{ opacity: 0, x: -40 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.8 }}
                                >
                                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10">
                                        Education
                                    </h2>
                                    
                                    <div className="space-y-10">
                                        {education.map((edu, index) => (
                                            <motion.div 
                                                key={edu.id}
                                                className="relative pl-8 border-l-2 border-gray-300 hover:border-gray-900 transition-colors group cursor-pointer"
                                                whileHover={{ x: 8 }}
                                                initial={{ opacity: 0, x: -20 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                            >
                                                <div className="absolute -left-2.5 top-0 w-5 h-5 rounded-full bg-gray-900 group-hover:scale-125 transition-transform"></div>
                                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                                    {edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}
                                                </h3>
                                                <p className="text-gray-600 font-medium mb-1">
                                                    {edu.school}
                                                </p>
                                                <p className="text-sm text-gray-500 mb-3">
                                                    {formatDateRange(edu.startDate, edu.endDate, edu.current)}
                                                </p>
                                                {edu.description && (
                                                    <p className="text-gray-700 leading-relaxed text-sm">
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
                                    initial={{ opacity: 0, x: 40 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.8 }}
                                >
                                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10">
                                        Experience
                                    </h2>
                                    
                                    <div className="space-y-10">
                                        {experience.map((exp, index) => (
                                            <motion.div 
                                                key={exp.id}
                                                className="relative pl-8 border-l-2 border-gray-300 hover:border-gray-900 transition-colors group cursor-pointer"
                                                whileHover={{ x: 8 }}
                                                initial={{ opacity: 0, x: -20 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                            >
                                                <div className="absolute -left-2.5 top-0 w-5 h-5 rounded-full bg-gray-900 group-hover:scale-125 transition-transform"></div>
                                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                                    {exp.role}
                                                </h3>
                                                <p className="text-gray-600 font-medium mb-1">
                                                    {exp.company}
                                                </p>
                                                <p className="text-sm text-gray-500 mb-3">
                                                    {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                                                </p>
                                                {exp.summary && (
                                                    <p className="text-gray-700 leading-relaxed text-sm">
                                                        {exp.summary}
                                                    </p>
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.section>
                            )}
                        </div>

                        {/* Contact Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8 }}
                        >
                            <ContactTray />
                        </motion.div>

                    </div>
                </div>
            </div>
        </Transition>
    );
}