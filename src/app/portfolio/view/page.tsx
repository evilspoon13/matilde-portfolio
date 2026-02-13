"use client";

import Transition from "@/components/Transition";
import dynamic from "next/dynamic";

const PortfolioBookViewer = dynamic(
  () => import("@/components/PortfolioBookViewer"),
  { ssr: false }
);

export default function PortfolioViewPage() {
  return (
    <Transition>
      <div className="w-full text-neutral-900">
        <div className="max-w-[95vw] mx-auto px-4 pt-16 pb-24">
          <a
            href="/portfolio"
            className="text-xs uppercase tracking-[0.25em] text-neutral-400 hover:text-neutral-900 transition-colors"
          >
            ← Back to Portfolio
          </a>

          <div className="mt-10">
            <PortfolioBookViewer fileUrl="/portfolio.pdf" />
          </div>
        </div>
      </div>
    </Transition>
  );
}
