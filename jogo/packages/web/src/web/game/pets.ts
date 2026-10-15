// Sistema de PETS — companheiros de combate que dao bonus para a equipe inteira.
// Fase G1: 12 especies (arte pixel art em /public/pets/<especie>.png, 192x192)
// combinadas com 12 LINHAGENS (paletas + afinidade secundaria) = 144 pets,
// cada um com 3 estagios de evolucao, 20 niveis e 2 tracos deterministicos.
// Nenhuma arte de personagem nova: as linhagens sao recoloracoes por hue-rotate.

export type PetKind =
  | "striker" // + dano das habilidades
  | "bulwark" // - dano recebido
  | "medic" // regenera HP por turno
  | "sprinter" // + agilidade
  | "reactor" // + MP maximo
  | "vampire" // rouba vida
  | "hunter" // + chance de critico
  | "scavenger" // + ouro nas vitorias
  | "mentor"; // + XP nas vitorias

export type Rarity = "bronze" | "silver" | "gold";

export interface PetDef {
  id: string;
  /** especie base (define a arte) */
  species: string;
  /** linhagem (define a paleta e a afinidade secundaria) */
  strain: string;
  name: string;
  kind: PetKind;
  /** afinidade secundaria, com metade da forca */
  kind2: PetKind;
  element: string;
  rarity: Rarity;
  /** valor no nivel 1, estagio 1 */
  base: number;
  /** incremento por nivel */
  step: number;
  price: number;
  desc: string;
  flavor: string;
  /** nivel do jogador necessario para adotar */
  requiredLevel: number;
  /** 2 tracos passivos */
  traits: string[];
  /** rotacao de matiz aplicada na arte (graus) */
  hue: number;
  sat: number;
  bright: number;
}

export const PET_MAX_LEVEL = 20;
/** limites superiores de cada estagio de evolucao */
export const PET_STAGE_CAPS = [6, 13, 20];
export const PET_STAGE_LABEL = ["FILHOTE", "ADULTO", "ANCIAO"];
/** multiplicador de bonus por estagio */
const STAGE_MULT = [1, 1.35, 1.8];
/** quantidade maxima de pets levados ao mesmo tempo */
export const PET_SLOT_MAX = 3;
/** nivel do jogador que libera cada slot */
export const PET_SLOT_LEVELS = [1, 22, 48];

export const PET_KIND_LABEL: Record<PetKind, string> = {
  striker: "ATAQUE",
  bulwark: "COURACA",
  medic: "REPARO",
  sprinter: "VELOCIDADE",
  reactor: "ENERGIA",
  vampire: "DRENO",
  hunter: "PRECISAO",
  scavenger: "OURO",
  mentor: "EXPERIENCIA",
};

const KIND_DESC: Record<PetKind, (v: string) => string> = {
  striker: (v) => `+${v}% de dano nas habilidades.`,
  bulwark: (v) => `-${v}% de dano recebido pela equipe.`,
  medic: (v) => `Repara ${v}% do HP maximo por turno.`,
  sprinter: (v) => `+${v}% de AGILIDADE da equipe.`,
  reactor: (v) => `+${v}% de MP maximo da equipe.`,
  vampire: (v) => `Recupera ${v}% do dano causado como HP.`,
  hunter: (v) => `+${v}% de chance de golpe critico.`,
  scavenger: (v) => `+${v}% de ouro nas vitorias.`,
  mentor: (v) => `+${v}% de XP nas vitorias.`,
};

// ------------------------------------------------------------------ especies
interface SpeciesDef {
  id: string;
  name: string;
  kind: PetKind;
  element: string;
  tier: number; // 0 bronze, 1 silver, 2 gold
  base: number;
  step: number;
  price: number;
  requiredLevel: number;
  flavor: string;
}

export const SPECIES: SpeciesDef[] = [
  {
    id: "scrapmouse",
    name: "RATO SUCATA",
    kind: "scavenger",
    element: "FERRUGEM",
    tier: 0,
    base: 12,
    step: 4,
    price: 1500,
    requiredLevel: 1,
    flavor: "Cata parafusos no campo de batalha e volta com os bolsos cheios.",
  },
  {
    id: "sparkbat",
    name: "MORCEGO FAISCA",
    kind: "reactor",
    element: "TROVAO",
    tier: 0,
    base: 10,
    step: 3.5,
    price: 2200,
    requiredLevel: 3,
    flavor: "Dorme de cabeca para baixo dentro do reator e acorda carregado.",
  },
  {
    id: "boltpup",
    name: "FILHOTE VOLT",
    kind: "sprinter",
    element: "RAIO",
    tier: 0,
    base: 7,
    step: 2.4,
    price: 2600,
    requiredLevel: 5,
    flavor: "Corre em circulos ao redor da arena antes de cada luta.",
  },
  {
    id: "cogturtle",
    name: "TARTARUGA ENGRENAGEM",
    kind: "bulwark",
    element: "BRONZE",
    tier: 1,
    base: 6,
    step: 1.8,
    price: 5200,
    requiredLevel: 8,
    flavor: "O casco dela ja parou meteoros. Duas vezes.",
  },
  {
    id: "medivine",
    name: "TREPADEIRA MEDICA",
    kind: "medic",
    element: "BIO",
    tier: 1,
    base: 3.5,
    step: 1.1,
    price: 6400,
    requiredLevel: 12,
    flavor: "Enrola nas juntas danificadas e costura o metal com seiva.",
  },
  {
    id: "emberfeline",
    name: "FELINO DE BRASA",
    kind: "striker",
    element: "BRASA",
    tier: 1,
    base: 8,
    step: 2.6,
    price: 7800,
    requiredLevel: 16,
    flavor: "Ronrona a 900 graus. Nao faca carinho sem luva termica.",
  },
  {
    id: "frostowl",
    name: "CORUJA GELIDA",
    kind: "hunter",
    element: "GELO",
    tier: 1,
    base: 6,
    step: 1.8,
    price: 8600,
    requiredLevel: 20,
    flavor: "Enxerga a fresta na blindagem antes de voce mirar.",
  },
  {
    id: "leechdrone",
    name: "DRONE SANGUESSUGA",
    kind: "vampire",
    element: "VAZIO",
    tier: 2,
    base: 8,
    step: 2.2,
    price: 14000,
    requiredLevel: 26,
    flavor: "Suga energia do inimigo e devolve pelo cabo de manutencao.",
  },
  {
    id: "runefox",
    name: "RAPOSA RUNICA",
    kind: "mentor",
    element: "RUNA",
    tier: 2,
    base: 15,
    step: 5,
    price: 16000,
    requiredLevel: 32,
    flavor: "Anota cada combate em tabuas de pedra flutuantes.",
  },
  {
    id: "magmawyrm",
    name: "VERME DE MAGMA",
    kind: "striker",
    element: "MAGMA",
    tier: 2,
    base: 12,
    step: 3.4,
    price: 22000,
    requiredLevel: 45,
    flavor: "Nasceu dentro de uma forja estelar e nunca esfriou.",
  },
  {
    id: "aegisjelly",
    name: "AGUA-VIVA EGIDE",
    kind: "bulwark",
    element: "CRISTAL",
    tier: 2,
    base: 10,
    step: 2.6,
    price: 24000,
    requiredLevel: 58,
    flavor: "Dissolve impacto em luz antes que chegue no chassi.",
  },
  {
    id: "zenithdrake",
    name: "DRAGAO ZENITE",
    kind: "medic",
    element: "ZENITE",
    tier: 2,
    base: 6,
    step: 1.6,
    price: 40000,
    requiredLevel: 75,
    flavor: "O ultimo companheiro. So responde a quem venceu o Coliseu.",
  },
];

export const SPECIES_MAP: Record<string, SpeciesDef> = Object.fromEntries(
  SPECIES.map((s) => [s.id, s]),
);

// ----------------------------------------------------------------- linhagens
interface StrainDef {
  id: string;
  /** sufixo do nome; vazio na linhagem pura */
  title: string;
  element: string;
  kind2: PetKind;
  hue: number;
  sat: number;
  bright: number;
  /** multiplicador de forca */
  mult: number;
  /** degraus de raridade somados ao tier da especie */
  tierUp: number;
  /** nivel de jogador somado ao requisito da especie */
  lvUp: number;
  lore: string;
}

/** A primeira linhagem e a "pura": mantem o id, o nome e a arte originais. */
export const STRAINS: StrainDef[] = [
  {
    id: "puro",
    title: "",
    element: "",
    kind2: "scavenger",
    hue: 0,
    sat: 1,
    bright: 1,
    mult: 1,
    tierUp: 0,
    lvUp: 0,
    lore: "Linhagem original do rancho, criada sem enxertos.",
  },
  {
    id: "ferro",
    title: "FERRICO",
    element: "FERRO",
    kind2: "bulwark",
    hue: 14,
    sat: 0.8,
    bright: 0.95,
    mult: 1.12,
    tierUp: 0,
    lvUp: 4,
    lore: "Criado em fornalhas de fundicao; a pele virou placa.",
  },
  {
    id: "ambar",
    title: "AMBARINO",
    element: "AMBAR",
    kind2: "scavenger",
    hue: 30,
    sat: 1.15,
    bright: 1.05,
    mult: 1.2,
    tierUp: 0,
    lvUp: 8,
    lore: "Cheira ouro fundido a tres arenas de distancia.",
  },
  {
    id: "aureo",
    title: "AUREO",
    element: "OURO",
    kind2: "mentor",
    hue: 46,
    sat: 1.25,
    bright: 1.1,
    mult: 1.32,
    tierUp: 1,
    lvUp: 12,
    lore: "Enfeitado por mestres de torneio como troféu vivo.",
  },
  {
    id: "clorofila",
    title: "SILVESTRE",
    element: "SEIVA",
    kind2: "medic",
    hue: 96,
    sat: 1.05,
    bright: 1,
    mult: 1.24,
    tierUp: 0,
    lvUp: 14,
    lore: "Cresceu nas ruinas verdes do setor abandonado.",
  },
  {
    id: "jade",
    title: "JADE",
    element: "JADE",
    kind2: "sprinter",
    hue: 140,
    sat: 1.1,
    bright: 1.05,
    mult: 1.36,
    tierUp: 1,
    lvUp: 18,
    lore: "Silencioso ao ponto de os sensores nao registrarem.",
  },
  {
    id: "ciano",
    title: "CIANOGENO",
    element: "CIANO",
    kind2: "reactor",
    hue: 194,
    sat: 1.2,
    bright: 1.05,
    mult: 1.44,
    tierUp: 1,
    lvUp: 24,
    lore: "Respira plasma frio e devolve energia limpa.",
  },
  {
    id: "cobalto",
    title: "COBALTICO",
    element: "COBALTO",
    kind2: "hunter",
    hue: 210,
    sat: 1.1,
    bright: 0.98,
    mult: 1.52,
    tierUp: 1,
    lvUp: 30,
    lore: "Olhos calibrados em campo de tiro militar.",
  },
  {
    id: "abissal",
    title: "ABISSAL",
    element: "ABISMO",
    kind2: "vampire",
    hue: 226,
    sat: 0.9,
    bright: 0.82,
    mult: 1.64,
    tierUp: 2,
    lvUp: 38,
    lore: "Voltou da fossa de sucata com algo a mais dentro.",
  },
  {
    id: "violeta",
    title: "VIOLACEO",
    element: "ETER",
    kind2: "striker",
    hue: 278,
    sat: 1.15,
    bright: 1.02,
    mult: 1.76,
    tierUp: 2,
    lvUp: 48,
    lore: "Cada passo abre uma fresta curta no eter.",
  },
  {
    id: "carmim",
    title: "CARMESIM",
    element: "CARMIM",
    kind2: "striker",
    hue: 336,
    sat: 1.3,
    bright: 1.05,
    mult: 1.9,
    tierUp: 2,
    lvUp: 62,
    lore: "Nasceu no fosso vermelho e nunca perdeu uma briga.",
  },
  {
    id: "prisma",
    title: "PRISMATICO",
    element: "PRISMA",
    kind2: "mentor",
    hue: 320,
    sat: 1.6,
    bright: 1.18,
    mult: 2.1,
    tierUp: 2,
    lvUp: 80,
    lore: "Um por geracao. A luz atravessa e sai como outra cor.",
  },
];

export const STRAIN_MAP: Record<string, StrainDef> = Object.fromEntries(
  STRAINS.map((s) => [s.id, s]),
);

// -------------------------------------------------------------------- tracos
export const TRAITS: string[] = [
  "VORAZ · come sucata e ignora 1 turno de veneno",
  "TEIMOSO · nao foge de batalha em desvantagem",
  "NOTURNO · rende mais em arenas escuras",
  "SIMBIOTICO · fortalece o robo com menos HP",
  "MAGNETICO · atrai fragmentos soltos da arena",
  "TERMICO · aquece o chassi antes do primeiro turno",
  "SENTINELA · avisa quando o inimigo carrega especial",
  "RESILIENTE · resiste ao primeiro efeito negativo",
  "FAMINTO · dobra o faro por lingotes na mina",
  "ESTUDIOSO · guarda dados de cada inimigo enfrentado",
  "ACROBATA · esquiva de armadilhas do cenario",
  "BARULHENTO · atrapalha a mira do adversario",
  "LEAL · nunca troca de treinador",
  "ANCESTRAL · sonha com arenas que ainda nao existem",
  "CINTILANTE · brilha quando o critico esta pronto",
  "GELIDO · reduz o superaquecimento das habilidades",
  "CACADOR · rastreia pecas raras no laboratorio",
  "OCO · absorve dano elemental duas vezes por luta",
  "TAGARELA · repete as ordens do treinador em coro",
  "VETERANO · comeca as batalhas com moral cheia",
];

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function traitsFor(id: string): string[] {
  const h = hash(id);
  const a = h % TRAITS.length;
  let b = (Math.floor(h / TRAITS.length) + 7) % TRAITS.length;
  if (b === a) b = (b + 1) % TRAITS.length;
  return [TRAITS[a], TRAITS[b]];
}

const RARITIES: Rarity[] = ["bronze", "silver", "gold"];

function buildPet(sp: SpeciesDef, st: StrainDef): PetDef {
  const id = st.id === "puro" ? sp.id : `${sp.id}_${st.id}`;
  const name = st.title ? `${sp.name} ${st.title}` : sp.name;
  const base = Math.round(sp.base * st.mult * 10) / 10;
  const step = Math.round(sp.step * st.mult * 10) / 10;
  const rarity = RARITIES[Math.min(2, sp.tier + st.tierUp)];
  const price = Math.round((sp.price * Math.pow(st.mult, 2.2)) / 100) * 100;
  return {
    id,
    species: sp.id,
    strain: st.id,
    name,
    kind: sp.kind,
    kind2: st.kind2,
    element: st.element || sp.element,
    rarity,
    base,
    step,
    price,
    desc: KIND_DESC[sp.kind](String(base)),
    flavor: st.id === "puro" ? sp.flavor : st.lore,
    requiredLevel: Math.min(95, sp.requiredLevel + st.lvUp),
    traits: traitsFor(id),
    hue: st.hue,
    sat: st.sat,
    bright: st.bright,
  };
}

export const PETS: PetDef[] = SPECIES.flatMap((sp) =>
  STRAINS.map((st) => buildPet(sp, st)),
);

export const PET_MAP: Record<string, PetDef> = Object.fromEntries(
  PETS.map((p) => [p.id, p]),
);

// ------------------------------------------------------------------ helpers
export function petArt(id: string): string {
  const def = PET_MAP[id];
  return `/pets/${def ? def.species : id}.png`;
}

/** filtro CSS que colore a arte da especie na paleta da linhagem */
export function petFilter(def: PetDef): string | undefined {
  if (def.strain === "puro") return undefined;
  // sepia injeta cor no metal cinza antes do hue-rotate, senao a recoloracao
  // quase nao aparece; o sepia nasce perto de 38deg, entao o offset compensa.
  const sat = (def.sat * 2.6).toFixed(2);
  return `sepia(0.72) saturate(${sat}) hue-rotate(${def.hue - 38}deg) brightness(${def.bright})`;
}

/** estagio de evolucao (0,1,2) do nivel informado */
export function petStage(level: number): number {
  if (level <= PET_STAGE_CAPS[0]) return 0;
  if (level <= PET_STAGE_CAPS[1]) return 1;
  return 2;
}

export function petStageLabel(level: number): string {
  return PET_STAGE_LABEL[petStage(Math.max(1, level))];
}

/** valor do efeito principal no nivel informado (ja com o bonus de estagio) */
export function petValue(def: PetDef, level: number): number {
  if (level <= 0) return 0;
  const raw = (def.base + def.step * (level - 1)) * STAGE_MULT[petStage(level)];
  return Math.round(raw * 10) / 10;
}

/** valor do efeito secundario: metade do principal */
export function petValue2(def: PetDef, level: number): number {
  return Math.round(petValue(def, level) * 0.5 * 10) / 10;
}

/** custo em ouro para subir do nivel atual para o proximo */
export function petUpgradeCost(def: PetDef, current: number): number {
  return Math.round((def.price * 0.32 * Math.pow(current + 1, 1.22)) / 50) * 50;
}

/** lingotes exigidos ao cruzar a fronteira de um estagio (0 nos demais niveis) */
export function petUpgradeBars(def: PetDef, current: number): number {
  const next = current + 1;
  if (next !== PET_STAGE_CAPS[0] + 1 && next !== PET_STAGE_CAPS[1] + 1) return 0;
  const tier = RARITIES.indexOf(def.rarity);
  return (next === PET_STAGE_CAPS[0] + 1 ? 6 : 14) + tier * 4;
}

/** quantos pets o jogador pode levar ao mesmo tempo */
export function petSlots(playerLevel: number): number {
  return PET_SLOT_LEVELS.filter((lv) => playerLevel >= lv).length;
}

export function petPower(def: PetDef, level: number): number {
  return Math.round(petValue(def, Math.max(1, level)) * 10 + def.requiredLevel * 2);
}
