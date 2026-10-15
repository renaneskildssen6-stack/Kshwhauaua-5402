import type { BattleEvent, Combat, Combatant, Side } from "../../web/game/combat";

/** Campos do lutador que mudam durante a reprodução de um turno. Valores absolutos: patches perdidos não acumulam erro. */
const PATCH_KEYS = ["hp", "mp", "ultimateCharge", "res", "effects", "pos", "charged", "chargeTurns", "ready", "fainted", "str", "def", "agl"] as const;
export type FighterPatch = Pick<Combatant, "uid"> & Partial<Pick<Combatant, (typeof PATCH_KEYS)[number]>>;
/** Evento enviado ao cliente: idêntico ao do motor, exceto `sync`, trocado por um patch leve (o snapshot completo pesa ~40 kB). */
export type OnlineEvent = Exclude<BattleEvent, { t: "sync" }> | { t: "patch"; fighters: FighterPatch[]; active: Record<Side, number> };
export interface Transition { revision: number; events: OnlineEvent[] }

function patchOf(c: Combat): OnlineEvent {
  const fighters = [...c.player.fighters, ...c.enemy.fighters].map(f => {
    const p: Record<string, unknown> = { uid: f.uid };
    for (const k of PATCH_KEYS) p[k] = f[k];
    return p as FighterPatch;
  });
  return { t: "patch", fighters, active: { player: c.player.active, enemy: c.enemy.active } };
}
export function compactEvents(events: BattleEvent[]): OnlineEvent[] {
  return events.map(e => e.t === "sync" ? patchOf(e.combat) : e).slice(-160);
}
const flip = (s: Side): Side => s === "player" ? "enemy" : "player";
/** Converte a reprodução canônica (anfitrião = player) para o ponto de vista do convidado. */
export function eventsFor(events: OnlineEvent[], side: Side): OnlineEvent[] {
  if (side === "player") return events;
  return events.map((e): OnlineEvent => {
    if (e.t === "patch") return { ...e, active: { player: e.active.enemy, enemy: e.active.player } };
    if (e.t === "end") return { ...e, result: e.result === "win" ? "lose" : "win" };
    if (e.t === "order") return { ...e, order: e.order.map(o => ({ ...o, side: flip(o.side) })) };
    if ("side" in e) return { ...e, side: flip(e.side) } as OnlineEvent;
    return e;
  });
}
