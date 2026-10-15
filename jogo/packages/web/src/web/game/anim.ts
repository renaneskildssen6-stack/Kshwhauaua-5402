/* Fase G3 — catalogo de animacoes de batalha.
 *
 * Regra do projeto: NENHUMA arte de personagem nova. Todas as 100 animacoes
 * abaixo sao composicao programatica — keyframes CSS base (mk-a-*) combinados
 * com recoloracao (hue/sepia/saturate), escala, duracao, camada e reuso dos
 * 8 sprite sheets de VFX que ja existem em /vfx.
 *
 * Cada animacao vive numa camada:
 *   sprite  -> transforma o proprio robo (lunge, recoil, squash, teleporte...)
 *   aura    -> halo/anel desenhado atras-em-volta do robo (buff, status, dreno)
 *   burst   -> sprite sheet de VFX por cima do alvo (impacto elemental)
 *   screen  -> efeito de tela cheia (flash, vinheta, zoom, speed lines, faixa)
 */

import { STATUSES } from "./status";
import { ROBOTS } from "./robots";

export type AnimLayer = "sprite" | "aura" | "burst" | "screen" | "decal" | "projectile" | "trail";

export interface AnimSpec {
  id: string;
  /** Nome legivel (PT-BR), usado em debug e no E2E. */
  label: string;
  layer: AnimLayer;
  /** Nome do @keyframes em styles.css (sem o prefixo de classe). */
  keyframe: string;
  /** Duracao total em ms. */
  duration: number;
  /** Curva de tempo. */
  ease?: string;
  /** Sprite sheet reaproveitado de /vfx (camadas burst/aura). */
  vfx?: string;
  /** Filtro CSS aplicado ao VFX/aura (recoloracao sem gerar arte). */
  filter?: string;
  /** Cor principal (aura/screen). */
  color?: string;
  /** Escala do elemento animado. */
  scale?: number;
  /** Intensidade de tremor de tela 0..3 (somado ao shake existente). */
  shake?: number;
  /** Texto opcional exibido pela camada screen (faixas/banners). */
  text?: string;
}

function tint(hue: number, sat = 2.2, bright = 1.05): string {
  return `sepia(0.65) saturate(${sat}) hue-rotate(${hue - 38}deg) brightness(${bright})`;
}

const V = {
  impact: "/vfx/impact.png",
  slash: "/vfx/slash.png",
  explosion: "/vfx/explosion.png",
  heal: "/vfx/heal.png",
  shield: "/vfx/shield.png",
  levelup: "/vfx/levelup.png",
  void: "/vfx/void.png",
  thunder: "/vfx/thunder.png",
} as const;

const list: AnimSpec[] = [];
function add(spec: AnimSpec): AnimSpec {
  list.push(spec);
  return spec;
}

/* ------------------------------------------------ 1) familias elementais (20)
 * Um burst por familia elemental. O elemento do robo (150+ valores) e mapeado
 * para uma destas familias por palavra-chave, com hash como fallback. */

export interface BurstFamily {
  key: string;
  label: string;
  hue: number;
  vfx: string;
  keyframe: string;
  words: string[];
}

const FAMILIES: BurstFamily[] = [
  { key: "fogo", label: "Ignicao", hue: 8, vfx: V.explosion, keyframe: "burst", words: ["FOGO", "CHAMA", "INFERNO", "BRASA", "PIRA", "FORJA", "MAGMA", "VULCAO", "CINZAS", "SOLDA"] },
  { key: "gelo", label: "Fratura Glacial", hue: 190, vfx: "/vfx/nov_cryo.png", keyframe: "shatter", words: ["GELO", "GEADA", "NEVE", "GLACIAL", "POLAR", "TUNDRA"] },
  { key: "trovao", label: "Descarga", hue: 55, vfx: "/vfx/nov_volt.png", keyframe: "bolt", words: ["TROVAO", "FAISCA", "TEMPESTADE", "PULSAR", "CIRCUITO", "NEON", "MAGNETISMO"] },
  { key: "terra", label: "Falha Tectonica", hue: 28, vfx: "/vfx/nov_geo.png", keyframe: "quake", words: ["TERRA", "PEDRA", "ROCHA", "GRANITO", "BASALTO", "TECTONICA", "TERREMOTO", "AREIA", "DESERTO", "POEIRA", "OBSIDIANA", "MARMORE"] },
  { key: "vento", label: "Corte de Vento", hue: 120, vfx: "/vfx/nov_aero.png", keyframe: "gust", words: ["VENTO", "BRISA", "VENTANIA", "NUVEM", "CEU", "PENA", "CALMARIA"] },
  { key: "luz", label: "Lanca de Luz", hue: 48, vfx: "/vfx/nov_luma.png", keyframe: "flare", words: ["LUZ", "SOL", "FOTON", "AURORA", "SANTO", "ZENITE", "CATEDRAL", "ESTRELA"] },
  { key: "sombra", label: "Mordida Sombria", hue: 275, vfx: "/vfx/nov_umbra.png", keyframe: "swallow", words: ["SOMBRA", "NOITE", "BREU", "ECLIPSE", "LUA", "TUMULO", "LAMENTO", "PICHE"] },
  { key: "veneno", label: "Nevoa Toxica", hue: 100, vfx: "/vfx/nov_toxa.png", keyframe: "seep", words: ["VENENO", "TOXINA", "ACIDO", "PRAGA", "LODO", "MUCO", "PANTANO", "FUMACA"] },
  { key: "agua", label: "Ressaca", hue: 205, vfx: "/vfx/nov_aqua.png", keyframe: "surge", words: ["AGUA", "MARE", "TSUNAMI", "RECIFE", "CORAL", "ALGA", "VAPOR"] },
  { key: "metal", label: "Prensa de Ferro", hue: 220, vfx: "/vfx/nov_ferra.png", keyframe: "clang", words: ["FERRO", "TITANIO", "LATAO", "OURO", "AMBAR", "ENGRENAGEM", "RELOJOARIA", "SUCATA", "FERRUGEM", "ANEL", "CORRENTE", "GRAFENO"] },
  { key: "cristal", label: "Prisma", hue: 170, vfx: V.shield, keyframe: "prism", words: ["CRISTAL", "VIDRO", "ESPELHO", "JADE"] },
  { key: "plasma", label: "Jato de Plasma", hue: 300, vfx: "/vfx/nov_nova.png", keyframe: "beam", words: ["PLASMA", "QUANTUM", "ETER", "NEBULOSA"] },
  { key: "vazio", label: "Colapso", hue: 250, vfx: V.void, keyframe: "collapse", words: ["VAZIO", "ABISMO", "ABISSO", "RUINA", "SILENCIO", "ESPIRITO", "ALMA"] },
  { key: "bio", label: "Enxame", hue: 90, vfx: V.void, keyframe: "swarm", words: ["BIO", "FUNGO", "ESPORO", "SELVA", "FLOR", "COLHEITA", "SIMBIOSE", "COLONIA", "BESOURO", "ESCARAVELHO", "FERRAO", "TEIA", "TECELA", "SEDA", "ESTACAO"] },
  { key: "cosmico", label: "Chuva de Meteoro", hue: 265, vfx: "/vfx/nov_nova.png", keyframe: "meteor", words: ["COSMICO", "METEORO", "ORBITA", "GRAVIDADE"] },
  { key: "sonoro", label: "Estrondo", hue: 320, vfx: V.impact, keyframe: "boom", words: ["SONORO", "CANTO", "IMPACTO", "ARTILHARIA", "GUERRA"] },
  { key: "tempo", label: "Distorcao", hue: 200, vfx: V.levelup, keyframe: "warp", words: ["TEMPO", "RUNA", "PSIQUICO", "PEREGRINO", "JURAMENTO", "DISCIPLINA", "HONRA"] },
  { key: "lamina", label: "Lamina Tripla", hue: 210, vfx: V.slash, keyframe: "triple", words: ["LAMINA", "LANCA", "ESPINHO", "PRESA", "CHIFRE", "OSSO", "SAMURAI", "VALQUIRIA", "AGIL"] },
  { key: "sangue", label: "Rasgo", hue: 350, vfx: V.slash, keyframe: "rend", words: ["SANGUE", "DRAGAO", "LOBO", "MATILHA", "URSO", "PRIMATA", "XENO"] },
  { key: "fortaleza", label: "Ariete", hue: 35, vfx: V.impact, keyframe: "ram", words: ["FORTALEZA", "MURALHA", "GUARDIA", "TITA", "TITAN"] },
];

for (const f of FAMILIES) {
  add({
    id: `burst_${f.key}`,
    label: `Impacto — ${f.label}`,
    layer: "burst",
    keyframe: f.keyframe,
    duration: 520,
    vfx: f.vfx,
    filter: tint(f.hue),
    scale: 1.15,
    shake: 1,
  });
}

const FAMILY_BY_WORD = new Map<string, string>();
for (const f of FAMILIES) for (const w of f.words) FAMILY_BY_WORD.set(w, f.key);

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** Familia elemental de um elemento de robo (sempre devolve um id valido). */
export function burstAnimFor(element: string): string {
  const key = element.trim().toUpperCase();
  const direct = FAMILY_BY_WORD.get(key);
  if (direct) return `burst_${direct}`;
  const fam = FAMILIES[hash(key) % FAMILIES.length];
  return `burst_${fam.key}`;
}

/* ------------------------------------------------- 2) status: aplicar + tick (20) */

function hexHue(hex: string): number {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return 200;
  const n = parseInt(m[1], 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  if (d === 0) return 200;
  let h: number;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return Math.round((((h * 60) % 360) + 360) % 360);
}

/** Fase H1: um par on/tick por cada um dos 36 status de status.ts. */
const STATUS_KF = ["seep", "bolt", "ward", "pulse", "drip", "ring", "haze", "swallow"] as const;

const STATUS = STATUSES.map((s, i) => ({
  type: s.id as string,
  label: s.label,
  hue: hexHue(s.color),
  kf: STATUS_KF[i % STATUS_KF.length],
  vfx: s.vfx,
}));

for (const s of STATUS) {
  add({
    id: `status_on_${s.type}`,
    label: `${s.label} — aplicado`,
    layer: "aura",
    keyframe: s.kf,
    duration: 620,
    vfx: s.vfx,
    filter: tint(s.hue, 2.6, 1.1),
    scale: 1.2,
  });
  add({
    id: `status_tick_${s.type}`,
    label: `${s.label} — em efeito`,
    layer: "aura",
    keyframe: "haze",
    duration: 460,
    vfx: s.vfx,
    filter: tint(s.hue, 2.0, 0.95),
    scale: 0.92,
  });
}

/* ---------------------------------------------------------- 3) impactos (5) */

add({ id: "hit_light", label: "Impacto leve", layer: "sprite", keyframe: "recoil", duration: 260, scale: 1 });
add({ id: "hit_medium", label: "Impacto medio", layer: "sprite", keyframe: "recoil-hard", duration: 340, shake: 1 });
add({ id: "hit_heavy", label: "Impacto pesado", layer: "sprite", keyframe: "squash", duration: 420, shake: 2 });
add({ id: "hit_crit", label: "Impacto critico", layer: "sprite", keyframe: "jitter", duration: 520, shake: 3 });
add({ id: "hit_mega", label: "Impacto devastador", layer: "sprite", keyframe: "tumble", duration: 640, shake: 3 });

/* ------------------------------------------------- 4) preparos de ataque (6) */

add({ id: "wind_lunge", label: "Avanco", layer: "sprite", keyframe: "lunge", duration: 380 });
add({ id: "wind_spin", label: "Giro", layer: "sprite", keyframe: "spin", duration: 460 });
add({ id: "wind_charge", label: "Carga de energia", layer: "sprite", keyframe: "charge", duration: 520 });
add({ id: "wind_dash", label: "Investida", layer: "sprite", keyframe: "dash", duration: 340 });
add({ id: "wind_stomp", label: "Pisada", layer: "sprite", keyframe: "stomp", duration: 420, shake: 1 });
add({ id: "wind_hover", label: "Elevacao", layer: "sprite", keyframe: "hover", duration: 560 });

/* --------------------------------------------------- 5) defesas: 5 x 2 (10) */

const DEFENSES: { kind: string; label: string; hue: number }[] = [
  { kind: "guard", label: "Guarda", hue: 210 },
  { kind: "repair", label: "Reparo", hue: 130 },
  { kind: "purge", label: "Purga", hue: 175 },
  { kind: "overcharge", label: "Sobrecarga", hue: 45 },
  { kind: "counter", label: "Contra-golpe", hue: 320 },
];

for (const d of DEFENSES) {
  add({
    id: `def_cast_${d.kind}`,
    label: `${d.label} — conjuracao`,
    layer: "aura",
    keyframe: "ring",
    duration: 560,
    vfx: d.kind === "repair" ? V.heal : d.kind === "counter" ? V.thunder : V.shield,
    filter: tint(d.hue, 2.4, 1.12),
    scale: 1.3,
  });
  add({
    id: `def_hold_${d.kind}`,
    label: `${d.label} — sustentada`,
    layer: "aura",
    keyframe: "orbit",
    duration: 900,
    vfx: V.shield,
    filter: tint(d.hue, 1.8, 1),
    scale: 1.1,
  });
}

/* ------------------------------------------------------ 6) camada de tela (10) */

add({ id: "scr_flash_white", label: "Flash branco", layer: "screen", keyframe: "flash", duration: 240, color: "#ffffff" });
add({ id: "scr_flash_red", label: "Flash vermelho", layer: "screen", keyframe: "flash", duration: 300, color: "#ff3b2e" });
add({ id: "scr_flash_gold", label: "Flash dourado", layer: "screen", keyframe: "flash", duration: 360, color: "#ffc63a" });
add({ id: "scr_vignette", label: "Vinheta pulsante", layer: "screen", keyframe: "vignette", duration: 620, color: "#05070f" });
add({ id: "scr_zoom", label: "Zoom de impacto", layer: "screen", keyframe: "zoom", duration: 380 });
add({ id: "scr_slow", label: "Barras de tensao", layer: "screen", keyframe: "bars", duration: 760, color: "#04060d" });
add({ id: "scr_chroma", label: "Aberracao cromatica", layer: "screen", keyframe: "chroma", duration: 420 });
add({ id: "scr_shockwave", label: "Onda de choque", layer: "screen", keyframe: "shock", duration: 520, color: "#8ff4ff" });
add({ id: "scr_speedlines", label: "Linhas de velocidade", layer: "screen", keyframe: "lines", duration: 460, color: "#cfe4ff" });
add({ id: "scr_darken", label: "Escurecer arena", layer: "screen", keyframe: "darken", duration: 700, color: "#02040a" });

/* -------------------------------------- 7) entradas, saidas e destruicao (7) */

add({ id: "faint_burst", label: "Explosao final", layer: "burst", keyframe: "burst", duration: 700, vfx: V.explosion, filter: tint(12, 2.4, 1.1), scale: 1.5, shake: 3 });
add({ id: "faint_sink", label: "Desligamento", layer: "sprite", keyframe: "sink", duration: 760 });
add({ id: "enter_drop", label: "Queda em campo", layer: "sprite", keyframe: "drop", duration: 620, shake: 1 });
add({ id: "enter_dash", label: "Entrada em disparada", layer: "sprite", keyframe: "enterdash", duration: 540 });
add({ id: "enter_teleport", label: "Entrada por teleporte", layer: "sprite", keyframe: "teleport", duration: 620 });
add({ id: "swap_out", label: "Recuo para troca", layer: "sprite", keyframe: "swapout", duration: 420 });
add({ id: "swap_in", label: "Chegada da troca", layer: "sprite", keyframe: "swapin", duration: 460 });

/* ------------------------------------------------------- 8) fim de luta (4) */

add({ id: "res_victory_pose", label: "Pose de vitoria", layer: "sprite", keyframe: "pose", duration: 900 });
add({ id: "res_victory_fanfare", label: "Fanfarra de vitoria", layer: "screen", keyframe: "fanfare", duration: 1200, color: "#ffc63a" });
add({ id: "res_defeat_slump", label: "Colapso de derrota", layer: "sprite", keyframe: "slump", duration: 900 });
add({ id: "res_defeat_fade", label: "Apagao de derrota", layer: "screen", keyframe: "darken", duration: 1100, color: "#000208" });

/* ---------------------------------------------------- 9) suporte e reacao (11) */

add({ id: "sup_heal_pulse", label: "Pulso de reparo", layer: "aura", keyframe: "pulse", duration: 560, vfx: V.heal, filter: tint(130, 2.4, 1.15), scale: 1.25 });
add({ id: "sup_mp_surge", label: "Surto de energia", layer: "aura", keyframe: "rise", duration: 520, vfx: V.levelup, filter: tint(200, 2.2, 1.1), scale: 1.1 });
add({ id: "sup_regen_drip", label: "Gotejo regenerativo", layer: "aura", keyframe: "drip", duration: 620, vfx: V.heal, filter: tint(150, 2, 1.05), scale: 0.95 });
add({ id: "sup_leech", label: "Sifao vital", layer: "aura", keyframe: "siphon", duration: 600, vfx: V.void, filter: tint(340, 2.4, 1.05), scale: 1.05 });
add({ id: "sup_thorns", label: "Repulsor de espinhos", layer: "aura", keyframe: "spikes", duration: 520, vfx: V.slash, filter: tint(20, 2.2, 1.05), scale: 1.2 });
add({ id: "sup_counter", label: "Revide", layer: "burst", keyframe: "bolt", duration: 520, vfx: V.thunder, filter: tint(320, 2.6, 1.15), scale: 1.25, shake: 2 });
add({ id: "sup_resist", label: "Barreira resistente", layer: "aura", keyframe: "ward", duration: 520, vfx: V.shield, filter: tint(185, 2.2, 1.15), scale: 1.2 });
add({ id: "sup_purify", label: "Anel purificador", layer: "aura", keyframe: "ring", duration: 620, vfx: V.heal, filter: tint(175, 2.4, 1.2), scale: 1.35 });
add({ id: "sup_faint", label: "Queda do lutador", layer: "sprite", keyframe: "collapse", duration: 720 });
add({ id: "sup_ward", label: "Campo de cobertura", layer: "aura", keyframe: "ward", duration: 640, vfx: V.shield, filter: tint(210, 2.4, 1.15), scale: 1.45 });
add({ id: "sup_revive", label: "Reanimacao de nucleo", layer: "aura", keyframe: "rise", duration: 780, vfx: V.levelup, filter: tint(48, 2.5, 1.2), scale: 1.4 });

/* ------------------------------------------------- 10) faixas e combos (12) */

add({ id: "ban_turn", label: "Faixa de turno", layer: "screen", keyframe: "banner", duration: 720, color: "#35e2f0", text: "TURNO" });
add({ id: "ban_crit", label: "Faixa de critico", layer: "screen", keyframe: "banner", duration: 760, color: "#ffb43a", text: "CRITICO!" });
add({ id: "ban_ultimate", label: "Faixa de ultimate", layer: "screen", keyframe: "banner-big", duration: 980, color: "#ff5bd0", text: "ULTIMATE" });
add({ id: "ban_combo", label: "Faixa de combo", layer: "screen", keyframe: "banner", duration: 680, color: "#57d76a", text: "COMBO" });
add({ id: "ban_stun", label: "Faixa de atordoamento", layer: "screen", keyframe: "banner", duration: 680, color: "#ffe14d", text: "ATORDOADO" });
add({ id: "ban_phase", label: "Faixa de nova fase", layer: "screen", keyframe: "banner-big", duration: 1020, color: "#c86bff", text: "NOVA FASE" });
add({ id: "combo_1", label: "Combo — primeiro golpe", layer: "sprite", keyframe: "combo1", duration: 320 });
add({ id: "combo_2", label: "Combo — segundo golpe", layer: "sprite", keyframe: "combo2", duration: 340 });
add({ id: "combo_3", label: "Combo — finalizacao", layer: "sprite", keyframe: "combo3", duration: 420, shake: 2 });
add({ id: "ult_charge", label: "Ultimate — carregando", layer: "aura", keyframe: "charge-aura", duration: 900, vfx: V.levelup, filter: tint(300, 2.6, 1.2), scale: 1.5 });
add({ id: "ult_beam", label: "Ultimate — disparo", layer: "burst", keyframe: "beam", duration: 760, vfx: V.explosion, filter: tint(300, 2.4, 1.2), scale: 1.7, shake: 3 });
add({ id: "ult_finisher", label: "Ultimate — finalizacao", layer: "sprite", keyframe: "finisher", duration: 700, shake: 2 });

/* ------------------------------------------- 5) decalques, projeteis e rastros (H2) */

const DECAL_BY_FAMILY: Record<string, string> = {
  fogo: "dec_scorch", gelo: "dec_frost", trovao: "dec_grid", terra: "dec_fissure",
  veneno: "dec_acid", agua: "dec_oil", sangue: "dec_blood", bio: "dec_bloom",
  vazio: "dec_rift", cristal: "dec_geode", sombra: "dec_rift", metal: "dec_grid",
};
const PROJ_BY_FAMILY: Record<string, string> = {
  gelo: "prj_shard", terra: "prj_seismic", trovao: "prj_arc", plasma: "prj_ion",
  vazio: "prj_voidray", sonoro: "prj_sonic", cosmico: "prj_grav", agua: "prj_stream",
  lamina: "prj_rail", luz: "prj_photon", fogo: "prj_photon",
};
const TRAIL_KEYS = ["trl_dash", "trl_jet", "trl_blade", "trl_chain", "trl_tele", "trl_slip", "trl_magnet", "trl_shear", "trl_thrust", "trl_reel"];

for (const d of new Set(Object.values(DECAL_BY_FAMILY))) {
  add({ id: `decal_${d}`, label: `Decalque — ${d}`, layer: "decal", keyframe: "decal", duration: 1400, vfx: `/vfx/${d}.png`, scale: 1 });
}
for (const d of new Set(Object.values(PROJ_BY_FAMILY))) {
  add({ id: `proj_${d}`, label: `Projetil — ${d}`, layer: "projectile", keyframe: "proj", duration: 380, vfx: `/vfx/${d}.png`, scale: 1 });
}
for (const t of TRAIL_KEYS) {
  add({ id: `trail_${t}`, label: `Rastro — ${t}`, layer: "trail", keyframe: "trail", duration: 460, vfx: `/vfx/${t}.png`, scale: 1.2 });
}

/** Decalque de chao deixado pelo elemento (ou null). */
export function decalAnimFor(element: string): string | null {
  const fam = burstAnimFor(element).replace("burst_", "");
  const d = DECAL_BY_FAMILY[fam];
  return d ? `decal_${d}` : null;
}

/** Projetil do elemento; golpes perfurantes usam o trilho. */
export function projectileAnimFor(element: string, pierce: boolean): string {
  if (pierce) return "proj_prj_rail";
  const fam = burstAnimFor(element).replace("burst_", "");
  return `proj_${PROJ_BY_FAMILY[fam] ?? "prj_photon"}`;
}

/** Rastro de avanço determinístico por skill. */
export function trailAnimFor(skillId: string): string {
  return `trail_${TRAIL_KEYS[hash(skillId) % TRAIL_KEYS.length]}`;
}

// Folhas H2 agora ligadas a eventos reais, não apenas catalogadas.
const GLITCHES = ["datamosh", "feedback", "glitch", "lens", "mirror", "roll", "scan", "static", "strobe", "tear"];
const ULTIMATES = ["blackhole", "chorus", "freeze", "genesis", "groundbreak", "singularity", "skysplit", "solarflare", "thunder", "titanfist"];
const IMPACTS = ["arcane", "beast", "mycel", "prime", "scrap", "seraph", "siege", "specter", "swift", "titan"];
const STATUS_BURSTS = ["bleed", "boost", "burn", "corrode", "daze", "freeze", "hex", "poison", "shock", "weaken"];
const SUPPORTS = ["aegis", "ammo", "coolant", "medic", "nanite", "patch", "rally", "recharge", "repair", "ward"];
export const WORLD_EFFECTS = ["alarm", "ash", "aurora", "blizzard", "eclipse", "gears", "holy", "meteor", "overgrowth", "rain", "sand", "steam", "thunderstorm", "tsunami", "vortex", "wildfire"];
for (const key of GLITCHES) add({ id: `gl_${key}`, label: `Distorção ${key}`, layer: "screen", keyframe: "distort", duration: 620, vfx: `/vfx/gl_${key}.png`, scale: 1.2 });
for (const key of ULTIMATES) add({ id: `ult_${key}`, label: `Ultimate ${key}`, layer: "screen", keyframe: "cinematic", duration: 1300, vfx: `/vfx/ult_${key}.png`, scale: 2 });
for (const key of IMPACTS) add({ id: `imp_${key}`, label: `Impacto ${key}`, layer: "burst", keyframe: "burst", duration: 520, vfx: `/vfx/imp_${key}.png` });
for (const key of STATUS_BURSTS) add({ id: `st_burst_${key}`, label: `Condição ${key}`, layer: "aura", keyframe: "pulse", duration: 620, vfx: `/vfx/st_burst_${key}.png` });
for (const key of SUPPORTS) add({ id: `support_${key}`, label: `Suporte ${key}`, layer: "aura", keyframe: "ring", duration: 650, vfx: `/vfx/sup_${key}.png` });
// Cada chassi tem assinatura de impacto e uma faixa/cinemática nomeada.
for (const [i, r] of ROBOTS.entries()) {
  const u = ULTIMATES[hash(r.element) % ULTIMATES.length];
  add({ id: `cin_${r.id}`, label: `${r.name} — ultimate`, layer: "screen", keyframe: "cinematic", duration: 1400, vfx: `/vfx/ult_${u}.png`, text: r.name, color: "#ffe36a" });
  add({ id: `chassis_${r.id}`, label: `${r.name} — reação`, layer: "burst", keyframe: ["burst", "shatter", "quake", "clang", "swallow"][i % 5], duration: 440 + i % 7 * 30, scale: 0.9 + i % 9 * 0.07, vfx: `/vfx/imp_${IMPACTS[i % IMPACTS.length]}.png` });
}
export function glitchAnimFor(key: string): string { return `gl_${GLITCHES[hash(key) % GLITCHES.length]}`; }
export function ultimateAnimFor(robotId: string, element: string): string {
  return ROBOTS.some((r) => r.id === robotId) ? `cin_${robotId}` : `ult_${ULTIMATES[hash(element) % ULTIMATES.length]}`;
}
export function chassisAnimFor(robotId: string): string {
  return ROBOTS.some((r) => r.id === robotId) ? `chassis_${robotId}` : `imp_${IMPACTS[hash(robotId) % IMPACTS.length]}`;
}
export function statusBurstFor(id: string): string {
  const key = /burn|overheat/.test(id) ? "burn" : /poison|toxin/.test(id) ? "poison" : /bleed/.test(id) ? "bleed" : /corro|shatter/.test(id) ? "corrode" : /freeze|chill/.test(id) ? "freeze" : /shock|paraly/.test(id) ? "shock" : /stun|daze|sleep/.test(id) ? "daze" : /hex|curse|doom/.test(id) ? "hex" : /weak|slow|silence|blind/.test(id) ? "weaken" : "boost";
  return `st_burst_${key}`;
}
export function worldEffectFor(arena: string, weather: string): string {
  const s = `${arena} ${weather}`;
  if (/espor|biodome|swarm/.test(s)) return "overgrowth";
  if (/nevas|frozen|tundra/.test(s)) return "blizzard";
  if (/vulc|erup|wildfire/.test(s)) return "wildfire";
  if (/cinza|fuligem/.test(s)) return "ash";
  if (/eclipse|necropolis|graveyard/.test(s)) return "eclipse";
  if (/spire|sagrado/.test(s)) return "holy";
  if (/aurora|crystal/.test(s)) return "aurora";
  if (/mare|sunken|trench/.test(s)) return "tsunami";
  if (/sand|areia|canyon/.test(s)) return "sand";
  if (/thunder|tempestade|storm/.test(s)) return "thunderstorm";
  if (/vapor|foundry/.test(s)) return "steam";
  if (/prensa|forge|reactor/.test(s)) return "gears";
  if (/orbital|meteor|skyfall/.test(s)) return "meteor";
  if (/neon|alarm|siege/.test(s)) return "alarm";
  if (/vento|sky/.test(s)) return "vortex";
  return WORLD_EFFECTS[hash(s) % WORLD_EFFECTS.length];
}

export const ANIMS: Record<string, AnimSpec> = Object.fromEntries(
  list.map((a) => [a.id, a]),
);
export const ANIM_IDS: string[] = list.map((a) => a.id);
export const ANIM_COUNT = list.length;

export function animSpec(id: string): AnimSpec | null {
  return ANIMS[id] ?? null;
}

/** Animacao de impacto conforme dano relativo e critico. */
export function hitAnimFor(dmg: number, maxHp: number, crit: boolean): string {
  const pct = maxHp <= 0 ? 0 : dmg / maxHp;
  if (crit && pct >= 0.28) return "hit_mega";
  if (crit) return "hit_crit";
  if (pct >= 0.22) return "hit_heavy";
  if (pct >= 0.1) return "hit_medium";
  return "hit_light";
}

const WINDUPS = ["wind_lunge", "wind_spin", "wind_charge", "wind_dash", "wind_stomp", "wind_hover"];

/** Preparo de ataque determinístico por skill (sempre o mesmo gesto). */
export function windupAnimFor(skillId: string, mp: number): string {
  if (mp >= 24) return "wind_charge";
  return WINDUPS[hash(skillId) % WINDUPS.length];
}
