/**
 * Panteão — 27 chassis EXCLUSIVOS do catálogo (bronze, prata e ouro), 9 por portal.
 *
 * São robôs normais dos 256 (mesmos sprites de 16 frames, kits e PvP), mas que
 * nenhum torneio premia: o Panteão é a única forma de recrutá-los
 * (cápsulas, contratos e `unlockRobot` os recusam — ver save.ts).
 * Ordem de cada portal: do mais acessível ao mais difícil (define custo/tier).
 */
export type PantheonId = "norse" | "egypt" | "greek";

export interface PantheonDef {
  id: PantheonId;
  name: string;
  realm: string;
  color: string;
  glow: string;
  arena: string;
  lore: string;
  robots: string[];
}

export const PANTHEONS: PantheonDef[] = [
  {
    id: "norse",
    name: "ASGARD",
    realm: "PORTAL DAS RUNAS",
    color: "#7fd4ff",
    glow: "rgba(120,200,255,0.55)",
    arena: "frozen",
    lore: "Forjados no gelo de Niflheim, os chassis de Asgard só respondem a pilotos que já sangraram em batalha.",
    robots: ["ursagrind", "granithor", "lupvexor", "cornubrute", "juggerspine", "mortarhulk", "bastionox", "tectomaul", "draknoir"],
  },
  {
    id: "greek",
    name: "OLIMPO",
    realm: "PORTAL DO TROVÃO",
    color: "#ffd86a",
    glow: "rgba(255,216,106,0.55)",
    arena: "sky",
    lore: "No topo do Olimpo, os reatores-campeões esperam um desafiante digno do raio.",
    robots: ["gwenshield", "simiaslam", "lanceviel", "bushidorne", "stormfang", "hydroknight", "templarion", "tigravox", "chronowake"],
  },
  {
    id: "egypt",
    name: "DUAT",
    realm: "PORTAL DO SOL",
    color: "#ffa04a",
    glow: "rgba(255,160,74,0.55)",
    arena: "volcano",
    lore: "Sob as areias do Duat, os faraós de metal pesam o núcleo de cada piloto contra uma pluma.",
    robots: ["scarabyss", "formicore", "gastropodo", "vespirion", "mantivore", "cicadron", "aranthrax", "xenovyre", "hollowseer"],
  },
];

export const PANTHEON_IDS: readonly string[] = Object.freeze(PANTHEONS.flatMap((p) => p.robots));
export const PANTHEON_OF: Record<string, PantheonId> = Object.fromEntries(
  PANTHEONS.flatMap((p) => p.robots.map((id) => [id, p.id])),
);
const SET = new Set(PANTHEON_IDS);

export function isPantheonRobot(id: string): boolean {
  return SET.has(id);
}

export function robotsOf(p: PantheonId): string[] {
  return PANTHEONS.find((x) => x.id === p)?.robots ?? [];
}
