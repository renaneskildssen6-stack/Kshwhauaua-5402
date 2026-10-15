/**
 * Fase H1 — resolvedor das 105 mecanicas nomeadas.
 *
 * Um kit autoral marca cada golpe com um ou mais ids de `MECH_IDS`. Aqui cada
 * id ganha comportamento real de combate, descrito como um punhado de numeros
 * que `combat.ts` aplica:
 *
 *   mult    -> multiplicador de dano do golpe (1 = neutro)
 *   flat    -> dano plano somado depois do multiplicador
 *   heal    -> cura no atacante (absoluta)
 *   mpGain  -> MP devolvido ao atacante
 *   selfDmg -> dano no atacante (custo de sangue)
 *   guard   -> dano extra mitigado neste golpe (defesa ativa)
 *   notes   -> linhas de log
 *
 * A mesma mecanica pode aparecer em varios chassis (ela e o vocabulario); o que
 * nunca se repete e o conjunto que cada robo carrega.
 */

import type { MechId, KitSkill, Position, ResourceId } from "./kits/types";

/* ---------------------------------------------------------------- contexto */

export interface MechActor {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  str: number;
  def: number;
  agl: number;
  level: number;
  /** efeitos ativos (status de status.ts + legacy). */
  effects: { type: string; power: number; turns: number }[];
  /** recurso alternativo atual / maximo. */
  res: number;
  resMax: number;
  resId?: ResourceId;
  pos: Position;
  element: string;
  /** turnos/rounds desde o inicio da luta. */
  turn: number;
  /** abates acumulados. */
  kills: number;
  /** golpes acumulados nesta luta. */
  hits: number;
  /** pilhas de escalonamento (overload/frenzy/...). */
  stacks: number;
  /** carga individual normalizada (0..10). */
  charge: number;
  /** id do chassi. */
  robotId: string;
}

export interface MechCtx {
  atk: MechActor;
  vic: MechActor;
  skill: KitSkill;
  side: "player" | "enemy";
  /** dano bruto ja calculado antes das mecanicas. */
  dmg: number;
  crit: boolean;
  /** golpes do skill. */
  hits: number;
  /** indice do golpe atual (0-based). */
  idx: number;
  rng: () => number;
  /** HP medio do time do atacante / do inimigo (0..1). */
  allyHpPct: number;
  foeHpPct: number;
  /** clima e zona ativos. */
  weatherElement?: string;
  zone?: string;
  /** multiplicador de afinidade elemental do par (elements.ts). */
  affinity: number;
  /** true quando o alvo nao e a GUARDA inimiga. */
  offGuard: boolean;
  /** quantos aliados ainda estao de pe. */
  alliesAlive: number;
  /** pilhas de recurso gastas neste golpe. */
  spent: number;
}

export interface MechOut {
  mult: number;
  flat: number;
  heal: number;
  mpGain: number;
  selfDmg: number;
  guard: number;
  notes: string[];
}

export function emptyMechOut(): MechOut {
  return { mult: 1, flat: 0, heal: 0, mpGain: 0, selfDmg: 0, guard: 0, notes: [] };
}

function merge(base: MechOut, part: Partial<MechOut>): MechOut {
  return {
    mult: base.mult * (part.mult ?? 1),
    flat: base.flat + (part.flat ?? 0),
    heal: base.heal + (part.heal ?? 0),
    mpGain: base.mpGain + (part.mpGain ?? 0),
    selfDmg: base.selfDmg + (part.selfDmg ?? 0),
    guard: base.guard + (part.guard ?? 0),
    notes: part.notes ? [...base.notes, ...part.notes] : base.notes,
  };
}

/* ----------------------------------------------------------------- helpers */

const pct = (v: number, of: number) => Math.round((of * v) / 100);
const has = (a: MechActor, type: string) => a.effects.some((e) => e.type === type);

export interface MechDef {
  id: MechId;
  label: string;
  group: string;
  desc: string;
  run?: (c: MechCtx) => Partial<MechOut>;
}

/* ------------------------------------------------------------- definicoes */

export const MECH_DEFS: Record<string, MechDef> = {
  /* -------------------------------------------------- penetracao e dano */
  execute: {
    id: "execute", label: "EXECUÇÃO", group: "penetracao",
    desc: "+35% de dano em alvos abaixo de 40% de HP.",
    run: (c) => (c.vic.hp / c.vic.maxHp < 0.4 ? { mult: 1.35, notes: ["golpe de execução"] } : {}),
  },
  pierce: {
    id: "pierce", label: "PERFURAÇÃO", group: "penetracao",
    desc: "Ignora 30% da defesa do alvo.",
    run: (c) => ({ flat: pct(22, c.vic.def), notes: ["atravessa blindagem"] }),
  },
  armorpen: {
    id: "armorpen", label: "QUEBRA-BLINDAGEM", group: "penetracao",
    desc: "+25% de dano por cada camada de blindagem ativa do alvo.",
    run: (c) => {
      const layers = c.vic.effects.filter((e) => e.type === "damage_reduction" || e.type === "shield" || e.type === "barrier").length;
      return { mult: 1 + layers * 0.25, notes: layers ? [`${layers} camada(s) rachada(s)`] : [] };
    },
  },
  ignoredef: {
    id: "ignoredef", label: "ANULA DEFESA", group: "penetracao",
    desc: "Trata a defesa do alvo como 60% menor.",
    run: (c) => ({ flat: pct(40, c.vic.def), notes: ["defesa anulada"] }),
  },
  trueDamage: {
    id: "trueDamage", label: "DANO VERDADEIRO", group: "penetracao",
    desc: "Parte do golpe não sofre redução nem resistência elemental.",
    run: (c) => ({ flat: pct(15, c.vic.maxHp) > 0 ? Math.max(1, pct(4, c.vic.maxHp)) : 1, notes: ["dano verdadeiro"] }),
  },
  shieldbreak: {
    id: "shieldbreak", label: "ROMPE-ESCUDO", group: "penetracao",
    desc: "Consome escudos e barreiras do alvo antes do dano.",
    run: (c) => {
      const n = c.vic.effects.filter((e) => e.type === "shield" || e.type === "barrier").length;
      return n ? { mult: 1 + n * 0.2, notes: ["escudo estilhaçado"] } : {};
    },
  },
  overkill: {
    id: "overkill", label: "EXCESSO", group: "penetracao",
    desc: "Dano excedente vira cura para o atacante.",
    run: (c) => ({ heal: Math.max(0, Math.round(c.dmg - c.vic.hp)), notes: ["excesso convertido em reparo"] }),
  },
  executeThreshold: {
    id: "executeThreshold", label: "LIMIAR LETAL", group: "penetracao",
    desc: "Abaixo de 15% de HP o alvo é desligado de imediato.",
    run: (c) => (c.vic.hp / c.vic.maxHp <= 0.15 ? { mult: 4, notes: ["LIMIAR LETAL ATINGIDO"] } : {}),
  },
  lastStand: {
    id: "lastStand", label: "ÚLTIMA POSIÇÃO", group: "penetracao",
    desc: "+8% de dano por cada 20% de HP que o atacante já perdeu.",
    run: (c) => ({ mult: 1 + (1 - c.atk.hp / c.atk.maxHp) * 0.4, notes: ["luta até o fim"] }),
  },
  missingHpScaling: {
    id: "missingHpScaling", label: "ESCALA FERIDA", group: "penetracao",
    desc: "Dano cresce conforme o HP que falta no alvo.",
    run: (c) => ({ mult: 1 + (1 - c.vic.hp / c.vic.maxHp) * 0.5 }),
  },
  stackScaling: {
    id: "stackScaling", label: "ESCALA ACUMULADA", group: "penetracao",
    desc: "+12% de dano por pilha de status no alvo.",
    run: (c) => {
      const n = c.vic.effects.length;
      return { mult: 1 + n * 0.12, notes: n ? [`${n} status no alvo`] : [] };
    },
  },
  critUp: {
    id: "critUp", label: "CRÍTICO ELEVADO", group: "penetracao",
    desc: "Golpe com chance de crítico muito acima do normal.",
    run: (c) => (c.crit ? { mult: 1.25, notes: ["crítico reforçado"] } : { notes: ["mira no ponto fraco"] }),
  },
  critMark: {
    id: "critMark", label: "MARCAR CRÍTICO", group: "penetracao",
    desc: "O alvo fica marcado: o próximo crítico nele causa 50% mais.",
    run: (c) => (has(c.vic, "marked") ? { mult: 1.5, notes: ["alvo marcado explodiu"] } : {}),
  },
  firstStrike: {
    id: "firstStrike", label: "PRIMEIRO GOLPE", group: "penetracao",
    desc: "+30% de dano no primeiro round da batalha.",
    run: (c) => (c.atk.turn <= 1 ? { mult: 1.3, notes: ["abertura"] } : {}),
  },
  backstab: {
    id: "backstab", label: "PELAS COSTAS", group: "penetracao",
    desc: "+28% de dano quando o alvo não é a posição de GUARDA.",
    run: (c) => (c.offGuard ? { mult: 1.28, notes: ["golpe nas costas"] } : {}),
  },
  aimedShot: {
    id: "aimedShot", label: "TIRO MIRADO", group: "penetracao",
    desc: "Dano mínimo garantido: não pode cair abaixo de 12% do HP máximo do alvo.",
    run: (c) => {
      const floor = Math.max(1, pct(12, c.vic.maxHp));
      return c.dmg < floor ? { flat: floor - c.dmg, notes: ["tiro certeiro"] } : {};
    },
  },
  beam: {
    id: "beam", label: "FEIXE", group: "penetracao",
    desc: "Feixe contínuo: ignora esquiva e acerta com precisão total.",
    run: () => ({ mult: 1.1, notes: ["feixe contínuo"] }),
  },
  detonate: {
    id: "detonate", label: "DETONAR", group: "penetracao",
    desc: "Explode os status de queimadura e veneno do alvo em dano imediato.",
    run: (c) => {
      const dot = c.vic.effects
        .filter((e) => e.type === "burn" || e.type === "poison")
        .reduce((s, e) => s + e.power, 0);
      return dot ? { flat: dot * 2, notes: ["status detonados"] } : {};
    },
  },

  /* ---------------------------------------------------- multiplicidade */
  multihit: {
    id: "multihit", label: "MULTI-GOLPE", group: "multiplicidade",
    desc: "Dois a quatro impactos rápidos no mesmo alvo.",
    run: (c) => ({ mult: 1 + (c.hits - 1) * 0.08, notes: [`${c.hits} impactos`] }),
  },
  chain: {
    id: "chain", label: "CORRENTE", group: "multiplicidade",
    desc: "Sobras do golpe saltam para a linha inimiga (dano reduzido).",
    run: () => ({ mult: 1.15, notes: ["salta entre inimigos"] }),
  },
  splash: {
    id: "splash", label: "RESPINGO", group: "multiplicidade",
    desc: "Respinga em quem estiver atrás do alvo.",
    run: (c) => ({ mult: c.hits > 1 ? 1.1 : 1.05, notes: ["respingo em área"] }),
  },
  spread: {
    id: "spread", label: "LEQUE", group: "multiplicidade",
    desc: "Abre em leque: mais forte contra times com muitos robôs de pé.",
    run: (c) => ({ mult: 1 + Math.min(0.35, c.alliesAlive * 0.07), notes: ["tiro em leque"] }),
  },
  echoStrike: {
    id: "echoStrike", label: "GOLPE-ECO", group: "multiplicidade",
    desc: "Repete o último golpe causado como eco no fim do turno.",
    run: () => ({ mult: 1.12, notes: ["eco do golpe anterior"] }),
  },
  relentless: {
    id: "relentless", label: "IMPARÁVEL", group: "multiplicidade",
    desc: "Não pode ser esquivado nem bloqueado; dano sempre entra.",
    run: () => ({ mult: 1.05, notes: ["golpe imparável"] }),
  },

  /* ------------------------------------------------------ sustentacao */
  drainHp: {
    id: "drainHp", label: "DRENO VITAL", group: "sustentacao",
    desc: "Conversa 35% do dano causado em reparo.",
    run: (c) => ({ heal: Math.round(c.dmg * 0.35), notes: ["energia vital drenada"] }),
  },
  drainMp: {
    id: "drainMp", label: "DRENO DE MP", group: "sustentacao",
    desc: "Rouba MP do alvo proporcional ao dano.",
    run: (c) => ({ mpGain: Math.max(1, Math.round(c.dmg * 0.4)) }),
  },
  lifesteal: {
    id: "lifesteal", label: "SANGUESSUGA", group: "sustentacao",
    desc: "Cura 20% do dano e converte o resto em escudo leve.",
    run: (c) => ({ heal: Math.round(c.dmg * 0.2) + Math.max(1, pct(1, c.atk.maxHp)), notes: ["sangue sugado"] }),
  },
  lifelink: {
    id: "lifelink", label: "ELO VITAL", group: "sustentacao",
    desc: "Divide o dano sofrido com o alvo nas trocas seguintes.",
    run: () => ({ mult: 1.08, notes: ["elos vitais tensionados"] }),
  },
  bloodPact: {
    id: "bloodPact", label: "PACTO DE SANGUE", group: "sustentacao",
    desc: "Gasta 8% do HP máximo para somar 30% de dano.",
    run: (c) => ({ mult: 1.3, selfDmg: Math.max(1, pct(8, c.atk.maxHp)), notes: ["pacto selado com sangue"] }),
  },
  hpCost: {
    id: "hpCost", label: "CUSTO DE HP", group: "sustentacao",
    desc: "Parte do custo sai da própria vida, não do reator.",
    run: (c) => ({ selfDmg: Math.max(1, pct(5, c.atk.maxHp)), mpGain: 4, notes: ["pagou com o casco"] }),
  },
  mpCost: {
    id: "mpCost", label: "CUSTO EXTRA DE MP", group: "sustentacao",
    desc: "Consome mais energia em troca de dano estável.",
    run: () => ({ mult: 1.14, notes: ["reator forçado"] }),
  },
  overload: {
    id: "overload", label: "SOBRECARGA", group: "sustentacao",
    desc: "Acumula tensão a cada uso; no pico o próximo golpe causa +45%.",
    run: (c) => {
      const s = c.atk.stacks;
      return { mult: 1 + Math.min(0.45, s * 0.09), notes: s > 0 ? [`tensão x${s}`] : ["tensão iniciada"] };
    },
  },
  enrage: {
    id: "enrage", label: "FÚRIA", group: "sustentacao",
    desc: "+4% de dano por 10% de HP perdido, permanente na luta.",
    run: (c) => ({ mult: 1 + (1 - c.atk.hp / c.atk.maxHp) * 0.4, notes: ["fúria crescente"] }),
  },
  gainTurn: {
    id: "gainTurn", label: "GANHO DE TURNO", group: "sustentacao",
    desc: "No abate, o atacante ganha uma ação imediata.",
    run: (c) => (c.vic.hp <= 0 ? { notes: ["ação extra!"] } : {}),
  },
  extraAction: {
    id: "extraAction", label: "AÇÃO EXTRA", group: "sustentacao",
    desc: "Gasta o recurso para agir de novo no mesmo round.",
    run: (c) => (c.spent > 0 ? { mult: 1.1, notes: ["age novamente"] } : {}),
  },

  /* ------------------------------------------------------------ status */
  burnApply: {
    id: "burnApply", label: "INFLAMAR", group: "status",
    desc: "Incendeia o alvo; dano por turno cresce com a pilha.",
    run: (c) => ({ mult: has(c.vic, "burn") ? 1.15 : 1, notes: ["calor acumulando"] }),
  },
  poisonApply: {
    id: "poisonApply", label: "ENVENENAR", group: "status",
    desc: "Veneno ignora defesa e cresce a cada aplicação.",
    run: (c) => ({ mult: has(c.vic, "poison") ? 1.18 : 1, notes: ["toxina no circuito"] }),
  },
  bleedApply: {
    id: "bleedApply", label: "SANGRAR", group: "status",
    desc: "Corta linhas hidráulicas: dano por turno somado ao veneno.",
    run: (c) => ({ flat: has(c.vic, "bleed") ? Math.max(1, pct(4, c.vic.maxHp)) : 0 }),
  },
  corrodeApply: {
    id: "corrodeApply", label: "CORROER", group: "status",
    desc: "Ácido reduz a defesa do alvo pelo resto da luta.",
    run: (c) => ({ flat: pct(10, c.vic.def), notes: ["blindagem corroída"] }),
  },
  freezeApply: {
    id: "freezeApply", label: "CONGELAR", group: "status",
    desc: "Congela o alvo: pode perder o turno inteiro.",
    run: (c) => ({ mult: has(c.vic, "freeze") ? 1.4 : 1, notes: ["cristais de gelo"] }),
  },
  stunApply: {
    id: "stunApply", label: "ATURDIR", group: "status",
    desc: "Atordoa: o alvo perde a próxima ação.",
    run: (c) => ({ mult: has(c.vic, "stun") ? 1.3 : 1.05 }),
  },
  fearApply: {
    id: "fearApply", label: "AMEDRONTAR", group: "status",
    desc: "Medo reduz força e esquiva do alvo.",
    run: (c) => ({ mult: has(c.vic, "fear") ? 1.15 : 1 }),
  },
  silenceApply: {
    id: "silenceApply", label: "SILENCIAR", group: "status",
    desc: "Bloqueia habilidades de MP alto do alvo.",
    run: (c) => (has(c.vic, "silence") ? { mult: 1.2, notes: ["alvo silenciado"] } : {}),
  },
  exposeApply: {
    id: "exposeApply", label: "EXPOR", group: "status",
    desc: "Expõe falhas: o alvo passa a receber mais dano.",
    run: (c) => (has(c.vic, "marked") || has(c.vic, "shatter") ? { mult: 1.25 } : {}),
  },
  markApply: {
    id: "markApply", label: "MARCAR", group: "status",
    desc: "Marca o alvo para o time inteiro focar.",
    run: (c) => ({ mult: has(c.vic, "marked") ? 1.2 : 1, notes: ["alvo marcado"] }),
  },
  weakenApply: {
    id: "weakenApply", label: "ENFRAQUECER", group: "status",
    desc: "Corta a força do alvo; soma contra quem já está fraco.",
    run: (c) => ({ mult: has(c.vic, "weakening") ? 1.15 : 1 }),
  },
  blindApply: {
    id: "blindApply", label: "CEGAR", group: "status",
    desc: "Cegueira faz o alvo errar; o atacante aproveita a brecha.",
    run: (c) => ({ mult: has(c.vic, "blind") ? 1.22 : 1, notes: ["alvo sem mira"] }),
  },
  shatterApply: {
    id: "shatterApply", label: "ESTILHAÇAR", group: "status",
    desc: "Estilhaça: cada golpe seguinte ignora parte da defesa.",
    run: (c) => ({ flat: has(c.vic, "shatter") ? pct(25, c.vic.def) : 0 }),
  },
  curseApply: {
    id: "curseApply", label: "AMALDIÇOAR", group: "status",
    desc: "Maldição converte cura inimiga em dano.",
    run: (c) => ({ mult: has(c.vic, "curse") ? 1.3 : 1, notes: ["pacto quebrado"] }),
  },
  hexApply: {
    id: "hexApply", label: "ENFEITIÇAR", group: "status",
    desc: "Marca rúnica: debuffs do alvo duram mais.",
    run: (c) => ({ mult: c.vic.effects.length >= 3 ? 1.22 : 1.05 }),
  },
  doomApply: {
    id: "doomApply", label: "CONDENAR", group: "status",
    desc: "Contagem regressiva letal se o alvo não for curado.",
    run: (c) => ({ mult: has(c.vic, "doom") ? 1.5 : 1, notes: ["sentença selada"] }),
  },
  paralyzeApply: {
    id: "paralyzeApply", label: "PARALISAR", group: "status",
    desc: "Paralisia atrasa a iniciativa e corta o turno.",
    run: (c) => ({ mult: has(c.vic, "paralyze") ? 1.35 : 1.08, notes: ["servos travando"] }),
  },
  rootApply: {
    id: "rootApply", label: "ENRAIZAR", group: "status",
    desc: "Prende o alvo: não pode ser trocado e perde esquiva.",
    run: (c) => ({ mult: has(c.vic, "root") || has(c.vic, "trapped") ? 1.2 : 1 }),
  },
  confuseApply: {
    id: "confuseApply", label: "CONFUNDIR", group: "status",
    desc: "Confusão faz o alvo acertar os próprios aliados.",
    run: (c) => ({ mult: has(c.vic, "confuse") ? 1.28 : 1, notes: ["alvo confuso"] }),
  },
  slowApply: {
    id: "slowApply", label: "RETARDAR", group: "status",
    desc: "Lentidão empurra o alvo para o fim da ordem de turno.",
    run: (c) => ({ mult: has(c.vic, "slow") ? 1.12 : 1 }),
  },
  hasteApply: {
    id: "hasteApply", label: "ACELERAR", group: "status",
    desc: "O atacante acelera: age antes e ganha esquiva.",
    run: (c) => ({ mult: has(c.atk, "haste") ? 1.18 : 1 }),
  },
  dotSpread: {
    id: "dotSpread", label: "ESPALHAR MAL", group: "status",
    desc: "Espalha queimadura/veneno para o resto do time inimigo.",
    run: (c) => {
      const dots = c.vic.effects.filter((e) => e.type === "burn" || e.type === "poison").length;
      return dots ? { mult: 1 + dots * 0.1, notes: ["maldição se espalha"] } : {};
    },
  },
  statusEcho: {
    id: "statusEcho", label: "ECO DE STATUS", group: "status",
    desc: "Repete no alvo o último status que ele aplicou.",
    run: () => ({ mult: 1.1, notes: ["status devolvido"] }),
  },
  reflectStatus: {
    id: "reflectStatus", label: "REFLETIR STATUS", group: "status",
    desc: "Devolve o status recebido direto para o alvo.",
    run: (c) => (c.vic.effects.length ? { mult: 1.12, notes: ["status refletido"] } : {}),
  },

  /* ------------------------------------------------------------ defesa */
  reflect: {
    id: "reflect", label: "REFLEXO", group: "defesa",
    desc: "Devolve parte do dano recebido neste turno.",
    run: () => ({ mult: 1.05, notes: ["campo refletor"] }),
  },
  thorns: {
    id: "thorns", label: "ESPINHOS", group: "defesa",
    desc: "Espinhos elétricos ferem quem toca o chassi.",
    run: (c) => ({ flat: pct(6, c.vic.maxHp) > 0 ? Math.max(1, pct(3, c.vic.maxHp)) : 1, notes: ["espinhos ativos"] }),
  },
  barrierMake: {
    id: "barrierMake", label: "FAZER BARREIRA", group: "defesa",
    desc: "Em vez de causar dano, ergue uma barreira à frente.",
    run: () => ({ mult: 0.6, notes: ["barreira erguida"] }),
  },
  absorb: {
    id: "absorb", label: "ABSORVER", group: "defesa",
    desc: "Converte o dano não causado em energia para o reator.",
    run: (c) => ({ mpGain: Math.max(1, pct(6, c.atk.maxMp)), notes: ["energia absorvida"] }),
  },
  cover: {
    id: "cover", label: "COBERTURA", group: "defesa",
    desc: "Aquele que cobre reduz o dano recebido pelos aliados atrás.",
    run: () => ({ guard: 0.12, notes: ["cobre a linha"] }),
  },
  intercept: {
    id: "intercept", label: "INTERCEPTAR", group: "defesa",
    desc: "Chama para si os golpes dirigidos a SUPORTE/NÚCLEO.",
    run: () => ({ guard: 0.15, notes: ["intercepta o golpe"] }),
  },
  redirect: {
    id: "redirect", label: "REDIRECIONAR", group: "defesa",
    desc: "Redireciona o alvo da investida para si mesmo.",
    run: () => ({ mult: 0.9, guard: 0.1, notes: ["investida redirecionada"] }),
  },
  counter: {
    id: "counter", label: "CONTRA-GOLPE", group: "defesa",
    desc: "Devolve parte do dano tomado no mesmo round.",
    run: () => ({ mult: 1.08, notes: ["guarda de contra-ataque"] }),
  },
  parryStance: {
    id: "parryStance", label: "POSTURA DE APARO", group: "defesa",
    desc: "Aparo perfeito: chance de zerar o golpe recebido.",
    run: () => ({ guard: 0.25, notes: ["postura de aparo"] }),
  },
  riposte: {
    id: "riposte", label: "RÉPLICA", group: "defesa",
    desc: "Depois de aparar, o próximo golpe é crítico garantido.",
    run: () => ({ mult: 1.2, notes: ["réplica encadeada"] }),
  },
  taunt: {
    id: "taunt", label: "PROVOCAR", group: "defesa",
    desc: "Força a IA inimiga a focar o provocador.",
    run: () => ({ guard: 0.08, notes: ["provocação"] }),
  },
  cleanse: {
    id: "cleanse", label: "LIMPAR", group: "defesa",
    desc: "Remove um status negativo por uso.",
    run: (c) => ({ mpGain: has(c.atk, "poison") || has(c.atk, "burn") ? 3 : 0, notes: ["circuito limpo"] }),
  },
  purge: {
    id: "purge", label: "PURGAR", group: "defesa",
    desc: "Varre todos os debuffs e converte em blindagem.",
    run: (c) => {
      const bad = c.atk.effects.length;
      return bad ? { guard: 0.05 * bad, notes: ["purga completa"] } : {};
    },
  },
  reviveOnce: {
    id: "reviveOnce", label: "REATIVAR", group: "defesa",
    desc: "Uma vez por batalha, volta com 35% do HP ao cair.",
    run: () => ({ notes: ["núcleo de emergência"] }),
  },
  guardStance: {
    id: "guardStance", label: "POSTURA FIRME", group: "defesa",
    desc: "Reduz muito o dano, mas abaixa o dano causado.",
    run: () => ({ mult: 0.75, guard: 0.3, notes: ["postura firme"] }),
  },
  regenField: {
    id: "regenField", label: "CAMPO DE REPARO", group: "defesa",
    desc: "Ergue um campo que repara o time a cada turno.",
    run: (c) => ({ heal: Math.max(1, pct(3, c.atk.maxHp)), notes: ["campo de reparo"] }),
  },

  /* ------------------------------------------------------------- campo */
  summon: {
    id: "summon", label: "INVOCAR", group: "campo",
    desc: "Invoca um drone auxiliar que ataca a cada turno.",
    run: (c) => ({ flat: Math.max(1, pct(5, c.vic.maxHp)), notes: ["drone invocado"] }),
  },
  zone: {
    id: "zone", label: "ZONA", group: "campo",
    desc: "Cria uma zona elemental que afeta quem estiver nela.",
    run: (c) => ({ mult: c.zone === c.atk.element ? 1.15 : 1.05, notes: ["zona criada"] }),
  },
  trap: {
    id: "trap", label: "ARMADILHA", group: "campo",
    desc: "Deixa uma armadilha na posição do alvo.",
    run: (c) => ({ flat: Math.max(1, pct(7, c.vic.maxHp)), notes: ["armadilha disparada"] }),
  },
  terrainShift: {
    id: "terrainShift", label: "MUDAR TERRENO", group: "campo",
    desc: "Troca o clima da arena ao seu favor.",
    run: (c) => ({ mult: c.weatherElement === c.atk.element ? 1.2 : 1.08, notes: ["terreno reescrito"] }),
  },
  weather: {
    id: "weather", label: "CLIMA", group: "campo",
    desc: "Puxa o clima para si: a arena responde ao chassi.",
    run: (c) => (c.weatherElement ? { mult: 1.12, notes: ["clima dominado"] } : { mult: 1.05 }),
  },
  hazardSpawn: {
    id: "hazardSpawn", label: "PERIGO", group: "campo",
    desc: "Espalha perigo elementtal pela arena.",
    run: (c) => ({ flat: Math.max(1, pct(4, c.vic.maxHp)), notes: ["perigo espalhado"] }),
  },
  coverMake: {
    id: "coverMake", label: "ERGUE COBERTURA", group: "campo",
    desc: "Ergue cobertura de campo que sobrevive ao turno.",
    run: () => ({ guard: 0.14, notes: ["cobertura erguida"] }),
  },
  aura: {
    id: "aura", label: "AURA", group: "campo",
    desc: "Aura geral que reforça o time inteiro.",
    run: (c) => ({ mult: 1 + c.allyHpPct * 0.15, notes: ["aura do time"] }),
  },
  auraHeal: {
    id: "auraHeal", label: "AURA DE CURA", group: "campo",
    desc: "Aura que repara os aliados a cada turno.",
    run: (c) => ({ heal: Math.max(1, pct(4, c.atk.maxHp)), notes: ["aura curativa"] }),
  },
  auraStr: {
    id: "auraStr", label: "AURA DE FORÇA", group: "campo",
    desc: "+18% de força do time enquanto o portador vive.",
    run: (c) => ({ mult: 1 + Math.min(0.3, (1 - c.allyHpPct) * 0 + 0.18), notes: ["aura de força"] }),
  },
  auraDef: {
    id: "auraDef", label: "AURA DE DEFESA", group: "campo",
    desc: "Blindagem de time: -15% de dano recebido por todos.",
    run: () => ({ mult: 1.06, guard: 0.15, notes: ["aura defensiva"] }),
  },
  auraAgi: {
    id: "auraAgi", label: "AURA DE VELOCIDADE", group: "campo",
    desc: "O time age antes: esquiva e criticidade para cima.",
    run: () => ({ mult: 1.14, notes: ["aura de velocidade"] }),
  },
  auraRegen: {
    id: "auraRegen", label: "AURA DE REGENERAÇÃO", group: "campo",
    desc: "Reparo contínuo em todos os aliados, maior com HP baixo.",
    run: (c) => ({ heal: Math.max(1, pct(3 + (1 - c.allyHpPct) * 4, c.atk.maxHp)) }),
  },

  /* -------------------------------------------------------- informacao */
  stealth: {
    id: "stealth", label: "FURTIVO", group: "informacao",
    desc: "Some do campo: o próximo golpe é crítico garantido.",
    run: (c) => ({ mult: c.crit ? 1.5 : 1.25, notes: ["ataque da sombra"] }),
  },
  reveal: {
    id: "reveal", label: "REVELAR", group: "informacao",
    desc: "Expõe fraquezas: o alvo não pode esquivar nem aparar.",
    run: () => ({ mult: 1.16, notes: ["fraquezas reveladas"] }),
  },
  swapForced: {
    id: "swapForced", label: "TROCA FORÇADA", group: "informacao",
    desc: "Arrasta o alvo para a posição exposta.",
    run: (c) => ({ mult: c.offGuard ? 1.2 : 1.05, notes: ["alvo arrastado"] }),
  },
  transformPhase: {
    id: "transformPhase", label: "TRANSIÇÃO", group: "informacao",
    desc: "Troca de forma no meio do golpe e herda os bônus da nova fase.",
    run: (c) => ({ mult: 1 + Math.min(0.6, (1 - c.atk.hp / c.atk.maxHp) * 0.6), notes: ["forma nova"] }),
  },
  copybuff: {
    id: "copybuff", label: "COPIAR BÔNUS", group: "informacao",
    desc: "Copia um buff ativo do alvo para si.",
    run: (c) => {
      const buffs = c.vic.effects.filter((e) => has(c.atk, e.type) === false).length;
      return buffs ? { mult: 1 + Math.min(0.3, buffs * 0.1), notes: ["bônus copiado"] } : {};
    },
  },
  copyStat: {
    id: "copyStat", label: "COPIAR ATRIBUTO", group: "informacao",
    desc: "Usa a força do alvo contra ele mesmo quando ele é mais forte.",
    run: (c) => (c.vic.str > c.atk.str ? { flat: (c.vic.str - c.atk.str) * 2, notes: ["força emprestada"] } : {}),
  },
  mimic: {
    id: "mimic", label: "MIMETIZAR", group: "informacao",
    desc: "Reproduz o último golpe usado pelo inimigo.",
    run: () => ({ mult: 1.1, notes: ["skill imitada"] }),
  },
  steal: {
    id: "steal", label: "ROUBAR", group: "informacao",
    desc: "Rouba MP e recurso do alvo a cada acerto.",
    run: (c) => ({ mpGain: Math.max(2, pct(5, c.vic.maxMp)), notes: ["recurso roubado"] }),
  },
  cleanseAll: {
    id: "cleanseAll", label: "LIMPEZA TOTAL", group: "informacao",
    desc: "Limpa todo o time e devolve um pouco de MP a cada um.",
    run: (c) => ({ mpGain: Math.max(1, pct(4, c.atk.maxMp)), notes: ["time purificado"] }),
  },

  /* -------------------------------------------------------------- tempo */
  timeStop: {
    id: "timeStop", label: "PARADA TEMPORAL", group: "tempo",
    desc: "Congela o alvo por um ciclo: ele perde a próxima ação.",
    run: () => ({ mult: 1.3, notes: ["tempo parado"] }),
  },
  quantumSkip: {
    id: "quantumSkip", label: "SALTO QUÂNTICO", group: "tempo",
    desc: "Salta a vez do alvo: age duas vezes antes dele.",
    run: () => ({ mult: 1.15, notes: ["salto quântico"] }),
  },
  mirrorDamage: {
    id: "mirrorDamage", label: "ESPELHO", group: "tempo",
    desc: "Copia o dano causado ao alvo de volta para o atacante.",
    run: () => ({ mult: 1.18, notes: ["dano espelhado"] }),
  },
  karma: {
    id: "karma", label: "CARMA", group: "tempo",
    desc: "Quem causou mais dano na luta recebe a conta de volta.",
    run: (c) => ({ flat: Math.max(1, pct(6, c.vic.maxHp)), notes: ["carma cobrado"] }),
  },
  countdown: {
    id: "countdown", label: "CONTAGEM", group: "tempo",
    desc: "Marca o alvo: em 3 turnos o golpe guardado detona.",
    run: (c) => ({ mult: c.atk.turn % 3 === 0 ? 1.6 : 1.02, notes: ["a contagem corre"] }),
  },
  lucky: {
    id: "lucky", label: "SORTE", group: "tempo",
    desc: "Gasta sorte acumulada para forçar dano máximo.",
    run: (c) => (c.atk.res > 0 ? { mult: 1 + Math.min(0.5, c.atk.res * 0.1), notes: ["sorte gasta"] } : {}),
  },
  positionShift: {
    id: "positionShift", label: "TROCAR POSIÇÃO", group: "tempo",
    desc: "Troca de posição e rouba o bônus de zona do alvo.",
    run: () => ({ mult: 1.08, notes: ["posição trocada"] }),
  },
  ultimateCharge: {
    id: "ultimateCharge", label: "CARGA DE ULTIMATE", group: "tempo",
    desc: "Aumenta a potência do golpe em até 20% conforme a carga individual do reator cresce.",
    run: (c) => ({ mult: 1 + Math.min(0.2, c.atk.charge * 0.02), notes: ["ultimate carregando"] }),
  },
};

export const MECH_LIST: MechDef[] = Object.values(MECH_DEFS);
export const MECH_DEF_COUNT = MECH_LIST.length;

export function mechDef(id: string): MechDef | null {
  return MECH_DEFS[id] ?? null;
}

export function mechLabel(id: string): string {
  return MECH_DEFS[id]?.label ?? id.toUpperCase();
}

export function mechGroup(id: string): string {
  return MECH_DEFS[id]?.group ?? "outros";
}

/** Ids de mecanicas desconhecidos (usado pelo validador dos kits). */
export function unknownMechs(ids: string[]): string[] {
  return ids.filter((id) => !MECH_DEFS[id]);
}

/**
 * Aplica um conjunto de mecanicas ao contexto de um golpe. Os multiplicadores
 * somam em serie, os valores planos somam entre si e as notas voltam para o log.
 */
export function resolveMechs(ids: (string | undefined)[], ctx: MechCtx): MechOut {
  let out = emptyMechOut();
  for (const id of ids) {
    if (!id) continue;
    const def = MECH_DEFS[id];
    if (!def?.run) continue;
    out = merge(out, def.run(ctx));
  }
  return out;
}
