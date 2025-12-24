"use client";

import { motion } from "framer-motion";
import { RiExternalLinkLine } from "react-icons/ri";

interface LinkCardProps {
    title: string;
    description: string;
    linkUrl: string;
    linkText: string;
}

export default function LinkCard({ title, description, linkUrl, linkText }: LinkCardProps) {
    return (
        <div className="w-full px-4 md:px-6 lg:px-8 py-12 md:py-16">
            <motion.div
                className="max-w-2xl w-full mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="bg-white border border-gray-200 rounded-xl p-12 md:p-16 shadow-lg text-center">
                    <motion.h1 
                        className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.3 }}
                    >
                        {title}
                    </motion.h1>
                    
                    <p className="text-gray-700 text-lg md:text-xl mb-12 leading-relaxed">
                        {description}
                    </p>

                    {/* Interactive Link Button */}
                    <motion.a
                        href={linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 bg-gradient-to-br from-gray-100 to-gray-200 hover:from-blue-50 hover:to-blue-100 text-gray-800 hover:text-blue-600 font-semibold text-xl md:text-2xl px-8 py-4 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-300 hover:border-blue-400"
                        whileHover={{ scale: 1.05, y: -3 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.3 }}
                    >
                        <span>{linkText}</span>
                        <motion.div
                            animate={{ x: [0, 3, 0] }}
                            transition={{ 
                                duration: 1.5, 
                                repeat: Infinity,
                                ease: "easeInOut" 
                            }}
                        >
                            <RiExternalLinkLine className="w-6 h-6 md:w-7 md:h-7" />
                        </motion.div>
                    </motion.a>
                </div>
            </motion.div>
        </div>
    );
}
