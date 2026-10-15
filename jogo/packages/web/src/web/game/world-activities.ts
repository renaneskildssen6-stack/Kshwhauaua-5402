import { addGold, addItem, addPlayerXP } from "./save";
import type { TournamentDef } from "./tournaments";
import { getWorld, saveWorld, type Region, type WorldSave } from "./world";

export type MissionKind = "collect" | "hunt" | "explore" | "lantern" | "relic";
export interface Mission { id: string; region: number; name: string; desc: string; kind: MissionKind; target: number; gold: number; xp: number }
export function missionsFor(r: Region): Mission[] {
  const definitions: [MissionKind, string, string, number][] = [
    ["collect", "ENERGIA DE CAMPO", "Recolha núcleos de energia após aceitar.", 8],
    ["hunt", "GUARDIOES HOSTIS", "Derrote criaturas com golpes, pisões ou especial.", 5],
    ["explore", "CARTOGRAFO", "Descubra três regiões novas após aceitar.", 3],
    ["lantern", "FAROIS DO CAMINHO", "Acenda quatro lanternas novas após aceitar.", 4],
    ["relic", "SEGREDO PRIMORDIAL", "Encontre uma relíquia nas galerias profundas.", 1],
  ];
  return definitions.map(([kind, name, desc, target]) => ({ id: `${r.id}:quest:${kind}`, region: r.index, name, desc, kind, target, gold: 120 + r.site.t.requiredLevel * 14, xp: 30 + r.site.t.requiredLevel * 4 }));
}
export function metric(s: WorldSave, kind: MissionKind): number {
  return kind === "collect" ? s.quests["_collected"]?.value ?? 0 : kind === "hunt" ? s.kills : kind === "explore" ? s.biomes.length : kind === "lantern" ? s.lanterns.length : s.relics.length;
}
export function acceptMission(s: WorldSave, m: Mission): boolean {
  if (s.quests[m.id] || Object.keys(s.quests).filter(k => !k.startsWith("_") && !s.quests[k].done).length >= 8) return false;
  s.quests[m.id] = { start: metric(s, m.kind), value: 0, done: false }; saveWorld(s); return true;
}
export function missionProgress(s: WorldSave, m: Mission): number {
  const q = s.quests[m.id]; return q ? Math.min(m.target, Math.max(0, metric(s, m.kind) - q.start)) : 0;
}
export function claimMission(s: WorldSave, m: Mission): boolean {
  const q = s.quests[m.id]; if (!q || q.done || missionProgress(s, m) < m.target) return false;
  // Mark before crediting; reopening the panel cannot credit twice.
  q.done = true; s.completed.push(m.id); saveWorld(s); addGold(m.gold); addPlayerXP(m.xp); return true;
}
export function collectedCore(s: WorldSave) {
  const q = s.quests["_collected"] ?? { start: 0, value: 0, done: true }; q.value++; s.quests["_collected"] = q;
}
export function rewardActivity(s: WorldSave, id: string, level: number): boolean {
  if (s.completed.includes(id)) return false;
  s.completed.push(id); saveWorld(s); addGold(180 + level * 18); addPlayerXP(40 + level * 5); addItem("repair_kit", 1); return true;
}
export function quickBattle(r: Region, playerLevel: number): TournamentDef {
  const source = r.site.t, level = Math.max(1, Math.min(playerLevel + 2, source.requiredLevel));
  return { id: `quick:${r.id}`, name: "DUELO RAPIDO · " + source.name.replace(/^COPA /, ""), arena: source.arena,
    desc: "Duelo de campo: uma única luta, adversários ajustados ao seu nível. Não consome nem conquista o torneio da região.", requiredLevel: 1,
    fights: [{ name: "GUARDA LOCAL", enemies: source.fights[0].enemies.slice(0, 2).map(e => ({ ...e, level, trained: Math.min(e.trained, level) })) }],
    reward: { gold: 35 + level * 12, xp: 12 + level * 3 }, replayGold: 35 + level * 12, element: source.element };
}
export function activeMissions(s: WorldSave): Mission[] {
  return getWorld().regions.flatMap(missionsFor).filter(m => s.quests[m.id] && !s.quests[m.id].done);
}