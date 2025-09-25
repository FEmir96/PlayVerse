// playverse-web/components/CoverBox.tsx
"use client";

type CoverBoxProps = {
  src?: string | null;
  alt?: string;
  /** Proporción del box: "16/9" | "2/3" | "1/1" | "3/4" ...  */
  ratio?: string;
  /** "contain" (no recorta) | "cover" (recorta para llenar) */
  fit?: "contain" | "cover";
  className?: string;
};

export function CoverBox({
  src,
  alt = "Cover",
  ratio = "16/9",
  fit = "contain",
  className = "",
}: CoverBoxProps) {
  const safe = src || "/placeholder.svg";
  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-900 ${className}`}
      style={{ aspectRatio: ratio }}
    >
      {/* Fondo borroso con la misma imagen */}
      <img
        src={safe}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover blur-md scale-110 opacity-40"
      />

      {/* Imagen principal */}
      <img
        src={safe}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={`absolute inset-0 h-full w-full ${fit === "contain" ? "object-contain" : "object-cover"}`}
      />
    </div>
  );
}
