import ExperienceAdmin from "./ExperienceAdmin";
import { adminQueries } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function AdminExperiencePage() {
  const experience = await adminQueries.experience();
  return <ExperienceAdmin experience={experience} />;
}
