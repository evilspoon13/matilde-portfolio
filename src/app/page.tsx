import HomeContent from "@/components/HomeContent";
import Transition from "@/components/Transition";
import { getAbout, getEducation, getExperience } from "@/lib/notion";

export const revalidate = 600;

export default async function Home() {
  const [about, education, experience] = await Promise.all([
    getAbout(),
    getEducation(),
    getExperience(),
  ]);

  if (!about) {
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
    <HomeContent about={about} education={education} experience={experience} />
  );
}
