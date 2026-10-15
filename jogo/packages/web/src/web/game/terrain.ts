/**
 * Fase H1 — terreno de arena.
 *
 * Cada uma das 11 arenas (game/arenas.ts) deixa de ser só cenário: cada
 * posição de formação cai numa ZONA com efeito real (dano por turno, cobertura,
 * buff de stat, cura, crit, energia) e cada arena tem um CLIMA que gira a cada
 * round e altera o combate inteiro.
 *
 * Nada aqui gera arte: zona e clima são descritos por cor + rótulo + ícone de
 * /ui, e desenhados pela UI de combate.
 */

import { ARENA_IDS, ARENA_NAMES, type ArenaId } from "./arenas";
import type { Position } from "./kits/types";

export const ZONE_KINDS = [
  "hazard",
  "cover",
  "buff",
  "heal",
  "crit",
  "energy",
  "void",
] as const;

export type ZoneKind = (typeof ZONE_KINDS)[number];

export interface Zone {
  id: string;
  arena: ArenaId;
  position: Position;
  kind: ZoneKind;
  /** magnitude: % de HP por turno, % de dano, % de stat, crit em pontos. */
  val: number;
  label: string;
  color: string;
  desc: string;
  /** stats afetados quando kind === "buff". */
  stat?: "str" | "def" | "agl";
}

export interface WeatherDef {
  id: string;
  label: string;
  color: string;
  desc: string;
  /** % de dano somado no golpe de uma família elemental. */
  element?: string;
  /** % de dano somado a golpes de status/elemento genérico. */
  dmgBonus?: number;
  /** Restrição por tag; sem elemento/tag o bônus vale para todos os golpes. */
  damageTag?: string;
  elementBonuses?: Record<string, number>;
  crit?: number;
  noTerrainHeal?: boolean;
  /** dano por turno em todos os lutadores (% do HP máximo). */
  dot?: number;
  /** % de esquiva extra para todos. */
  evade?: number;
  /** % de cura recebida a mais. */
  healIn?: number;
  /** % de MP drenado por turno. */
  mpDrain?: number;
}

/**
 * Roda de clima: 3 estados por arena, girando um por round. Sempre entra o
 * primeiro no round 1 — o jogador aprende o padrão e pode planejar o timing.
 */
export const ARENA_WEATHER: Partial<Record<ArenaId, WeatherDef[]>> = {
  dojo: [
    { id: "brisa_serena", label: "BRISA SERENA", color: "#8dff7a", desc: "Ar limpo do pátio: +10% de cura recebida.", healIn: 10 },
    { id: "poeira_de_treino", label: "POEIRA DE TREINO", color: "#c99a5b", desc: "Nuvem de terra: -6% de dano em golpes de área.", damageTag: "area", dmgBonus: -6 },
    { id: "silencio_ritual", label: "SILÊNCIO RITUAL", color: "#b07aff", desc: "O dojo prende a voz: -8% de MP de todos por turno.", mpDrain: 8 },
  ],
  neodojo: [
    { id: "neon_pulsante", label: "NÉON PULSANTE", color: "#ff5bd0", desc: "Luz de propaganda: +12% de dano para ELÉTRICO.", element: "ELETRICO", dmgBonus: 12 },
    { id: "neblina_de_dados", label: "NEBLINA DE DADOS", color: "#8fd6ff", desc: "Interferência: +10% de esquiva para todos.", evade: 10 },
    { id: "apagao", label: "APAGÃO", color: "#4a1e85", desc: "Rede cai: +25% de dano para SOMBRA.", element: "SOMBRA", dmgBonus: 25 },
  ],
  volcano: [
    { id: "chuva_de_cinzas", label: "CHUVA DE CINZAS", color: "#ff6a2a", desc: "Cinza quente: +20% de dano para FOGO e 5% de HP por turno.", element: "FOGO", dmgBonus: 20, dot: 5 },
    { id: "onda_de_calor", label: "ONDA DE CALOR", color: "#ffe94d", desc: "Calor sufocante: -10% de cura recebida para todos.", healIn: -10 },
    { id: "erupcao_menor", label: "ERUPÇÃO MENOR", color: "#ffb43a", desc: "Rocha incandescente: 10% do HP máximo por turno.", dot: 10 },
  ],
  foundry: [
    { id: "faiscas", label: "FAÍSCAS", color: "#f2c14e", desc: "Solda voando: +15% de dano para METAL.", element: "METAL", dmgBonus: 15 },
    { id: "prensa_ativa", label: "PRENSA ATIVA", color: "#c9d2e0", desc: "Martelo industrial: +18% de dano em golpes contundentes.", damageTag: "contundente", dmgBonus: 18 },
    { id: "vazamento_toxico", label: "VAZAMENTO TÓXICO", color: "#9dff6a", desc: "Tanque rachado: 6% de HP por turno e +15% para TÓXICO.", element: "TOXICO", dmgBonus: 15, dot: 6 },
  ],
  orbital: [
    { id: "vacuo", label: "VÁCUO", color: "#8fd6ff", desc: "Sem ar: +12% de dano para COSMICO, sem cura de terreno.", element: "COSMICO", dmgBonus: 12, noTerrainHeal: true },
    { id: "radiacao", label: "RADIAÇÃO", color: "#7cf0e0", desc: "Chuva de partículas: +15% para QUÂNTICO e 4% de HP por turno.", element: "QUANTICO", dmgBonus: 15, dot: 4 },
    { id: "eclipse_orbital", label: "ECLIPSE ORBITAL", color: "#2a4f96", desc: "Sol bloqueado: LUZ perde 20% e SOMBRA ganha 20%.", elementBonuses: { LUZ: -20, SOMBRA: 20 } },
  ],
  frozen: [
    { id: "nevasca", label: "NEVASCA", color: "#7fe4ff", desc: "Vento gelado: +20% de dano para GELO e 5% de HP por turno.", element: "GELO", dmgBonus: 20, dot: 5 },
    { id: "gelo_fino", label: "GELO FINO", color: "#bfeaff", desc: "Chão traiçoeiro: +12% de esquiva para todos.", evade: 12 },
    { id: "branco_absoluto", label: "BRANCO ABSOLUTO", color: "#ffffff", desc: "Visibilidade zero: -15% de crítico para todos.", crit: -15 },
  ],
  crystal: [
    { id: "refracao", label: "REFRACÇÃO", color: "#d7a6ff", desc: "Facetas vivas: +20% de dano para CRISTAL.", element: "CRISTAL", dmgBonus: 20 },
    { id: "eco_prismatico", label: "ECO PRISMÁTICO", color: "#ff9ce8", desc: "Golpes ecoam: +12% de dano em golpes de ARCANO.", element: "ARCANO", dmgBonus: 12 },
    { id: "ressonancia", label: "RESSONÂNCIA", color: "#f2c14e", desc: "A caverna devolve o som: +18% de dano em área.", damageTag: "area", dmgBonus: 18 },
  ],
  sky: [
    { id: "corrente_ascendente", label: "CORRENTE ASCENDENTE", color: "#a8ffd9", desc: "Térmica forte: +22% de dano para VENTO.", element: "VENTO", dmgBonus: 22 },
    { id: "vento_cortante", label: "VENTO CORTANTE", color: "#8dffce", desc: "Lâmina de ar: 5% de HP por turno em todos.", dot: 5 },
    { id: "ar_rarefeito", label: "AR RAREFEITO", color: "#cfe4ff", desc: "Falta oxigênio: -10% de dano para todos.", dmgBonus: -10 },
  ],
  storm: [
    { id: "tempestade", label: "TEMPESTADE", color: "#ffe94d", desc: "Descarga total: +25% de dano para ELÉTRICO e 6% de HP por turno.", element: "ELETRICO", dmgBonus: 25, dot: 6 },
    { id: "raio_dirigido", label: "RAIO DIRIGIDO", color: "#ffd447", desc: "Pulso concentrado: +30% no próximo golpe elétrico do round.", element: "ELETRICO", dmgBonus: 30 },
    { id: "calmaria_do_olho", label: "CALMARIA DO OLHO", color: "#57d76a", desc: "Centro da tempestade: +20% de cura recebida.", healIn: 20 },
  ],
  sunken: [
    { id: "mare_alta", label: "MARÉ ALTA", color: "#5aa9ff", desc: "Água sobe: +20% de dano para ÁGUA e 4% de HP por turno.", element: "AGUA", dmgBonus: 20, dot: 4 },
    { id: "corrente_fria", label: "CORRENTE FRIA", color: "#7fe4ff", desc: "Água gelada: +15% para GELO.", element: "GELO", dmgBonus: 15 },
    { id: "agua_corrompida", label: "ÁGUA CORROMPIDA", color: "#9dff6a", desc: "Templo contaminado: +18% para TÓXICO e 5% de HP por turno.", element: "TOXICO", dmgBonus: 18, dot: 5 },
  ],
  canyon: [
    { id: "vendaval_de_areia", label: "VENDAVAL DE AREIA", color: "#c99a5b", desc: "Areia nos servos: +18% para TERRA e 5% de HP por turno.", element: "TERRA", dmgBonus: 18, dot: 5 },
    { id: "sol_a_pino", label: "SOL A PINO", color: "#ffe94d", desc: "Reflexo ofuscante: +15% de dano para LUZ, -8% de esquiva.", element: "LUZ", dmgBonus: 15, evade: -8 },
    { id: "desmoronamento", label: "DESMORONAMENTO", color: "#a12c05", desc: "Estátuas caem: +22% em golpes de IMPACTO.", element: "IMPACTO", dmgBonus: 22 },
  ],
  necroforge: [
    { id: "chama_verde", label: "CHAMA VERDE", color: "#4dff88", desc: "Forja espectral: +18% para ARCANO.", element: "ARCANO", dmgBonus: 18 },
    { id: "fuligem_viva", label: "FULIGEM VIVA", color: "#9ab0a4", desc: "Fuligem: 4% de HP por turno.", dot: 4 },
    { id: "martelo_fantasma", label: "MARTELO FANTASMA", color: "#c0ffd8", desc: "Golpes de IMPACTO +20%.", element: "IMPACTO", dmgBonus: 20 },
  ],
  biodome: [
    { id: "orvalho", label: "ORVALHO", color: "#a8e86a", desc: "Estufa umida: +12% de cura recebida.", healIn: 12 },
    { id: "esporos", label: "ESPOROS", color: "#c8ff8a", desc: "Esporos: +18% para BIO e 4% de HP por turno.", element: "BIO", dmgBonus: 18, dot: 4 },
    { id: "luz_solar", label: "LUZ SOLAR", color: "#ffe94d", desc: "Cupula aberta: +15% para LUZ.", element: "LUZ", dmgBonus: 15 },
  ],
  necropolis: [
    { id: "neblina_fria", label: "NEBLINA FRIA", color: "#b9a8d6", desc: "Nevoa: +18% para SOMBRA.", element: "SOMBRA", dmgBonus: 18 },
    { id: "lamento", label: "LAMENTO", color: "#c08cff", desc: "Lamento: 8% de MP drenado por turno.", mpDrain: 8 },
    { id: "lua_de_osso", label: "LUA DE OSSO", color: "#e6e0cf", desc: "Lua palida: +15% para GELO.", element: "GELO", dmgBonus: 15 },
  ],
  spire: [
    { id: "vento_alto", label: "VENTO ALTO", color: "#bfeaff", desc: "Altitude: +18% para VENTO.", element: "VENTO", dmgBonus: 18 },
    { id: "raio_sagrado", label: "RAIO SAGRADO", color: "#fff2b0", desc: "Luz do pinaculo: +20% para LUZ.", element: "LUZ", dmgBonus: 20 },
    { id: "bencao", label: "BENCAO", color: "#8dff7a", desc: "Bencao: +14% de cura recebida.", healIn: 14 },
  ],
  trench: [
    { id: "pressao", label: "PRESSAO", color: "#30f0d0", desc: "Pressao: 5% de HP por turno.", dot: 5 },
    { id: "bioluz", label: "BIOLUZ", color: "#7ff0d6", desc: "Bioluz: +18% para AGUA.", element: "AGUA", dmgBonus: 18 },
    { id: "corrente_negra", label: "CORRENTE NEGRA", color: "#2a6fb0", desc: "Corrente: +10% de esquiva.", evade: 10 },
  ],
  throne: [
    { id: "estandartes", label: "ESTANDARTES", color: "#f0c04a", desc: "Pompa real: +18% para METAL.", element: "METAL", dmgBonus: 18 },
    { id: "vitral", label: "VITRAL", color: "#ff6a6a", desc: "Vitral rubro: +18% para FOGO.", element: "FOGO", dmgBonus: 18 },
    { id: "ordem_real", label: "ORDEM REAL", color: "#d9c9a0", desc: "Decreto: 8% de MP drenado por turno.", mpDrain: 8 },
  ],
};

export interface FieldState {
  arena: ArenaId;
  /** índice do clima atual na roda da arena */
  weatherIndex: number;
  weather: WeatherDef;
  zones: Zone[];
}

/** Zonas autorais de cada arena, uma por posição de formação. */
const ARENA_ZONES: Partial<Record<ArenaId, Zone[]>> = {
  dojo: [
    { id: "dojo_g", arena: "dojo", position: "guarda", kind: "cover", val: 12, label: "PISO DE TÁBUAS", color: "#c99a5b", desc: "Tábuas firmes: -12% de dano recebido.", stat: "def" },
    { id: "dojo_f", arena: "dojo", position: "flanco", kind: "buff", val: 10, label: "MARCA DE TREINO", color: "#8dff7a", desc: "Linha de treino: +10% de força.", stat: "str" },
    { id: "dojo_s", arena: "dojo", position: "suporte", kind: "heal", val: 5, label: "FONTE DO PÁTIO", color: "#5aa9ff", desc: "Água fresca: cura 5% do HP por turno." },
    { id: "dojo_n", arena: "dojo", position: "nucleo", kind: "energy", val: 6, label: "ALTAR", color: "#8fd6ff", desc: "Altar carregado: +6 de MP por turno." },
  ],
  neodojo: [
    { id: "neo_g", arena: "neodojo", position: "guarda", kind: "buff", val: 14, label: "PAINEL NEON", color: "#ff5bd0", desc: "Painel de propaganda: +14% de agilidade.", stat: "agl" },
    { id: "neo_f", arena: "neodojo", position: "flanco", kind: "crit", val: 8, label: "MIRANTE HOLO", color: "#7cf0e0", desc: "Retículo holográfico: +8 de crítico." },
    { id: "neo_s", arena: "neodojo", position: "suporte", kind: "cover", val: 10, label: "BIOMBO DE LED", color: "#8fd6ff", desc: "Painel translúcido: -10% de dano recebido." },
    { id: "neo_n", arena: "neodojo", position: "nucleo", kind: "hazard", val: 5, label: "CABOS VIVOS", color: "#ffe94d", desc: "Fiação exposta: 5% do HP por turno." },
  ],
  volcano: [
    { id: "vol_g", arena: "volcano", position: "guarda", kind: "hazard", val: 7, label: "FISSURA DE LAVA", color: "#ff6a2a", desc: "Lava viva: 7% do HP por turno." },
    { id: "vol_f", arena: "volcano", position: "flanco", kind: "buff", val: 16, label: "VENTO DE BRASA", color: "#ffb43a", desc: "Ar incandescente: +16% de força.", stat: "str" },
    { id: "vol_s", arena: "volcano", position: "suporte", kind: "hazard", val: 4, label: "PEDRA MORNA", color: "#a12c05", desc: "Rocha morna: 4% do HP por turno." },
    { id: "vol_n", arena: "volcano", position: "nucleo", kind: "crit", val: 10, label: "BOCA DO CRATERA", color: "#ffd447", desc: "Calor no alvo: +10 de crítico." },
  ],
  foundry: [
    { id: "fun_g", arena: "foundry", position: "guarda", kind: "cover", val: 16, label: "CHAPA DE AÇO", color: "#c9d2e0", desc: "Placa de blindagem: -16% de dano recebido." },
    { id: "fun_f", arena: "foundry", position: "flanco", kind: "buff", val: 12, label: "BRAÇO MECÂNICO", color: "#f2c14e", desc: "Braço hidráulico: +12% de força.", stat: "str" },
    { id: "fun_s", arena: "foundry", position: "suporte", kind: "energy", val: 8, label: "TOMADA INDUSTRIAL", color: "#8fd6ff", desc: "Rede trifásica: +8 de MP por turno." },
    { id: "fun_n", arena: "foundry", position: "nucleo", kind: "hazard", val: 5, label: "CALDEIRA", color: "#ff6a2a", desc: "Caldeira aberta: 5% do HP por turno." },
  ],
  orbital: [
    { id: "orb_g", arena: "orbital", position: "guarda", kind: "void", val: 10, label: "BORDA DE PLATAFORMA", color: "#2a4f96", desc: "Sem gravidade na borda: +10% de dano recebido." },
    { id: "orb_f", arena: "orbital", position: "flanco", kind: "buff", val: 18, label: "CANHÃO DE BORDO", color: "#8fd6ff", desc: "Emplacamento de tiro: +18% de força.", stat: "str" },
    { id: "orb_s", arena: "orbital", position: "suporte", kind: "energy", val: 10, label: "REATOR", color: "#7cf0e0", desc: "Reator auxiliar: +10 de MP por turno." },
    { id: "orb_n", arena: "orbital", position: "nucleo", kind: "cover", val: 14, label: "CASCO DE PONTOS", color: "#cfe4ff", desc: "Anteparo de titânio: -14% de dano recebido." },
  ],
  frozen: [
    { id: "fr_g", arena: "frozen", position: "guarda", kind: "hazard", val: 6, label: "LAGO CONGELADO", color: "#7fe4ff", desc: "Gelo fino: 6% do HP por turno." },
    { id: "fr_f", arena: "frozen", position: "flanco", kind: "crit", val: 12, label: "ESTALACTITE", color: "#bfeaff", desc: "Ponta de gelo: +12 de crítico." },
    { id: "fr_s", arena: "frozen", position: "suporte", kind: "heal", val: 6, label: "ABRIGO DE NEVE", color: "#5aa9ff", desc: "Cavidade isolante: cura 6% do HP por turno." },
    { id: "fr_n", arena: "frozen", position: "nucleo", kind: "buff", val: 15, label: "AURORA BOREAL", color: "#8dffce", desc: "Luz polar: +15% de agilidade.", stat: "agl" },
  ],
  crystal: [
    { id: "cr_g", arena: "crystal", position: "guarda", kind: "buff", val: 16, label: "PAREDE DE QUARTZO", color: "#d7a6ff", desc: "Quartzo em volta: +16% de defesa.", stat: "def" },
    { id: "cr_f", arena: "crystal", position: "flanco", kind: "crit", val: 14, label: "FACETA AFIADA", color: "#f2c14e", desc: "Aresta de cristal: +14 de crítico." },
    { id: "cr_s", arena: "crystal", position: "suporte", kind: "hazard", val: 5, label: "GEOÉLIO", color: "#ff9ce8", desc: "Vetor de eco: 5% do HP por turno." },
    { id: "cr_n", arena: "crystal", position: "nucleo", kind: "cover", val: 18, label: "DENTRO DO GEODO", color: "#bfa6ff", desc: "Blindagem de pedra: -18% de dano recebido." },
  ],
  sky: [
    { id: "sk_g", arena: "sky", position: "guarda", kind: "void", val: 12, label: "SEM CORRIMÃO", color: "#a8ffd9", desc: "Borda no vazio: +12% de dano recebido." },
    { id: "sk_f", arena: "sky", position: "flanco", kind: "buff", val: 20, label: "TÉRMICA", color: "#8dffce", desc: "Corrente ascendente: +20% de agilidade.", stat: "agl" },
    { id: "sk_s", arena: "sky", position: "suporte", kind: "heal", val: 5, label: "NUVEM CARREGADA", color: "#5aa9ff", desc: "Nuvem úmida: cura 5% do HP por turno." },
    { id: "sk_n", arena: "sky", position: "nucleo", kind: "crit", val: 12, label: "OLHO DO CÉU", color: "#fff2b8", desc: "Vista privilegiada: +12 de crítico." },
  ],
  storm: [
    { id: "st_g", arena: "storm", position: "guarda", kind: "hazard", val: 8, label: "PARA-RAIOS", color: "#ffe94d", desc: "Atrai raios: 8% do HP por turno." },
    { id: "st_f", arena: "storm", position: "flanco", kind: "buff", val: 14, label: "BOBINA", color: "#ffd447", desc: "Bobina exposta: +14% de força.", stat: "str" },
    { id: "st_s", arena: "storm", position: "suporte", kind: "energy", val: 12, label: "CAPACITOR", color: "#8fd6ff", desc: "Banco de capacitores: +12 de MP por turno." },
    { id: "st_n", arena: "storm", position: "nucleo", kind: "cover", val: 12, label: "ESTRUTURA DE PEDRA", color: "#c9d2e0", desc: "Arco de pedra: -12% de dano recebido." },
  ],
  sunken: [
    { id: "su_g", arena: "sunken", position: "guarda", kind: "hazard", val: 6, label: "ÁGUA NO PEITO", color: "#5aa9ff", desc: "Maré forte: 6% do HP por turno." },
    { id: "su_f", arena: "sunken", position: "flanco", kind: "buff", val: 15, label: "ESCOLHO DE CORAL", color: "#8dffce", desc: "Crista afiada: +15% de força.", stat: "str" },
    { id: "su_s", arena: "sunken", position: "suporte", kind: "heal", val: 7, label: "TURBILHÃO LIMPO", color: "#7cf0e0", desc: "Corrente purificadora: cura 7% do HP por turno." },
    { id: "su_n", arena: "sunken", position: "nucleo", kind: "energy", val: 9, label: "PEDRA DE ÂMBAR", color: "#f2c14e", desc: "Selo do templo: +9 de MP por turno." },
  ],
  canyon: [
    { id: "ca_g", arena: "canyon", position: "guarda", kind: "cover", val: 14, label: "BLOCO DE PEDRA", color: "#c99a5b", desc: "Resto de estátua: -14% de dano recebido." },
    { id: "ca_f", arena: "canyon", position: "flanco", kind: "buff", val: 15, label: "RAMPA", color: "#f2c14e", desc: "Terreno alto: +15% de força.", stat: "str" },
    { id: "ca_s", arena: "canyon", position: "suporte", kind: "hazard", val: 5, label: "AREIA MOVEDIÇA", color: "#6f4a1e", desc: "Areia movediça: 5% do HP por turno." },
    { id: "ca_n", arena: "canyon", position: "nucleo", kind: "crit", val: 13, label: "COLUNA CAÍDA", color: "#ffb43a", desc: "Linha limpa de tiro: +13 de crítico." },
  ],
  necroforge: [
    { id: "nec_g", arena: "necroforge", position: "guarda", kind: "cover", val: 14, label: "ENXOVIA", color: "#4dff88", desc: "Bigorna espectral: -14% de dano recebido." },
    { id: "nec_f", arena: "necroforge", position: "flanco", kind: "buff", val: 12, label: "MARTELO", color: "#c0ffd8", desc: "Forja ativa: +12% de forca.", stat: "str" },
    { id: "nec_s", arena: "necroforge", position: "suporte", kind: "heal", val: 5, label: "BRASA VERDE", color: "#4dff88", desc: "Brasa curativa: 5% do HP por turno." },
    { id: "nec_n", arena: "necroforge", position: "nucleo", kind: "energy", val: 8, label: "NUCLEO DA FORJA", color: "#9affc8", desc: "Nucleo: +8 de MP por turno." },
  ],
  biodome: [
    { id: "bio_g", arena: "biodome", position: "guarda", kind: "cover", val: 12, label: "TRONCO", color: "#a8e86a", desc: "Tronco denso: -12% de dano recebido." },
    { id: "bio_f", arena: "biodome", position: "flanco", kind: "buff", val: 12, label: "SEIVA", color: "#c8ff8a", desc: "Seiva: +12% de agilidade.", stat: "agl" },
    { id: "bio_s", arena: "biodome", position: "suporte", kind: "heal", val: 6, label: "CANTEIRO", color: "#68c056", desc: "Canteiro: cura 6% do HP por turno." },
    { id: "bio_n", arena: "biodome", position: "nucleo", kind: "hazard", val: 5, label: "ESPINHEIRAL", color: "#17441c", desc: "Espinhos: 5% do HP por turno." },
  ],
  necropolis: [
    { id: "npl_g", arena: "necropolis", position: "guarda", kind: "cover", val: 13, label: "LAPIDE", color: "#b9a8d6", desc: "Lapide: -13% de dano recebido." },
    { id: "npl_f", arena: "necropolis", position: "flanco", kind: "hazard", val: 5, label: "CRIPTA", color: "#5a5266", desc: "Cripta: 5% do HP por turno." },
    { id: "npl_s", arena: "necropolis", position: "suporte", kind: "energy", val: 8, label: "ALTAR FUNEBRE", color: "#c08cff", desc: "Altar: +8 de MP por turno." },
    { id: "npl_n", arena: "necropolis", position: "nucleo", kind: "crit", val: 13, label: "MAUSOLEU", color: "#e6e0cf", desc: "Sombra longa: +13 de critico." },
  ],
  spire: [
    { id: "spi_g", arena: "spire", position: "guarda", kind: "cover", val: 12, label: "COLUNATA", color: "#fff0c4", desc: "Colunata: -12% de dano recebido." },
    { id: "spi_f", arena: "spire", position: "flanco", kind: "buff", val: 12, label: "BANDEIRA", color: "#ffe08a", desc: "Estandarte: +12% de forca.", stat: "str" },
    { id: "spi_s", arena: "spire", position: "suporte", kind: "heal", val: 6, label: "FONTE SAGRADA", color: "#8dff7a", desc: "Fonte: cura 6% do HP por turno." },
    { id: "spi_n", arena: "spire", position: "nucleo", kind: "crit", val: 14, label: "CUPULA", color: "#ffe08a", desc: "Foco de luz: +14 de critico." },
  ],
  trench: [
    { id: "tre_g", arena: "trench", position: "guarda", kind: "cover", val: 14, label: "CASCO AFUNDADO", color: "#1c5a86", desc: "Casco: -14% de dano recebido." },
    { id: "tre_f", arena: "trench", position: "flanco", kind: "buff", val: 12, label: "CORRENTE", color: "#30f0d0", desc: "Corrente: +12% de agilidade.", stat: "agl" },
    { id: "tre_s", arena: "trench", position: "suporte", kind: "hazard", val: 5, label: "FENDA TERMICA", color: "#ff6a1a", desc: "Fenda: 5% do HP por turno." },
    { id: "tre_n", arena: "trench", position: "nucleo", kind: "energy", val: 9, label: "ORBE ABISSAL", color: "#7ff0d6", desc: "Orbe: +9 de MP por turno." },
  ],
  throne: [
    { id: "thr_g", arena: "throne", position: "guarda", kind: "cover", val: 15, label: "DEGRAU REAL", color: "#f0c04a", desc: "Degrau: -15% de dano recebido." },
    { id: "thr_f", arena: "throne", position: "flanco", kind: "buff", val: 12, label: "ESTANDARTE", color: "#ff6a6a", desc: "Estandarte: +12% de forca.", stat: "str" },
    { id: "thr_s", arena: "throne", position: "suporte", kind: "heal", val: 5, label: "CALICE", color: "#ffd35a", desc: "Calice: cura 5% do HP por turno." },
    { id: "thr_n", arena: "throne", position: "nucleo", kind: "crit", val: 15, label: "TRONO", color: "#ffd35a", desc: "Trono: +15 de critico." },
  ],
};

const FIELD_PARENT: Record<string, ArenaId> = {"archive": "neodojo", "aurora": "frozen", "crown": "throne", "forge": "foundry", "genesis": "biodome", "graveyard": "necropolis", "hangar": "foundry", "orbit": "orbital", "reactor": "storm", "rift": "orbital", "skyfall": "sky", "swarm": "biodome", "tundra": "frozen", "undercity": "neodojo", "m_draft": "foundry", "m_caravan": "canyon", "m_rift": "orbital", "m_mirror": "crystal", "m_siege": "foundry", "m_hunt": "neodojo", "m_reactors": "storm", "m_mono": "crystal", "m_stakes": "throne", "m_maze": "biodome"};
for (const [id, parent] of Object.entries(FIELD_PARENT)) {
  ARENA_WEATHER[id as ArenaId] = ARENA_WEATHER[parent]?.map((w) => ({ ...w, id: `${id}_${w.id}` }));
  ARENA_ZONES[id as ArenaId] = ARENA_ZONES[parent]?.map((z) => ({ ...z, id: `${id}_${z.id}`, arena: id as ArenaId }));
}

export function arenaZones(arena: string): Zone[] {
  const id = (ARENA_IDS as string[]).includes(arena) ? (arena as ArenaId) : "dojo";
  return ARENA_ZONES[id] ?? ARENA_ZONES.dojo!;
}

export function arenaWeather(arena: string): WeatherDef[] {
  const id = (ARENA_IDS as string[]).includes(arena) ? (arena as ArenaId) : "dojo";
  return ARENA_WEATHER[id] ?? ARENA_WEATHER.dojo!;
}

export function arenaName(arena: string): string {
  const id = (ARENA_IDS as string[]).includes(arena) ? (arena as ArenaId) : "dojo";
  return ARENA_NAMES[id];
}

/** Zona de uma posição. */
export function zoneFor(arena: string, position: Position): Zone {
  const zones = arenaZones(arena);
  return zones.find((z) => z.position === position) ?? zones[0];
}

/** Estado inicial de campo de uma batalha. */
export function makeField(arena: string): FieldState {
  const wheel = arenaWeather(arena);
  return {
    arena: (ARENA_IDS as string[]).includes(arena) ? (arena as ArenaId) : "dojo",
    weatherIndex: 0,
    weather: wheel[0],
    zones: arenaZones(arena),
  };
}

/** Avança a roda de clima; devolve o novo estado e se mudou. */
export function rotateWeather(field: FieldState): { field: FieldState; changed: boolean } {
  const wheel = arenaWeather(field.arena);
  const next = (field.weatherIndex + 1) % wheel.length;
  return {
    field: { ...field, weatherIndex: next, weather: wheel[next] },
    changed: true,
  };
}

/** Bônus de dano que o clima dá a uma família elemental. */
export function weatherDamage(field: FieldState, element: string, tags: readonly string[] = []): number {
  const w = field.weather;
  const el = element.toUpperCase();
  if (w.element && w.element !== el) return w.elementBonuses?.[el] ?? 0;
  if (w.damageTag && !tags.includes(w.damageTag)) return w.elementBonuses?.[el] ?? 0;
  return (w.dmgBonus ?? 0) + (w.elementBonuses?.[el] ?? 0);
}
