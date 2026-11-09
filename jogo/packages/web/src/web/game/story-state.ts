/** Progresso persistido do Modo História. Sem dependências de save.ts (evita ciclo). */
export interface StoryProgress {
  /** capítulos vencidos ao menos uma vez — a recompensa de estreia só paga para ids fora desta lista. */
  cleared: string[];
  /** escolhas narrativas (ex.: rei → "poupou" | "desmontou"). */
  flags: Record<string, string>;
  /** último capítulo aberto, para o mapa focar nele. */
  last: string | null;
}

export const freshStory = (): StoryProgress => ({ cleared: [], flags: {}, last: null });

export function normalizeStory(raw: Partial<StoryProgress> | undefined): StoryProgress {
  if (!raw || typeof raw !== "object") return freshStory();
  const cleared = Array.isArray(raw.cleared) ? [...new Set(raw.cleared.filter((id) => typeof id === "string"))] : [];
  const flags: Record<string, string> = {};
  if (raw.flags && typeof raw.flags === "object") {
    for (const [k, v] of Object.entries(raw.flags)) if (typeof v === "string") flags[k] = v;
  }
  return { cleared, flags, last: typeof raw.last === "string" ? raw.last : null };
}
