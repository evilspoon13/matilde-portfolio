"use client";

import {
  MotionValue,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import Image, { type StaticImageData } from "next/image";
import { useCallback, useRef } from "react";

import courtyardRender from "@/assets/hero/courtyard-render.jpg";
import framingStudyModel from "@/assets/hero/framing-study-model.png";
import hillsideVillaModel from "@/assets/hero/hillside-villa-model.png";
import terracedHouseIso from "@/assets/hero/terraced-house-iso.png";

/**
 * Work photos scattered around the name. Positions are percentages of the hero
 * box, so the composition holds its shape at any width. `depth` is how far a
 * photo drifts with the cursor — bigger reads as nearer the viewer. Every photo
 * sits behind the letters, and the slots keep to the whitespace around them, so
 * the name is never covered.
 */
type Slot = {
  image: StaticImageData;
  /** Alt text, and the React key for the slot. */
  label: string;
  top: string;
  left: string;
  width: string;
  rotate: number;
  depth: number;
  /**
   * A background-removed PNG: it gets a shadow that follows the cutout instead
   * of a rectangular one, since there is no photo edge to cast it.
   */
  cutout?: boolean;
  /**
   * Phone placement. Only the slots that carry one are kept below md — the
   * rest would collide with the name at that width.
   */
  mobile?: { top: string; left: string; width: string };
};

const SLOTS: Slot[] = [
  {
    image: framingStudyModel,
    label: "Framing study model",
    top: "-2%", left: "1%", width: "30vw", rotate: 3, depth: 0.55, cutout: true,
    mobile: { top: "0%", left: "0%", width: "62vw" },
  },
  {
    image: hillsideVillaModel,
    label: "Hillside villa site model",
    top: "-6%", left: "62%", width: "26vw", rotate: -2, depth: 0.85, cutout: true,
    mobile: { top: "2%", left: "46%", width: "56vw" },
  },
  {
    image: terracedHouseIso,
    label: "Terraced house isometric model",
    top: "60%", left: "0%", width: "18vw", rotate: -4, depth: 0.7, cutout: true,
    mobile: { top: "70%", left: "1%", width: "46vw" },
  },
  {
    image: courtyardRender,
    label: "Courtyard render",
    top: "58%", left: "78%", width: "21vw", rotate: -2.5, depth: 1.1,
    mobile: { top: "79%", left: "45%", width: "48vw" },
  },
];

export default function HeroScatter({
  name,
  jobTitle,
}: {
  name: string;
  jobTitle?: string;
}) {
  const reduceMotion = useReducedMotion();
  const boxRef = useRef<HTMLDivElement>(null);

  // -0.5 .. 0.5 across the hero, smoothed. Every card reads off these two.
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 60, damping: 20, mass: 0.6 });
  const smoothY = useSpring(pointerY, { stiffness: 60, damping: 20, mass: 0.6 });

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (reduceMotion) return;
      const box = boxRef.current?.getBoundingClientRect();
      if (!box) return;
      pointerX.set((event.clientX - box.left) / box.width - 0.5);
      pointerY.set((event.clientY - box.top) / box.height - 0.5);
    },
    [pointerX, pointerY, reduceMotion]
  );

  const handlePointerLeave = useCallback(() => {
    pointerX.set(0);
    pointerY.set(0);
  }, [pointerX, pointerY]);

  const words = name.trim().split(/\s+/);

  return (
    <section
      ref={boxRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative w-full px-6 pt-6 pb-12 sm:px-10 sm:pb-16 lg:px-[3vw]"
    >
      <div className="relative h-[62vh] min-h-[400px] sm:h-[66vh] lg:h-[calc(100svh-15rem)] lg:min-h-[520px]">
        {/* Photos — one layer, always behind the letters */}
        <div className="absolute inset-0">
          {SLOTS.map((slot, index) => (
            <PhotoTile
              key={slot.label}
              slot={slot}
              index={index}
              pointerX={smoothX}
              pointerY={smoothY}
            />
          ))}
        </div>

        {/* The name, above every photo */}
        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-center">
          {words.map((word, index) => (
            <motion.h1
              key={word + index}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.05 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontSize: "clamp(3.5rem, 17vw, 26rem)",
                lineHeight: 0.82,
                // Alternate words indent, so the block reads as a composition
                // rather than a stack.
                marginLeft: index % 2 === 0 ? "0" : "22%",
              }}
              className="select-none font-normal tracking-[-0.06em] text-brand"
            >
              {word}
            </motion.h1>
          ))}
        </div>
      </div>

      {jobTitle && (
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="relative mt-8 text-xs uppercase tracking-[0.3em] text-neutral-500 sm:text-sm"
        >
          {jobTitle}
        </motion.p>
      )}
    </section>
  );
}

function PhotoTile({
  slot,
  index,
  pointerX,
  pointerY,
}: {
  slot: Slot;
  index: number;
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
}) {
  const x = useTransform(pointerX, (value) => value * slot.depth * 64);
  const y = useTransform(pointerY, (value) => value * slot.depth * 40);

  return (
    <motion.div
      className={`absolute top-[var(--m-top)] left-[var(--m-left)] w-[var(--m-width)] md:top-[var(--top)] md:left-[var(--left)] md:w-[var(--width)] ${
        slot.mobile ? "" : "hidden md:block"
      }`}
      style={
        {
          "--top": slot.top,
          "--left": slot.left,
          "--width": slot.width,
          "--m-top": slot.mobile?.top ?? slot.top,
          "--m-left": slot.mobile?.left ?? slot.left,
          "--m-width": slot.mobile?.width ?? slot.width,
          x,
          y,
        } as React.CSSProperties
      }
      initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.9, delay: 0.15 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        style={{ rotate: slot.rotate }}
        whileHover={{ scale: 1.06, rotate: 0, zIndex: 10 }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
        className="group"
      >
        <Image
          src={slot.image}
          alt={slot.label}
          sizes="(min-width: 768px) 25vw, 50vw"
          placeholder="blur"
          priority
          className={
            slot.cutout
              ? "h-auto w-full drop-shadow-[0_16px_28px_rgba(15,23,42,0.22)]"
              : "h-auto w-full shadow-[0_18px_50px_rgba(15,23,42,0.14)]"
          }
        />
      </motion.div>
    </motion.div>
  );
}
