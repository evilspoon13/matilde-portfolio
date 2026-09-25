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
 * Work photos scattered around the name.
 *
 * They sit in a band above the name and a band below it rather than being
 * positioned against the hero box. The name's size tracks the viewport WIDTH
 * while the box's height tracks its HEIGHT, so any absolute placement that
 * cleared the letters on one screen shape ran straight through them on
 * another — a wide, short window pushed both bands into the name. Stacked
 * bands can't overlap it at any aspect ratio.
 *
 * Within a band, `offset` is the gap before a photo as a share of the band's
 * width, so the pair can be clustered and slid left or right rather than pinned
 * to the two corners. `nudge` shifts a photo vertically inside its band. Top
 * band sits left of centre, bottom band right of it, so the composition drifts
 * diagonally instead of reading as a symmetrical frame.
 *
 * `depth` is how far a photo drifts with the cursor — bigger reads as nearer
 * the viewer.
 */
type Slot = {
  image: StaticImageData;
  /** Alt text, and the React key for the slot. */
  label: string;
  band: "top" | "bottom";
  /**
   * Width from md up. Capped against vh as well as vw, since the bands and the
   * name have to share the screen's height: the vh term is the aspect ratio
   * times the share of the viewport height a band may take.
   */
  width: string;
  /** Width below md, where the bands get a bigger share of a smaller screen. */
  mobileWidth: string;
  /** Space before the photo within its band, as a share of the band's width. */
  offset: string;
  mobileOffset: string;
  /** Vertical offset within the band, as a share of the photo's own height. */
  nudge?: string;
  rotate: number;
  depth: number;
  /**
   * A background-removed PNG: it gets a shadow that follows the cutout instead
   * of a rectangular one, since there is no photo edge to cast it.
   */
  cutout?: boolean;
};

const SLOTS: Slot[] = [
  {
    image: framingStudyModel,
    label: "Framing study model",
    band: "top",
    width: "min(30vw, 36vh, 560px)",
    mobileWidth: "44vw",
    offset: "1%",
    mobileOffset: "0%",
    rotate: 4,
    depth: 0.55,
    cutout: true,
  },
  {
    image: hillsideVillaModel,
    label: "Hillside villa site model",
    band: "top",
    width: "min(23vw, 25vh, 390px)",
    mobileWidth: "42vw",
    offset: "15%",
    mobileOffset: "8%",
    nudge: "-16%",
    rotate: -3.5,
    depth: 0.85,
    cutout: true,
  },
  {
    image: terracedHouseIso,
    label: "Terraced house isometric model",
    band: "bottom",
    width: "min(15vw, 15vh, 250px)",
    mobileWidth: "26vw",
    offset: "38%",
    mobileOffset: "4%",
    nudge: "6%",
    rotate: -6,
    depth: 0.7,
    cutout: true,
  },
  {
    image: courtyardRender,
    label: "Courtyard render",
    band: "bottom",
    width: "min(30vw, 40vh, 640px)",
    mobileWidth: "46vw",
    offset: "12%",
    mobileOffset: "14%",
    nudge: "-4%",
    rotate: -2,
    depth: 1.1,
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

  // -0.5 .. 0.5 across the hero, smoothed. Every photo reads off these two.
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

  const band = (which: "top" | "bottom") => (
    <div className="flex items-start">
      {SLOTS.filter((slot) => slot.band === which).map((slot) => (
        <PhotoTile
          key={slot.label}
          slot={slot}
          index={SLOTS.indexOf(slot)}
          pointerX={smoothX}
          pointerY={smoothY}
        />
      ))}
    </div>
  );

  return (
    <section
      ref={boxRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative w-full px-6 pt-6 pb-12 sm:px-10 sm:pb-16 lg:px-[3vw]"
    >
      <div className="flex min-h-[calc(100svh-13rem)] flex-col justify-center gap-10 sm:gap-12 lg:gap-[3vh]">
        {band("top")}

        {/* The name, between the two bands — never under a photo */}
        <div className="pointer-events-none">
          {words.map((word, index) => (
            <motion.h1
              key={word + index}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.05 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontSize: "clamp(3.5rem, min(17vw, 21vh), 22rem)",
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

        {band("bottom")}
      </div>

      {jobTitle && (
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="relative mt-16 text-xs uppercase tracking-[0.3em] text-neutral-500 sm:text-sm lg:mt-20"
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
      className="ml-[var(--m-offset)] w-[var(--m-width)] shrink-0 md:ml-[var(--offset)] md:w-[var(--width)]"
      style={
        {
          "--width": slot.width,
          "--m-width": slot.mobileWidth,
          "--offset": slot.offset,
          "--m-offset": slot.mobileOffset,
          x,
          y,
        } as React.CSSProperties
      }
      initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.9, delay: 0.15 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        style={{ rotate: slot.rotate, y: slot.nudge ?? 0 }}
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
