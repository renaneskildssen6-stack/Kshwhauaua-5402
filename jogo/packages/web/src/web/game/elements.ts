/**
 * Fase H1 — sistema elemental.
 *
 * Os 256 robos do jogo trazem um rotulo de elemento textual herdado da Fase A
 * (157 valores distintos: "FOGO", "AREIA MOVEDICA", "RELOJOARIA", "ZENITE"...).
 * Este arquivo normaliza tudo isso em 18 FAMILIAS jogaveis e define a matriz
 * de afinidade 18x18 usada no calculo de dano:
 *
 *   2    fraqueza   (x2.0)
 *   1    neutro     (x1.0)
 *   0.5  resistencia (x0.5)
 *   0    imunidade   (absorve: cura em vez de ferir)
 *
 * A matriz NAO e aleatoria: cada linha foi escrita a mao a partir da tabela
 * STRONG / RESIST / IMMUNE abaixo (relacoes tematicas explicadas no comentario
 * de cada familia) e expandida em AFFINITY_TABLE no fim do modulo, com as
 * somas conferidas por `ELEMENT_STATS`.
 *
 * Regra do projeto: nenhuma arte nova. As cores/vfx abaixo so apontam para os
 * 28 arquivos de /vfx que ja existem.
 */

import { matchKeyword } from "./arenas";

export const ELEMENT_IDS = [
  "IMPACTO",
  "LAMINA",
  "PERFURACAO",
  "FOGO",
  "GELO",
  "ELETRICO",
  "TOXICO",
  "TERRA",
  "VENTO",
  "AGUA",
  "LUZ",
  "SOMBRA",
  "COSMICO",
  "QUANTICO",
  "BIO",
  "METAL",
  "CRISTAL",
  "ARCANO",
] as const;

export type ElementId = (typeof ELEMENT_IDS)[number];

export interface ElementDef {
  id: ElementId;
  /** Nome curto exibido em selos e no codex. */
  label: string;
  /** Abreviacao de 3 letras para o cabecalho de turno. */
  abbr: string;
  /** Cor do selo (borda/texto) — usada no CSS, nao gera arte. */
  color: string;
  /** Cor secundaria para gradientes de selo. */
  glow: string;
  /** Frase de identidade, aparece no codex do robô. */
  motto: string;
  /** Sprite sheet de /vfx reaproveitado no golpe. */
  vfx: string;
  /** Status caracteristico desta familia (deve existir em status.ts). */
  status: string;
  /** Arena onde a familia e tematica (deve existir em arenas.ts). */
  arena: string;
  /** Logica central desta familia — o que o jogador espera dela. */
  identity: string;
}

export const ELEMENTS: ElementDef[] = [
  {
    id: "IMPACTO",
    label: "IMPACTO",
    abbr: "IMP",
    color: "#d7dbe4",
    glow: "#8b93a8",
    motto: "O peso resolve antes do argumento.",
    vfx: "/vfx/meteor.png",
    status: "stun",
    arena: "canyon",
    identity: "Dano bruto e atordoamento. Quebra estruturas rigidas (gelo, cristal, metal) mas e absorvido por fluidos e terrenos soltos.",
  },
  {
    id: "LAMINA",
    label: "LAMINA",
    abbr: "LAM",
    color: "#ff7a9c",
    glow: "#a32c52",
    motto: "Corta o que nao deveria ser cortado.",
    vfx: "/vfx/slash.png",
    status: "bleed",
    arena: "neodojo",
    identity: "Cortes multiplos e sangramento. Fatia materia organica e correntes de ar, mas emperra em placas e faces duras.",
  },
  {
    id: "PERFURACAO",
    label: "PERFURACAO",
    abbr: "PER",
    color: "#f2c14e",
    glow: "#9a6f14",
    motto: "Existe sempre uma costura no casco.",
    vfx: "/vfx/laser.png",
    status: "corrode",
    arena: "foundry",
    identity: "Ignora boa parte da defesa e perfura blindagem. Passa reto por ar e agua, mas erra o alvo evasivo no escuro.",
  },
  {
    id: "FOGO",
    label: "FOGO",
    abbr: "FOG",
    color: "#ff6a2a",
    glow: "#a12c05",
    motto: "Tudo que existe tem um ponto de ignicao.",
    vfx: "/vfx/inferno.png",
    status: "burn",
    arena: "volcano",
    identity: "Queimadura acumulativa e dano crescente por turno. Derrete gelo e metal, carboniza biomassa; agua e pedra apagam a chama.",
  },
  {
    id: "GELO",
    label: "GELO",
    abbr: "GEL",
    color: "#7fe4ff",
    glow: "#1f7fa5",
    motto: "Devagar e a unica velocidade segura.",
    vfx: "/vfx/frost.png",
    status: "freeze",
    arena: "frozen",
    identity: "Congelamento, lentidao e travas de turno. Prende agua e vida em suspensao; fogo e metal quebram o gelo facilmente.",
  },
  {
    id: "ELETRICO",
    label: "ELETRICO",
    abbr: "ELE",
    color: "#ffe94d",
    glow: "#b58f00",
    motto: "O caminho mais curto entre dois pontos.",
    vfx: "/vfx/thunder.png",
    status: "paralyze",
    arena: "storm",
    identity: "Paralisia, pulso em cadeia e travamento de MP. Conduz por metal e agua e sobe pelo vento; a terra aterrissa o pulso.",
  },
  {
    id: "TOXICO",
    label: "TOXICO",
    abbr: "TOX",
    color: "#9dff6a",
    glow: "#3f7a12",
    motto: "Nao precisa rachar o casco. So entrar por ele.",
    vfx: "/vfx/toxic.png",
    status: "poison",
    arena: "sunken",
    identity: "Veneno que ignora defesa, corrosao de equipamento e contaminacao de terreno. Metal e cristal sao inertes a ela.",
  },
  {
    id: "TERRA",
    label: "TERRA",
    abbr: "TER",
    color: "#c99a5b",
    glow: "#6f4a1e",
    motto: "Pesado, antigo e ainda aqui.",
    vfx: "/vfx/quake.png",
    status: "root",
    arena: "canyon",
    identity: "Aterramento, aprisionamento e dano em area no chao. Descarrega eletricidade e esmaga minerais; vento e impactos escorregam por ela.",
  },
  {
    id: "VENTO",
    label: "VENTO",
    abbr: "VEN",
    color: "#a8ffd9",
    glow: "#2a8f6b",
    motto: "Ninguem acerta o que ja passou.",
    vfx: "/vfx/cyclone.png",
    status: "evade_up",
    arena: "sky",
    identity: "Esquiva ativa, deslocamento de posicao e erosao por area. Espalha fogo e gases; e inefetivo contra placas e faces polidas.",
  },
  {
    id: "AGUA",
    label: "AGUA",
    abbr: "AGU",
    color: "#5aa9ff",
    glow: "#14458f",
    motto: "Contorna hoje, afoga amanha.",
    vfx: "/vfx/torrent.png",
    status: "drain",
    arena: "sunken",
    identity: "Dreno de energia, pressao continua e cura por corrente. Apaga chamas e cobre terreno; congela e conduz o que nao deveria.",
  },
  {
    id: "LUZ",
    label: "LUZ",
    abbr: "LUZ",
    color: "#fff2b8",
    glow: "#bf9a1e",
    motto: "Onde eu chego, nao sobra esconderijo.",
    vfx: "/vfx/laser.png",
    status: "blind",
    arena: "orbital",
    identity: "Purificacao, exposicao de alvos e dano concentrado em raio. Queima trevas e toxinas; cristais e metais refletem o feixe.",
  },
  {
    id: "SOMBRA",
    label: "SOMBRA",
    abbr: "SOM",
    color: "#b07aff",
    glow: "#4a1e85",
    motto: "Nao me vence quem nao consegue me encontrar.",
    vfx: "/vfx/curse.png",
    status: "curse",
    arena: "neodojo",
    identity: "Maldicao, furtividade e roubo de recursos. Apaga luz e apodrece vida; mal e imune a si mesma e o quantico a atravessa.",
  },
  {
    id: "COSMICO",
    label: "COSMICO",
    abbr: "COS",
    color: "#8fd6ff",
    glow: "#2a4f96",
    motto: "Escala e uma arma.",
    vfx: "/vfx/cosmos.png",
    status: "marked",
    arena: "orbital",
    identity: "Marca de alvo, gravidade e dano em area massivo. Achata terreno e vento; suas proprias forcas se anulam em parte.",
  },
  {
    id: "QUANTICO",
    label: "QUANTICO",
    abbr: "QUA",
    color: "#7cf0e0",
    glow: "#1c7d72",
    motto: "Estou nos dois lugares ate voce medir.",
    vfx: "/vfx/chrono.png",
    status: "slow",
    arena: "orbital",
    identity: "Ignora e contorna a defesa: sobreposicao, salto de tempo e copia de estados. Solido e liquido passam batido; mal se enrosca nela.",
  },
  {
    id: "BIO",
    label: "BIO",
    abbr: "BIO",
    color: "#8dff7a",
    glow: "#2f7a1c",
    motto: "Cresce em cima de qualquer coisa.",
    vfx: "/vfx/bloom.png",
    status: "hp_regen",
    arena: "dojo",
    identity: "Regeneracao, parasitas e crescimento progressivo. Absorve agua e solo e impede veneno; corte e fogo podam rapido.",
  },
  {
    id: "METAL",
    label: "METAL",
    abbr: "MET",
    color: "#c9d2e0",
    glow: "#5c6577",
    motto: "Feito para durar mais que o dono.",
    vfx: "/vfx/clang.png",
    status: "damage_reduction",
    arena: "foundry",
    identity: "Defesa acumulativa, refletir e reforco de blindagem. Trunca mineral e vida; nao sente veneno, mas derrete no calor.",
  },
  {
    id: "CRISTAL",
    label: "CRISTAL",
    abbr: "CRI",
    color: "#d7a6ff",
    glow: "#5f2a96",
    motto: "Rigido ate o exato instante em que quebra.",
    vfx: "/vfx/prism.png",
    status: "shatter",
    arena: "crystal",
    identity: "Refracao, fragmentacao e retorno de dano magico. Quebra pulsos eletricos e facetas a luz; impacto e arcanismo racha o material.",
  },
  {
    id: "ARCANO",
    label: "ARCANO",
    abbr: "ARC",
    color: "#ff9ce8",
    glow: "#8a1f74",
    motto: "A regra tambem e um material.",
    vfx: "/vfx/plasma.png",
    status: "silence",
    arena: "neodojo",
    identity: "Silenciar habilidades, reescrever numeros e corromper equipamento. Desfaz estrutura e quantica; forca bruta e perfuracao a desmontam.",
  },
];

export const ELEMENT_MAP: Record<string, ElementDef> = Object.fromEntries(
  ELEMENTS.map((e) => [e.id, e]),
);

export const ELEMENT_COUNT = ELEMENTS.length;

export function elementDef(id: string): ElementDef | null {
  return ELEMENT_MAP[(id || "").toUpperCase()] ?? null;
}

export function elementLabel(id: string): string {
  return elementDef(id)?.label ?? "NEUTRO";
}

/**
 * Tabela autoral: para cada familia, contra quem ela e forte (x2), contra quem
 * ela e fraca (x0.5) e quem a absorve (x0). O que nao aparece e neutro.
 *
 * As justificativas tematicas estao nos comentarios de cada linha.
 */
interface ElementRow {
  strong: ElementId[];
  resist: ElementId[];
  immune: ElementId[];
}

export const ELEMENT_ROWS: Record<ElementId, ElementRow> = {
  // Massa contra material rigido. Fluidos e terra solta engolem o golpe.
  IMPACTO: { strong: ["GELO", "CRISTAL", "METAL"], resist: ["VENTO", "TERRA", "AGUA"], immune: [] },
  // Gume contra materia viva e correntes de ar. Placas emperram a lamina.
  LAMINA: { strong: ["BIO", "VENTO", "SOMBRA"], resist: ["METAL", "CRISTAL", "AGUA", "ARCANO"], immune: [] },
  // Broca contra cascos, rocha e barreira magica. Ar e agua nao tem o que furar.
  PERFURACAO: { strong: ["METAL", "TERRA", "ARCANO"], resist: ["VENTO", "AGUA", "SOMBRA"], immune: [] },
  // Calor derrete gelo e metal e queima vida. Agua, pedra e facetas apagam.
  FOGO: { strong: ["BIO", "GELO", "METAL"], resist: ["AGUA", "TERRA", "CRISTAL"], immune: [] },
  // Frio prende agua e vida e imobiliza o ar. O calor e a massa quebram o gelo.
  GELO: { strong: ["AGUA", "BIO", "VENTO"], resist: ["FOGO", "METAL", "IMPACTO"], immune: [] },
  // Corrente conduz por metal, agua e vento ionizado. A terra aterrissa.
  ELETRICO: { strong: ["METAL", "AGUA", "VENTO"], resist: ["TERRA", "CRISTAL", "ARCANO"], immune: [] },
  // Veneno, acido e praga entram por tudo que e vivo. Inertes nao reagem.
  TOXICO: { strong: ["BIO", "AGUA", "ARCANO"], resist: ["TERRA", "LUZ", "VENTO"], immune: ["METAL", "CRISTAL"] },
  // Peso e solo: aterrissa eletricidade, sufoca fogo, cobre metal, parte gume.
  TERRA: { strong: ["ELETRICO", "FOGO", "METAL", "LAMINA", "PERFURACAO"], resist: ["VENTO", "IMPACTO"], immune: [] },
  // Erosao e deslocamento: espalha fogo e gases, arranca terra. Para em placa.
  VENTO: { strong: ["TERRA", "TOXICO", "FOGO"], resist: ["METAL", "CRISTAL", "AGUA", "GELO", "LAMINA", "ARCANO"], immune: [] },
  // Corrente continua: apaga fogo, inunda solo, dilui toxico.
  AGUA: { strong: ["FOGO", "TERRA", "TOXICO"], resist: ["GELO", "ELETRICO", "BIO"], immune: [] },
  // Raio focado: purifica trevas e toxinas, desfaz magia. Facetas brilham.
  LUZ: { strong: ["SOMBRA", "TOXICO", "ARCANO"], resist: ["CRISTAL", "METAL", "LUZ"], immune: [] },
  // Maldicao e apagamento: consome luz, magia e vida. Mal e quantico escapam.
  SOMBRA: { strong: ["LUZ", "ARCANO", "BIO"], resist: ["SOMBRA", "QUANTICO", "CRISTAL", "LAMINA", "VENTO"], immune: [] },
  // Escala: achaixa terreno e vento, ofusca a luz. Sua propria forca se anula.
  COSMICO: { strong: ["TERRA", "LUZ", "VENTO"], resist: ["COSMICO", "ARCANO", "METAL"], immune: [] },
  // Sobreposicao: atravessa sombra, escala e regra. Solidos nao a acertam.
  QUANTICO: { strong: ["SOMBRA", "COSMICO", "ARCANO"], resist: ["IMPACTO", "PERFURACAO", "LAMINA", "FOGO"], immune: ["QUANTICO"] },
  // Simbiose: suga agua e solo, processa toxina. Poda corta e queima rapido.
  BIO: { strong: ["AGUA", "TERRA", "TOXICO"], resist: ["FOGO", "GELO", "LAMINA", "SOMBRA"], immune: [] },
  // Liga e blindagem: trunca mineral e vida, conduz corrente pra fora.
  METAL: { strong: ["CRISTAL", "BIO", "GELO"], resist: ["ELETRICO", "FOGO", "ARCANO", "IMPACTO", "PERFURACAO", "VENTO"], immune: ["TOXICO"] },
  // Faceta e reflexo: devolve pulso, racha a luz, desvia o ar.
  CRISTAL: { strong: ["ELETRICO", "LUZ", "VENTO"], resist: ["FOGO", "TERRA", "IMPACTO", "ARCANO", "LAMINA", "TOXICO"], immune: [] },
  // Regra reescrita: desmancha metal, cristal, quantica e forca pura.
  ARCANO: { strong: ["METAL", "CRISTAL", "QUANTICO", "IMPACTO"], resist: ["ARCANO", "LUZ", "PERFURACAO", "TOXICO", "VENTO"], immune: [] },
};

function buildTable(): Record<ElementId, Record<ElementId, number>> {
  const out = {} as Record<ElementId, Record<ElementId, number>>;
  for (const atk of ELEMENT_IDS) {
    const row = {} as Record<ElementId, number>;
    const spec = ELEMENT_ROWS[atk];
    for (const def of ELEMENT_IDS) {
      let v = 1;
      if (spec.strong.includes(def)) v = 2;
      else if (spec.immune.includes(def)) v = 0;
      else if (spec.resist.includes(def)) v = 0.5;
      row[def] = v;
    }
    out[atk] = row;
  }
  return out;
}

/** Matriz 18x18 expandida a partir de ELEMENT_ROWS: AFFINITY_TABLE[ataque][alvo]. */
export const AFFINITY_TABLE: Record<ElementId, Record<ElementId, number>> = buildTable();

/** Somas por linha, usadas no codex e no validador. */
export const ELEMENT_STATS: Record<
  ElementId,
  { strong: number; resist: number; immune: number; neutral: number }
> = Object.fromEntries(
  ELEMENT_IDS.map((id) => {
    const spec = ELEMENT_ROWS[id];
    return [
      id,
      {
        strong: spec.strong.length,
        resist: spec.resist.length,
        immune: spec.immune.length,
        neutral: ELEMENT_IDS.length - spec.strong.length - spec.resist.length - spec.immune.length,
      },
    ];
  }),
) as Record<ElementId, { strong: number; resist: number; immune: number; neutral: number }>;

/** Multiplicador de dano de um ataque elementAL contra um alvo elementAL. */
export function affinity(attack: string, target: string): number {
  const a = (attack || "").toUpperCase() as ElementId;
  const t = (target || "").toUpperCase() as ElementId;
  const row = AFFINITY_TABLE[a];
  if (!row) return 1;
  const v = row[t];
  return typeof v === "number" ? v : 1;
}

export type AffinityTier = "absorve" | "resiste" | "neutro" | "fraco";

export function affinityTier(mult: number): AffinityTier {
  if (mult <= 0) return "absorve";
  if (mult < 1) return "resiste";
  if (mult > 1) return "fraco";
  return "neutro";
}

/** Rotulo curto do selo de afinidade mostrado no alvo. */
export const TIER_LABEL: Record<AffinityTier, string> = {
  absorve: "ABSORVE",
  resiste: "RESISTE",
  neutro: "NEUTRO",
  fraco: "FRACO",
};

export const TIER_COLOR: Record<AffinityTier, string> = {
  absorve: "#7cf0e0",
  resiste: "#8b93a8",
  neutro: "#d7dbe4",
  fraco: "#ff5b6e",
};

/* ------------------------------------------------------------------ deteccao
 * Normaliza os 157 rotulos textuais herdados para as 18 familias.
 * Lista escrita a mao, na ordem em que e avaliada (multi-palavra primeiro).
 */

const DETECT: [ElementId, string[]][] = [
  [
    "FOGO",
    [
      "FOGO",
      "CHAMA",
      "BRASA",
      "PIRA",
      "MAGMA",
      "VULCAO",
      "INFERNO",
      "CINZAS",
      "FAISCA",
      "DRAGAO",
    ],
  ],
  [
    "GELO",
    ["GELO", "GEADA", "NEVE", "GLACIAL", "POLAR", "TUNDRA", "CRIO"],
  ],
  [
    "ELETRICO",
    ["TROVAO", "TEMPESTADE", "RAIO", "ELETR", "NEON", "PLASMA", "CORRENTE", "MAGNET", "PULSO"],
  ],
  [
    "TOXICO",
    ["VENENO", "TOXIN", "ACIDO", "PRAGA", "PESTE", "LODO", "PICHE", "PANTANO", "MUCO"],
  ],
  [
    "METAL",
    [
      "FERRO",
      "FERRUGEM",
      "FORJA",
      "SUCATA",
      "METAL",
      "TITAN",
      "TITA",
      "LATAO",
      "ENGRENAGEM",
      "CIRCUITO",
      "GRAFENO",
      "RELOJO",
      "OURO",
      "AÇO",
      "SOLDA",
      "GUARDIA",
      "FORTALEZA",
      "MAQUIN",
    ],
  ],
  [
    "CRISTAL",
    ["CRISTAL", "VIDRO", "JADE", "ESPELHO", "AMBAR", "MARMORE", "OBSIDIANA", "PRISMA", "DIAMANTE"],
  ],
  [
    "QUANTICO",
    ["QUANTUM", "TEMPO", "CRONO", "ETERNO", "PARADOXO", "ETER"],
  ],
  [
    "COSMICO",
    [
      "COSMIC",
      "NEBULOSA",
      "ESTRELA",
      "BURACO NEGRO",
      "GALAX",
      "ORBITA",
      "PULSAR",
      "GRAVIDADE",
      "METEORO",
      "ANEL",
      "COLONIA",
      "ESTACAO",
      "LUA",
      "ECLIPSE",
      "ZENITE",
      "XENO",
    ],
  ],
  [
    "LUZ",
    ["LUZ", "FOTON", "AURORA", "ARCO-IRIS", "SANTO", "SOL", "CATEDRAL", "VALQUIRIA", "PEREGRINO", "JURAMENTO", "ESTRELA"],
  ],
  [
    "SOMBRA",
    [
      "SOMBRA",
      "ESCURO",
      "NOITE",
      "BREU",
      "VAZIO",
      "VOID",
      "TUMULO",
      "RUINA",
      "LAMENTO",
      "SILENCIO",
      "ESPIRITO",
      "ALMA",
      "MALD",
      "CAOS",
    ],
  ],
  [
    "ARCANO",
    [
      "ARCANO",
      "RUNA",
      "PSIQUIC",
      "CANTO",
      "SONOR",
      "SOM ",
      "TECELA",
      "SEDA",
      "DISCIPLINA",
      "ESPECTR",
      "OCULT",
    ],
  ],
  [
    "PERFURACAO",
    ["PERFURACAO", "LANCA", "FERRAO", "PRESA", "OSSO", "AGULHA", "ESPETO", "BROCA"],
  ],
  [
    "LAMINA",
    ["LAMINA", "CORTE", "ESPADA", "GARRA", "SERRA", "SAMURAI", "HONRA"],
  ],
  [
    "BIO",
    [
      "BIO",
      "SELVA",
      "FLOR",
      "FUNGO",
      "ESPORO",
      "ESPINHO",
      "BESOURO",
      "ESCARAVELHO",
      "LOBO",
      "MATILHA",
      "SANGUE",
      "VIDA",
      "ALGA",
      "CORAL",
      "TEIA",
      "SIMBIOSE",
      "PRIMATA",
      "URSO",
    ],
  ],
  [
    "VENTO",
    ["VENTO", "VENTANIA", "CEU", "NUVEM", "BRISA", "PENA", "CALMARIA", "FUMACA", "VAPOR", "AGIL"],
  ],
  [
    "AGUA",
    ["AGUA", "MARE", "TSUNAMI", "RECIFE", "ABISS", "ABISMO", "OCEANO", "CHUVA", "ONDA"],
  ],
  [
    "TERRA",
    [
      "TERRA",
      "AREIA",
      "DESERTO",
      "PEDRA",
      "ROCHA",
      "GRANITO",
      "BASALTO",
      "POEIRA",
      "TECTONIC",
      "TERREMOTO",
      "COLHEITA",
      "DUNA",
      "MURALHA",
      "BOSQUE",
    ],
  ],
  [
    "IMPACTO",
    ["IMPACTO", "ARTILHARIA", "CHIFRE", "VULCAO", "QUEDA", "PUNHO", "MARCIAL", "GUERRA"],
  ],
];

/**
 * Normaliza um elemento textual legado para uma das 18 familias.
 * Se nenhuma palavra-chave bater, cai numa familia estavel por hash (nunca
 * devolve string vazia nem quebra a matriz).
 */
export function detectElement(legacy: string): ElementId {
  const up = (legacy || "").toUpperCase();
  for (const [id, words] of DETECT) {
    for (const w of words) {
      if (matchKeyword(up, w)) return id;
    }
  }
  let h = 2166136261;
  for (let i = 0; i < up.length; i += 1) {
    h ^= up.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ELEMENT_IDS[(h >>> 0) % ELEMENT_IDS.length] as ElementId;
}

/** True quando a familia foi determinada por palavra-chave (sem fallback). */
export function detectedByKeyword(legacy: string): boolean {
  const up = (legacy || "").toUpperCase();
  for (const [, words] of DETECT) {
    for (const w of words) if (matchKeyword(up, w)) return true;
  }
  return false;
}

/** Lista completa dos rotulos legados que caem numa familia (codex/validador). */
export function keywordsFor(id: ElementId): string[] {
  return DETECT.find(([e]) => e === id)?.[1] ?? [];
}

/* ------------------------------------------------------------- apresentacao
 * Selo de afinidade: usado na UI de combate e no log.
 * Nao gera arte — so texto + cor.
 */

export function affinitySticker(attack: string, target: string): string {
  const m = affinity(attack, target);
  const tier = affinityTier(m);
  if (tier === "neutro") return "";
  const el = elementDef(target);
  return `${TIER_LABEL[tier]} ${el?.label ?? "?"}`;
}

export function affinitySummary(id: ElementId): string {
  const def = ELEMENT_MAP[id];
  const s = ELEMENT_STATS[id];
  return `${def.label} · ${s.strong} fortes · ${s.resist} resistidos · ${s.immune} imunes`;
}
