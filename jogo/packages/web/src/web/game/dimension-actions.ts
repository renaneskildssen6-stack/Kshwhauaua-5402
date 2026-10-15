import { getState, setState, teamSaves } from "./save";
import { ROBOTS, ROBOT_MAP } from "./robots";
import { detectElement } from "./elements";
import { defaultKitLoadout } from "./kits";
import { grantXP, playerMaxXP, type RobotSave } from "./engine";
import { GENERAL } from "./config";
import { DIMENSIONS, CAMPAIGNS, bump, hashText, energyCap, type DimensionId, type DimensionRun, type Carry, type BattleRules } from "./expansion";
import { CHALLENGES, BLESSINGS, gateTierUnlocked, type GateBlessing } from "./city-development";

export function draftPool(): string[] {
  const s = getState(), seed = hashText(`draft|${s.expansion.runSeq}`);
  return Array.from({ length: 8 }, (_, i) => ROBOTS[(seed + i * 31) % ROBOTS.length].id);
}
export function campaignMode(id: string, chapter: number): DimensionId {
  const s = getState(), c = CAMPAIGNS.find((c) => c.id === id);
  const branch = s.expansion.storyChoices[`${id}_${chapter}`];
  if (chapter === 1 && branch === "mercy") return id === "echoes" ? "caravan" : id === "void" ? "mirror" : "mono";
  if (chapter === 3 && branch === "force") return id === "echoes" ? "siege" : id === "void" ? "hunt" : "rift";
  return c?.modes[chapter] ?? "draft";
}
export function startDimension(mode: DimensionId, picks: string[] = [], family = "", campaign?: string, tier = 0, blessing: GateBlessing = "vital"): boolean {
  const s = getState(), e = s.expansion, def = DIMENSIONS.find((m) => m.id === mode);
  const challenge = CHALLENGES.find((c) => c.tier === tier);
  if (!def || !challenge || !gateTierUnlocked(s, mode, tier) || !BLESSINGS.some((b) => b.id === blessing) || e.run && ["ready", "battle", "choice"].includes(e.run.phase) || e.energy < challenge.cost || !e.distribution.portal) return false;
  if (campaign && (!CAMPAIGNS.some(c=>c.id===campaign) || (e.campaigns[campaign] ?? 0) >= 6 || campaignMode(campaign, e.campaigns[campaign] ?? 0) !== mode)) return false;
  const level = Math.max(1, Math.round(teamSaves(s).reduce((a, r) => a + r.level, 0) / Math.max(1, s.team.length)));
  let team = teamSaves(s).map((r) => ({ ...r, trained: { ...r.trained } }));
  if (mode === "draft") {
    const pool = draftPool();
    if (picks.length!==4 || new Set(picks).size !== 4 || picks.some((id) => !pool.includes(id))) return false;
    team = picks.map((id) => ({ id, level, xp: 0, trained: { str: 0, def: 0, agl: 0 }, borrowed: true, loadout: defaultKitLoadout(id) }));
  }
  if (mode === "mono") team = s.robots.filter((r) => detectElement(ROBOT_MAP[r.id]?.element ?? "") === family).slice(0, 4).map((r) => ({ ...r, loadout: defaultKitLoadout(r.id), gadgetLevel: s.gadgets[r.id] ?? 0 }));
  if (!team.length) return false;
  const chapter = campaign ? e.campaigns[campaign] ?? 0 : 0;
  const force = campaign && e.storyChoices[`${campaign}_${chapter}`] === "force";
  const levelGate = e.development.attunement[mode] ?? 0;
  const bonus = blessing === "vital" ? { hp: 20 * levelGate } : blessing === "power" ? { str: 3 * levelGate, agl: 2 * levelGate } : {};
  const run: DimensionRun = { uid: e.runSeq, mode, stage: 1, length: def.length, phase: "ready", team, carry: {}, items: { repair_kit: 3 + (blessing === "supplies" ? levelGate : 0), energy_cell: 2 + (blessing === "supplies" ? levelGate : 0) }, bank: 0, bonus, core: 100, path: [], route: "safe", campaign, challenge: tier, rewardScale: challenge.reward, blessing, enemyScale: challenge.scale * (campaign ? 1 + chapter * .04 + (force ? .08 : 0) : 1) };
  setState((s) => ({ ...s, expansion: { ...s.expansion, energy: s.expansion.energy - challenge.cost, runSeq: s.expansion.runSeq + 1, run } }));
  return true;
}
export function dimensionRules(run: DimensionRun): BattleRules {
  return { deadline: run.mode === "reactors" ? 14 - run.stage * 2 : undefined, core: run.mode === "siege" ? run.core : undefined, targetId: run.mode === "hunt" ? (run.stage === run.length ? "npc_voidarchon" : "npc_scavenger") : undefined, borrowed: run.mode === "draft" };
}
export function dimensionTeam(run: DimensionRun): RobotSave[] {
  return run.team.map((r, i) => ({ ...r, runBonus: run.bonus, battleRules: i === 0 ? dimensionRules(run) : undefined }));
}
export function dimensionEnemies(run: DimensionRun): RobotSave[] {
  const def = DIMENSIONS.find((m) => m.id === run.mode)!;
  const level = Math.max(1, Math.round(run.team.reduce((a, r) => a + r.level, 0) / run.team.length));
  if (run.mode === "mirror") return run.team.map((r) => ({ ...r, battleRules: undefined, borrowed: undefined, statScale: (1 + (run.stage - 1) * .08) * run.enemyScale * (run.route === "risky" ? 1.2 : 1) }));
  let ids: string[];
  const boss = run.stage === run.length;
  if (run.mode === "hunt") ids = ["npc_siegetank", boss ? def.boss : "npc_scavenger", "npc_mirrorduelist"];
  else if (boss) ids = [def.boss, ...(run.mode === "siege" ? ["npc_scavenger"] : [])];
  else {
    const pool = run.mode === "maze" ? ["npc_scavenger", "npc_minotaur"] : run.mode === "siege" ? ["npc_siegetank", "npc_scavenger"] : run.mode === "rift" ? ["npc_voidarchon", "npc_chronoguard"] : run.mode === "draft" || run.mode === "caravan" ? ["npc_scavenger", "npc_scrapking"] : run.mode === "stakes" ? ["npc_dicelord", "npc_mirrorduelist"] : ["npc_chronoguard", "npc_mirrorduelist"];
    ids = Array.from({ length: Math.min(3, 1 + Math.floor(run.stage / 2)) }, (_, i) => pool[(i + run.stage) % pool.length]);
  }
  return ids.map((id) => ({ id, level, xp: 0, trained: { str: 0, def: 0, agl: 0 }, loadout: defaultKitLoadout(id), statScale: run.enemyScale * (run.route === "risky" ? 1.2 : 1) * (boss ? .9 : .8) }));
}
export function launchDimension(uid: number, stage: number): boolean {
  const run = getState().expansion.run;
  if (!run || run.uid !== uid || run.stage !== stage || run.phase !== "ready") return false;
  setState((s) => ({ ...s, expansion: { ...s.expansion, run: { ...run, phase: "battle" } } }));
  return true;
}
export function useRunItem(uid: number, item: string) {
  setState((s) => { const r = s.expansion.run; if (!r || r.uid !== uid || r.phase !== "battle" || !(r.items[item] > 0)) return s; return { ...s, expansion: { ...s.expansion, run: { ...r, items: { ...r.items, [item]: r.items[item] - 1 } } } }; });
}
function payRun(s: ReturnType<typeof getState>, run: DimensionRun, won: boolean) {
  const gold = Math.round(run.bank * (1 + s.expansion.reputation / 2000)), xp = Math.floor(run.bank / 5);
  let level = s.playerLevel, playerXP = s.playerXP + xp;
  while (level < GENERAL.max_level && playerXP >= playerMaxXP(level)) { playerXP -= playerMaxXP(level); level++; }
  let e = bump(s.expansion, "runsCompleted");
  const dia = won ? 3 + Math.floor(run.length / 2) + (run.challenge ?? 0) * 2 : 0;
  if (won) e = bump(e, `${run.mode}Wins`);
  if (won && run.campaign) {
    const chapter = e.campaigns[run.campaign] ?? 0;
    e = { ...e, campaigns: { ...e.campaigns, [run.campaign]: Math.min(6, chapter + 1) } };
  }
  const owned = new Set(run.mode === "draft" ? [] : run.team.map((r) => r.id));
  return { ...s, gold: s.gold + gold, playerLevel: level, playerXP, diamonds: s.diamonds + dia, diamondsEarned: s.diamondsEarned + dia, robots: s.robots.map((r) => owned.has(r.id) ? grantXP(r, xp).save : r), expansion: { ...e, run } };
}
export function finishDimension(uid: number, stage: number, result: "win" | "lose", snapshot: Carry = {}) {
  if(result!=="win"&&result!=="lose")return;
  setState((s) => {
    const r = s.expansion.run;
    if (!r || r.uid !== uid || r.stage !== stage || r.phase !== "battle") return s;
    if (result === "lose") return { ...s, expansion: { ...bump(s.expansion, "runsLost"), run: { ...r, phase: "lost", bank: 0 } } };
    const persistent = ["caravan", "rift", "maze", "siege", "stakes"].includes(r.mode);
    const carry: Carry = {};
    for (const robot of r.team) {
      const f = snapshot[robot.id] ?? { hp: 1, mp: 1 };
      const fraction=(n:number)=>Number.isFinite(n)?Math.max(0,Math.min(1,n)):1;
      carry[robot.id] = persistent ? { hp: fraction(f.hp), mp: fraction(f.mp) } : { hp: 1, mp: 1 };
    }
    const bank = r.bank + Math.round((200 + stage * 100) * (r.route === "risky" ? 2 : 1) * (r.rewardScale ?? 1));
    const core=snapshot.__core?.hp;
    const next: DimensionRun = { ...r, phase: stage >= r.length ? "won" : "choice", bank, carry, core: core!==undefined&&Number.isFinite(core)?Math.max(0,Math.min(100,core)):r.core };
    const updated = { ...s, battlesWon: s.battlesWon + 1, expansion: bump(s.expansion, `${r.mode}Battles`) };
    return next.phase === "won" ? payRun(updated, next, true) : { ...updated, expansion: { ...updated.expansion, run: next } };
  });
}
export function runChoice(uid: number, choice: string): boolean {
  const s = getState(), r = s.expansion.run;
  if (!r || r.uid !== uid || r.phase !== "choice") return false;
  const allowed = r.mode === "rift" ? ["vital", "power", "speed"] : r.mode === "caravan" ? ["supplies", "repair", "continue"] : r.mode === "maze" ? ["shrine", "treasure", "shortcut"] : r.mode === "stakes" ? ["cash", "risk", "safe"] : ["repair", "offense", "safe"];
  if (!allowed.includes(choice)) return false;
  if (choice === "cash") { const next: DimensionRun = { ...r, phase: "cashed" }; setState((s) => payRun(s, next, false)); return true; }
  if ((choice === "supplies" || choice === "repair") && r.mode === "caravan" && r.bank < 150) return false;
  const next: DimensionRun = { ...r, stage: r.stage + 1, phase: "ready", path: [...r.path, choice], bonus: { ...r.bonus }, carry: { ...r.carry }, route: ["risk", "treasure", "shortcut", "offense"].includes(choice) ? "risky" : "safe" };
  if (choice === "vital") next.bonus.hp = (next.bonus.hp ?? 0) + 35;
  if (choice === "power" || choice === "offense") next.bonus.str = (next.bonus.str ?? 0) + 8;
  if (choice === "speed") next.bonus.agl = (next.bonus.agl ?? 0) + 8;
  if (["repair", "shrine", "vital"].includes(choice)) for (const [id, f] of Object.entries(next.carry)) next.carry[id] = { hp: f.hp > 0 ? Math.min(1, f.hp + .25) : .15, mp: Math.min(1, f.mp + .2) };
  if (choice === "supplies") { next.items = { ...r.items, repair_kit: (r.items.repair_kit ?? 0) + 2, energy_cell: (r.items.energy_cell ?? 0) + 1 }; next.bank -= 150; }
  if (choice === "repair" && r.mode === "caravan") next.bank -= 150;
  if (choice === "repair" && r.mode === "siege") next.core = Math.min(100, r.core + 15);
  if (choice === "treasure") next.bank += 200;
  if (choice === "shortcut") { next.bonus.agl = (next.bonus.agl ?? 0) + 10; next.enemyScale += .12; }
  setState((s) => ({ ...s, expansion: { ...s.expansion, run: next } }));
  return true;
}
export function closeRun(uid: number) {
  setState((s) => { const r = s.expansion.run; return !r || r.uid !== uid || r.phase === "battle" ? s : { ...s, expansion: { ...s.expansion, run: null } }; });
}
export function battleEnergy() {
  setState((s) => { const e = s.expansion, amount = Math.min(energyCap(e.plant) - e.energy, 3 + e.plant); return { ...s, expansion: { ...bump(e, "energyEarned", amount), energy: e.energy + amount } }; });
}