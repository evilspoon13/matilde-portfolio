"use client";

import Image from "next/image";
import Transition from "@/components/Transition";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface WorkDetail {
    id: string;
    title: string;
    date: string;
    description: string;
    image: string;
    details: string[];
    location: string;
    client: string;
}

export default function WorkDetail() {
    const params = useParams();
    const [work, setWork] = useState<WorkDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [imageOnLeft, setImageOnLeft] = useState(true);

    const fetchWork = async () => {
        try {
            const response = await fetch(`/api/works/${params.id}`);
            const data = await response.json();
            setWork(data);
            // Alternate image position based on a hash of the ID
            setImageOnLeft(data.id.charCodeAt(0) % 2 === 0);
        } catch (error) {
            console.error('Error fetching work:', error);
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
                <div className="w-full px-4 md:px-6 lg:px-8 py-12">
                    <div className="max-w-[1600px] mx-auto space-y-12">
                        {/* Back Button */}
                        <motion.div 
                            className="flex justify-start -mt-4"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            <motion.a
                                href="/works"
                                className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-800 hover:border-gray-900 hover:text-gray-900 font-semibold text-base md:text-lg px-6 py-3 rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                ← Back to Works
                            </motion.a>
                        </motion.div>
                        
                        <div className="w-full min-h-screen flex items-center justify-center">
                            <div className="text-2xl text-gray-600">Loading...</div>
                        </div>
                    </div>
                </div>
            </Transition>
        );
    }

    if (!work) {
        return (
            <Transition>
                <div className="w-full px-4 md:px-6 lg:px-8 py-12">
                    <div className="max-w-[1600px] mx-auto space-y-12">
                        {/* Back Button */}
                        <motion.div 
                            className="flex justify-start -mt-4"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            <motion.a
                                href="/works"
                                className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-800 hover:border-gray-900 hover:text-gray-900 font-semibold text-base md:text-lg px-6 py-3 rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                ← Back
                            </motion.a>
                        </motion.div>
                        
                        <div className="w-full min-h-screen flex items-center justify-center">
                            <div className="text-2xl text-gray-600">Work not found</div>
                        </div>
                    </div>
                </div>
            </Transition>
        );
    }

    return (
        <Transition>
            <div className="w-full px-4 md:px-6 lg:px-8 py-12">
                <div className="max-w-[1600px] mx-auto space-y-12">
                    
                    {/* Back Button */}
                    <motion.div 
                        className="flex justify-between items-center -mt-4 hover:cursor-pointer"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <motion.a
                            href="/works"
                            className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-800 hover:border-blue-400 hover:text-blue-600 font-semibold text-base md:text-lg px-6 py-3 rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            ← Back to Works
                        </motion.a>
                    </motion.div>
                    
                    {/* Header */}
                    <motion.div 
                        className="text-center space-y-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <motion.h1 
                            className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.3 }}
                        >
                            {work.title}
                        </motion.h1>
                        
                        <div className="flex items-center justify-center gap-4 text-gray-600 text-lg">
                            <span>{work.date}</span>
                            {work.location && (
                                <>
                                    <span>•</span>
                                    <span>{work.location}</span>
                                </>
                            )}
                            {work.client && (
                                <>
                                    <span>•</span>
                                    <span>{work.client}</span>
                                </>
                            )}
                        </div>
                    </motion.div>

                    {/* Main Content - Image and Description */}
                    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start ${!imageOnLeft ? 'lg:grid-flow-dense' : ''}`}>
                        
                        {/* Image */}
                        <motion.div 
                            className={`w-full ${!imageOnLeft ? 'lg:col-start-2' : ''}`}
                            initial={{ opacity: 0, x: imageOnLeft ? -20 : 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            whileHover={{ scale: 1.02 }}
                        >
                            <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300">
                                <Image
                                    src={work.image}
                                    alt={work.title}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>
                        </motion.div>

                        {/* Description */}
                        <motion.div 
                            className={`space-y-6 ${!imageOnLeft ? 'lg:col-start-1 lg:row-start-1' : ''}`}
                            initial={{ opacity: 0, x: imageOnLeft ? 20 : -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-md">
                                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                                    About This Project
                                </h2>
                                
                                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                                    {work.description}
                                </p>

                                {work.details && work.details.length > 0 && (
                                    <div className="space-y-3">
                                        <h3 className="text-xl font-semibold text-gray-900">
                                            Key Features
                                        </h3>
                                        <ul className="space-y-2">
                                            {work.details.map((detail, index) => (
                                                <motion.li 
                                                    key={index}
                                                    className="flex items-start gap-3 text-gray-700"
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ duration: 0.4, delay: 0.4 + (index * 0.1) }}
                                                    whileHover={{ x: 5 }}
                                                >
                                                    <span className="text-gray-400 font-bold text-xl">•</span>
                                                    <span>{detail}</span>
                                                </motion.li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </Transition>
    );
}