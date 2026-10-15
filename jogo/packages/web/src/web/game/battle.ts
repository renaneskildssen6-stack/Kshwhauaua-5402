/**
 * Fachada legada da batalha (H1).
 *
 * O motor vive em `./combat`: formacao por posicao, agenda de turnos,
 * elementos com afinidade, 36 status, 105 mecanicas, 93 passivas, campo
 * com zonas/clima, chefes multi-fase, IA tatica e ultimate
 * individual. Este modulo apenas re-exporta a API que as telas ja
 * consomem, preservando o contrato de `screens/battle.tsx`.
 */
export {
  activeOf,
  applyForcedSwap,
  createBattle,
  effectLabel,
  fighterSkills,
  resolveTurn,
  /* HUD H1: acao completa do motor + leituras de painel */
  resolveCombatTurn,
  ultimateOf,
  affinityOf,
  battleReport,
  combatSummary,
  damagePreview,
  orderPreview,
  readyOf,
  reachesBench,
  zoneOf,
} from "./combat";

export type {
  ActiveEffect,
  AffinityTier,
  Battle,
  BattleAction,
  BattleEvent,
  BattleSide,
  BattleView,
  Combat,
  CombatAction,
  CombatMode,
  CombatSummary,
  Combatant,
  Difficulty,
  Fighter,
  Forecast,
  OrderEntry,
  Phase,
  Side,
} from "./combat";

/* Configuracao de combate que as telas leem direto (carga e dificuldade). */
export { ULTIMATE_MAX, DIFFICULTY } from "./combat";
