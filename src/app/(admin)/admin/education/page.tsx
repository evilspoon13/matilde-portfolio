import EducationAdmin from "./EducationAdmin";
import { adminQueries } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function AdminEducationPage() {
  const education = await adminQueries.education();
  return <EducationAdmin education={education} />;
}
