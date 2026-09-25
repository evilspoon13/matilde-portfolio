import { notFound } from "next/navigation";

import WorkEditor from "./WorkEditor";
import { adminQueries } from "@/lib/content";
import { publicUrl } from "@/lib/storage";

export const dynamic = "force-dynamic";

export default async function AdminWorkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const works = await adminQueries.works();
  const work = works.find((candidate) => candidate.id === id);
  if (!work) notFound();

  const images = await adminQueries.workImages(id);

  return (
    <WorkEditor
      work={work}
      images={images.map((image) => ({
        id: image.id,
        url: publicUrl(image.key),
        width: image.width,
        height: image.height,
      }))}
    />
  );
}
