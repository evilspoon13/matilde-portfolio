import WorksGrid, { type WorkTile } from "@/components/WorksGrid";
import { getWorks } from "@/lib/notion";

export const revalidate = 600;

export default async function Works() {
  const works = await getWorks();

  const tiles: WorkTile[] = works.map((work) => ({
    id: work.id,
    title: work.title,
    date: work.date,
    location: work.location,
    image:
      work.images.find((img) => typeof img === "string" && img.trim() !== "") ??
      null,
  }));

  return <WorksGrid works={tiles} />;
}
