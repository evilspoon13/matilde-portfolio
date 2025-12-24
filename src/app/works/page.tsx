"use client";

import ProjectTile from "@/components/ProjectTile";
import Transition from "@/components/Transition";
import { useEffect, useState } from "react";

interface Work {
    id: string;
    title: string;
    date: string;
    description: string;
    image: string;
    details: string[];
    location: string;
    client: string;
}

export default function Works() {
    const [works, setWorks] = useState<Work[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchWorks = async () => {
        try {
            const response = await fetch('/api/works');
            const data = await response.json();
            setWorks(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching works:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorks();
    }, []);

    if (loading) {
        return (
            <Transition>
                <div className="w-full flex items-center justify-center">
                    <div className="text-2xl text-gray-600">Loading...</div>
                </div>
            </Transition>
        );
    }

    return (
        <Transition>
            <div className="w-full px-6 md:px-12 lg:px-20 py-8">
                {/* Projects Grid - Full Width */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {/* Existing Works */}
                    {works.map((work) => (
                        <ProjectTile
                            key={work.id}
                            id={work.id}
                            title={work.title}
                            date={work.date}
                            image={work.image}
                            link={`/works/${work.id}`}
                        />
                    ))}
                </div>
            </div>
        </Transition>
    );
}