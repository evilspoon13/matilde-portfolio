import WorksAdmin from "./WorksAdmin";
import { adminQueries } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function AdminWorksPage() {
  const works = await adminQueries.works();
  return <WorksAdmin works={works} />;
}
