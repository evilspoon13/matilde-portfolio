"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { motion, AnimatePresence } from "framer-motion";

// Important: set the PDF.js worker path
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

type Props = {
  fileUrl: string;
};

const MD_BREAKPOINT = 768;

export default function PortfolioBookViewer({ fileUrl }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageAspectRatio, setPageAspectRatio] = useState<number>(11 / 8.5);
  const [containerWidth, setContainerWidth] = useState<number>(1000);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedPage, setSelectedPage] = useState<number | null>(null);

  const isMobile = containerWidth < MD_BREAKPOINT;

  // Measure container width on mount and window resize only (not on content changes)
  // to avoid feedback loops where content → resize → recalc → content → …
  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.getBoundingClientRect().width;
      setContainerWidth(Math.max(280, Math.floor(w)));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Mobile: one page per step [1], [2], [3], ...
  // Desktop: cover alone, then spreads [1], [2,3], [4,5], ...
  const steps = useMemo(() => {
    if (numPages === 0) return [];

    if (isMobile) {
      return Array.from({ length: numPages }, (_, i) => [i + 1]);
    }

    const result: number[][] = [[1]]; // cover
    for (let p = 2; p <= numPages; p += 2) {
      const spread = [p];
      if (p + 1 <= numPages) spread.push(p + 1);
      result.push(spread);
    }
    return result;
  }, [numPages, isMobile]);

  const totalSteps = steps.length;
  const current = steps[currentIndex] ?? [1];
  const isCover = current.length === 1 && current[0] === 1;

  // Clamp index when switching between mobile/desktop
  useEffect(() => {
    if (totalSteps > 0 && currentIndex >= totalSteps) {
      setCurrentIndex(totalSteps - 1);
    }
  }, [totalSteps, currentIndex]);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, totalSteps - 1));
  }, [totalSteps]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedPage(null);
        return;
      }
      if (selectedPage !== null) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev, selectedPage]);

  // Swipe support for touch devices
  const touchStartX = useRef<number | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      const threshold = 50;
      if (dx < -threshold) goNext();
      else if (dx > threshold) goPrev();
      touchStartX.current = null;
    },
    [goNext, goPrev]
  );

  // Sizing
  const innerPadding = isMobile ? 32 : 80; // px-4 vs px-10 (each side)
  const availableWidth = containerWidth - innerPadding;

  const singlePageWidth = availableWidth; // mobile: full width

  const spreadPageWidth = Math.floor((availableWidth - 24) / 2); // desktop: half minus gap

  // Fixed content height based on actual page aspect ratio
  const contentHeight = isMobile
    ? singlePageWidth * pageAspectRatio
    : spreadPageWidth * pageAspectRatio;

  // Cover width derived from content height so single-page views match spread height
  const coverWidth = isMobile
    ? availableWidth
    : Math.floor(contentHeight / pageAspectRatio);

  // Page label for counter
  const pageLabel =
    current.length === 1
      ? current[0] === 1
        ? "Cover"
        : `Page ${current[0]}`
      : current.length === 2
        ? `${current[0]}–${current[1]}`
        : `${current[0]}`;

  return (
    <div
      ref={containerRef}
      className="w-full"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="
          bg-white border border-neutral-200
          rounded-2xl md:rounded-3xl
          shadow-[0_20px_60px_rgba(0,0,0,0.05)]
          px-4 sm:px-10 py-6 sm:py-10
          overflow-hidden
        "
      >
        <Document
          file={fileUrl}
          onLoadSuccess={async (pdf) => {
            setNumPages(pdf.numPages);
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 1 });
            setPageAspectRatio(viewport.height / viewport.width);
          }}
          loading={
            <div className="py-20 text-center text-neutral-500 tracking-wide" style={{ height: contentHeight }}>
              Loading portfolio…
            </div>
          }
          error={
            <div className="py-20 text-center text-neutral-500" style={{ height: contentHeight }}>
              Could not load PDF. Make sure the file is in <code>/public</code>.
            </div>
          }
        >
          <div
            className="flex items-center justify-center"
            style={{ height: contentHeight }}
          >
            {isCover ? (
              /* COVER */
              <div className="flex justify-center">
                <div
                  className="rounded-xl md:rounded-2xl overflow-hidden border border-neutral-200 bg-white cursor-pointer transition-transform duration-300 hover:scale-[1.01]"
                  onClick={() => setSelectedPage(1)}
                >
                  <Page
                    pageNumber={1}
                    width={coverWidth}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                </div>
              </div>
            ) : current.length === 1 ? (
              /* SINGLE PAGE (mobile) */
              <div className="flex justify-center">
                <div
                  className="rounded-xl overflow-hidden border border-neutral-200 bg-white cursor-pointer transition-transform duration-300 hover:scale-[1.01]"
                  onClick={() => setSelectedPage(current[0])}
                >
                  <Page
                    pageNumber={current[0]}
                    width={singlePageWidth}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                </div>
              </div>
            ) : (
              /* SPREAD (desktop, two pages side by side) */
              <div className="flex justify-center items-start gap-6">
                <div
                  className="rounded-2xl overflow-hidden border border-neutral-200 bg-white cursor-pointer transition-transform duration-300 hover:scale-[1.01]"
                  onClick={() => setSelectedPage(current[0])}
                >
                  <Page
                    pageNumber={current[0]}
                    width={spreadPageWidth}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                </div>

                {current[1] ? (
                  <div
                    className="rounded-2xl overflow-hidden border border-neutral-200 bg-white cursor-pointer transition-transform duration-300 hover:scale-[1.01]"
                    onClick={() => setSelectedPage(current[1])}
                  >
                    <Page
                      pageNumber={current[1]}
                      width={spreadPageWidth}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                    />
                  </div>
                ) : (
                  <div
                    className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50"
                    style={{
                      width: spreadPageWidth,
                      height: spreadPageWidth * pageAspectRatio,
                    }}
                    aria-hidden="true"
                  />
                )}
              </div>
            )}
          </div>
        </Document>
      </div>

      {/* Navigation controls */}
      {totalSteps > 1 && (
        <div className="flex items-center justify-between mt-4 sm:mt-6 px-1 sm:px-2">
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="
              px-3 sm:px-4 py-2 text-sm font-medium tracking-wide
              text-neutral-700 hover:text-neutral-900
              disabled:opacity-30 disabled:cursor-not-allowed
              transition-opacity
            "
          >
            ← Prev
          </button>

          <span className="text-[10px] sm:text-xs text-neutral-400 tracking-widest uppercase select-none">
            {pageLabel} &middot; {currentIndex + 1} / {totalSteps}
          </span>

          <button
            onClick={goNext}
            disabled={currentIndex === totalSteps - 1}
            className="
              px-3 sm:px-4 py-2 text-sm font-medium tracking-wide
              text-neutral-700 hover:text-neutral-900
              disabled:opacity-30 disabled:cursor-not-allowed
              transition-opacity
            "
          >
            Next →
          </button>
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {selectedPage !== null && (
          <motion.div
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPage(null)}
          >
            <motion.div
              className="relative max-w-6xl w-full flex items-center justify-center"
              style={{ height: "90vh" }}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Document file={fileUrl}>
                <Page
                  pageNumber={selectedPage}
                  height={Math.floor((typeof window !== "undefined" ? window.innerHeight : 800) * 0.85)}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="rounded-xl overflow-hidden shadow-2xl"
                />
              </Document>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
