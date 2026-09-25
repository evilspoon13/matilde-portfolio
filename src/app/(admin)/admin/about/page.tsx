import AboutForm from "./AboutForm";
import { adminQueries } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function AdminAboutPage() {
  const about = await adminQueries.about();
  return <AboutForm about={about} />;
}
