import Image from "next/image";

type Props = {
  /** Public R2 URL, or "" when no background is set. */
  src?: string;
};

export default function BackgroundImage({ src }: Props) {
  if (!src) return null;

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <Image
        src={src}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover brightness-105 contrast-95 saturate-50 select-none"
      />

      {/* Soft overlay to control whiteness */}
      <div className="absolute inset-0 bg-white/80" />
    </div>
  );
}
