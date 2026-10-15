// GERADO: um gadget unico por robo (220 no total).
// Cada gadget tem arte propria em /public/gadgets/<robotId>.png, sobe ate o nivel 30
// em 3 marcos (MK-I/II/III) e abre ate 3 sockets de chip (ver CHIPS no fim do arquivo).

export type GadgetKind =
  | "power"
  | "guard"
  | "speed"
  | "vitality"
  | "reactor"
  | "leech"
  | "thorns"
  | "regen"
  | "crit"
  | "phase"
  | "amp"
  | "aegis";

export interface GadgetDef {
  robotId: string;
  name: string;
  kind: GadgetKind;
  element: string;
  rarity: "bronze" | "silver" | "gold";
  /** valor do efeito no nivel 1 */
  base: number;
  /** incremento por nivel */
  step: number;
  /** preco de compra */
  price: number;
  desc: string;
  flavor: string;
}

export const GADGET_MAX_LEVEL = 30;
/** nivel minimo do robo para destravar o gadget */
export const GADGET_ROBOT_LEVEL = 10;

/** Marcos do gadget: MK-I (1-10), MK-II (11-20), MK-III (21-30). */
export const GADGET_MK_CAPS = [10, 20, 30];
export const GADGET_MK_LABEL = ["MK-I", "MK-II", "MK-III"];
const GADGET_MK_MULT = [1, 1.25, 1.55];

/** Nivel de gadget que libera cada socket de chip. */
export const GADGET_SOCKET_LEVELS = [5, 15, 25];
export const GADGET_MAX_SOCKETS = GADGET_SOCKET_LEVELS.length;

export function gadgetMk(level: number): number {
  const l = Math.max(1, level);
  return l > GADGET_MK_CAPS[1] ? 2 : l > GADGET_MK_CAPS[0] ? 1 : 0;
}

export function gadgetMkLabel(level: number): string {
  return GADGET_MK_LABEL[gadgetMk(level)];
}

/** Sockets liberados por nivel de gadget. */
export function gadgetSockets(level: number): number {
  return GADGET_SOCKET_LEVELS.filter((l) => level >= l).length;
}

/** Lingotes exigidos para cruzar a fronteira de um marco (10->11, 20->21). */
export function gadgetUpgradeBars(def: GadgetDef, current: number): number {
  const tier = def.rarity === "gold" ? 2 : def.rarity === "silver" ? 1 : 0;
  if (current === GADGET_MK_CAPS[0]) return 10 + tier * 5;
  if (current === GADGET_MK_CAPS[1]) return 24 + tier * 8;
  return 0;
}

export const GADGETS: GadgetDef[] = [
  { robotId: "aurorion", name: "PUNHO SOLAR", kind: "power", element: "LUZ", rarity: "gold", base: 10.2, step: 2.6, price: 18000, desc: "+10.2% de FORCA em combate.", flavor: "Modulo solar forjado sob medida para AURORION." },
  { robotId: "ferrovax", name: "PLACA FERREO", kind: "guard", element: "FERRO", rarity: "bronze", base: 8, step: 2, price: 8000, desc: "+8% de DEFESA em combate.", flavor: "Modulo ferreo forjado sob medida para FERROVAX." },
  { robotId: "cryolance", name: "PROPULSOR GLACIAL", kind: "speed", element: "GELO", rarity: "silver", base: 9, step: 2.2, price: 12000, desc: "+9% de AGILIDADE em combate.", flavor: "Modulo glacial forjado sob medida para CRYOLANCE." },
  { robotId: "voltronin", name: "CORACAO VOLTAICO", kind: "vitality", element: "TROVAO", rarity: "silver", base: 11.2, step: 2.8, price: 12000, desc: "+11.2% de HP maximo.", flavor: "Modulo voltaico forjado sob medida para VOLT RONIN." },
  { robotId: "pyrokaiser", name: "CELULA IGNEO", kind: "reactor", element: "FOGO", rarity: "gold", base: 15.4, step: 3.8, price: 18000, desc: "+15.4% de MP maximo.", flavor: "Modulo igneo forjado sob medida para PYROKAISER." },
  { robotId: "terrabyte", name: "GARRA TELURICO", kind: "leech", element: "TERRA", rarity: "bronze", base: 8, step: 1.5, price: 8000, desc: "Recupera 8% do dano causado como HP.", flavor: "Modulo telurico forjado sob medida para TERRABYTE." },
  { robotId: "zephyrblade", name: "ESPINHO EOLICO", kind: "thorns", element: "VENTO", rarity: "silver", base: 11.2, step: 2.2, price: 12000, desc: "Reflete 11.2% do dano recebido.", flavor: "Modulo eolico forjado sob medida para ZEPHYRBLADE." },
  { robotId: "nullshade", name: "COLMEIA NULO", kind: "regen", element: "VAZIO", rarity: "gold", base: 5.1, step: 1, price: 18000, desc: "Repara 5.1% do HP maximo por turno.", flavor: "Modulo nulo forjado sob medida para NULLSHADE." },
  { robotId: "acidra", name: "VISOR CORROSIVO", kind: "crit", element: "ACIDO", rarity: "bronze", base: 5, step: 1, price: 8000, desc: "+5% de chance de golpe critico.", flavor: "Modulo corrosivo forjado sob medida para ACIDRA." },
  { robotId: "gravitus", name: "MANTO GRAVITICO", kind: "phase", element: "GRAVIDADE", rarity: "silver", base: 4.5, step: 0.9, price: 12000, desc: "+4.5% de chance de esquiva.", flavor: "Modulo gravitico forjado sob medida para GRAVITUS." },
  { robotId: "chronowake", name: "RESSOADOR CRONICO", kind: "amp", element: "TEMPO", rarity: "gold", base: 9, step: 2.3, price: 18000, desc: "+9% de dano nas habilidades.", flavor: "Modulo cronico forjado sob medida para CHRONOWAKE." },
  { robotId: "bioreaper", name: "BARREIRA ORGANICO", kind: "aegis", element: "BIO", rarity: "silver", base: 6.7, step: 1.3, price: 12000, desc: "-6.7% de dano recebido.", flavor: "Modulo organico forjado sob medida para BIOREAPER." },
  { robotId: "stormfang", name: "PUNHO CICLONICO", kind: "power", element: "TEMPESTADE", rarity: "silver", base: 9, step: 2.2, price: 12000, desc: "+9% de FORCA em combate.", flavor: "Modulo ciclonico forjado sob medida para STORMFANG." },
  { robotId: "quartzine", name: "PLACA PRISMATICO", kind: "guard", element: "CRISTAL", rarity: "bronze", base: 8, step: 2, price: 8000, desc: "+8% de DEFESA em combate.", flavor: "Modulo prismatico forjado sob medida para QUARTZINE." },
  { robotId: "hydroknight", name: "PROPULSOR AQUATICO", kind: "speed", element: "AGUA", rarity: "silver", base: 9, step: 2.2, price: 12000, desc: "+9% de AGILIDADE em combate.", flavor: "Modulo aquatico forjado sob medida para HYDROKNIGHT." },
  { robotId: "emberfox", name: "CORACAO INCANDESCENTE", kind: "vitality", element: "BRASA", rarity: "gold", base: 12.8, step: 3.2, price: 18000, desc: "+12.8% de HP maximo.", flavor: "Modulo incandescente forjado sob medida para EMBERFOX." },
  { robotId: "ironmonk", name: "CELULA JADEITA", kind: "reactor", element: "JADE", rarity: "bronze", base: 12, step: 3, price: 8000, desc: "+12% de MP maximo.", flavor: "Modulo jadeita forjado sob medida para IRONMONK." },
  { robotId: "nebulon", name: "GARRA COSMICO", kind: "leech", element: "COSMICO", rarity: "gold", base: 10.2, step: 1.9, price: 18000, desc: "Recupera 10.2% do dano causado como HP.", flavor: "Modulo cosmico forjado sob medida para NEBULON." },
  { robotId: "titanox", name: "ESPINHO TITANICO", kind: "thorns", element: "TITA", rarity: "silver", base: 11.2, step: 2.2, price: 12000, desc: "Reflete 11.2% do dano recebido.", flavor: "Modulo titanico forjado sob medida para TITANOX." },
  { robotId: "magnavore", name: "COLMEIA MAGNETICO", kind: "regen", element: "MAGNETISMO", rarity: "gold", base: 5.1, step: 1, price: 18000, desc: "Repara 5.1% do HP maximo por turno.", flavor: "Modulo magnetico forjado sob medida para MAGNAVORE." },
  { robotId: "solarixprime", name: "VISOR HELIACO", kind: "crit", element: "SOL", rarity: "gold", base: 6.4, step: 1.3, price: 18000, desc: "+6.4% de chance de golpe critico.", flavor: "Modulo heliaco forjado sob medida para SOLARIX PRIME." },
  { robotId: "lunargeist", name: "MANTO LUNAR", kind: "phase", element: "LUA", rarity: "silver", base: 4.5, step: 0.9, price: 12000, desc: "+4.5% de chance de esquiva.", flavor: "Modulo lunar forjado sob medida para LUNAR GEIST." },
  { robotId: "dunecrawler", name: "RESSOADOR ARENOSO", kind: "amp", element: "AREIA", rarity: "bronze", base: 7, step: 1.8, price: 8000, desc: "+7% de dano nas habilidades.", flavor: "Modulo arenoso forjado sob medida para DUNE CRAWLER." },
  { robotId: "junglemaw", name: "BARREIRA SILVESTRE", kind: "aegis", element: "SELVA", rarity: "silver", base: 6.7, step: 1.3, price: 12000, desc: "-6.7% de dano recebido.", flavor: "Modulo silvestre forjado sob medida para JUNGLE MAW." },
  { robotId: "abyssalord", name: "PUNHO ABISSAL", kind: "power", element: "ABISSO", rarity: "gold", base: 10.2, step: 2.6, price: 18000, desc: "+10.2% de FORCA em combate.", flavor: "Modulo abissal forjado sob medida para ABYSSA LORD." },
  { robotId: "toxinvore", name: "PLACA TOXICO", kind: "guard", element: "TOXINA", rarity: "bronze", base: 8, step: 2, price: 8000, desc: "+8% de DEFESA em combate.", flavor: "Modulo toxico forjado sob medida para TOXINVORE." },
  { robotId: "ruinwarden", name: "PROPULSOR RUINOSO", kind: "speed", element: "RUINA", rarity: "silver", base: 9, step: 2.2, price: 12000, desc: "+9% de AGILIDADE em combate.", flavor: "Modulo ruinoso forjado sob medida para RUIN WARDEN." },
  { robotId: "forgeheart", name: "CORACAO FUNDIDO", kind: "vitality", element: "FORJA", rarity: "silver", base: 11.2, step: 2.8, price: 12000, desc: "+11.2% de HP maximo.", flavor: "Modulo fundido forjado sob medida para FORGE HEART." },
  { robotId: "snowreaver", name: "CELULA NIVEO", kind: "reactor", element: "NEVE", rarity: "bronze", base: 12, step: 3, price: 8000, desc: "+12% de MP maximo.", flavor: "Modulo niveo forjado sob medida para SNOW REAVER." },
  { robotId: "ashenrevenant", name: "GARRA CINEREO", kind: "leech", element: "CINZAS", rarity: "gold", base: 10.2, step: 1.9, price: 18000, desc: "Recupera 10.2% do dano causado como HP.", flavor: "Modulo cinereo forjado sob medida para ASHEN REVENANT." },
  { robotId: "plasmawraith", name: "ESPINHO PLASMICO", kind: "thorns", element: "PLASMA", rarity: "gold", base: 12.8, step: 2.6, price: 18000, desc: "Reflete 12.8% do dano recebido.", flavor: "Modulo plasmico forjado sob medida para PLASMA WRAITH." },
  { robotId: "shadowfang", name: "COLMEIA UMBRIO", kind: "regen", element: "SOMBRA", rarity: "silver", base: 4.5, step: 0.9, price: 12000, desc: "Repara 4.5% do HP maximo por turno.", flavor: "Modulo umbrio forjado sob medida para SHADOWFANG." },
  { robotId: "mirrorclad", name: "VISOR ESPELHADO", kind: "crit", element: "ESPELHO", rarity: "gold", base: 6.4, step: 1.3, price: 18000, desc: "+6.4% de chance de golpe critico.", flavor: "Modulo espelhado forjado sob medida para MIRRORCLAD." },
  { robotId: "bonemarshal", name: "MANTO OSSEO", kind: "phase", element: "OSSO", rarity: "silver", base: 4.5, step: 0.9, price: 12000, desc: "+4.5% de chance de esquiva.", flavor: "Modulo osseo forjado sob medida para BONE MARSHAL." },
  { robotId: "cloudpiercer", name: "RESSOADOR NIMBOSO", kind: "amp", element: "NUVEM", rarity: "bronze", base: 7, step: 1.8, price: 8000, desc: "+7% de dano nas habilidades.", flavor: "Modulo nimboso forjado sob medida para CLOUD PIERCER." },
  { robotId: "vulcanargo", name: "BARREIRA VULCANICO", kind: "aegis", element: "VULCAO", rarity: "silver", base: 6.7, step: 1.3, price: 12000, desc: "-6.7% de dano recebido.", flavor: "Modulo vulcanico forjado sob medida para VULCAN ARGO." },
  { robotId: "mireclad", name: "PUNHO PALUSTRE", kind: "power", element: "PANTANO", rarity: "bronze", base: 8, step: 2, price: 8000, desc: "+8% de FORCA em combate.", flavor: "Modulo palustre forjado sob medida para MIRECLAD." },
  { robotId: "aridfang", name: "PLACA ARIDO", kind: "guard", element: "DESERTO", rarity: "bronze", base: 8, step: 2, price: 8000, desc: "+8% de DEFESA em combate.", flavor: "Modulo arido forjado sob medida para ARID FANG." },
  { robotId: "tundrakeeper", name: "PROPULSOR BOREAL", kind: "speed", element: "TUNDRA", rarity: "silver", base: 9, step: 2.2, price: 12000, desc: "+9% de AGILIDADE em combate.", flavor: "Modulo boreal forjado sob medida para TUNDRA KEEPER." },
  { robotId: "reefsovereign", name: "CORACAO CORALINO", kind: "vitality", element: "RECIFE", rarity: "gold", base: 12.8, step: 3.2, price: 18000, desc: "+12.8% de HP maximo.", flavor: "Modulo coralino forjado sob medida para REEF SOVEREIGN." },
  { robotId: "obsidianfist", name: "CELULA OBSIDIANO", kind: "reactor", element: "OBSIDIANA", rarity: "silver", base: 13.4, step: 3.4, price: 12000, desc: "+13.4% de MP maximo.", flavor: "Modulo obsidiano forjado sob medida para OBSIDIAN FIST." },
  { robotId: "amberlock", name: "GARRA AMBARINO", kind: "leech", element: "AMBAR", rarity: "bronze", base: 8, step: 1.5, price: 8000, desc: "Recupera 8% do dano causado como HP.", flavor: "Modulo ambarino forjado sob medida para AMBERLOCK." },
  { robotId: "neondrifter", name: "ESPINHO NEONICO", kind: "thorns", element: "NEON", rarity: "silver", base: 11.2, step: 2.2, price: 12000, desc: "Reflete 11.2% do dano recebido.", flavor: "Modulo neonico forjado sob medida para NEON DRIFTER." },
  { robotId: "rustpriest", name: "COLMEIA OXIDADO", kind: "regen", element: "FERRUGEM", rarity: "bronze", base: 4, step: 0.8, price: 8000, desc: "Repara 4% do HP maximo por turno.", flavor: "Modulo oxidado forjado sob medida para RUST PRIEST." },
  { robotId: "graphenex", name: "VISOR GRAFENICO", kind: "crit", element: "GRAFENO", rarity: "gold", base: 6.4, step: 1.3, price: 18000, desc: "+6.4% de chance de golpe critico.", flavor: "Modulo grafenico forjado sob medida para GRAPHENEX." },
  { robotId: "quantumecho", name: "MANTO QUANTICO", kind: "phase", element: "QUANTUM", rarity: "gold", base: 5.1, step: 1, price: 18000, desc: "+5.1% de chance de esquiva.", flavor: "Modulo quantico forjado sob medida para QUANTUM ECHO." },
  { robotId: "nebulaseer", name: "RESSOADOR NEBULAR", kind: "amp", element: "NEBULOSA", rarity: "silver", base: 7.8, step: 2, price: 12000, desc: "+7.8% de dano nas habilidades.", flavor: "Modulo nebular forjado sob medida para NEBULA SEER." },
  { robotId: "eclipsar", name: "BARREIRA ECLIPTICO", kind: "aegis", element: "ECLIPSE", rarity: "gold", base: 7.7, step: 1.5, price: 18000, desc: "-7.7% de dano recebido.", flavor: "Modulo ecliptico forjado sob medida para ECLIPSAR." },
  { robotId: "meteorpunch", name: "PUNHO METEORICO", kind: "power", element: "METEORO", rarity: "silver", base: 9, step: 2.2, price: 12000, desc: "+9% de FORCA em combate.", flavor: "Modulo meteorico forjado sob medida para METEOR PUNCH." },
  { robotId: "ringwarden", name: "PLACA ORBITAL", kind: "guard", element: "ANEL", rarity: "silver", base: 9, step: 2.2, price: 12000, desc: "+9% de DEFESA em combate.", flavor: "Modulo orbital forjado sob medida para RING WARDEN." },
  { robotId: "pulsarcore", name: "PROPULSOR PULSANTE", kind: "speed", element: "PULSAR", rarity: "gold", base: 10.2, step: 2.6, price: 18000, desc: "+10.2% de AGILIDADE em combate.", flavor: "Modulo pulsante forjado sob medida para PULSAR CORE." },
  { robotId: "voidsingularity", name: "CORACAO SINGULAR", kind: "vitality", element: "BURACO NEGRO", rarity: "gold", base: 12.8, step: 3.2, price: 18000, desc: "+12.8% de HP maximo.", flavor: "Modulo singular forjado sob medida para VOID SINGULARITY." },
  { robotId: "seraphcircuit", name: "CELULA SOLAR", kind: "reactor", element: "LUZ", rarity: "gold", base: 15.4, step: 3.8, price: 18000, desc: "+15.4% de MP maximo.", flavor: "Modulo solar forjado sob medida para SERAPH CIRCUIT." },
  { robotId: "cinderhound", name: "GARRA INCANDESCENTE", kind: "leech", element: "BRASA", rarity: "bronze", base: 8, step: 1.5, price: 8000, desc: "Recupera 8% do dano causado como HP.", flavor: "Modulo incandescente forjado sob medida para CINDERHOUND." },
  { robotId: "glacierjaw", name: "ESPINHO GLACIAL", kind: "thorns", element: "GELO", rarity: "silver", base: 11.2, step: 2.2, price: 12000, desc: "Reflete 11.2% do dano recebido.", flavor: "Modulo glacial forjado sob medida para GLACIER JAW." },
  { robotId: "stormlance", name: "COLMEIA CICLONICO", kind: "regen", element: "TEMPESTADE", rarity: "silver", base: 4.5, step: 0.9, price: 12000, desc: "Repara 4.5% do HP maximo por turno.", flavor: "Modulo ciclonico forjado sob medida para STORMLANCE." },
  { robotId: "terraforge", name: "VISOR TELURICO", kind: "crit", element: "TERRA", rarity: "bronze", base: 5, step: 1, price: 8000, desc: "+5% de chance de golpe critico.", flavor: "Modulo telurico forjado sob medida para TERRAFORGE." },
  { robotId: "windshear", name: "MANTO EOLICO", kind: "phase", element: "VENTO", rarity: "bronze", base: 4, step: 0.8, price: 8000, desc: "+4% de chance de esquiva.", flavor: "Modulo eolico forjado sob medida para WINDSHEAR." },
  { robotId: "voidcaller", name: "RESSOADOR NULO", kind: "amp", element: "VAZIO", rarity: "silver", base: 7.8, step: 2, price: 12000, desc: "+7.8% de dano nas habilidades.", flavor: "Modulo nulo forjado sob medida para VOIDCALLER." },
  { robotId: "acidbloom", name: "BARREIRA CORROSIVO", kind: "aegis", element: "ACIDO", rarity: "bronze", base: 6, step: 1.2, price: 8000, desc: "-6% de dano recebido.", flavor: "Modulo corrosivo forjado sob medida para ACIDBLOOM." },
  { robotId: "gravitide", name: "PUNHO GRAVITICO", kind: "power", element: "GRAVIDADE", rarity: "silver", base: 9, step: 2.2, price: 12000, desc: "+9% de FORCA em combate.", flavor: "Modulo gravitico forjado sob medida para GRAVITIDE." },
  { robotId: "chronofracture", name: "PLACA CRONICO", kind: "guard", element: "TEMPO", rarity: "gold", base: 10.2, step: 2.6, price: 18000, desc: "+10.2% de DEFESA em combate.", flavor: "Modulo cronico forjado sob medida para CHRONOFRACTURE." },
  { robotId: "biolattice", name: "PROPULSOR ORGANICO", kind: "speed", element: "BIO", rarity: "silver", base: 9, step: 2.2, price: 12000, desc: "+9% de AGILIDADE em combate.", flavor: "Modulo organico forjado sob medida para BIOLATTICE." },
  { robotId: "crystallux", name: "CORACAO PRISMATICO", kind: "vitality", element: "CRISTAL", rarity: "gold", base: 12.8, step: 3.2, price: 18000, desc: "+12.8% de HP maximo.", flavor: "Modulo prismatico forjado sob medida para CRYSTALLUX." },
  { robotId: "aquabastion", name: "CELULA AQUATICO", kind: "reactor", element: "AGUA", rarity: "silver", base: 13.4, step: 3.4, price: 12000, desc: "+13.4% de MP maximo.", flavor: "Modulo aquatico forjado sob medida para AQUA BASTION." },
  { robotId: "emberwing", name: "GARRA IGNEO", kind: "leech", element: "FOGO", rarity: "bronze", base: 8, step: 1.5, price: 8000, desc: "Recupera 8% do dano causado como HP.", flavor: "Modulo igneo forjado sob medida para EMBERWING." },
  { robotId: "ironsentinel", name: "ESPINHO FERREO", kind: "thorns", element: "FERRO", rarity: "bronze", base: 10, step: 2, price: 8000, desc: "Reflete 10% do dano recebido.", flavor: "Modulo ferreo forjado sob medida para IRON SENTINEL." },
  { robotId: "thunderoni", name: "COLMEIA VOLTAICO", kind: "regen", element: "TROVAO", rarity: "silver", base: 4.5, step: 0.9, price: 12000, desc: "Repara 4.5% do HP maximo por turno.", flavor: "Modulo voltaico forjado sob medida para THUNDER ONI." },
  { robotId: "titanbulwark", name: "VISOR TITANICO", kind: "crit", element: "TITA", rarity: "gold", base: 6.4, step: 1.3, price: 18000, desc: "+6.4% de chance de golpe critico.", flavor: "Modulo titanico forjado sob medida para TITAN BULWARK." },
  { robotId: "magnashrike", name: "MANTO MAGNETICO", kind: "phase", element: "MAGNETISMO", rarity: "silver", base: 4.5, step: 0.9, price: 12000, desc: "+4.5% de chance de esquiva.", flavor: "Modulo magnetico forjado sob medida para MAGNASHRIKE." },
  { robotId: "jadearbiter", name: "RESSOADOR JADEITA", kind: "amp", element: "JADE", rarity: "gold", base: 9, step: 2.3, price: 18000, desc: "+9% de dano nas habilidades.", flavor: "Modulo jadeita forjado sob medida para JADE ARBITER." },
  { robotId: "cosmoveil", name: "BARREIRA COSMICO", kind: "aegis", element: "COSMICO", rarity: "silver", base: 6.7, step: 1.3, price: 12000, desc: "-6.7% de dano recebido.", flavor: "Modulo cosmico forjado sob medida para COSMOVEIL." },
  { robotId: "sandwyrm", name: "PUNHO ARENOSO", kind: "power", element: "AREIA", rarity: "silver", base: 9, step: 2.2, price: 12000, desc: "+9% de FORCA em combate.", flavor: "Modulo arenoso forjado sob medida para SANDWYRM." },
  { robotId: "pyreconclave", name: "PLACA IGNEO", kind: "guard", element: "FOGO", rarity: "gold", base: 10.2, step: 2.6, price: 18000, desc: "+10.2% de DEFESA em combate.", flavor: "Modulo igneo forjado sob medida para PYRE CONCLAVE." },
  { robotId: "frostmonarch", name: "PROPULSOR GLACIAL FROST", kind: "speed", element: "GELO", rarity: "gold", base: 10.2, step: 2.6, price: 18000, desc: "+10.2% de AGILIDADE em combate.", flavor: "Modulo glacial forjado sob medida para FROST MONARCH." },
  { robotId: "voltcarnyx", name: "CORACAO VOLTAICO VOLTCARNYX", kind: "vitality", element: "TROVAO", rarity: "gold", base: 12.8, step: 3.2, price: 18000, desc: "+12.8% de HP maximo.", flavor: "Modulo voltaico forjado sob medida para VOLTCARNYX." },
  { robotId: "quarrybreaker", name: "CELULA TELURICO", kind: "reactor", element: "TERRA", rarity: "bronze", base: 12, step: 3, price: 8000, desc: "+12% de MP maximo.", flavor: "Modulo telurico forjado sob medida para QUARRY BREAKER." },
  { robotId: "zephyrhalo", name: "GARRA EOLICO", kind: "leech", element: "VENTO", rarity: "gold", base: 10.2, step: 1.9, price: 18000, desc: "Recupera 10.2% do dano causado como HP.", flavor: "Modulo eolico forjado sob medida para ZEPHYR HALO." },
  { robotId: "nullpriest", name: "ESPINHO NULO", kind: "thorns", element: "VAZIO", rarity: "gold", base: 12.8, step: 2.6, price: 18000, desc: "Reflete 12.8% do dano recebido.", flavor: "Modulo nulo forjado sob medida para NULL PRIEST." },
  { robotId: "venomcarapace", name: "COLMEIA TOXICO", kind: "regen", element: "TOXINA", rarity: "silver", base: 4.5, step: 0.9, price: 12000, desc: "Repara 4.5% do HP maximo por turno.", flavor: "Modulo toxico forjado sob medida para VENOM CARAPACE." },
  { robotId: "grimsprocket", name: "VISOR RUINOSO", kind: "crit", element: "RUINA", rarity: "bronze", base: 5, step: 1, price: 8000, desc: "+5% de chance de golpe critico.", flavor: "Modulo ruinoso forjado sob medida para GRIM SPROCKET." },
  { robotId: "blastfurnace", name: "MANTO FUNDIDO", kind: "phase", element: "FORJA", rarity: "gold", base: 5.1, step: 1, price: 18000, desc: "+5.1% de chance de esquiva.", flavor: "Modulo fundido forjado sob medida para BLAST FURNACE." },
  { robotId: "hailstriker", name: "RESSOADOR NIVEO", kind: "amp", element: "NEVE", rarity: "silver", base: 7.8, step: 2, price: 12000, desc: "+7.8% de dano nas habilidades.", flavor: "Modulo niveo forjado sob medida para HAILSTRIKER." },
  { robotId: "emberlash", name: "BARREIRA INCANDESCENTE", kind: "aegis", element: "BRASA", rarity: "bronze", base: 6, step: 1.2, price: 8000, desc: "-6% de dano recebido.", flavor: "Modulo incandescente forjado sob medida para EMBERLASH." },
  { robotId: "lumenblade", name: "PUNHO SOLAR LUMEN", kind: "power", element: "LUZ", rarity: "silver", base: 9, step: 2.2, price: 12000, desc: "+9% de FORCA em combate.", flavor: "Modulo solar forjado sob medida para LUMEN BLADE." },
  { robotId: "gloomtide", name: "PLACA ABISSAL", kind: "guard", element: "ABISSO", rarity: "silver", base: 9, step: 2.2, price: 12000, desc: "+9% de DEFESA em combate.", flavor: "Modulo abissal forjado sob medida para GLOOMTIDE." },
  { robotId: "sporeherald", name: "PROPULSOR ORGANICO SPORE", kind: "speed", element: "BIO", rarity: "bronze", base: 8, step: 2, price: 8000, desc: "+8% de AGILIDADE em combate.", flavor: "Modulo organico forjado sob medida para SPORE HERALD." },
  { robotId: "prismvector", name: "CORACAO PRISMATICO PRISM", kind: "vitality", element: "CRISTAL", rarity: "silver", base: 11.2, step: 2.8, price: 12000, desc: "+11.2% de HP maximo.", flavor: "Modulo prismatico forjado sob medida para PRISM VECTOR." },
  { robotId: "maelstromfist", name: "CELULA AQUATICO MAELSTROM", kind: "reactor", element: "AGUA", rarity: "gold", base: 15.4, step: 3.8, price: 18000, desc: "+15.4% de MP maximo.", flavor: "Modulo aquatico forjado sob medida para MAELSTROM FIST." },
  { robotId: "scrapbaron", name: "GARRA OXIDADO", kind: "leech", element: "FERRUGEM", rarity: "silver", base: 9, step: 1.7, price: 12000, desc: "Recupera 9% do dano causado como HP.", flavor: "Modulo oxidado forjado sob medida para SCRAP BARON." },
  { robotId: "stelladrake", name: "ESPINHO COSMICO", kind: "thorns", element: "COSMICO", rarity: "gold", base: 12.8, step: 2.6, price: 18000, desc: "Reflete 12.8% do dano recebido.", flavor: "Modulo cosmico forjado sob medida para STELLADRAKE." },
  { robotId: "terminuscore", name: "COLMEIA QUANTICO", kind: "regen", element: "QUANTUM", rarity: "gold", base: 5.1, step: 1, price: 18000, desc: "Repara 5.1% do HP maximo por turno.", flavor: "Modulo quantico forjado sob medida para TERMINUS CORE." },
  { robotId: "heliondriver", name: "VISOR HELIACO HELION", kind: "crit", element: "SOL", rarity: "silver", base: 5.6, step: 1.1, price: 12000, desc: "+5.6% de chance de golpe critico.", flavor: "Modulo heliaco forjado sob medida para HELION DRIVER." },
  { robotId: "noxfeather", name: "MANTO UMBRIO", kind: "phase", element: "SOMBRA", rarity: "silver", base: 4.5, step: 0.9, price: 12000, desc: "+4.5% de chance de esquiva.", flavor: "Modulo umbrio forjado sob medida para NOXFEATHER." },
  { robotId: "basaltguard", name: "RESSOADOR OBSIDIANO", kind: "amp", element: "OBSIDIANA", rarity: "bronze", base: 7, step: 1.8, price: 8000, desc: "+7% de dano nas habilidades.", flavor: "Modulo obsidiano forjado sob medida para BASALT GUARD." },
  { robotId: "hexweaver", name: "BARREIRA GRAFENICO", kind: "aegis", element: "GRAFENO", rarity: "silver", base: 6.7, step: 1.3, price: 12000, desc: "-6.7% de dano recebido.", flavor: "Modulo grafenico forjado sob medida para HEXWEAVER." },
  { robotId: "solstitia", name: "PUNHO ECLIPTICO", kind: "power", element: "ECLIPSE", rarity: "silver", base: 9, step: 2.2, price: 12000, desc: "+9% de FORCA em combate.", flavor: "Modulo ecliptico forjado sob medida para SOLSTITIA." },
  { robotId: "cometfang", name: "PLACA METEORICO", kind: "guard", element: "METEORO", rarity: "bronze", base: 8, step: 2, price: 8000, desc: "+8% de DEFESA em combate.", flavor: "Modulo meteorico forjado sob medida para COMETFANG." },
  { robotId: "orbitalmarshal", name: "PROPULSOR ORBITAL", kind: "speed", element: "ANEL", rarity: "gold", base: 10.2, step: 2.6, price: 18000, desc: "+10.2% de AGILIDADE em combate.", flavor: "Modulo orbital forjado sob medida para ORBITAL MARSHAL." },
  { robotId: "neutronmaul", name: "CORACAO PULSANTE", kind: "vitality", element: "PULSAR", rarity: "silver", base: 11.2, step: 2.8, price: 12000, desc: "+11.2% de HP maximo.", flavor: "Modulo pulsante forjado sob medida para NEUTRON MAUL." },
  { robotId: "eventhorizon", name: "CELULA SINGULAR", kind: "reactor", element: "BURACO NEGRO", rarity: "gold", base: 15.4, step: 3.8, price: 18000, desc: "+15.4% de MP maximo.", flavor: "Modulo singular forjado sob medida para EVENT HORIZON." },
  { robotId: "mossknight", name: "GARRA SILVESTRE", kind: "leech", element: "SELVA", rarity: "bronze", base: 8, step: 1.5, price: 8000, desc: "Recupera 8% do dano causado como HP.", flavor: "Modulo silvestre forjado sob medida para MOSS KNIGHT." },
  { robotId: "quicksilverr", name: "ESPINHO ESPELHADO", kind: "thorns", element: "ESPELHO", rarity: "gold", base: 12.8, step: 2.6, price: 18000, desc: "Reflete 12.8% do dano recebido.", flavor: "Modulo espelhado forjado sob medida para QUICKSILVER." },
  { robotId: "boneorchestra", name: "COLMEIA OSSEO", kind: "regen", element: "OSSO", rarity: "gold", base: 5.1, step: 1, price: 18000, desc: "Repara 5.1% do HP maximo por turno.", flavor: "Modulo osseo forjado sob medida para BONE ORCHESTRA." },
  { robotId: "stratoveil", name: "VISOR NIMBOSO", kind: "crit", element: "NUVEM", rarity: "silver", base: 5.6, step: 1.1, price: 12000, desc: "+5.6% de chance de golpe critico.", flavor: "Modulo nimboso forjado sob medida para STRATOVEIL." },
  { robotId: "lavabastion", name: "MANTO VULCANICO", kind: "phase", element: "VULCAO", rarity: "gold", base: 5.1, step: 1, price: 18000, desc: "+5.1% de chance de esquiva.", flavor: "Modulo vulcanico forjado sob medida para LAVA BASTION." },
  { robotId: "bogtyrant", name: "RESSOADOR PALUSTRE", kind: "amp", element: "PANTANO", rarity: "silver", base: 7.8, step: 2, price: 12000, desc: "+7.8% de dano nas habilidades.", flavor: "Modulo palustre forjado sob medida para BOG TYRANT." },
  { robotId: "mirageblade", name: "BARREIRA ARIDO", kind: "aegis", element: "DESERTO", rarity: "gold", base: 7.7, step: 1.5, price: 18000, desc: "-7.7% de dano recebido.", flavor: "Modulo arido forjado sob medida para MIRAGE BLADE." },
  { robotId: "permafrostmk", name: "PUNHO BOREAL", kind: "power", element: "TUNDRA", rarity: "gold", base: 10.2, step: 2.6, price: 18000, desc: "+10.2% de FORCA em combate.", flavor: "Modulo boreal forjado sob medida para PERMAFROST MK." },
  { robotId: "coralshiv", name: "PLACA CORALINO", kind: "guard", element: "RECIFE", rarity: "bronze", base: 8, step: 2, price: 8000, desc: "+8% de DEFESA em combate.", flavor: "Modulo coralino forjado sob medida para CORAL SHIV." },
  { robotId: "resinjudge", name: "PROPULSOR AMBARINO", kind: "speed", element: "AMBAR", rarity: "silver", base: 9, step: 2.2, price: 12000, desc: "+9% de AGILIDADE em combate.", flavor: "Modulo ambarino forjado sob medida para RESIN JUDGE." },
  { robotId: "gridrunner", name: "CORACAO NEONICO", kind: "vitality", element: "NEON", rarity: "bronze", base: 10, step: 2.5, price: 8000, desc: "+10% de HP maximo.", flavor: "Modulo neonico forjado sob medida para GRIDRUNNER." },
  { robotId: "seraphimvoid", name: "CELULA NULO", kind: "reactor", element: "VAZIO", rarity: "gold", base: 15.4, step: 3.8, price: 18000, desc: "+15.4% de MP maximo.", flavor: "Modulo nulo forjado sob medida para SERAPHIM VOID." },
  { robotId: "tempestcrown", name: "GARRA CICLONICO", kind: "leech", element: "TEMPESTADE", rarity: "gold", base: 10.2, step: 1.9, price: 18000, desc: "Recupera 10.2% do dano causado como HP.", flavor: "Modulo ciclonico forjado sob medida para TEMPEST CROWN." },
  { robotId: "ironmonarch", name: "ESPINHO FERREO IRON", kind: "thorns", element: "FERRO", rarity: "gold", base: 12.8, step: 2.6, price: 18000, desc: "Reflete 12.8% do dano recebido.", flavor: "Modulo ferreo forjado sob medida para IRON MONARCH." },
  { robotId: "vireoblade", name: "COLMEIA JADEITA", kind: "regen", element: "JADE", rarity: "silver", base: 4.5, step: 0.9, price: 12000, desc: "Repara 4.5% do HP maximo por turno.", flavor: "Modulo jadeita forjado sob medida para VIREO BLADE." },
  { robotId: "aetherloom", name: "VISOR NEBULAR", kind: "crit", element: "NEBULOSA", rarity: "gold", base: 6.4, step: 1.3, price: 18000, desc: "+6.4% de chance de golpe critico.", flavor: "Modulo nebular forjado sob medida para AETHER LOOM." },
  { robotId: "cindercrown", name: "MANTO CINEREO", kind: "phase", element: "CINZAS", rarity: "silver", base: 4.5, step: 0.9, price: 12000, desc: "+4.5% de chance de esquiva.", flavor: "Modulo cinereo forjado sob medida para CINDER CROWN." },
  { robotId: "magnetarfist", name: "RESSOADOR MAGNETICO", kind: "amp", element: "MAGNETISMO", rarity: "gold", base: 9, step: 2.3, price: 18000, desc: "+9% de dano nas habilidades.", flavor: "Modulo magnetico forjado sob medida para MAGNETAR FIST." },
  { robotId: "ravenousbloom", name: "BARREIRA ORGANICO RAVENOUS", kind: "aegis", element: "BIO", rarity: "gold", base: 7.7, step: 1.5, price: 18000, desc: "-7.7% de dano recebido.", flavor: "Modulo organico forjado sob medida para RAVENOUS BLOOM." },
  // --- GADGETS 220 ---
  { robotId: "obsidianfang", name: "CORACAO PRIMEVO", kind: "vitality", element: "OBSIDIANA", rarity: "silver", base: 11.5, step: 2.8, price: 12000, desc: "+11.5% de HP maximo.", flavor: "Modulo primevo forjado sob medida para OBSIDIAN FANG." },
  { robotId: "aurumtitan", name: "CORACAO TITANICO", kind: "vitality", element: "OURO", rarity: "gold", base: 13.4, step: 3.2, price: 18000, desc: "+13.4% de HP maximo.", flavor: "Modulo titanico forjado sob medida para AURUM TITAN." },
  { robotId: "mycelor", name: "GARRA CAUSTICO", kind: "leech", element: "FUNGO", rarity: "bronze", base: 8.4, step: 1.5, price: 8000, desc: "Recupera 8.4% do dano causado como HP.", flavor: "Modulo caustico forjado sob medida para MYCELOR." },
  { robotId: "tidebreaker", name: "GARRA PRIMEVO", kind: "leech", element: "MARE", rarity: "silver", base: 9.6, step: 1.7, price: 12000, desc: "Recupera 9.6% do dano causado como HP.", flavor: "Modulo primevo forjado sob medida para TIDEBREAKER." },
  { robotId: "nimbusaint", name: "CORACAO SPECTRAL", kind: "vitality", element: "NUVEM", rarity: "gold", base: 13.3, step: 3.2, price: 18000, desc: "+13.3% de HP maximo.", flavor: "Modulo spectral forjado sob medida para NIMBUS SAINT." },
  { robotId: "scrapjaw", name: "GARRA SPECTRAL", kind: "leech", element: "SUCATA", rarity: "bronze", base: 8.5, step: 1.5, price: 8000, desc: "Recupera 8.5% do dano causado como HP.", flavor: "Modulo spectral forjado sob medida para SCRAPJAW." },
  { robotId: "chronowraith", name: "ESPINHO TITANICO", kind: "thorns", element: "TEMPO", rarity: "gold", base: 13.4, step: 2.5, price: 18000, desc: "Reflete 13.4% do dano recebido.", flavor: "Modulo titanico forjado sob medida para CHRONO WRAITH." },
  { robotId: "basaltgore", name: "PROPULSOR ARCANO", kind: "speed", element: "BASALTO", rarity: "bronze", base: 8.5, step: 2.0, price: 8000, desc: "+8.5% de AGILIDADE em combate.", flavor: "Modulo arcano forjado sob medida para BASALT GORE." },
  { robotId: "seraphlux", name: "RESSOADOR ETEREO", kind: "amp", element: "SANTO", rarity: "gold", base: 9.2, step: 2.3, price: 18000, desc: "+9.2% de dano nas habilidades.", flavor: "Modulo etereo forjado sob medida para SERAPH LUX." },
  { robotId: "venomcoil", name: "RESSOADOR TITANICO", kind: "amp", element: "VENENO", rarity: "silver", base: 8.0, step: 2.0, price: 12000, desc: "+8.0% de dano nas habilidades.", flavor: "Modulo titanico forjado sob medida para VENOM COIL." },
  { robotId: "magnetarch", name: "VISOR ARCANO", kind: "crit", element: "MAGNETISMO", rarity: "silver", base: 6.1, step: 1.1, price: 12000, desc: "+6.1% de chance de golpe critico.", flavor: "Modulo arcano forjado sob medida para MAGNETARCH." },
  { robotId: "emberkite", name: "BARREIRA TITANICO", kind: "aegis", element: "BRASA", rarity: "bronze", base: 5.8, step: 1.1, price: 8000, desc: "-5.8% de dano recebido.", flavor: "Modulo titanico forjado sob medida para EMBER KITE." },
  { robotId: "gravelord", name: "ESPINHO ARCANO", kind: "thorns", element: "GRAVIDADE", rarity: "gold", base: 13.3, step: 2.5, price: 18000, desc: "Reflete 13.3% do dano recebido.", flavor: "Modulo arcano forjado sob medida para GRAVELORD." },
  { robotId: "silkarachne", name: "CELULA TITANICO", kind: "reactor", element: "SEDA", rarity: "silver", base: 13.7, step: 3.4, price: 12000, desc: "+13.7% de MP maximo.", flavor: "Modulo titanico forjado sob medida para SILK ARACHNE." },
  { robotId: "boreaxe", name: "RESSOADOR TITANICO", kind: "amp", element: "VENTANIA", rarity: "bronze", base: 7.7, step: 1.8, price: 8000, desc: "+7.7% de dano nas habilidades.", flavor: "Modulo titanico forjado sob medida para BOREAXE." },
  { robotId: "plasmoth", name: "PUNHO ARCANO", kind: "power", element: "PLASMA", rarity: "silver", base: 9.6, step: 2.2, price: 12000, desc: "+9.6% de FORCA em combate.", flavor: "Modulo arcano forjado sob medida para PLASMOTH." },
  { robotId: "steelmonk", name: "RESSOADOR RUNICO", kind: "amp", element: "DISCIPLINA", rarity: "bronze", base: 7.5, step: 1.8, price: 8000, desc: "+7.5% de dano nas habilidades.", flavor: "Modulo runico forjado sob medida para IRON MONK." },
  { robotId: "nebulynx", name: "PROPULSOR CAUSTICO", kind: "speed", element: "NEBULOSA", rarity: "gold", base: 10.8, step: 2.5, price: 18000, desc: "+10.8% de AGILIDADE em combate.", flavor: "Modulo caustico forjado sob medida para NEBULYNX." },
  { robotId: "rustsaurus", name: "CORACAO SIDERAL", kind: "vitality", element: "FERRUGEM", rarity: "bronze", base: 10.3, step: 2.5, price: 8000, desc: "+10.3% de HP maximo.", flavor: "Modulo sideral forjado sob medida para RUSTSAURUS." },
  { robotId: "crystalquartz", name: "VISOR COLOSSAL", kind: "crit", element: "CRISTAL", rarity: "silver", base: 6.2, step: 1.1, price: 12000, desc: "+6.2% de chance de golpe critico.", flavor: "Modulo colossal forjado sob medida para CRYSTAL QUARTZ." },
  { robotId: "bogmire", name: "VISOR CAUSTICO", kind: "crit", element: "PANTANO", rarity: "bronze", base: 5.4, step: 1.0, price: 8000, desc: "+5.4% de chance de golpe critico.", flavor: "Modulo caustico forjado sob medida para BOGMIRE." },
  { robotId: "solstice", name: "CORACAO SPECTRAL", kind: "vitality", element: "ESTACAO", rarity: "gold", base: 13.4, step: 3.2, price: 18000, desc: "+13.4% de HP maximo.", flavor: "Modulo spectral forjado sob medida para SOLSTICE." },
  { robotId: "neonrunner", name: "VISOR COLOSSAL", kind: "crit", element: "NEON", rarity: "silver", base: 5.6, step: 1.1, price: 12000, desc: "+5.6% de chance de golpe critico.", flavor: "Modulo colossal forjado sob medida para NEON RUNNER." },
  { robotId: "cathedron", name: "PLACA SPECTRAL", kind: "guard", element: "CATEDRAL", rarity: "gold", base: 9.8, step: 2.3, price: 18000, desc: "+9.8% de DEFESA em combate.", flavor: "Modulo spectral forjado sob medida para CATHEDRON." },
  { robotId: "kelpwarden", name: "COLMEIA TITANICO", kind: "regen", element: "ALGA", rarity: "bronze", base: 4.5, step: 0.8, price: 8000, desc: "Repara 4.5% do HP maximo por turno.", flavor: "Modulo titanico forjado sob medida para KELP WARDEN." },
  { robotId: "thunderbison", name: "ESPINHO ETEREO", kind: "thorns", element: "TROVAO", rarity: "silver", base: 11.4, step: 2.2, price: 12000, desc: "Reflete 11.4% do dano recebido.", flavor: "Modulo etereo forjado sob medida para THUNDER BISON." },
  { robotId: "prismblade", name: "VISOR ETEREO", kind: "crit", element: "ARCO-IRIS", rarity: "gold", base: 6.9, step: 1.3, price: 18000, desc: "+6.9% de chance de golpe critico.", flavor: "Modulo etereo forjado sob medida para PRISM BLADE." },
  { robotId: "ashenhound", name: "MANTO MORTIFERO", kind: "phase", element: "CINZAS", rarity: "bronze", base: 4.5, step: 0.8, price: 8000, desc: "+4.5% de chance de esquiva.", flavor: "Modulo mortifero forjado sob medida para CINDER HOUND." },
  { robotId: "aetherbell", name: "GARRA SPECTRAL", kind: "leech", element: "ETER", rarity: "silver", base: 9.3, step: 1.7, price: 12000, desc: "Recupera 9.3% do dano causado como HP.", flavor: "Modulo spectral forjado sob medida para AETHER BELL." },
  { robotId: "dreadnought", name: "GARRA TITANICO", kind: "leech", element: "GUERRA", rarity: "gold", base: 10.4, step: 2.0, price: 18000, desc: "Recupera 10.4% do dano causado como HP.", flavor: "Modulo titanico forjado sob medida para DREADNOUGHT X." },
  { robotId: "wispkin", name: "CELULA COLOSSAL", kind: "reactor", element: "ESPIRITO", rarity: "bronze", base: 12.5, step: 3.1, price: 8000, desc: "+12.5% de MP maximo.", flavor: "Modulo colossal forjado sob medida para WISPKIN." },
  { robotId: "obeliskar", name: "BARREIRA RUNICO", kind: "aegis", element: "RUNA", rarity: "silver", base: 6.1, step: 1.2, price: 12000, desc: "-6.1% de dano recebido.", flavor: "Modulo runico forjado sob medida para OBELISKAR." },
  { robotId: "sirenfall", name: "CELULA TITANICO", kind: "reactor", element: "CANTO", rarity: "gold", base: 15.7, step: 3.9, price: 18000, desc: "+15.7% de MP maximo.", flavor: "Modulo titanico forjado sob medida para SIRENFALL." },
  { robotId: "boilerbrute", name: "CORACAO CAUSTICO", kind: "vitality", element: "VAPOR", rarity: "bronze", base: 10.1, step: 2.5, price: 8000, desc: "+10.1% de HP maximo.", flavor: "Modulo caustico forjado sob medida para BOILER BRUTE." },
  { robotId: "voidmantis", name: "MANTO MORTIFERO", kind: "phase", element: "VAZIO", rarity: "gold", base: 5.8, step: 1.0, price: 18000, desc: "+5.8% de chance de esquiva.", flavor: "Modulo mortifero forjado sob medida para VOID MANTIS." },
  { robotId: "harvestking", name: "VISOR SPECTRAL", kind: "crit", element: "COLHEITA", rarity: "silver", base: 6.2, step: 1.1, price: 12000, desc: "+6.2% de chance de golpe critico.", flavor: "Modulo spectral forjado sob medida para HARVEST KING." },
  { robotId: "polarisguard", name: "PROPULSOR SIDERAL", kind: "speed", element: "POLAR", rarity: "silver", base: 9.5, step: 2.2, price: 12000, desc: "+9.5% de AGILIDADE em combate.", flavor: "Modulo sideral forjado sob medida para POLARIS GUARD." },
  { robotId: "sandvizier", name: "COLMEIA VORAZ", kind: "regen", element: "DESERTO", rarity: "gold", base: 5.3, step: 1.0, price: 18000, desc: "Repara 5.3% do HP maximo por turno.", flavor: "Modulo voraz forjado sob medida para SAND VIZIER." },
  { robotId: "clockthrone", name: "CORACAO ARCANO", kind: "vitality", element: "ENGRENAGEM", rarity: "gold", base: 13.4, step: 3.2, price: 18000, desc: "+13.4% de HP maximo.", flavor: "Modulo arcano forjado sob medida para CLOCK THRONE." },
  { robotId: "fenrisbyte", name: "PUNHO SIDERAL", kind: "power", element: "LOBO", rarity: "silver", base: 9.4, step: 2.2, price: 12000, desc: "+9.4% de FORCA em combate.", flavor: "Modulo sideral forjado sob medida para FENRISBYTE." },
  { robotId: "emberlotus", name: "CELULA RUNICO", kind: "reactor", element: "FLOR", rarity: "silver", base: 13.8, step: 3.4, price: 12000, desc: "+13.8% de MP maximo.", flavor: "Modulo runico forjado sob medida para EMBER LOTUS." },
  { robotId: "stygianox", name: "COLMEIA ETEREO", kind: "regen", element: "ABISMO", rarity: "bronze", base: 4.1, step: 0.8, price: 8000, desc: "Repara 4.1% do HP maximo por turno.", flavor: "Modulo etereo forjado sob medida para STYGIAN OX." },
  { robotId: "photonveil", name: "RESSOADOR ARCANO", kind: "amp", element: "FOTON", rarity: "gold", base: 9.8, step: 2.3, price: 18000, desc: "+9.8% de dano nas habilidades.", flavor: "Modulo arcano forjado sob medida para PHOTON VEIL." },
  { robotId: "grimquill", name: "COLMEIA ETEREO", kind: "regen", element: "PENA", rarity: "silver", base: 4.7, step: 0.9, price: 12000, desc: "Repara 4.7% do HP maximo por turno.", flavor: "Modulo etereo forjado sob medida para GRIM QUILL." },
  { robotId: "magmaticus", name: "VISOR CAUSTICO", kind: "crit", element: "MAGMA", rarity: "gold", base: 6.9, step: 1.3, price: 18000, desc: "+6.9% de chance de golpe critico.", flavor: "Modulo caustico forjado sob medida para MAGMATICUS." },
  { robotId: "frostpike", name: "BARREIRA VORAZ", kind: "aegis", element: "GEADA", rarity: "bronze", base: 5.8, step: 1.1, price: 8000, desc: "-5.8% de dano recebido.", flavor: "Modulo voraz forjado sob medida para FROST PIKE." },
  { robotId: "orbitalance", name: "BARREIRA MORTIFERO", kind: "aegis", element: "ORBITA", rarity: "silver", base: 6.6, step: 1.2, price: 12000, desc: "-6.6% de dano recebido.", flavor: "Modulo mortifero forjado sob medida para ORBITALANCE." },
  { robotId: "bramblewrath", name: "VISOR FERAL", kind: "crit", element: "ESPINHO", rarity: "bronze", base: 5.5, step: 1.0, price: 8000, desc: "+5.5% de chance de golpe critico.", flavor: "Modulo feral forjado sob medida para BRAMBLE WRATH." },
  { robotId: "cobaltronin", name: "ESPINHO PRIMEVO", kind: "thorns", element: "AÇO AZUL", rarity: "gold", base: 12.9, step: 2.5, price: 18000, desc: "Reflete 12.9% do dano recebido.", flavor: "Modulo primevo forjado sob medida para COBALT RONIN." },
  { robotId: "sporequeen", name: "MANTO VORAZ", kind: "phase", element: "ESPORO", rarity: "gold", base: 5.7, step: 1.0, price: 18000, desc: "+5.7% de chance de esquiva.", flavor: "Modulo voraz forjado sob medida para SPORE QUEEN." },
  { robotId: "quakejaw", name: "MANTO ETEREO", kind: "phase", element: "TERREMOTO", rarity: "silver", base: 4.7, step: 0.9, price: 12000, desc: "+4.7% de chance de esquiva.", flavor: "Modulo etereo forjado sob medida para QUAKE JAW." },
  { robotId: "astrafox", name: "CORACAO RUNICO", kind: "vitality", element: "ESTRELA", rarity: "silver", base: 11.4, step: 2.8, price: 12000, desc: "+11.4% de HP maximo.", flavor: "Modulo runico forjado sob medida para ASTRA FOX." },
  { robotId: "hullbreaker", name: "ESPINHO FERAL", kind: "thorns", element: "TITANIO", rarity: "bronze", base: 10.5, step: 2.0, price: 8000, desc: "Reflete 10.5% do dano recebido.", flavor: "Modulo feral forjado sob medida para HULL BREAKER." },
  { robotId: "aurorafin", name: "CORACAO VORAZ", kind: "vitality", element: "AURORA", rarity: "gold", base: 13.3, step: 3.2, price: 18000, desc: "+13.3% de HP maximo.", flavor: "Modulo voraz forjado sob medida para AURORA FIN." },
  { robotId: "mirrorage", name: "PROPULSOR TITANICO", kind: "speed", element: "ESPELHO", rarity: "gold", base: 10.4, step: 2.5, price: 18000, desc: "+10.4% de AGILIDADE em combate.", flavor: "Modulo titanico forjado sob medida para MIRRORAGE." },
  { robotId: "carrionvex", name: "PLACA PRIMEVO", kind: "guard", element: "PRAGA", rarity: "silver", base: 8.2, step: 2.0, price: 12000, desc: "+8.2% de DEFESA em combate.", flavor: "Modulo primevo forjado sob medida para CARRION VEX." },
  { robotId: "titanforge", name: "COLMEIA TITANICO", kind: "regen", element: "FORJA", rarity: "gold", base: 5.9, step: 1.0, price: 18000, desc: "Repara 5.9% do HP maximo por turno.", flavor: "Modulo titanico forjado sob medida para TITAN FORGE." },
  { robotId: "glasscicada", name: "BARREIRA SPECTRAL", kind: "aegis", element: "VIDRO", rarity: "bronze", base: 5.4, step: 1.1, price: 8000, desc: "-5.4% de dano recebido.", flavor: "Modulo spectral forjado sob medida para GLASS CICADA." },
  { robotId: "shogunplate", name: "GARRA ARCANO", kind: "leech", element: "SAMURAI", rarity: "gold", base: 10.8, step: 2.0, price: 18000, desc: "Recupera 10.8% do dano causado como HP.", flavor: "Modulo arcano forjado sob medida para SHOGUN PLATE." },
  { robotId: "dustmoth", name: "VISOR SIDERAL", kind: "crit", element: "POEIRA", rarity: "bronze", base: 5.4, step: 1.0, price: 8000, desc: "+5.4% de chance de golpe critico.", flavor: "Modulo sideral forjado sob medida para DUST MOTH." },
  { robotId: "hydroquake", name: "ESPINHO PRIMEVO", kind: "thorns", element: "TSUNAMI", rarity: "silver", base: 11.7, step: 2.2, price: 12000, desc: "Reflete 11.7% do dano recebido.", flavor: "Modulo primevo forjado sob medida para HYDROQUAKE." },
  { robotId: "emberfang", name: "PROPULSOR MORTIFERO", kind: "speed", element: "CHAMA", rarity: "bronze", base: 8.4, step: 2.0, price: 8000, desc: "+8.4% de AGILIDADE em combate.", flavor: "Modulo mortifero forjado sob medida para EMBER FANG." },
  { robotId: "lanternghast", name: "CELULA VORAZ", kind: "reactor", element: "ALMA", rarity: "silver", base: 14.0, step: 3.4, price: 12000, desc: "+14.0% de MP maximo.", flavor: "Modulo voraz forjado sob medida para LANTERN GHAST." },
  { robotId: "cobblegolem", name: "CORACAO MORTIFERO", kind: "vitality", element: "PEDRA", rarity: "bronze", base: 10.4, step: 2.5, price: 8000, desc: "+10.4% de HP maximo.", flavor: "Modulo mortifero forjado sob medida para COBBLE GOLEM." },
  { robotId: "skyforgewing", name: "RESSOADOR SIDERAL", kind: "amp", element: "CEU", rarity: "gold", base: 9.4, step: 2.3, price: 18000, desc: "+9.4% de dano nas habilidades.", flavor: "Modulo sideral forjado sob medida para SKYFORGE WING." },
  { robotId: "scarabking", name: "RESSOADOR SIDERAL", kind: "amp", element: "BESOURO", rarity: "gold", base: 9.5, step: 2.3, price: 18000, desc: "+9.5% de dano nas habilidades.", flavor: "Modulo sideral forjado sob medida para SCARAB KING." },
  { robotId: "tempestcoil", name: "PLACA FERAL", kind: "guard", element: "TEMPESTADE", rarity: "silver", base: 8.4, step: 2.0, price: 12000, desc: "+8.4% de DEFESA em combate.", flavor: "Modulo feral forjado sob medida para TEMPEST COIL." },
  { robotId: "marblesaint", name: "CORACAO RUNICO", kind: "vitality", element: "MARMORE", rarity: "silver", base: 11.8, step: 2.8, price: 12000, desc: "+11.8% de HP maximo.", flavor: "Modulo runico forjado sob medida para MARBLE SAINT." },
  { robotId: "gearwidow", name: "CELULA FERAL", kind: "reactor", element: "RELOJOARIA", rarity: "silver", base: 13.9, step: 3.4, price: 12000, desc: "+13.9% de MP maximo.", flavor: "Modulo feral forjado sob medida para GEAR WIDOW." },
  { robotId: "radiantcalf", name: "PLACA COLOSSAL", kind: "guard", element: "SOL", rarity: "bronze", base: 7.3, step: 1.8, price: 8000, desc: "+7.3% de DEFESA em combate.", flavor: "Modulo colossal forjado sob medida para RADIANT CALF." },
  { robotId: "acidgrin", name: "CORACAO CAUSTICO", kind: "vitality", element: "ACIDO", rarity: "silver", base: 11.8, step: 2.8, price: 12000, desc: "+11.8% de HP maximo.", flavor: "Modulo caustico forjado sob medida para ACID GRIN." },
  { robotId: "bastionhold", name: "PUNHO RUNICO", kind: "power", element: "FORTALEZA", rarity: "gold", base: 10.5, step: 2.5, price: 18000, desc: "+10.5% de FORCA em combate.", flavor: "Modulo runico forjado sob medida para BASTION HOLD." },
  { robotId: "meteorachi", name: "RESSOADOR SIDERAL", kind: "amp", element: "METEORO", rarity: "gold", base: 9.3, step: 2.3, price: 18000, desc: "+9.3% de dano nas habilidades.", flavor: "Modulo sideral forjado sob medida para METEORACHI." },
  { robotId: "silentquill", name: "GARRA COLOSSAL", kind: "leech", element: "SILENCIO", rarity: "silver", base: 9.6, step: 1.7, price: 12000, desc: "Recupera 9.6% do dano causado como HP.", flavor: "Modulo colossal forjado sob medida para SILENT QUILL." },
  { robotId: "boltbunny", name: "PROPULSOR PRIMEVO", kind: "speed", element: "FAISCA", rarity: "bronze", base: 8.4, step: 2.0, price: 8000, desc: "+8.4% de AGILIDADE em combate.", flavor: "Modulo primevo forjado sob medida para BOLT BUNNY." },
  { robotId: "furnaceoni", name: "RESSOADOR MORTIFERO", kind: "amp", element: "INFERNO", rarity: "gold", base: 9.5, step: 2.3, price: 18000, desc: "+9.5% de dano nas habilidades.", flavor: "Modulo mortifero forjado sob medida para FURNACE ONI." },
  { robotId: "glacierarch", name: "CELULA FERAL", kind: "reactor", element: "GLACIAL", rarity: "gold", base: 15.5, step: 3.9, price: 18000, desc: "+15.5% de MP maximo.", flavor: "Modulo feral forjado sob medida para GLACIER ARCH." },
  { robotId: "swiftgale", name: "ESPINHO SIDERAL", kind: "thorns", element: "BRISA", rarity: "bronze", base: 10.6, step: 2.0, price: 8000, desc: "Reflete 10.6% do dano recebido.", flavor: "Modulo sideral forjado sob medida para SWIFT GALE." },
  { robotId: "darkharbor", name: "CELULA RUNICO", kind: "reactor", element: "BREU", rarity: "silver", base: 13.8, step: 3.4, price: 12000, desc: "+13.8% de MP maximo.", flavor: "Modulo runico forjado sob medida para DARK HARBOR." },
  { robotId: "solderjack", name: "PLACA MORTIFERO", kind: "guard", element: "SOLDA", rarity: "bronze", base: 7.3, step: 1.8, price: 8000, desc: "+7.3% de DEFESA em combate.", flavor: "Modulo mortifero forjado sob medida para SOLDER JACK." },
  { robotId: "valkyrune", name: "PLACA CAUSTICO", kind: "guard", element: "VALQUIRIA", rarity: "gold", base: 9.5, step: 2.3, price: 18000, desc: "+9.5% de DEFESA em combate.", flavor: "Modulo caustico forjado sob medida para VALKYRUNE." },
  { robotId: "mudlarker", name: "COLMEIA FERAL", kind: "regen", element: "LODO", rarity: "bronze", base: 4.1, step: 0.8, price: 8000, desc: "Repara 4.1% do HP maximo por turno.", flavor: "Modulo feral forjado sob medida para MUDLARKER." },
  { robotId: "crimsonaria", name: "RESSOADOR ETEREO", kind: "amp", element: "SANGUE", rarity: "gold", base: 9.2, step: 2.3, price: 18000, desc: "+9.2% de dano nas habilidades.", flavor: "Modulo etereo forjado sob medida para CRIMSON ARIA." },
  { robotId: "stonewhisker", name: "CELULA MORTIFERO", kind: "reactor", element: "GRANITO", rarity: "bronze", base: 12.2, step: 3.1, price: 8000, desc: "+12.2% de MP maximo.", flavor: "Modulo mortifero forjado sob medida para STONE WHISKER." },
  { robotId: "skyreef", name: "CELULA COLOSSAL", kind: "reactor", element: "CORAL", rarity: "silver", base: 14.0, step: 3.4, price: 12000, desc: "+14.0% de MP maximo.", flavor: "Modulo colossal forjado sob medida para SKY REEF." },
  { robotId: "ironpilgrim", name: "GARRA RUNICO", kind: "leech", element: "PEREGRINO", rarity: "silver", base: 9.3, step: 1.7, price: 12000, desc: "Recupera 9.3% do dano causado como HP.", flavor: "Modulo runico forjado sob medida para IRON PILGRIM." },
  { robotId: "nightjarx", name: "RESSOADOR PRIMEVO", kind: "amp", element: "NOITE", rarity: "silver", base: 8.5, step: 2.0, price: 12000, desc: "+8.5% de dano nas habilidades.", flavor: "Modulo primevo forjado sob medida para NIGHTJAR X." },
  { robotId: "pyreherald", name: "VISOR ARCANO", kind: "crit", element: "PIRA", rarity: "gold", base: 6.4, step: 1.3, price: 18000, desc: "+6.4% de chance de golpe critico.", flavor: "Modulo arcano forjado sob medida para PYRE HERALD." },
  { robotId: "dunemaw", name: "RESSOADOR PRIMEVO", kind: "amp", element: "AREIA MOVEDIÇA", rarity: "silver", base: 8.3, step: 2.0, price: 12000, desc: "+8.3% de dano nas habilidades.", flavor: "Modulo primevo forjado sob medida para DUNE MAW." },
  { robotId: "circuitmonk", name: "ESPINHO SIDERAL", kind: "thorns", element: "CIRCUITO", rarity: "gold", base: 13.4, step: 2.5, price: 18000, desc: "Reflete 13.4% do dano recebido.", flavor: "Modulo sideral forjado sob medida para CIRCUIT MONK." },
  { robotId: "frostmourn", name: "CELULA ETEREO", kind: "reactor", element: "LAMENTO", rarity: "gold", base: 15.6, step: 3.9, price: 18000, desc: "+15.6% de MP maximo.", flavor: "Modulo etereo forjado sob medida para FROST MOURN." },
  { robotId: "brasslion", name: "PUNHO CAUSTICO", kind: "power", element: "LATAO", rarity: "silver", base: 9.3, step: 2.2, price: 12000, desc: "+9.3% de FORCA em combate.", flavor: "Modulo caustico forjado sob medida para BRASS LION." },
  { robotId: "tarpitfiend", name: "BARREIRA ARCANO", kind: "aegis", element: "PICHE", rarity: "bronze", base: 5.4, step: 1.1, price: 8000, desc: "-5.4% de dano recebido.", flavor: "Modulo arcano forjado sob medida para TARPIT FIEND." },
  { robotId: "skyloomweaver", name: "PROPULSOR PRIMEVO", kind: "speed", element: "TECELA", rarity: "silver", base: 9.4, step: 2.2, price: 12000, desc: "+9.4% de AGILIDADE em combate.", flavor: "Modulo primevo forjado sob medida para SKYLOOM WEAVER." },
  { robotId: "boulderox", name: "GARRA RUNICO", kind: "leech", element: "ROCHA", rarity: "bronze", base: 8.7, step: 1.5, price: 8000, desc: "Recupera 8.7% do dano causado como HP.", flavor: "Modulo runico forjado sob medida para BOULDER OX." },
  { robotId: "halcyonix", name: "CORACAO SPECTRAL", kind: "vitality", element: "CALMARIA", rarity: "gold", base: 12.9, step: 3.2, price: 18000, desc: "+12.9% de HP maximo.", flavor: "Modulo spectral forjado sob medida para HALCYONIX." },
  { robotId: "gravebyte", name: "VISOR SIDERAL", kind: "crit", element: "TUMULO", rarity: "silver", base: 5.7, step: 1.1, price: 12000, desc: "+5.7% de chance de golpe critico.", flavor: "Modulo sideral forjado sob medida para GRAVEBYTE." },
  { robotId: "emberveilla", name: "COLMEIA MORTIFERO", kind: "regen", element: "FOGO FATUO", rarity: "silver", base: 5.1, step: 0.9, price: 12000, desc: "Repara 5.1% do HP maximo por turno.", flavor: "Modulo mortifero forjado sob medida para EMBER VEILLA." },
  { robotId: "titanomaw", name: "VISOR COLOSSAL", kind: "crit", element: "TITAN", rarity: "gold", base: 6.4, step: 1.3, price: 18000, desc: "+6.4% de chance de golpe critico.", flavor: "Modulo colossal forjado sob medida para TITANOMAW." },
  { robotId: "zenithara", name: "ESPINHO TITANICO", kind: "thorns", element: "ZENITE", rarity: "gold", base: 13.5, step: 2.5, price: 18000, desc: "Reflete 13.5% do dano recebido.", flavor: "Modulo titanico forjado sob medida para ZENITHARA." },
  // --- FIM GADGETS 220 ---
];

export const GADGET_MAP: Record<string, GadgetDef> = Object.fromEntries(
  GADGETS.map((g) => [g.robotId, g]),
);

export const KIND_LABEL: Record<GadgetKind, string> = {
  power: "OVERDRIVE",
  guard: "COURACA",
  speed: "TURBINA",
  vitality: "NUCLEO VITAL",
  reactor: "REATOR",
  leech: "DRENO",
  thorns: "REPULSOR",
  regen: "NANOFORJA",
  crit: "MIRA",
  phase: "DESLOCADOR",
  amp: "AMPLIFICADOR",
  aegis: "EGIDE",
};

/** valor do efeito para um nivel de gadget (escala pelo marco atual) */
export function gadgetValue(def: GadgetDef, level: number): number {
  const l = Math.max(1, Math.min(GADGET_MAX_LEVEL, level));
  const raw = def.base + def.step * 0.6 * (l - 1);
  return Math.round(raw * GADGET_MK_MULT[gadgetMk(l)] * 10) / 10;
}

export function gadgetDesc(def: GadgetDef, level: number): string {
  const v = gadgetValue(def, level);
  switch (def.kind) {
    case "power":
      return `+${v}% de FORCA em combate.`;
    case "guard":
      return `+${v}% de DEFESA em combate.`;
    case "speed":
      return `+${v}% de AGILIDADE em combate.`;
    case "vitality":
      return `+${v}% de HP maximo.`;
    case "reactor":
      return `+${v}% de MP maximo.`;
    case "leech":
      return `Recupera ${v}% do dano causado como HP.`;
    case "thorns":
      return `Reflete ${v}% do dano recebido.`;
    case "regen":
      return `Repara ${v}% do HP maximo por turno.`;
    case "crit":
      return `+${v}% de chance de golpe critico.`;
    case "phase":
      return `+${v}% de chance de esquiva.`;
    case "amp":
      return `+${v}% de dano nas habilidades.`;
    case "aegis":
      return `-${v}% de dano recebido.`;
  }
}

/** custo para subir do nivel atual para o proximo */
export function upgradeCost(def: GadgetDef, current: number): number {
  return Math.round((def.price * 0.3 * Math.pow(current + 1, 1.12)) / 50) * 50;
}

export function gadgetArt(robotId: string): string {
  return `/gadgets/${robotId}.png`;
}

/** nivel do gadget usado por robos da IA (so a partir do nivel 10 do robo) */
export function aiGadgetLevel(robotId: string, robotLevel: number): number {
  if (robotLevel < GADGET_ROBOT_LEVEL || !GADGET_MAP[robotId]) return 0;
  const seed = [...robotId].reduce((a, c) => a + c.charCodeAt(0), 0);
  const base = Math.floor((robotLevel - GADGET_ROBOT_LEVEL) / 9) + 1;
  return Math.max(1, Math.min(GADGET_MAX_LEVEL, base + (seed % 2)));
}

// ------------------------------------------------------------------- chips
// Chips sao modulos genericos do jogador: forjados com ouro + lingotes e
// encaixados nos sockets do gadget de qualquer robo. 12 tipos x 4 tiers = 48.

export interface ChipDef {
  id: string;
  name: string;
  kind: GadgetKind;
  /** 1..4 */
  tier: number;
  tierName: string;
  /** bonus do chip no efeito correspondente */
  value: number;
  price: number;
  /** lingotes exigidos na forja */
  bars: number;
  desc: string;
}

const CHIP_TIERS = [
  { tier: 1, name: "BRUTO", mult: 1, price: 2500, bars: 4 },
  { tier: 2, name: "REFINADO", mult: 2.1, price: 9000, bars: 12 },
  { tier: 3, name: "OTIMIZADO", mult: 3.4, price: 26000, bars: 26 },
  { tier: 4, name: "SINGULAR", mult: 5, price: 70000, bars: 55 },
];

const CHIP_BASE: Record<GadgetKind, { name: string; value: number }> = {
  power: { name: "CHIP DE IMPACTO", value: 3.5 },
  guard: { name: "CHIP DE ANTEPARO", value: 3.5 },
  speed: { name: "CHIP DE GIRO", value: 3.2 },
  vitality: { name: "CHIP DE FOLE", value: 4 },
  reactor: { name: "CHIP DE CELULA", value: 5 },
  leech: { name: "CHIP DE SIFAO", value: 2.6 },
  thorns: { name: "CHIP DE REPULSA", value: 3.8 },
  regen: { name: "CHIP DE SUTURA", value: 1.6 },
  crit: { name: "CHIP DE MIRA", value: 2, },
  phase: { name: "CHIP DE DESVIO", value: 1.6 },
  amp: { name: "CHIP DE RESSONANCIA", value: 3 },
  aegis: { name: "CHIP DE EGIDE", value: 2.2 },
};

const CHIP_KINDS = Object.keys(CHIP_BASE) as GadgetKind[];

function chipEffectDesc(kind: GadgetKind, v: number): string {
  switch (kind) {
    case "power":
      return `+${v}% de FORCA`;
    case "guard":
      return `+${v}% de DEFESA`;
    case "speed":
      return `+${v}% de AGILIDADE`;
    case "vitality":
      return `+${v}% de HP maximo`;
    case "reactor":
      return `+${v}% de MP maximo`;
    case "leech":
      return `+${v}% de dreno`;
    case "thorns":
      return `+${v}% de espinhos`;
    case "regen":
      return `+${v}% de reparo por turno`;
    case "crit":
      return `+${v}% de critico`;
    case "phase":
      return `+${v}% de esquiva`;
    case "amp":
      return `+${v}% de dano nas habilidades`;
    case "aegis":
      return `-${v}% de dano recebido`;
  }
}

export const CHIPS: ChipDef[] = CHIP_KINDS.flatMap((kind) =>
  CHIP_TIERS.map((t) => {
    const value = Math.round(CHIP_BASE[kind].value * t.mult * 10) / 10;
    return {
      id: `${kind}_t${t.tier}`,
      name: `${CHIP_BASE[kind].name} ${t.name}`,
      kind,
      tier: t.tier,
      tierName: t.name,
      value,
      price: t.price,
      bars: t.bars,
      desc: `${chipEffectDesc(kind, value)}.`,
    };
  }),
);

export const CHIP_MAP: Record<string, ChipDef> = Object.fromEntries(
  CHIPS.map((c) => [c.id, c]),
);

export const CHIP_TIER_COLOR = ["#c98a4b", "#cfd8e3", "#ffd24a", "#b06bff"];

export function chipColor(def: ChipDef): string {
  return CHIP_TIER_COLOR[Math.max(0, Math.min(3, def.tier - 1))];
}

/**
 * Soma de todos os efeitos de um gadget: o efeito principal do proprio gadget
 * mais os chips encaixados nos sockets liberados.
 */
export function gadgetTotals(
  def: GadgetDef | undefined,
  level: number,
  chipIds: (string | null | undefined)[] = [],
): Partial<Record<GadgetKind, number>> {
  const out: Partial<Record<GadgetKind, number>> = {};
  if (!def || level <= 0) return out;
  const add = (kind: GadgetKind, v: number) => {
    out[kind] = Math.round(((out[kind] ?? 0) + v) * 10) / 10;
  };
  add(def.kind, gadgetValue(def, level));
  const sockets = gadgetSockets(level);
  chipIds.slice(0, sockets).forEach((id) => {
    const chip = id ? CHIP_MAP[id] : undefined;
    if (chip) add(chip.kind, chip.value);
  });
  return out;
}

/** Chips que a IA encaixa, conforme o nivel do robo (deterministico). */
export function aiChips(robotId: string, robotLevel: number): string[] {
  const glevel = aiGadgetLevel(robotId, robotLevel);
  const sockets = gadgetSockets(glevel);
  if (sockets <= 0) return [];
  const seed = [...robotId].reduce((a, c) => a + c.charCodeAt(0), 0);
  const tier = Math.max(1, Math.min(4, 1 + Math.floor((robotLevel - 20) / 20)));
  const out: string[] = [];
  for (let i = 0; i < sockets; i++) {
    const kind = CHIP_KINDS[(seed + i * 5) % CHIP_KINDS.length];
    out.push(`${kind}_t${tier}`);
  }
  return out;
}
