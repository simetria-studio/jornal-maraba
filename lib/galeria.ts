export type FotoGaleria = { src: string; alt: string };
export const MAX_GALERIA = 12;

/** Lê a coluna `galeria` (JSON) com segurança. */
export function lerGaleria(bruto: string | undefined): FotoGaleria[] {
  try {
    const v = JSON.parse(bruto || "[]");
    return Array.isArray(v)
      ? v.filter((f) => f && typeof f.src === "string").map((f) => ({ src: f.src as string, alt: String(f.alt ?? "") }))
      : [];
  } catch {
    return [];
  }
}
