import WorkDetailView from "@/components/WorkDetailView";
import Transition from "@/components/Transition";
import { getWorkById, getWorks } from "@/lib/notion";

export const revalidate = 600;

/** Prerender every work at build time; new ones are rendered on first request. */
export async function generateStaticParams() {
  const works = await getWorks();
  return works.map((work) => ({ id: work.id }));
}

export default async function WorkDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const work = await getWorkById(id);

  if (!work) {
    return (
      <Transition>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-neutral-500 text-lg tracking-wide">
            Project not found
          </p>
        </div>
      </Transition>
    );
  }

  return <WorkDetailView work={work} />;
}
