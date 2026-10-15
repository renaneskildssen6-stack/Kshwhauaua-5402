// Sistema de CARDS de combate — cada card altera regras da batalha.
// Arte pixel art em /public/cards/<id>.png (192x192).
// O jogador equipa ate 3 cards respeitando o orcamento de energia do deck.
// Cards combinam entre si por TAGS (sinergias) e por COMBOS nomeados.

/** Modificadores agregados que um deck entrega ao lutador. */
export type CardStat =
  | "str" // % de forca
  | "def" // % de defesa
  | "agl" // % de agilidade
  | "hp" // % de HP maximo
  | "mp" // % de MP maximo
  | "crit" // + pontos percentuais de critico
  | "evade" // + pontos percentuais de esquiva
  | "amp" // % de poder das habilidades
  | "aegis" // % de reducao de dano recebido
  | "lifesteal" // % do dano causado convertido em cura
  | "thorns" // % do dano recebido devolvido
  | "regen" // % do HP maximo regenerado por turno
  | "mpregen" // + MP por turno
  | "opening" // % de dano extra nos 2 primeiros turnos
  | "rage" // % de dano extra abaixo de 35% de HP
  | "resist" // % de chance de ignorar efeito negativo recebido
  | "venom" // % de poder dos efeitos aplicados
  | "gold" // % de ouro extra na vitoria
  | "xp"; // % de XP extra na vitoria

export type CardMods = Partial<Record<CardStat, number>>;

export type CardTag =
  | "chama"
  | "gelo"
  | "trovao"
  | "sombra"
  | "ferro"
  | "nano"
  | "arcano"
  | "fera"
  | "protocolo"
  | "caos";

export type CardRarity = "bronze" | "prata" | "ouro" | "prisma";

/** Carta base desenhada a mao (30 no total, uma arte cada). */
export interface BaseCard {
  id: string;
  name: string;
  rarity: CardRarity;
  element: string;
  /** custo de energia no deck */
  cost: number;
  tags: CardTag[];
  price: number;
  requiredLevel: number;
  desc: string;
  flavor: string;
  mods: CardMods;
}

/** Selos de forja: cada carta base existe em 7 versoes seladas. */
export type CardSealId =
  | "bruto"
  | "rubro"
  | "polar"
  | "voltaico"
  | "umbral"
  | "aureo"
  | "prisma";

export interface SealDef {
  id: CardSealId;
  name: string;
  /** multiplicador aplicado aos mods da carta base */
  mult: number;
  /** energia extra no deck */
  costDelta: number;
  /** tag adicionada pelo selo (undefined no selo bruto) */
  extraTag?: CardTag;
  /** mods proprios do selo, somados depois do multiplicador */
  bonus: CardMods;
  priceMult: number;
  /** degraus de raridade adicionados */
  rarityUp: number;
  /** niveis exigidos acima da carta base */
  levelAdd: number;
  /** recoloracao da arte base (filtro CSS) */
  hue: number;
  sat: number;
  bright: number;
  flavor: string;
}

export interface CardDef extends BaseCard {
  /** id da carta base (arte compartilhada) */
  base: string;
  seal: CardSealId;
  sealName: string;
}

export interface SynergyDef {
  id: string;
  name: string;
  desc: string;
  /** ativa quando o deck tem >= count cards com a tag */
  tag?: { tag: CardTag; count: number };
  /** ativa quando o deck tem >= count cards do mesmo selo */
  seal?: { seal: CardSealId; count: number };
  /** ativa quando todos esses cards estao equipados */
  cards?: string[];
  mods: CardMods;
}

/** Teto absoluto de cards equipados (o jogador libera slots por nivel). */
export const MAX_CARDS = 5;
/** Nivel do piloto que libera cada slot de deck. */
export const CARD_SLOT_LEVELS = [1, 1, 1, 20, 45];
/** Slots de deck liberados pelo nivel do piloto. */
export function cardSlots(playerLevel: number): number {
  return CARD_SLOT_LEVELS.filter((l) => playerLevel >= l).length;
}

/** Refino: cada card possuido sobe ate o nivel 10, ampliando seus mods. */
export const CARD_MAX_REFINE = 10;
export function refineMult(refine: number): number {
  const r = Math.max(1, Math.min(CARD_MAX_REFINE, refine || 1));
  return 1 + 0.09 * (r - 1);
}

export const CARD_STAT_LABEL: Record<CardStat, string> = {
  str: "FORCA",
  def: "DEFESA",
  agl: "AGILIDADE",
  hp: "HP MAX",
  mp: "MP MAX",
  crit: "CRITICO",
  evade: "ESQUIVA",
  amp: "PODER",
  aegis: "COURACA",
  lifesteal: "DRENO",
  thorns: "ESPINHOS",
  regen: "REPARO",
  mpregen: "MP/TURNO",
  opening: "ABERTURA",
  rage: "FURIA",
  resist: "RESISTENCIA",
  venom: "TOXINA",
  gold: "OURO",
  xp: "XP",
};

export const CARD_TAG_LABEL: Record<CardTag, string> = {
  chama: "CHAMA",
  gelo: "GELO",
  trovao: "TROVAO",
  sombra: "SOMBRA",
  ferro: "FERRO",
  nano: "NANO",
  arcano: "ARCANO",
  fera: "FERA",
  protocolo: "PROTOCOLO",
  caos: "CAOS",
};

export const CARD_RARITY_COLOR: Record<CardRarity, string> = {
  bronze: "#c98a4b",
  prata: "#cfd8e3",
  ouro: "#ffd24a",
  prisma: "#b06bff",
};

/** Orcamento de energia do deck, cresce com o nivel do piloto. */
export function deckBudget(playerLevel: number): number {
  return 6 + Math.min(16, Math.floor(playerLevel / 4));
}

const BASE_CARDS: BaseCard[] = [
  // ---------------------------------------------------------------- bronze
  {
    id: "chama_viva",
    name: "CHAMA VIVA",
    rarity: "bronze",
    element: "FOGO",
    cost: 2,
    tags: ["chama"],
    price: 1200,
    requiredLevel: 1,
    desc: "+10% de poder das habilidades.",
    flavor: "A fornalha nunca dorme dentro do peito do mecha.",
    mods: { amp: 10 },
  },
  {
    id: "placa_bruta",
    name: "PLACA BRUTA",
    rarity: "bronze",
    element: "FERRO",
    cost: 2,
    tags: ["ferro"],
    price: 1200,
    requiredLevel: 1,
    desc: "+12% de DEFESA e +6% de HP maximo.",
    flavor: "Sucata soldada as pressas, mas aguenta o tranco.",
    mods: { def: 12, hp: 6 },
  },
  {
    id: "capacitor_leve",
    name: "CAPACITOR LEVE",
    rarity: "bronze",
    element: "TROVAO",
    cost: 2,
    tags: ["trovao"],
    price: 1400,
    requiredLevel: 2,
    desc: "+3 de MP por turno.",
    flavor: "Zumbe baixinho enquanto recarrega.",
    mods: { mpregen: 3 },
  },
  {
    id: "passo_curto",
    name: "PASSO CURTO",
    rarity: "bronze",
    element: "VENTO",
    cost: 2,
    tags: ["fera"],
    price: 1400,
    requiredLevel: 2,
    desc: "+10% de AGILIDADE e +3% de esquiva.",
    flavor: "Tres passos falsos para cada passo verdadeiro.",
    mods: { agl: 10, evade: 3 },
  },
  {
    id: "cofre_ferrugem",
    name: "COFRE DE FERRUGEM",
    rarity: "bronze",
    element: "SUCATA",
    cost: 1,
    tags: ["ferro"],
    price: 1600,
    requiredLevel: 3,
    desc: "+25% de ouro nas vitorias.",
    flavor: "Cada vitoria enche mais um pouco o cofre.",
    mods: { gold: 25 },
  },
  {
    id: "manual_piloto",
    name: "MANUAL DO PILOTO",
    rarity: "bronze",
    element: "DADOS",
    cost: 1,
    tags: ["protocolo"],
    price: 1600,
    requiredLevel: 3,
    desc: "+25% de XP nas vitorias.",
    flavor: "Anotacoes rabiscadas por cem pilotos antes de voce.",
    mods: { xp: 25 },
  },
  {
    id: "nanoreparo",
    name: "NANORREPARO",
    rarity: "bronze",
    element: "NANO",
    cost: 2,
    tags: ["nano"],
    price: 1800,
    requiredLevel: 4,
    desc: "Regenera 4% do HP maximo por turno.",
    flavor: "Um enxame invisivel costurando o casco.",
    mods: { regen: 4 },
  },
  {
    id: "presa_gelada",
    name: "PRESA GELADA",
    rarity: "bronze",
    element: "GELO",
    cost: 2,
    tags: ["gelo"],
    price: 1800,
    requiredLevel: 4,
    desc: "+20% de poder dos efeitos aplicados.",
    flavor: "O frio entra pelas juntas e fica.",
    mods: { venom: 20 },
  },

  // ---------------------------------------------------------------- prata
  {
    id: "forja_furiosa",
    name: "FORJA FURIOSA",
    rarity: "prata",
    element: "FOGO",
    cost: 3,
    tags: ["chama", "caos"],
    price: 4200,
    requiredLevel: 6,
    desc: "+14% de FORCA e +18% de dano abaixo de 35% de HP.",
    flavor: "Quanto mais amassado, mais quente ele fica.",
    mods: { str: 14, rage: 18 },
  },
  {
    id: "muralha_polar",
    name: "MURALHA POLAR",
    rarity: "prata",
    element: "GELO",
    cost: 3,
    tags: ["gelo", "ferro"],
    price: 4200,
    requiredLevel: 6,
    desc: "+12% de couraca e +10% de HP maximo.",
    flavor: "Uma parede de gelo que responde com estilhaco.",
    mods: { aegis: 12, hp: 10 },
  },
  {
    id: "descarga_tripla",
    name: "DESCARGA TRIPLA",
    rarity: "prata",
    element: "TROVAO",
    cost: 3,
    tags: ["trovao"],
    price: 4600,
    requiredLevel: 8,
    desc: "+8% de critico e +8% de AGILIDADE.",
    flavor: "Tres arcos saem antes do inimigo piscar.",
    mods: { crit: 8, agl: 8 },
  },
  {
    id: "manto_sombrio",
    name: "MANTO SOMBRIO",
    rarity: "prata",
    element: "SOMBRA",
    cost: 3,
    tags: ["sombra"],
    price: 4600,
    requiredLevel: 8,
    desc: "+8% de esquiva e +10% de dreno de vida.",
    flavor: "Some no escuro e volta com a vida do outro.",
    mods: { evade: 8, lifesteal: 10 },
  },
  {
    id: "protocolo_ferro",
    name: "PROTOCOLO FERRO",
    rarity: "prata",
    element: "DADOS",
    cost: 3,
    tags: ["protocolo", "ferro"],
    price: 5000,
    requiredLevel: 10,
    desc: "+15% de DEFESA e 25% de resistencia a efeitos.",
    flavor: "Rotina de emergencia gravada em memoria fria.",
    mods: { def: 15, resist: 25 },
  },
  {
    id: "enxame_nano",
    name: "ENXAME NANO",
    rarity: "prata",
    element: "NANO",
    cost: 3,
    tags: ["nano", "arcano"],
    price: 5000,
    requiredLevel: 10,
    desc: "Regenera 6% do HP por turno e +2 de MP por turno.",
    flavor: "Milhoes de operarios microscopicos em turno dobrado.",
    mods: { regen: 6, mpregen: 2 },
  },
  {
    id: "instinto_fera",
    name: "INSTINTO DE FERA",
    rarity: "prata",
    element: "BESTA",
    cost: 3,
    tags: ["fera", "caos"],
    price: 5400,
    requiredLevel: 12,
    desc: "+22% de dano nos 2 primeiros turnos e +6% de critico.",
    flavor: "Ataca antes de pensar. Costuma dar certo.",
    mods: { opening: 22, crit: 6 },
  },
  {
    id: "espinho_reativo",
    name: "ESPINHO REATIVO",
    rarity: "prata",
    element: "FERRO",
    cost: 3,
    tags: ["ferro", "caos"],
    price: 5400,
    requiredLevel: 12,
    desc: "Devolve 18% do dano recebido e +8% de DEFESA.",
    flavor: "Bater nele custa caro.",
    mods: { thorns: 18, def: 8 },
  },

  // ---------------------------------------------------------------- ouro
  {
    id: "coroa_incandescente",
    name: "COROA INCANDESCENTE",
    rarity: "ouro",
    element: "FOGO",
    cost: 4,
    tags: ["chama", "arcano"],
    price: 12000,
    requiredLevel: 16,
    desc: "+22% de poder das habilidades e +10% de FORCA.",
    flavor: "Coroa fundida com o nucleo de uma estrela morta.",
    mods: { amp: 22, str: 10 },
  },
  {
    id: "juizo_congelante",
    name: "JUIZO CONGELANTE",
    rarity: "ouro",
    element: "GELO",
    cost: 4,
    tags: ["gelo", "protocolo"],
    price: 12000,
    requiredLevel: 16,
    desc: "+35% de poder dos efeitos e +14% de couraca.",
    flavor: "O veredito chega em forma de geada.",
    mods: { venom: 35, aegis: 14 },
  },
  {
    id: "tempestade_permanente",
    name: "TEMPESTADE PERMANENTE",
    rarity: "ouro",
    element: "TROVAO",
    cost: 4,
    tags: ["trovao", "caos"],
    price: 13000,
    requiredLevel: 18,
    desc: "+12% de critico, +12% de AGILIDADE e +4 de MP por turno.",
    flavor: "Uma nuvem particular que segue o mecha.",
    mods: { crit: 12, agl: 12, mpregen: 4 },
  },
  {
    id: "devorador_de_luz",
    name: "DEVORADOR DE LUZ",
    rarity: "ouro",
    element: "SOMBRA",
    cost: 4,
    tags: ["sombra", "fera"],
    price: 13000,
    requiredLevel: 18,
    desc: "+20% de dreno de vida e +12% de FORCA.",
    flavor: "Come o brilho do adversario e engorda com ele.",
    mods: { lifesteal: 20, str: 12 },
  },
  {
    id: "nucleo_arcano",
    name: "NUCLEO ARCANO",
    rarity: "ouro",
    element: "ARCANO",
    cost: 4,
    tags: ["arcano", "nano"],
    price: 14000,
    requiredLevel: 20,
    desc: "+25% de MP maximo, +5 de MP por turno e +12% de poder.",
    flavor: "Gira sozinho, alimentado por uma equacao inacabada.",
    mods: { mp: 25, mpregen: 5, amp: 12 },
  },
  {
    id: "titan_de_aco",
    name: "TITA DE ACO",
    rarity: "ouro",
    element: "FERRO",
    cost: 5,
    tags: ["ferro", "protocolo"],
    price: 15000,
    requiredLevel: 22,
    desc: "+20% de HP maximo, +18% de DEFESA e 20% de couraca.",
    flavor: "Nao corre. Nao precisa.",
    mods: { hp: 20, def: 18, aegis: 20 },
  },
  {
    id: "cacador_selvagem",
    name: "CACADOR SELVAGEM",
    rarity: "ouro",
    element: "BESTA",
    cost: 4,
    tags: ["fera", "sombra"],
    price: 14000,
    requiredLevel: 20,
    desc: "+30% de dano de abertura, +10% de esquiva.",
    flavor: "Caca em silencio e termina no primeiro bote.",
    mods: { opening: 30, evade: 10 },
  },
  {
    id: "diretriz_zero",
    name: "DIRETRIZ ZERO",
    rarity: "ouro",
    element: "DADOS",
    cost: 4,
    tags: ["protocolo", "arcano"],
    price: 15000,
    requiredLevel: 22,
    desc: "45% de resistencia a efeitos e +15% de DEFESA e AGILIDADE.",
    flavor: "Quando tudo falha, a diretriz zero assume o controle.",
    mods: { resist: 45, def: 15, agl: 15 },
  },

  // ---------------------------------------------------------------- prisma
  {
    id: "supernova_privada",
    name: "SUPERNOVA PRIVADA",
    rarity: "prisma",
    element: "FOGO",
    cost: 5,
    tags: ["chama", "caos", "arcano"],
    price: 34000,
    requiredLevel: 28,
    desc: "+30% de poder, +25% de furia, mas -10% de HP maximo.",
    flavor: "Guarda uma estrela colapsando dentro do reator.",
    mods: { amp: 30, rage: 25, hp: -10 },
  },
  {
    id: "eco_do_vazio",
    name: "ECO DO VAZIO",
    rarity: "prisma",
    element: "SOMBRA",
    cost: 5,
    tags: ["sombra", "arcano", "nano"],
    price: 34000,
    requiredLevel: 28,
    desc: "+25% de dreno, 8% de regeneracao e +12% de esquiva.",
    flavor: "O que ele absorve nunca volta.",
    mods: { lifesteal: 25, regen: 8, evade: 12 },
  },
  {
    id: "coracao_da_tempestade",
    name: "CORACAO DA TEMPESTADE",
    rarity: "prisma",
    element: "TROVAO",
    cost: 5,
    tags: ["trovao", "fera", "caos"],
    price: 38000,
    requiredLevel: 32,
    desc: "+18% de critico, +20% de AGILIDADE e +15% de FORCA.",
    flavor: "Bate como trovao e sai antes do relampago.",
    mods: { crit: 18, agl: 20, str: 15 },
  },
  {
    id: "fortaleza_prisma",
    name: "FORTALEZA PRISMA",
    rarity: "prisma",
    element: "PRISMA",
    cost: 6,
    tags: ["ferro", "gelo", "protocolo"],
    price: 38000,
    requiredLevel: 32,
    desc: "+28% de couraca, +25% de HP e devolve 25% do dano.",
    flavor: "Cada face do prisma reflete um golpe diferente.",
    mods: { aegis: 28, hp: 25, thorns: 25 },
  },
  {
    id: "singularidade",
    name: "SINGULARIDADE",
    rarity: "prisma",
    element: "ARCANO",
    cost: 6,
    tags: ["arcano", "caos", "nano"],
    price: 45000,
    requiredLevel: 36,
    desc: "+20% em todos os atributos e +6 de MP por turno.",
    flavor: "Um ponto onde as regras do combate se dobram.",
    mods: { str: 20, def: 20, agl: 20, hp: 20, mp: 20, mpregen: 6 },
  },
  {
    id: "protocolo_omega",
    name: "PROTOCOLO OMEGA",
    rarity: "prisma",
    element: "DADOS",
    cost: 6,
    tags: ["protocolo", "nano", "ferro"],
    price: 45000,
    requiredLevel: 36,
    desc: "60% de resistencia, 10% de regeneracao e +20% de couraca.",
    flavor: "A ultima rotina antes do desligamento definitivo.",
    mods: { resist: 60, regen: 10, aegis: 20 },
  },
];

export { BASE_CARDS };

// ------------------------------------------------------------------ selos
export const SEALS: SealDef[] = [
  {
    id: "bruto",
    name: "BRUTO",
    mult: 1,
    costDelta: 0,
    bonus: {},
    priceMult: 1,
    rarityUp: 0,
    levelAdd: 0,
    hue: 0,
    sat: 1,
    bright: 1,
    flavor: "Forja original, sem selo aplicado.",
  },
  {
    id: "rubro",
    name: "RUBRO",
    mult: 1.25,
    costDelta: 1,
    extraTag: "chama",
    bonus: { rage: 8 },
    priceMult: 3.2,
    rarityUp: 1,
    levelAdd: 4,
    hue: -22,
    sat: 1.5,
    bright: 1.02,
    flavor: "Selo rubro: a carta foi temperada na fornalha e nunca esfriou.",
  },
  {
    id: "polar",
    name: "POLAR",
    mult: 1.25,
    costDelta: 1,
    extraTag: "gelo",
    bonus: { aegis: 6 },
    priceMult: 3.2,
    rarityUp: 1,
    levelAdd: 4,
    hue: 150,
    sat: 1.1,
    bright: 1.14,
    flavor: "Selo polar: cada linha do circuito respira frio absoluto.",
  },
  {
    id: "voltaico",
    name: "VOLTAICO",
    mult: 1.35,
    costDelta: 1,
    extraTag: "trovao",
    bonus: { crit: 6 },
    priceMult: 4.5,
    rarityUp: 1,
    levelAdd: 9,
    hue: 78,
    sat: 1.7,
    bright: 1.16,
    flavor: "Selo voltaico: a carta zumbe na mao antes de ser jogada.",
  },
  {
    id: "umbral",
    name: "UMBRAL",
    mult: 1.35,
    costDelta: 1,
    extraTag: "sombra",
    bonus: { lifesteal: 8 },
    priceMult: 4.5,
    rarityUp: 1,
    levelAdd: 9,
    hue: 220,
    sat: 1.2,
    bright: 0.88,
    flavor: "Selo umbral: o desenho muda quando ninguem esta olhando.",
  },
  {
    id: "aureo",
    name: "AUREO",
    mult: 1.5,
    costDelta: 2,
    extraTag: "protocolo",
    bonus: { gold: 18, xp: 18 },
    priceMult: 6,
    rarityUp: 2,
    levelAdd: 16,
    hue: 12,
    sat: 1.9,
    bright: 1.2,
    flavor: "Selo aureo: emitido pela propria Liga, em folha de ouro.",
  },
  {
    id: "prisma",
    name: "PRISMA",
    mult: 1.8,
    costDelta: 2,
    extraTag: "arcano",
    bonus: { amp: 10, resist: 10 },
    priceMult: 9,
    rarityUp: 2,
    levelAdd: 24,
    hue: 265,
    sat: 1.8,
    bright: 1.08,
    flavor: "Selo prisma: refrata a realidade em sete versoes do mesmo golpe.",
  },
];

export const CARD_SEAL_MAP: Record<string, SealDef> = Object.fromEntries(
  SEALS.map((s) => [s.id, s]),
);

const RARITY_ORDER: CardRarity[] = ["bronze", "prata", "ouro", "prisma"];

/** Descricao automatica a partir dos mods (usada nas versoes seladas). */
export function modsDesc(mods: CardMods): string {
  const parts = (Object.entries(mods) as [CardStat, number][])
    .filter(([, v]) => v !== 0)
    .map(([k, v]) => `${v > 0 ? "+" : ""}${v}${k === "mpregen" ? "" : "%"} de ${CARD_STAT_LABEL[k]}`);
  return `${parts.join(", ")}.`;
}

function buildCard(base: BaseCard, seal: SealDef): CardDef {
  const mods: CardMods = {};
  for (const [k, v] of Object.entries(base.mods) as [CardStat, number][]) {
    mods[k] = Math.round(v * seal.mult * 10) / 10;
  }
  for (const [k, v] of Object.entries(seal.bonus) as [CardStat, number][]) {
    mods[k] = Math.round(((mods[k] ?? 0) + v) * 10) / 10;
  }
  const tags =
    seal.extraTag && !base.tags.includes(seal.extraTag)
      ? [...base.tags, seal.extraTag]
      : [...base.tags];
  const rIdx = Math.min(
    RARITY_ORDER.length - 1,
    RARITY_ORDER.indexOf(base.rarity) + seal.rarityUp,
  );
  return {
    ...base,
    id: seal.id === "bruto" ? base.id : `${base.id}_${seal.id}`,
    base: base.id,
    seal: seal.id,
    sealName: seal.name,
    name: seal.id === "bruto" ? base.name : `${base.name} ${seal.name}`,
    rarity: RARITY_ORDER[rIdx],
    cost: base.cost + seal.costDelta,
    tags,
    price: Math.round((base.price * seal.priceMult) / 50) * 50,
    requiredLevel: Math.min(70, base.requiredLevel + seal.levelAdd),
    desc: seal.id === "bruto" ? base.desc : modsDesc(mods),
    flavor: seal.id === "bruto" ? base.flavor : seal.flavor,
    mods,
  };
}

/** 30 cartas base x 7 selos = 210 cards jogaveis. */
export const CARDS: CardDef[] = BASE_CARDS.flatMap((b) => SEALS.map((s) => buildCard(b, s)));

export const CARD_MAP: Record<string, CardDef> = Object.fromEntries(
  CARDS.map((c) => [c.id, c]),
);

export const BASE_CARD_MAP: Record<string, BaseCard> = Object.fromEntries(
  BASE_CARDS.map((c) => [c.id, c]),
);

/** Todas as versoes seladas de uma carta base, na ordem dos selos. */
export function sealedVariants(baseId: string): CardDef[] {
  return SEALS.map((s) => CARD_MAP[s.id === "bruto" ? baseId : `${baseId}_${s.id}`]).filter(
    (c): c is CardDef => Boolean(c),
  );
}

/** Filtro CSS que recolore a arte base conforme o selo. */
export function cardFilter(def: CardDef): string | undefined {
  const s = CARD_SEAL_MAP[def.seal];
  if (!s || s.id === "bruto") return undefined;
  return `sepia(0.62) saturate(${(s.sat * 2.4).toFixed(2)}) hue-rotate(${s.hue - 38}deg) brightness(${s.bright})`;
}

/** Mods efetivos de um card no nivel de refino informado. */
export function cardModsAt(def: CardDef, refine = 1): CardMods {
  const m = refineMult(refine);
  const out: CardMods = {};
  for (const [k, v] of Object.entries(def.mods) as [CardStat, number][]) {
    out[k] = Math.round(v * m * 10) / 10;
  }
  return out;
}

/** Custo em ouro para subir um nivel de refino. */
export function refineCost(def: CardDef, current: number): number {
  const cur = Math.max(1, current);
  return Math.round((def.price * 0.3 * Math.pow(cur, 1.25)) / 50) * 50;
}

/** Lingotes exigidos nos marcos de refino (4 e 8). */
export function refineBars(def: CardDef, current: number): number {
  const next = Math.max(1, current) + 1;
  const tier = RARITY_ORDER.indexOf(def.rarity);
  if (next === 4) return 6 + tier * 3;
  if (next === 8) return 14 + tier * 4;
  return 0;
}

/** Poder relativo de um card, usado para ordenar listas. */
export function cardPower(def: CardDef, refine = 1): number {
  return Object.values(cardModsAt(def, refine)).reduce((a, b) => a + b, 0);
}

// ------------------------------------------------------------- sinergias
// Tres camadas: por TAG (2/3/4 cards), por SELO (2/3 cards) e COMBOS nomeados.

interface TagSynRow {
  n2: string;
  m2: CardMods;
  n3: string;
  m3: CardMods;
  n4: string;
  m4: CardMods;
}

const TAG_SYN: Record<CardTag, TagSynRow> = {
  chama: {
    n2: "COMBUSTAO EM CADEIA",
    m2: { amp: 15, rage: 10 },
    n3: "INFERNO TOTAL",
    m3: { amp: 25, str: 15 },
    n4: "NOVA DE FORJA",
    m4: { amp: 40, str: 25, rage: 20 },
  },
  gelo: {
    n2: "ZERO ABSOLUTO",
    m2: { venom: 20, aegis: 8 },
    n3: "INVERNO PERPETUO",
    m3: { venom: 35, aegis: 16, def: 12 },
    n4: "ERA GLACIAL",
    m4: { venom: 55, aegis: 26, def: 20, resist: 20 },
  },
  trovao: {
    n2: "SOBRECARGA",
    m2: { crit: 8, mpregen: 3 },
    n3: "ARCO ETERNO",
    m3: { crit: 16, mpregen: 5, agl: 12 },
    n4: "TEMPESTADE SINGULAR",
    m4: { crit: 26, mpregen: 8, agl: 20, amp: 15 },
  },
  sombra: {
    n2: "PREDADOR NOTURNO",
    m2: { lifesteal: 10, evade: 6 },
    n3: "VEU SEM FUNDO",
    m3: { lifesteal: 20, evade: 12, venom: 15 },
    n4: "ECLIPSE TOTAL",
    m4: { lifesteal: 32, evade: 18, venom: 25, amp: 15 },
  },
  ferro: {
    n2: "LINHA DE BLINDAGEM",
    m2: { def: 12, thorns: 10 },
    n3: "BASTIAO ABSOLUTO",
    m3: { aegis: 20, hp: 15 },
    n4: "CIDADELA DE ACO",
    m4: { aegis: 30, hp: 25, thorns: 20, def: 18 },
  },
  nano: {
    n2: "COLONIA ATIVA",
    m2: { regen: 5 },
    n3: "ENXAME EXPONENCIAL",
    m3: { regen: 10, hp: 12 },
    n4: "BIOMASSA TOTAL",
    m4: { regen: 16, hp: 20, aegis: 15 },
  },
  arcano: {
    n2: "CIRCUITO RUNICO",
    m2: { mp: 15, amp: 10 },
    n3: "CONVERGENCIA ARCANA",
    m3: { amp: 20, mpregen: 5 },
    n4: "GRIMORIO VIVO",
    m4: { amp: 35, mp: 30, mpregen: 8 },
  },
  fera: {
    n2: "MATILHA",
    m2: { agl: 12, opening: 15 },
    n3: "INSTINTO ALFA",
    m3: { agl: 20, opening: 25, crit: 10 },
    n4: "REVOADA SELVAGEM",
    m4: { agl: 30, opening: 40, crit: 18, str: 15 },
  },
  protocolo: {
    n2: "REDE DE COMANDO",
    m2: { resist: 20, def: 8 },
    n3: "KERNEL BLINDADO",
    m3: { resist: 35, def: 16, aegis: 12 },
    n4: "DIRETRIZ TOTAL",
    m4: { resist: 55, def: 24, aegis: 20, hp: 15 },
  },
  caos: {
    n2: "ENTROPIA",
    m2: { str: 12, rage: 12 },
    n3: "COLAPSO",
    m3: { crit: 20, rage: 20 },
    n4: "FIM DE CICLO",
    m4: { crit: 30, rage: 35, str: 25 },
  },
};

const TAG_SYNERGIES: SynergyDef[] = (Object.keys(TAG_SYN) as CardTag[]).flatMap((tag) => {
  const row = TAG_SYN[tag];
  const label = CARD_TAG_LABEL[tag];
  return [
    {
      id: `s_${tag}2`,
      name: row.n2,
      desc: `2 cards ${label}: ${modsDesc(row.m2)}`,
      tag: { tag, count: 2 },
      mods: row.m2,
    },
    {
      id: `s_${tag}3`,
      name: row.n3,
      desc: `3 cards ${label}: ${modsDesc(row.m3)}`,
      tag: { tag, count: 3 },
      mods: row.m3,
    },
    {
      id: `s_${tag}4`,
      name: row.n4,
      desc: `4 cards ${label}: ${modsDesc(row.m4)}`,
      tag: { tag, count: 4 },
      mods: row.m4,
    },
  ];
});

const SEAL_SYN: Record<CardSealId, { n2: string; m2: CardMods; n3: string; m3: CardMods }> = {
  bruto: {
    n2: "FORJA CRUA",
    m2: { str: 8, def: 8 },
    n3: "OFICIO DO MARTELO",
    m3: { str: 16, def: 16, hp: 10 },
  },
  rubro: {
    n2: "BRASA GEMEA",
    m2: { rage: 15, amp: 10 },
    n3: "TRIPLICE FORNALHA",
    m3: { rage: 30, amp: 20, str: 15 },
  },
  polar: {
    n2: "SOPRO GEMEO",
    m2: { aegis: 12, resist: 15 },
    n3: "TRIPLICE INVERNO",
    m3: { aegis: 24, resist: 30, def: 15 },
  },
  voltaico: {
    n2: "ARCO GEMEO",
    m2: { crit: 10, agl: 10 },
    n3: "TRIPLICE DESCARGA",
    m3: { crit: 22, agl: 20, mpregen: 5 },
  },
  umbral: {
    n2: "SOMBRA GEMEA",
    m2: { lifesteal: 14, evade: 8 },
    n3: "TRIPLICE VEU",
    m3: { lifesteal: 28, evade: 16, venom: 20 },
  },
  aureo: {
    n2: "SELO DA LIGA",
    m2: { gold: 30, xp: 30 },
    n3: "TESOURO DA LIGA",
    m3: { gold: 60, xp: 60, amp: 15 },
  },
  prisma: {
    n2: "REFRACAO DUPLA",
    m2: { amp: 20, resist: 20 },
    n3: "PRISMA PERFEITO",
    m3: { amp: 40, resist: 40, aegis: 20, crit: 15 },
  },
};

const SEAL_SYNERGIES: SynergyDef[] = (Object.keys(SEAL_SYN) as CardSealId[]).flatMap((seal) => {
  const row = SEAL_SYN[seal];
  return [
    {
      id: `sl_${seal}2`,
      name: row.n2,
      desc: `2 cards do selo ${seal.toUpperCase()}: ${modsDesc(row.m2)}`,
      seal: { seal, count: 2 },
      mods: row.m2,
    },
    {
      id: `sl_${seal}3`,
      name: row.n3,
      desc: `3 cards do selo ${seal.toUpperCase()}: ${modsDesc(row.m3)}`,
      seal: { seal, count: 3 },
      mods: row.m3,
    },
  ];
});

const COMBOS: SynergyDef[] = [
  {
    id: "c_vulcao",
    name: "COMBO: VULCAO DE ACO",
    desc: "FORJA FURIOSA + PLACA BRUTA: +15% de FORCA e +12% de couraca.",
    cards: ["forja_furiosa", "placa_bruta"],
    mods: { str: 15, aegis: 12 },
  },
  {
    id: "c_vampiro",
    name: "COMBO: SEDE ETERNA",
    desc: "MANTO SOMBRIO + DEVORADOR DE LUZ: +20% de dreno e +10% de poder.",
    cards: ["manto_sombrio", "devorador_de_luz"],
    mods: { lifesteal: 20, amp: 10 },
  },
  {
    id: "c_raio",
    name: "COMBO: RELAMPAGO DUPLO",
    desc: "DESCARGA TRIPLA + TEMPESTADE PERMANENTE: +15% de critico e +10% de AGILIDADE.",
    cards: ["descarga_tripla", "tempestade_permanente"],
    mods: { crit: 15, agl: 10 },
  },
  {
    id: "c_maquina",
    name: "COMBO: MAQUINA PERFEITA",
    desc: "PROTOCOLO FERRO + DIRETRIZ ZERO + TITA DE ACO: +25% de couraca e 25% de resistencia.",
    cards: ["protocolo_ferro", "diretriz_zero", "titan_de_aco"],
    mods: { aegis: 25, resist: 25 },
  },
  {
    id: "c_bicho",
    name: "COMBO: CACADA ABERTA",
    desc: "INSTINTO DE FERA + CACADOR SELVAGEM: +25% de abertura e +10% de critico.",
    cards: ["instinto_fera", "cacador_selvagem"],
    mods: { opening: 25, crit: 10 },
  },
  {
    id: "c_singular",
    name: "COMBO: HORIZONTE DE EVENTOS",
    desc: "SINGULARIDADE + ECO DO VAZIO: +20% de dreno e +15% de poder.",
    cards: ["singularidade", "eco_do_vazio"],
    mods: { lifesteal: 20, amp: 15 },
  },
  {
    id: "c_riqueza",
    name: "COMBO: EXPEDICAO LUCRATIVA",
    desc: "COFRE DE FERRUGEM + MANUAL DO PILOTO: +25% de ouro e +25% de XP.",
    cards: ["cofre_ferrugem", "manual_piloto"],
    mods: { gold: 25, xp: 25 },
  },
  {
    id: "c_nucleo",
    name: "COMBO: REATOR SATURADO",
    desc: "NUCLEO ARCANO + COROA INCANDESCENTE: +20% de poder e +20% de MP maximo.",
    cards: ["nucleo_arcano", "coroa_incandescente"],
    mods: { amp: 20, mp: 20 },
  },
  {
    id: "c_muralha",
    name: "COMBO: LINHA CONGELADA",
    desc: "MURALHA POLAR + PRESA GELADA: +20% de couraca e +25% de toxina.",
    cards: ["muralha_polar", "presa_gelada"],
    mods: { aegis: 20, venom: 25 },
  },
  {
    id: "c_juizo",
    name: "COMBO: TRIBUNAL DE GELO",
    desc: "JUIZO CONGELANTE + FORTALEZA PRISMA: +20% de DEFESA e +20% de resistencia.",
    cards: ["juizo_congelante", "fortaleza_prisma"],
    mods: { def: 20, resist: 20 },
  },
  {
    id: "c_enxame",
    name: "COMBO: OFICINA VIVA",
    desc: "ENXAME NANO + NANOREPARO: +8% de reparo por turno e +15% de HP maximo.",
    cards: ["enxame_nano", "nanoreparo"],
    mods: { regen: 8, hp: 15 },
  },
  {
    id: "c_espinho",
    name: "COMBO: CAMPO REATIVO",
    desc: "ESPINHO REATIVO + TITA DE ACO: +25% de espinhos e +15% de DEFESA.",
    cards: ["espinho_reativo", "titan_de_aco"],
    mods: { thorns: 25, def: 15 },
  },
  {
    id: "c_supernova",
    name: "COMBO: DETONACAO PRIVADA",
    desc: "SUPERNOVA PRIVADA + COROA INCANDESCENTE: +30% de poder e +20% de furia.",
    cards: ["supernova_privada", "coroa_incandescente"],
    mods: { amp: 30, rage: 20 },
  },
  {
    id: "c_omega",
    name: "COMBO: ULTIMA ROTINA",
    desc: "PROTOCOLO OMEGA + DIRETRIZ ZERO: +30% de resistencia e +10% de reparo.",
    cards: ["protocolo_omega", "diretriz_zero"],
    mods: { resist: 30, regen: 10 },
  },
  {
    id: "c_tempestade",
    name: "COMBO: OLHO DO CICLONE",
    desc: "CORACAO DA TEMPESTADE + CAPACITOR LEVE: +6 de MP por turno e +15% de AGILIDADE.",
    cards: ["coracao_da_tempestade", "capacitor_leve"],
    mods: { mpregen: 6, agl: 15 },
  },
  {
    id: "c_passo",
    name: "COMBO: DANCA CURTA",
    desc: "PASSO CURTO + MANTO SOMBRIO: +12% de esquiva e +20% de abertura.",
    cards: ["passo_curto", "manto_sombrio"],
    mods: { evade: 12, opening: 20 },
  },
  {
    id: "c_chama",
    name: "COMBO: PRIMEIRA FAISCA",
    desc: "CHAMA VIVA + FORJA FURIOSA: +20% de poder e +12% de FORCA.",
    cards: ["chama_viva", "forja_furiosa"],
    mods: { amp: 20, str: 12 },
  },
  {
    id: "c_caca",
    name: "COMBO: TRILHA DE SANGUE",
    desc: "CACADOR SELVAGEM + DEVORADOR DE LUZ: +18% de dreno e +15% de critico.",
    cards: ["cacador_selvagem", "devorador_de_luz"],
    mods: { lifesteal: 18, crit: 15 },
  },
];

export const SYNERGIES: SynergyDef[] = [...TAG_SYNERGIES, ...SEAL_SYNERGIES, ...COMBOS];

export interface DeckResult {
  ids: string[];
  cost: number;
  mods: CardMods;
  synergies: SynergyDef[];
}

function addMods(target: CardMods, src: CardMods) {
  for (const [k, v] of Object.entries(src) as [CardStat, number][]) {
    target[k] = Math.round(((target[k] ?? 0) + v) * 10) / 10;
  }
}

/**
 * Agrega os modificadores de um deck: mods de cada card ja escalados pelo
 * refino, mais todas as sinergias ativas (tag, selo e combo).
 */
export function resolveDeck(ids: string[], refine: Record<string, number> = {}): DeckResult {
  const defs = ids
    .map((id) => CARD_MAP[id])
    .filter((c): c is CardDef => Boolean(c))
    .slice(0, MAX_CARDS);
  const mods: CardMods = {};
  let cost = 0;
  for (const c of defs) {
    addMods(mods, cardModsAt(c, refine[c.id] ?? 1));
    cost += c.cost;
  }
  const owned = new Set(defs.map((c) => c.id));
  const bases = new Set(defs.map((c) => c.base));
  const tagCount = new Map<CardTag, number>();
  const sealCount = new Map<CardSealId, number>();
  for (const c of defs) {
    for (const t of c.tags) tagCount.set(t, (tagCount.get(t) ?? 0) + 1);
    sealCount.set(c.seal, (sealCount.get(c.seal) ?? 0) + 1);
  }
  const synergies: SynergyDef[] = [];
  for (const s of SYNERGIES) {
    const byTag = s.tag ? (tagCount.get(s.tag.tag) ?? 0) >= s.tag.count : false;
    const bySeal = s.seal ? (sealCount.get(s.seal.seal) ?? 0) >= s.seal.count : false;
    // combos valem para qualquer selo da carta base.
    const byCards = s.cards ? s.cards.every((id) => owned.has(id) || bases.has(id)) : false;
    if (byTag || bySeal || byCards) {
      synergies.push(s);
      addMods(mods, s.mods);
    }
  }
  return { ids: defs.map((c) => c.id), cost, mods, synergies };
}

/** Sinergias que ainda nao estao ativas mas ficariam a 1 card de distancia. */
export function nearSynergies(ids: string[], slots = MAX_CARDS): SynergyDef[] {
  const active = new Set(resolveDeck(ids).synergies.map((s) => s.id));
  const defs = ids.map((id) => CARD_MAP[id]).filter((c): c is CardDef => Boolean(c));
  const owned = new Set(defs.map((c) => c.id));
  const bases = new Set(defs.map((c) => c.base));
  const tagCount = new Map<CardTag, number>();
  const sealCount = new Map<CardSealId, number>();
  for (const c of defs) {
    for (const t of c.tags) tagCount.set(t, (tagCount.get(t) ?? 0) + 1);
    sealCount.set(c.seal, (sealCount.get(c.seal) ?? 0) + 1);
  }
  if (ids.length >= slots) return [];
  return SYNERGIES.filter((s) => {
    if (active.has(s.id)) return false;
    if (s.tag) return (tagCount.get(s.tag.tag) ?? 0) === s.tag.count - 1;
    if (s.seal) return (sealCount.get(s.seal.seal) ?? 0) === s.seal.count - 1;
    if (s.cards) {
      const missing = s.cards.filter((id) => !owned.has(id) && !bases.has(id)).length;
      return missing === 1;
    }
    return false;
  });
}

export function cardMod(mods: CardMods, stat: CardStat): number {
  return mods[stat] ?? 0;
}

/** Refino medio que a IA usa nos cards, conforme o nivel do robo. */
export function aiRefine(level: number): number {
  return Math.max(1, Math.min(CARD_MAX_REFINE, 1 + Math.floor(level / 9)));
}

/** Deck deterministico para robos controlados pela IA. */
export function aiDeck(robotId: string, level: number): string[] {
  let seed = level * 7919 + robotId.length * 131;
  for (let i = 0; i < robotId.length; i++) seed = (seed * 31 + robotId.charCodeAt(i)) % 2147483647;
  const rng = () => {
    seed = (seed * 48271) % 2147483647;
    return seed / 2147483647;
  };
  // inimigos ganham cards conforme o nivel: 1 no 5, 2 no 15, 3 no 25, 4 no 40, 5 no 60.
  const slots =
    level >= 60 ? 5 : level >= 40 ? 4 : level >= 25 ? 3 : level >= 15 ? 2 : level >= 5 ? 1 : 0;
  if (slots === 0) return [];
  const pool = CARDS.filter((c) => c.requiredLevel <= Math.max(1, level));
  if (pool.length === 0) return [];
  const out: string[] = [];
  // primeiro card puxa uma tag; os seguintes tentam fechar sinergia com ela.
  const first = pool[Math.floor(rng() * pool.length)];
  out.push(first.id);
  const tag = first.tags[Math.floor(rng() * first.tags.length)];
  while (out.length < slots) {
    const same = pool.filter((c) => !out.includes(c.id) && c.tags.includes(tag));
    const rest = pool.filter((c) => !out.includes(c.id));
    const list = same.length > 0 && rng() < 0.75 ? same : rest;
    if (list.length === 0) break;
    out.push(list[Math.floor(rng() * list.length)].id);
  }
  return out;
}

/** Mapa de refino que a IA aplica ao proprio deck. */
export function aiRefineMap(ids: string[], level: number): Record<string, number> {
  const r = aiRefine(level);
  return Object.fromEntries(ids.map((id) => [id, r]));
}

/** Caminho da arte pixel art do card (compartilhada entre os selos). */
export function cardArt(id: string): string {
  const def = CARD_MAP[id];
  return `/cards/${def ? def.base : id}.png`;
}
