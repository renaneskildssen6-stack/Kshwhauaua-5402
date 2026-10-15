/**
 * Fase H1 — as 93 passivas nomeadas.
 *
 * Cada chassi carrega exatamente duas passivas autorais + um talento. A
 * passiva se pendura num dos 32 hooks (`PASSIVE_HOOKS`) e devolve numeros que
 * `combat.ts` aplica no ponto certo do turno:
 *
 *   mult  -> multiplicador de dano do golpe em resolução
 *   flat  -> dano plano somado
 *   heal  -> cura no portador
 *   mp    -> MP devolvido
 *   res   -> recurso alternativo ganho
 *   guard -> mitigação extra neste golpe
 *   text  -> linha curta que vai para o log de combate
 */

import type { PassiveHook, PassiveId } from "./kits/types";

export interface PassiveActor {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  str: number;
  def: number;
  agl: number;
  level: number;
  effects: { type: string; power: number; turns: number }[];
  res: number;
  resMax: number;
  turn: number;
  kills: number;
  hits: number;
  stacks: number;
  charge: number;
  element: string;
  robotId: string;
}

export interface PassiveCtx {
  /** portador da passiva. */
  who: PassiveActor;
  /** oponente direto. */
  foe: PassiveActor;
  hook: PassiveHook;
  /** dano do golpe em resolução (quando aplicável). */
  dmg: number;
  crit: boolean;
  /** valor do evento: dano recebido, cura, MP gasto... */
  value: number;
  rng: () => number;
  allyHpPct: number;
  foeHpPct: number;
  /** true quando o portador é o lado do jogador. */
  isPlayer: boolean;
}

export interface PassiveOut {
  mult?: number;
  flat?: number;
  heal?: number;
  mp?: number;
  res?: number;
  guard?: number;
  text?: string;
}

export interface PassiveDef {
  id: PassiveId;
  name: string;
  hook: PassiveHook;
  desc: string;
  run?: (c: PassiveCtx) => PassiveOut | null;
}

const has = (a: PassiveActor, t: string) => a.effects.some((e) => e.type === t);
const pct = (v: number, of: number) => Math.round((of * v) / 100);

export const PASSIVE_DEFS: Record<string, PassiveDef> = {
  /* ------------------------------------------------------------ abertura */
  openingStrike: {
    id: "openingStrike", name: "GOLPE DE ABERTURA", hook: "onBeforeAttack",
    desc: "No primeiro round da luta, +35% de dano e crítico garantido.",
    run: (c) => (c.who.turn <= 1 ? { mult: 1.35, text: "abertura perfeita" } : null),
  },
  vanguardWall: {
    id: "vanguardWall", name: "MURALHA DE VANGUARDA", hook: "onDamageCalc",
    desc: "Enquanto todos os aliados vivem, -18% de dano recebido.",
    run: (c) => (c.allyHpPct > 0.9 ? { guard: 0.18, text: "muralha intacta" } : null),
  },
  rearSight: {
    id: "rearSight", name: "VISÃO TRASEIRA", hook: "onBeforeAttack",
    desc: "Não pode ser atacado pelas costas: +20% de dano contra flanqueadores.",
    run: (c) => (c.foe.agl > c.who.agl ? { mult: 1.2, text: "leu o movimento" } : null),
  },
  flankerInstinct: {
    id: "flankerInstinct", name: "INSTINTO DE FLANCO", hook: "onTurnStart",
    desc: "Ganha +12% de crítico no primeiro golpe de cada round.",
    run: (c) => (c.who.hits === 0 ? { mult: 1.12, res: 1, text: "posição de flanco" } : null),
  },
  firstBlood: {
    id: "firstBlood", name: "PRIMEIRO SANGUE", hook: "onKill",
    desc: "O primeiro abate do portador cura 25% do HP máximo, uma vez por luta.",
    run: (c) => (c.who.kills === 1 ? { heal: pct(25, c.who.maxHp), text: "primeiro sangue" } : null),
  },
  predator: {
    id: "predator", name: "PREDADOR", hook: "onBeforeAttack",
    desc: "+30% de dano contra alvos abaixo de metade do HP.",
    run: (c) => (c.foeHpPct < 0.5 ? { mult: 1.3, text: "farejou a presa" } : null),
  },
  opportunist: {
    id: "opportunist", name: "OPORTUNISTA", hook: "onBeforeAttack",
    desc: "+22% de dano contra alvos com qualquer status negativo.",
    run: (c) => (c.foe.effects.length > 0 ? { mult: 1.22, text: "aproveitou a brecha" } : null),
  },
  executioner: {
    id: "executioner", name: "CARRASCO", hook: "onHit",
    desc: "Golpes que zeram o HP devolvem 12 de MP.",
    run: (c) => (c.foe.hp <= 0 ? { mp: 12, text: "execução limpa" } : null),
  },
  duelist: {
    id: "duelist", name: "DUELISTA", hook: "onDamageCalc",
    desc: "+15% de dano e -10% de dano recebido em combate 1v1 isolado.",
    run: (c) => (c.allyHpPct <= 0.34 && c.foe.effects.length === 0 ? { mult: 1.15, guard: 0.1 } : null),
  },
  berserker: {
    id: "berserker", name: "BERSERKER", hook: "onBeforeAttack",
    desc: "+3% de dano por 10% de HP perdido.",
    run: (c) => ({ mult: 1 + (1 - c.who.hp / c.who.maxHp) * 0.3, text: "raiva acumulada" }),
  },
  revengeDrive: {
    id: "revengeDrive", name: "DESEJO DE VINGANÇA", hook: "onTakeHit",
    desc: "Cada golpe recebido deixa a próxima resposta 8% mais forte.",
    run: () => ({ res: 1, mult: 1, text: "vingança carregada" }),
  },
  painConverter: {
    id: "painConverter", name: "CONVERSOR DE DOR", hook: "onTakeHit",
    desc: "Converte 30% do dano recebido em recurso.",
    run: (c) => ({ res: Math.max(1, Math.round(c.value / 30)), text: "dor virou energia" }),
  },
  unyielding: {
    id: "unyielding", name: "INFLEXÍVEL", hook: "onDamageCalc",
    desc: "Abaixo de 25% de HP, nunca recebe mais de 20% do HP máximo por golpe.",
    run: (c) => (c.who.hp / c.who.maxHp < 0.25 ? { guard: 0.45, text: "não cai" } : null),
  },
  secondWind: {
    id: "secondWind", name: "SEGUNDO FÔLEGO", hook: "onLowHp",
    desc: "Uma vez, ao cair abaixo de 30%, repara 20% do HP.",
    run: (c) => (c.who.hp / c.who.maxHp < 0.3 ? { heal: pct(20, c.who.maxHp), res: 3, text: "segundo fôlego" } : null),
  },
  phoenixCore: {
    id: "phoenixCore", name: "NÚCLEO FÊNIX", hook: "onDeathAvoid",
    desc: "Uma vez por luta, volta com 40% do HP quando zerado.",
    run: (c) => ({ heal: pct(40, c.who.maxHp), res: 2, text: "núcleo fênix reacende" }),
  },
  regenerator: {
    id: "regenerator", name: "REGENERADOR", hook: "onTurnStart",
    desc: "Repara 6% do HP máximo por turno.",
    run: (c) => ({ heal: pct(6, c.who.maxHp), text: "reparo contínuo" }),
  },
  symbiote: {
    id: "symbiote", name: "SIMBIONTE", hook: "onHit",
    desc: "Cada acerto cura 8% do dano causado.",
    run: (c) => ({ heal: Math.max(1, Math.round(c.dmg * 0.08)) }),
  },
  leechField: {
    id: "leechField", name: "CAMPO SUGADOR", hook: "onEndTurn",
    desc: "Ao fim do turno, drena 4% do HP dos inimigos vivos.",
    run: (c) => ({ heal: pct(4, c.who.maxHp), flat: pct(4, c.foe.maxHp), text: "campo sugador" }),
  },
  energySiphon: {
    id: "energySiphon", name: "SIFÃO DE ENERGIA", hook: "onHit",
    desc: "Cada acerto rouba 6 de MP do alvo.",
    run: () => ({ mp: 6, text: "energia sifonada" }),
  },
  reactorSurge: {
    id: "reactorSurge", name: "PICO DO REATOR", hook: "onTurnStart",
    desc: "Abaixo de 50% de MP o golpe seguinte causa +25%.",
    run: (c) => (c.who.mp / c.who.maxMp < 0.5 ? { mult: 1.25, mp: 4, text: "pico do reator" } : null),
  },
  heatSink: {
    id: "heatSink", name: "DISSIPADOR", hook: "onEndTurn",
    desc: "Zera um ponto de acúmulo por turno e cura 3% do HP.",
    run: (c) => ({ heal: pct(3, c.who.maxHp), res: -1, text: "calor dissipado" }),
  },
  ammoFeeder: {
    id: "ammoFeeder", name: "ALIMENTADOR", hook: "onTurnStart",
    desc: "Recarrega 2 de munição por turno parado.",
    run: (c) => (c.who.hits === 0 ? { res: 2, text: "recarregado" } : { res: 1 }),
  },
  chargeKeeper: {
    id: "chargeKeeper", name: "GUARDIÃO DE CARGA", hook: "onEndTurn",
    desc: "Não perde carga ao agir e ganha +1 por turno defendendo.",
    run: () => ({ res: 1, text: "carga preservada" }),
  },
  echoChamber: {
    id: "echoChamber", name: "CÂMARA DE ECO", hook: "onAfterAttack",
    desc: "Repete o golpe como eco por 20% do dano.",
    run: (c) => ({ flat: Math.max(1, Math.round(c.dmg * 0.2)), text: "eco do golpe" }),
  },
  luckyCharm: {
    id: "luckyCharm", name: "AMULETO DA SORTE", hook: "onMiss",
    desc: "Cada ataque que erra rende 1 de sorte (força crítico depois).",
    run: () => ({ res: 1, text: "sorte somada" }),
  },
  flowState: {
    id: "flowState", name: "ESTADO DE FLUXO", hook: "onEvade",
    desc: "Esquiva perfeita dá +1 de fluxo e 5 de MP.",
    run: () => ({ res: 1, mp: 5, text: "fluxo perfeito" }),
  },
  corroder: {
    id: "corroder", name: "CORROSIVO", hook: "onHit",
    desc: "Todo acerto diminui 4% da defesa do alvo pelo resto da luta.",
    run: (c) => ({ flat: pct(4, c.foe.def), text: "blindagem perdendo" }),
  },
  toxinBloom: {
    id: "toxinBloom", name: "FLORAÇÃO TÓXICA", hook: "onStatusApply",
    desc: "Aplicar veneno em quem já está envenenado dobra a pilha.",
    run: (c) => (has(c.foe, "poison") ? { res: 2, flat: pct(3, c.foe.maxHp), text: "toxina floresce" } : null),
  },
  pyromaniac: {
    id: "pyromaniac", name: "PIROMANÍACO", hook: "onBeforeAttack",
    desc: "+25% de dano em alvos queimando; queimadura dura +1 turno.",
    run: (c) => (has(c.foe, "burn") ? { mult: 1.25, text: "fogo alimenta fogo" } : null),
  },
  cryomancer: {
    id: "cryomancer", name: "CRIOMANTE", hook: "onBeforeAttack",
    desc: "Contra alvos congelados/lentos o golpe é crítico garantido.",
    run: (c) => (has(c.foe, "freeze") || has(c.foe, "slow") ? { mult: 1.4, text: "alvo cristalizado" } : null),
  },
  stormChaser: {
    id: "stormChaser", name: "CAÇADOR DE TORMENTAS", hook: "onCrit",
    desc: "Críticos descarregam 6% do HP máximo do alvo em dano extra.",
    run: (c) => (c.crit ? { flat: pct(6, c.foe.maxHp), text: "descarga elétrica" } : null),
  },
  earthshaker: {
    id: "earthshaker", name: "ABALA-TERRA", hook: "onAfterAttack",
    desc: "Golpes pesados derrubam 8% de HP de todos os inimigos.",
    run: (c) => (c.dmg / Math.max(1, c.foe.maxHp) > 0.2 ? { flat: pct(8, c.foe.maxHp), text: "solo rachou" } : null),
  },
  windReader: {
    id: "windReader", name: "LEITOR DE VENTO", hook: "onEvade",
    desc: "Cada esquiva dá +8 de agilidade até o fim do round.",
    run: () => ({ res: 1, guard: 0.08, text: "leu a corrente" }),
  },
  tideCaller: {
    id: "tideCaller", name: "CHAMADOR DE MARÉ", hook: "onTurnStart",
    desc: "A cada 3 turnos banha o campo e repara 10% do HP do time.",
    run: (c) => (c.who.turn % 3 === 0 ? { heal: pct(10, c.who.maxHp), text: "maré alta" } : null),
  },
  lightBearer: {
    id: "lightBearer", name: "PORTADOR DA LUZ", hook: "onTurnStart",
    desc: "Ilumina o campo: aliados ganham +10% de dano e o portador cura 5%.",
    run: () => ({ heal: 0, mult: 1.1, res: 1, text: "campo iluminado" }),
  },
  shadowStep: {
    id: "shadowStep", name: "PASSO SOMBRIO", hook: "onBeforeAttack",
    desc: "Contra alvos sem status negativo, o primeiro golpe do round é crítico.",
    run: (c) => (c.foe.effects.length === 0 && c.who.hits === 0 ? { mult: 1.45, text: "sumiu na sombra" } : null),
  },
  starGazer: {
    id: "starGazer", name: "OBSERVADOR ESTELAR", hook: "onRoundStart",
    desc: "No começo de cada round ganha 8 de MP e +1 de recurso.",
    run: () => ({ mp: 8, res: 1, text: "leitura estelar" }),
  },
  quantumGhost: {
    id: "quantumGhost", name: "FANTASMA QUÂNTICO", hook: "onDamageCalc",
    desc: "30% de chance de o golpe recebido simplesmente não existir.",
    run: (c) => (c.rng() < 0.3 ? { guard: 1, text: "o golpe atravessou o vazio" } : null),
  },
  photosynth: {
    id: "photosynth", name: "FOTOSSÍNTESE", hook: "onTurnStart",
    desc: "Em clima de LUZ/TERRA o reparo dobra e ganha MP.",
    run: (c) => ({ heal: pct(c.who.element === "TERRA" ? 8 : 6, c.who.maxHp), mp: 3, text: "síntese ativa" }),
  },
  ironskin: {
    id: "ironskin", name: "PELE DE FERRO", hook: "onDamageCalc",
    desc: "-12% de dano recebido permanentemente; +6% contra contundentes.",
    run: () => ({ guard: 0.12 }),
  },
  prismGuard: {
    id: "prismGuard", name: "GUARDA PRISMÁTICA", hook: "onDamageCalc",
    desc: "Reduz 10% do dano e devolve 15% do dano calculado ao atacante.",
    run: (c) => ({ guard: 0.1, flat: Math.round(c.value * 0.15), text: "ataque refratado" }),
  },
  runeWeaver: {
    id: "runeWeaver", name: "TECEDOR DE RUNAS", hook: "onStatusApply",
    desc: "Cada status aplicado devolve 4 de MP e +1 de recurso.",
    run: () => ({ mp: 4, res: 1, text: "runa gravada" }),
  },
  terrainMaster: {
    id: "terrainMaster", name: "MESTRE DO TERRENO", hook: "onTerrain",
    desc: "Bônus de zona valem o dobro para o portador.",
    run: (c) => ({ mult: 1.12, heal: pct(3, c.who.maxHp), text: "terreno dominado" }),
  },
  hazardWalker: {
    id: "hazardWalker", name: "ANDARILHO DO PERIGO", hook: "onTerrain",
    desc: "Imune a dano de zona e converte perigo em 6 de MP.",
    run: () => ({ mp: 6, guard: 0.06, text: "atravessa o perigo" }),
  },
  zoneLord: {
    id: "zoneLord", name: "SENHOR DAS ZONAS", hook: "onTurnStart",
    desc: "Enquanto estiver em zona própria, ganha 15% de dano e 4 de recurso.",
    run: () => ({ mult: 1.15, res: 4, text: "zona consagrada" }),
  },
  teamPlayer: {
    id: "teamPlayer", name: "JOGADOR DE EQUIPE", hook: "onUltimateCharge",
    desc: "Cada outro aliado vivo dá +6% de dano ao portador; ganhar carga repara 3% do HP de cada aliado vivo.",
    run: (c) => ({ heal: pct(3, c.who.maxHp), text: "jogo coletivo" }),
  },
  comboKeeper: {
    id: "comboKeeper", name: "GUARDIÃO DO REATOR", hook: "onUltimateCharge",
    desc: "Ao carregar o ultimate, recupera +2 de recurso do chassi.",
    run: () => ({ res: 2, text: "reator alimentado" }),
  },
  ultimateBattery: {
    id: "ultimateBattery", name: "BATERIA FINAL", hook: "onUltReady",
    desc: "Ao chegar a 100%, concede +25% de força e +12 pontos de esquiva aos aliados vivos por dois rounds.",
    run: () => ({ text: "bateria final ativa" }),
  },
  guardianAngel: {
    id: "guardianAngel", name: "ANJO DA GUARDA", hook: "onAllyFaint",
    desc: "Quando um aliado cai, todo o time repara 12% do HP.",
    run: (c) => ({ heal: pct(12, c.who.maxHp), text: "proteção cedida" }),
  },
  auraAnchor: {
    id: "auraAnchor", name: "ÂNCORA DE AURA", hook: "onTurnStart",
    desc: "Auras do portador duram um turno a mais e curam 4%.",
    run: (c) => ({ heal: pct(4, c.who.maxHp), res: 1, text: "aura ancorada" }),
  },
  statusWeaver: {
    id: "statusWeaver", name: "TECELÃO DE STATUS", hook: "onStatusApply",
    desc: "Todo status aplicado dura +1 turno e ganha +20% de força.",
    run: () => ({ res: 2, text: "status reforçado" }),
  },
  purgeAura: {
    id: "purgeAura", name: "AURA PURIFICADORA", hook: "onTurnStart",
    desc: "Remove um debuff próprio por turno e ganha 3 de MP.",
    run: (c) => (c.who.effects.length > 0 ? { mp: 3, res: 1, text: "aura purificadora" } : null),
  },
  mirrorCore: {
    id: "mirrorCore", name: "NÚCLEO ESPELHO", hook: "onTakeHit",
    desc: "Devolve 20% de todo dano recebido ao atacante.",
    run: (c) => ({ flat: Math.round(c.value * 0.2), text: "dano espelhado" }),
  },
  karmaWeaver: {
    id: "karmaWeaver", name: "TECELÃO DE CARMA", hook: "onTakeHit",
    desc: "Guarda o dano recebido e devolve dobrado no quarto turno.",
    run: (c) => (c.who.turn % 4 === 0 ? { flat: Math.round(c.value * 2), text: "carma cobrado" } : { res: 1 }),
  },
  doomKeeper: {
    id: "doomKeeper", name: "GUARDIÃO DA SENTENÇA", hook: "onStatusApply",
    desc: "Aplicar condenação também reduz 20% do HP restante em 3 turnos.",
    run: (c) => (has(c.foe, "doom") ? { flat: pct(20, c.foe.maxHp) / 3, text: "sentença selada" } : null),
  },
  timekeeper: {
    id: "timekeeper", name: "GUARDA-TEMPO", hook: "onTurnStart",
    desc: "A cada 2 turnos age primeiro e repõe 10 de MP.",
    run: (c) => (c.who.turn % 2 === 0 ? { mp: 10, res: 1, text: "tempo acertado" } : null),
  },
  phaseWalker: {
    id: "phaseWalker", name: "CAMINHANTE DE FASES", hook: "onBossPhase",
    desc: "Trocar de fase cura 15% e concede uma ação extra.",
    run: () => ({ heal: 0, res: 3, text: "atravessou a fase" }),
  },
  leader: {
    id: "leader", name: "LIDERANÇA", hook: "onRoundStart",
    desc: "Enquanto vivo, o time ganha +12% de dano e +8% de defesa.",
    run: () => ({ mult: 1.12, guard: 0.08, text: "liderança ativa" }),
  },
  loneWolf: {
    id: "loneWolf", name: "LOBO SOLITÁRIO", hook: "onRoundStart",
    desc: "Como último de pé, ganha +40% de dano e +15 de esquiva.",
    run: (c) => (c.allyHpPct <= 0.34 ? { mult: 1.4, guard: 0.15, text: "sozinho e letal" } : null),
  },
  lastMan: {
    id: "lastMan", name: "ÚLTIMO DE PÉ", hook: "onLowHp",
    desc: "Abaixo de 20% de HP, cura 3% por turno e ganha 5 de recurso.",
    run: (c) => (c.who.hp / c.who.maxHp < 0.2 ? { heal: pct(3, c.who.maxHp), res: 5, text: "resiste sozinho" } : null),
  },
  counterMind: {
    id: "counterMind", name: "MENTE DE CONTRA", hook: "onTakeHit",
    desc: "Devolve 25% do dano recebido sempre que estiver defendendo.",
    run: (c) => (has(c.who, "damage_reduction") ? { flat: Math.round(c.value * 0.25), text: "contra-ataque mental" } : null),
  },
  parryMaster: {
    id: "parryMaster", name: "MESTRE DO APARO", hook: "onDamageCalc",
    desc: "25% de chance de aparar completamente o golpe.",
    run: (c) => (c.rng() < 0.25 ? { guard: 1, text: "APARADO" } : null),
  },
  evasiveFrame: {
    id: "evasiveFrame", name: "CHASSI EVASIVO", hook: "onDamageCalc",
    desc: "+14% de chance de esquiva em todos os golpes.",
    run: () => ({ guard: 0.14 }),
  },
  thornsAura: {
    id: "thornsAura", name: "AURA DE ESPINHOS", hook: "onTakeHit",
    desc: "Quem atacar o portador perde 7% de HP por golpe.",
    run: (c) => ({ flat: pct(7, c.foe.maxHp), text: "espinhos cortaram" }),
  },
  reflector: {
    id: "reflector", name: "REFLETOR", hook: "onTakeHit",
    desc: "Reflete 35% do dano, mas só contra golpes elementais.",
    run: (c) => ({ flat: Math.round(c.value * 0.35), text: "reflexão elementtal" }),
  },
  shieldEngineer: {
    id: "shieldEngineer", name: "ENGENHEIRO DE ESCUDOS", hook: "onTurnStart",
    desc: "Ergue 12% de barreira no início de cada turno.",
    run: () => ({ guard: 0.12, res: 1, text: "escudo remontado" }),
  },
  cleanSlate: {
    id: "cleanSlate", name: "PÁGINA LIMPA", hook: "onPurge",
    desc: "Purificações curam 15% do HP e dão 10 de MP.",
    run: (c) => ({ heal: pct(15, c.who.maxHp), mp: 10, res: 2, text: "página limpa" }),
  },
  silentHunter: {
    id: "silentHunter", name: "CAÇADOR SILENCIOSO", hook: "onBeforeAttack",
    desc: "+35% de dano contra alvos silenciados ou atordoados.",
    run: (c) => (has(c.foe, "silence") || has(c.foe, "stun") ? { mult: 1.35, text: "silêncio mortal" } : null),
  },
  spotter: {
    id: "spotter", name: "OBSERVADOR", hook: "onRoundStart",
    desc: "Marca o alvo mais perigoso: o time inteiro causa +10% nele.",
    run: () => ({ mult: 1.1, res: 1, text: "alvo prioritário marcado" }),
  },
  analyst: {
    id: "analyst", name: "ANALISTA", hook: "onAfterAttack",
    desc: "Depois de atacar, o próximo golpe no mesmo alvo ignora 20% da defesa.",
    run: (c) => ({ flat: pct(20, c.foe.def), text: "padrão analisado" }),
  },
  scavenger: {
    id: "scavenger", name: "CATADOR", hook: "onKill",
    desc: "Abates rendem 15 de MP e 3 de recurso.",
    run: () => ({ mp: 15, res: 3, text: "sucata coletada" }),
  },
  thief: {
    id: "thief", name: "LADRÃO", hook: "onHit",
    desc: "Rouba 1 de recurso e 5% do MP do alvo em cada acerto.",
    run: (c) => ({ mp: Math.max(1, pct(5, c.foe.maxMp)), res: 1, text: "roubou recurso" }),
  },
  mimicFrame: {
    id: "mimicFrame", name: "CHASSI MÍMICO", hook: "onTurnStart",
    desc: "Copia a maior virtude do inimigo: +20% no melhor atributo.",
    run: () => ({ mult: 1.2, res: 1, text: "virtude copiada" }),
  },
  copycat: {
    id: "copycat", name: "IMITADOR", hook: "onAfterAttack",
    desc: "Repete o último golpe recebido como contra-golpe.",
    run: (c) => ({ flat: Math.round(c.value * 0.6), text: "golpe imitado" }),
  },
  undyingCore: {
    id: "undyingCore", name: "NÚCLEO IMORTAL", hook: "onDeathAvoid",
    desc: "Sobrevive ao golpe letal com 1 de HP, uma vez por luta.",
    run: () => ({ guard: 1, res: 2, text: "núcleo imortal resistiu" }),
  },
  soulTether: {
    id: "soulTether", name: "AMARRA ALMA", hook: "onAllyFaint",
    desc: "Quando um aliado cai, absorve 20% do HP dele e 10 de MP.",
    run: (c) => ({ heal: pct(20, c.value), mp: 10, text: "alma amarrada" }),
  },
  bloodTithe: {
    id: "bloodTithe", name: "DÍZIMO DE SANGUE", hook: "onCrit",
    desc: "Golpes críticos convertem 30% do dano em reparo.",
    run: (c) => (c.crit ? { heal: Math.round(c.dmg * 0.3), text: "dízimo cobrado" } : null),
  },
  overclocker: {
    id: "overclocker", name: "OVERCLOCKER", hook: "onMpSpend",
    desc: "Gastar MP além de 20 devolve 40% como recurso.",
    run: (c) => (c.value >= 20 ? { res: Math.round(c.value * 0.4), text: "overclock" } : null),
  },
  clockwork: {
    id: "clockwork", name: "MECANISMO DE RELÓGIO", hook: "onEndTurn",
    desc: "Sempre age na mesma hora: +5% de dano por turno acumulado.",
    run: (c) => ({ mult: 1 + Math.min(0.4, c.who.turn * 0.05), text: "engrenagens exatas" }),
  },
  adaptation: {
    id: "adaptation", name: "ADAPTAÇÃO", hook: "onTakeHit",
    desc: "Cada golpe do mesmo elemento dói 15% menos que o anterior.",
    run: (c) => ({ guard: Math.min(0.4, 0.15 * (c.who.turn % 4)), text: "adaptando" }),
  },
  escalation: {
    id: "escalation", name: "ESCALADA", hook: "onHit",
    desc: "+7% de dano por golpe consecutivo no mesmo alvo.",
    run: (c) => ({ mult: 1 + Math.min(0.5, c.who.hits * 0.07), text: "escalando" }),
  },
  patience: {
    id: "patience", name: "PACIÊNCIA", hook: "onEndTurn",
    desc: "Turnos sem atacar acumulam 12% de dano de reserva.",
    run: (c) => (c.who.hits === 0 ? { res: 2, mult: 1.12, text: "paciência acumulando" } : null),
  },
  teslaCoil: {
    id: "teslaCoil", name: "BOBINA DE TESLA", hook: "onHit",
    desc: "Acertos causam 3% do HP máximo do alvo em dano elétrico extra.",
    run: (c) => ({ flat: pct(3, c.foe.maxHp), text: "descarga em cadeia" }),
  },
  magneticField: {
    id: "magneticField", name: "CAMPO MAGNÉTICO", hook: "onTurnStart",
    desc: "Atrai os golpes: +15% de aparo, mas +5% de dano recebido.",
    run: () => ({ guard: 0.15, text: "campo magnético" }),
  },
  gravityWell: {
    id: "gravityWell", name: "POÇO DE GRAVIDADE", hook: "onTurnStart",
    desc: "Prende o alvo: ele perde esquiva e iniciativa.",
    run: () => ({ mult: 1.18, guard: 0.08, text: "gravidade prendeu" }),
  },
  sandstorm: {
    id: "sandstorm", name: "TEMPESTADE DE AREIA", hook: "onRoundStart",
    desc: "Levanta areia: -15% de precisão para todos, -0 para o portador.",
    run: () => ({ guard: 0.1, res: 1, text: "areia levantada" }),
  },
  toxicCloud: {
    id: "toxicCloud", name: "NUVEM TÓXICA", hook: "onRoundStart",
    desc: "Nuvem persistente: 4% de HP por turno nos inimigos.",
    run: (c) => ({ flat: pct(4, c.foe.maxHp), text: "nuvem tóxica" }),
  },
  emberTrail: {
    id: "emberTrail", name: "TRILHA DE BRASAS", hook: "onAfterAttack",
    desc: "Deixa brasas: o alvo queima 3% do HP por turno.",
    run: (c) => ({ flat: pct(3, c.foe.maxHp), text: "brasas no rastro" }),
  },
  frostAura: {
    id: "frostAura", name: "AURA GÉLIDA", hook: "onTurnStart",
    desc: "Gela o campo: inimigos perdem 8% de agilidade.",
    run: () => ({ guard: 0.08, mult: 1.1, text: "campo gelado" }),
  },
  staticField: {
    id: "staticField", name: "CAMPO ESTÁTICO", hook: "onTurnStart",
    desc: "Estática pune o primeiro golpe inimigo com 8% de recuo.",
    run: (c) => ({ flat: pct(8, c.foe.maxHp), text: "estática disparou" }),
  },
  thornMine: {
    id: "thornMine", name: "MINA DE ESPINHOS", hook: "onTerrain",
    desc: "Mina o terreno: quem entrar nele leva 12% do HP máximo.",
    run: (c) => ({ flat: pct(12, c.foe.maxHp), text: "mina disparou" }),
  },
  spikeFloor: {
    id: "spikeFloor", name: "PISO DE LÂMINAS", hook: "onTakeHit",
    desc: "O chão corta: todo golpe próximo devolve 5% do dano em sangramento.",
    run: (c) => ({ flat: pct(5, c.foe.maxHp), text: "lâminas do piso" }),
  },
  battleRhythm: {
    id: "battleRhythm", name: "RITMO DE BATALHA", hook: "onAction",
    desc: "Alterna ataque e defesa: cada troca dá +10% de dano e 2 de recurso.",
    run: () => ({ mult: 1.1, res: 2, text: "ritmo mantido" }),
  },
};

export const PASSIVE_LIST: PassiveDef[] = Object.values(PASSIVE_DEFS);
export const PASSIVE_DEF_COUNT = PASSIVE_LIST.length;

export function passiveDef(id: string): PassiveDef | null {
  return PASSIVE_DEFS[id] ?? null;
}

export function passiveLabel(id: string): string {
  return PASSIVE_DEFS[id]?.name ?? id.toUpperCase();
}

export function unknownPassives(ids: string[]): string[] {
  return ids.filter((id) => !PASSIVE_DEFS[id]);
}

export interface FiredPassive {
  id: string;
  name: string;
  text: string;
}

export interface PassiveResult {
  out: PassiveOut;
  fired: FiredPassive[];
}

/**
 * Passa os hooks do time por uma lista de passivas. `ids` vem do kit do robô
 * ativo; cada passiva só dispara no hook dela.
 */
export function runPassives(
  ids: string[],
  hook: PassiveHook,
  ctx: PassiveCtx,
): PassiveResult {
  let out: PassiveOut = { mult: 1 };
  const fired: FiredPassive[] = [];
  for (const id of ids) {
    const def = PASSIVE_DEFS[id];
    if (!def || def.hook !== hook || !def.run) continue;
    const r = def.run(ctx);
    if (!r) continue;
    out = {
      mult: (out.mult ?? 1) * (r.mult ?? 1),
      flat: (out.flat ?? 0) + (r.flat ?? 0),
      heal: (out.heal ?? 0) + (r.heal ?? 0),
      mp: (out.mp ?? 0) + (r.mp ?? 0),
      res: (out.res ?? 0) + (r.res ?? 0),
      guard: (out.guard ?? 0) + (r.guard ?? 0),
    };
    fired.push({ id, name: def.name, text: r.text ?? def.name });
  }
  return { out, fired };
}

/** Passivas de um kit que rodam num hook (usado pelo codex/dossiê). */
export function passivesOnHook(ids: string[], hook: PassiveHook): PassiveDef[] {
  return ids
    .map((id) => PASSIVE_DEFS[id])
    .filter((d): d is PassiveDef => Boolean(d) && d.hook === hook);
}
