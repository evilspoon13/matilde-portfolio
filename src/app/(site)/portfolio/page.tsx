import PortfolioContent from "@/components/PortfolioContent";
import { getAbout } from "@/lib/content";

export const revalidate = 600;

export default async function Portfolio() {
  const about = await getAbout();
  return (
    <PortfolioContent
      resumeUrl={about?.resume}
      portfolioUrl={about?.portfolio}
    />
  );
}
