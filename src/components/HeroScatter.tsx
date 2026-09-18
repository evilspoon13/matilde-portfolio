"use client";

import {
  MotionValue,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  Box,
  Building2,
  DraftingCompass,
  Landmark,
  Layers,
  PencilRuler,
  Ruler,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useRef } from "react";

/**
 * Icon cards scattered around the name. Positions are percentages of the hero
 * box, so the composition holds its shape at any width. `depth` is how far a
 * card drifts with the cursor — bigger reads as nearer the viewer — and `layer`
 * decides whether the letters run over the card or under it.
 */
type Slot = {
  icon: LucideIcon;
  label: string;
  top: string;
  left: string;
  width: string;
  rotate: number;
  depth: number;
  layer: "front" | "back";
  /**
   * Phone placement. Only the slots that carry one are kept below md — the
   * rest would collide with the name at that width.
   */
  mobile?: { top: string; left: string; width: string };
};

const SLOTS: Slot[] = [
  {
    icon: DraftingCompass,
    label: "Drafting",
    top: "4%", left: "7%", width: "5.5vw", rotate: 3, depth: 0.55, layer: "back",
  },
  {
    icon: Building2,
    label: "Massing",
    top: "4%", left: "70%", width: "6vw", rotate: -2, depth: 0.8, layer: "front",
    mobile: { top: "4%", left: "58%", width: "15vw" },
  },
  {
    icon: Layers,
    label: "Section",
    top: "64%", left: "82%", width: "6vw", rotate: -2.5, depth: 1.05, layer: "front",
    mobile: { top: "74%", left: "56%", width: "16vw" },
  },
  {
    icon: PencilRuler,
    label: "Detail",
    top: "46%", left: "6%", width: "5.5vw", rotate: -4, depth: 0.7, layer: "back",
  },
  {
    icon: Box,
    label: "Model",
    top: "-3%", left: "36%", width: "5vw", rotate: -2.5, depth: 1.0, layer: "front",
    mobile: { top: "34%", left: "6%", width: "14vw" },
  },
  {
    icon: Ruler,
    label: "Scale",
    top: "26%", left: "88%", width: "5vw", rotate: 2.5, depth: 1.15, layer: "front",
  },
  {
    icon: Landmark,
    label: "Context",
    top: "74%", left: "16%", width: "4.5vw", rotate: 4, depth: 0.9, layer: "back",
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

  const renderCards = (layer: "front" | "back") =>
    SLOTS.filter((slot) => slot.layer === layer).map((slot) => (
      <IconCard
        key={slot.label}
        slot={slot}
        index={SLOTS.indexOf(slot)}
        pointerX={smoothX}
        pointerY={smoothY}
      />
    ));

  return (
    <section
      ref={boxRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative mx-auto w-full max-w-[1600px] px-6 pt-6 pb-12 sm:pb-16"
    >
      <div className="relative h-[62vh] min-h-[400px] sm:h-[66vh] lg:h-[calc(100svh-15rem)] lg:min-h-[520px]">
        {/* Cards the letters run over */}
        <div className="absolute inset-0">{renderCards("back")}</div>

        {/* The name */}
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-center">
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

        {/* Cards that sit over the letters */}
        <div className="absolute inset-0">{renderCards("front")}</div>
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

function IconCard({
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
  const Icon = slot.icon;

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
        whileHover={{ scale: 1.12, rotate: 0, zIndex: 30 }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
        className="group"
      >
        <Icon
          className="h-auto w-full text-neutral-400 transition-colors duration-300 group-hover:text-brand"
          strokeWidth={1}
        />
      </motion.div>
    </motion.div>
  );
}
