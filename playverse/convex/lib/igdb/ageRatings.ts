"use node";

// convex/lib/igdb/ageRatings.ts

export type AgeRatingChoice = {
  system: string;
  label: string;
  code?: string;
};

// Prioridad de sistemas al elegir uno
const PREF = ["ESRB", "PEGI", "USK", "CERO"] as const;

type AgeRow = { category?: number | null; rating?: number | null } | null;

export function pickAgeRating(rows?: AgeRow[]): AgeRatingChoice | null {
  const list = (rows ?? []).filter(Boolean) as NonNullable<AgeRow>[];
  if (!list.length) return null;

  const mapped = list
    .map(r => toLabel(r.category ?? null, r.rating ?? null))
    .filter(Boolean) as AgeRatingChoice[];

  if (!mapped.length) return null;

  for (const s of PREF) {
    const found = mapped.find(m => m.system === s);
    if (found) return found;
  }
  return mapped[0];
}

function toLabel(category: number | null, rating: number | null): AgeRatingChoice | null {
  if (category == null || rating == null) return null;
  switch (category) {
    case 1: // ESRB
      return { system: "ESRB", ...esrbLabel(rating) };
    case 2: // PEGI
      return { system: "PEGI", ...pegiLabel(rating) };
    case 3: // CERO
      return { system: "CERO", ...ceroLabel(rating) };
    case 4: // USK
      return { system: "USK", ...uskLabel(rating) };
    default:
      return { system: "IARC", label: "Not Rated" };
  }
}

function esrbLabel(r: number) {
  // IGDB: E(6), E10+(7), T(8), M(9), AO(10), RP(12)
  const map: Record<number, { code: string; label: string }> = {
    6: { code: "E", label: "ESRB E" },
    7: { code: "E10+", label: "ESRB E10+" },
    8: { code: "T", label: "ESRB T" },
    9: { code: "M", label: "ESRB M" },
    10:{ code: "AO", label: "ESRB AO" },
    12:{ code: "RP", label: "ESRB RP" },
  };
  return map[r] ?? { code: "NR", label: "ESRB Not Rated" };
}

function pegiLabel(r: number) {
  const map: Record<number, { code: string; label: string }> = {
    1: { code: "3",  label: "PEGI 3" },
    2: { code: "7",  label: "PEGI 7" },
    3: { code: "12", label: "PEGI 12" },
    4: { code: "16", label: "PEGI 16" },
    5: { code: "18", label: "PEGI 18" },
  };
  return map[r] ?? { code: "NR", label: "PEGI Not Rated" };
}

function ceroLabel(r: number) {
  const map: Record<number, { code: string; label: string }> = {
    1: { code: "A", label: "CERO A" },
    2: { code: "B", label: "CERO B" },
    3: { code: "C", label: "CERO C" },
    4: { code: "D", label: "CERO D" },
    5: { code: "Z", label: "CERO Z" },
  };
  return map[r] ?? { code: "NR", label: "CERO Not Rated" };
}

function uskLabel(r: number) {
  const map: Record<number, { code: string; label: string }> = {
    0: { code: "0",  label: "USK 0" },
    1: { code: "6",  label: "USK 6" },
    2: { code: "12", label: "USK 12" },
    3: { code: "16", label: "USK 16" },
    4: { code: "18", label: "USK 18" },
  };
  return map[r] ?? { code: "NR", label: "USK Not Rated" };
}
