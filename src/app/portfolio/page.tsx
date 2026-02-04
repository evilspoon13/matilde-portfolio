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
                const res = await fetch('/api/about');
                const data = await res.json();
                if (data?.portfolio) {
                    setPortfolioUrl(data.portfolio);
                }
            } catch (error) {
                console.error('Error fetching portfolio:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPortfolio();
    }, []);

    if (loading) {
        return (
            <Transition>
                <div className="w-full min-h-screen flex items-center justify-center">
                    <div className="text-2xl text-gray-600">Loading...</div>
                </div>
            </Transition>
        );
    }

    return (
        <Transition>
            <div className="w-full px-4 md:px-6 lg:px-8 py-12">
                <div className="max-w-5xl mx-auto space-y-12">

                    {/* Page Title */}
                    <motion.div
                        className="text-center space-y-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900">
                            Portfolio
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-600">
                            A closer look at what I've been working on
                        </p>
                    </motion.div>

                    {/* Portfolio Card */}
                    {portfolioUrl && (
                        <div className="flex justify-center">
                            <motion.a
                                href={portfolioUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white border-2 border-gray-200 rounded-xl p-8 shadow-lg hover:shadow-2xl hover:border-gray-900 transition-all duration-300 group max-w-2xl w-full"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                whileHover={{ scale: 1.02 }}
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                        <h2 className="text-3xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
                                            Portfolio
                                        </h2>
                                    </div>
                                    <p className="text-gray-600 text-lg">
                                        From concept sketches to finished builds — here's where I keep everything.
                                    </p>
                                    <div className="flex items-center gap-2 text-gray-900 font-semibold group-hover:gap-4 transition-all">
                                        <span>Take a look</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                            </motion.a>
                        </div>
                    )}

                    {/* Contact Card Tray */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <ContactTray />
                    </motion.div>
                </div>
            </div>
        </Transition>
    );
}
