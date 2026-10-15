import { getState, setState } from "./save";
import { ROUTES, RELICS, TALENT_NODES, CAMPAIGNS, energyCap, bump, hashText, MISSION_MAP, missionReady, talentBudget, type CitySystem } from "./expansion";
import { routeCost, routeDanger, talentCost, capacitorCap, type ExpeditionApproach } from "./city-development";

export function startExpedition(routeId: string, approach: ExpeditionApproach = "balanced"): boolean {
  const s = getState(), e = s.expansion, route = ROUTES.find((r) => r.id === routeId);
  if (!route || !["balanced", "survey", "cargo"].includes(approach) || e.expedition || e.energy < routeCost(e, routeId, route.cost) || !e.distribution.observatory) return false;
  setState((s) => ({ ...s, expansion: { ...s.expansion, energy: s.expansion.energy - routeCost(e, routeId, route.cost), expedition: { route: route.id, step: 0, supply: 10 + e.distribution.observatory * 2 + (e.development.routeResearch[routeId] ?? 0) * 2 + (approach === "survey" ? 4 : approach === "cargo" ? -2 : 0), cargo: 0, approach, log: ["Expedição lançada. As escolhas consomem provisões; alcançar a última etapa entrega a carga."], seed: hashText(`${routeId}|${e.counters.expeditions ?? 0}|${e.counters.expeditionFailures ?? 0}`) } } }));
  return true;
}
export function expeditionChoice(choice: "scan" | "rush" | "salvage"): string {
  if(!["scan","rush","salvage"].includes(choice))return "Escolha inválida: nenhuma provisão foi consumida.";
  let note = "";
  setState((s) => {
    let e = s.expansion;
    const job = e.expedition, route = ROUTES.find((r) => r.id === job?.route);
    if (!job || !route) return s;
    const roll = hashText(`${job.seed}|${job.step}|${choice}`) % 100;
    const risky = choice !== "scan";
    const danger = routeDanger(e, route.id, route.risk, job.approach, choice === "salvage");
    const trouble = risky && roll < danger;
    const supply = Math.max(0, job.supply - (choice === "scan" && job.approach !== "survey" ? 2 : 1) - (trouble ? 3 : 0));
    const factor = job.approach === "cargo" ? 1.35 : job.approach === "survey" ? .8 : 1;
    const cargo = job.cargo + Math.round((trouble ? 0 : choice === "salvage" ? 220 : choice === "rush" ? 140 : 80) * factor);
    const step = job.step + 1;
    note = trouble ? "Emboscada! Perdeu 3 provisões; a carga anterior está intacta." : choice === "scan" ? "Rota mapeada: passagem segura e dados coletados." : choice === "salvage" ? "Achado raro: uma cápsula ancestral foi recuperada." : "Avanço veloz: o comboio encontrou sucata útil.";
    const discovery = Array.from({ length: 8 }, (_, i) => `${route.id}_${i}`).find((id) => !e.discoveries.includes(id));
    if (!trouble && choice === "scan" && discovery) e = { ...e, discoveries: [...e.discoveries, discovery] };
    if (supply <= 0 && step < route.length) {
      note = "Sem provisões: a equipe foi evacuada. Metade da carga foi recuperada.";
      return { ...s, gold: s.gold + Math.floor(cargo / 2), expansion: { ...bump(e, "expeditionFailures"), expedition: null } };
    }
    if (step >= route.length) {
      const relic = RELICS.find((r) => r.set === route.set && !e.relics.includes(r.id));
      e = bump(e, "expeditions");
      if (relic) e = { ...e, relics: [...e.relics, relic.id] };
      note = `Rota concluída: +${cargo} ouro${relic ? `; ${relic.name} catalogada` : "; conjunto já completo"}.`;
      return { ...s, gold: s.gold + cargo, expansion: { ...e, expedition: null } };
    }
    return { ...s, expansion: { ...e, expedition: { ...job, step, supply, cargo, log: [...job.log, note].slice(-8) } } };
  });
  return note;
}
export function evacuateExpedition() {
  setState((s) => !s.expansion.expedition ? s : { ...s, gold: s.gold + Math.floor(s.expansion.expedition.cargo / 2), expansion: { ...bump(s.expansion, "expeditionFailures"), expedition: null } });
}
export function learnTalent(robotId: string, nodeId: string): boolean {
  const s = getState(), e = s.expansion, node = TALENT_NODES.find((n) => n.id === nodeId);
  const list = e.talents[robotId] ?? [], cost = talentCost(e, node?.tier ?? 0);
  if (!node || !s.robots.some((r) => r.id === robotId) || list.includes(nodeId) || list.length >= talentBudget(s, robotId) || s.gold < cost || e.energy < 3 || !e.distribution.academy) return false;
  if (node.tier > 0 && !list.some((id) => TALENT_NODES.some((n) => n.id === id && n.branch === node.branch && n.tier === node.tier - 1))) return false;
  if (node.tier === 3 && list.some((id) => TALENT_NODES.some((n) => n.id === id && n.tier === 3))) return false;
  setState((s) => ({ ...s, gold: s.gold - cost, expansion: { ...s.expansion, energy: s.expansion.energy - 3, talents: { ...s.expansion.talents, [robotId]: [...list, nodeId] } } }));
  return true;
}
export function resetTalents(robotId: string): boolean {
  const s = getState();
  if (s.gold < 300 || !(s.expansion.talents[robotId]?.length)) return false;
  setState((s) => ({ ...s, gold: s.gold - 300, expansion: { ...s.expansion, talents: { ...s.expansion.talents, [robotId]: [] } } }));
  return true;
}
export function upgradePlant(): boolean {
  const s = getState(), cost = s.expansion.plant * 500;
  if (s.expansion.plant >= 10 || s.gold < cost) return false;
  setState((s) => ({ ...s, gold: s.gold - cost, expansion: { ...s.expansion, plant: s.expansion.plant + 1 } }));
  return true;
}
export function distributePower(system: CitySystem, delta: number): boolean {
  if (!["observatory", "academy", "museum", "portal", "contracts", "power"].includes(system) || !Number.isInteger(delta) || Math.abs(delta) !== 1) return false;
  const e = getState().expansion, n = (e.distribution[system] ?? 0) + delta;
  const load = Object.values(e.distribution).reduce((a, v) => a + v, 0) + delta;
  if (n < 0 || n > 6 || load > 4 + e.plant * 2) return false;
  setState((s) => {
    const next = { ...s.expansion, distribution: { ...s.expansion.distribution, [system]: n } };
    return { ...s, expansion: { ...next, development: { ...next.development, capacitor: Math.min(next.development.capacitor, capacitorCap(next)) } } };
  });
  return true;
}
export function convertGoldToEnergy(): boolean {
  const s = getState(), e = s.expansion;
  if (s.gold < 100 || e.energy >= energyCap(e.plant)) return false;
  const amount = Math.min(20 + e.plant * 2, energyCap(e.plant) - e.energy);
  setState((s) => ({ ...s, gold: s.gold - 100, expansion: { ...bump(s.expansion, "energyEarned", amount), energy: s.expansion.energy + amount } }));
  return true;
}
export function claimContract(id: string): boolean {
  const s = getState(), m = MISSION_MAP[id];
  if (!m || !missionReady(s, m)) return false;
  setState((s) => ({ ...s, gold: s.gold + m.gold, diamonds: s.diamonds + m.diamonds, diamondsEarned: s.diamondsEarned + m.diamonds, expansion: { ...s.expansion, reputation: s.expansion.reputation + m.reputation + (s.expansion.distribution.contracts ?? 0), missionsClaimed: [...s.expansion.missionsClaimed, id], development: { ...s.expansion.development, tracked: s.expansion.development.tracked.filter((p) => p !== id) } } }));
  return true;
}
export function chooseStory(campaign: string, chapter: number, choice: "mercy" | "force") {
  if(!CAMPAIGNS.some(c=>c.id===campaign)||!Number.isInteger(chapter)||chapter<0||chapter>=6||!["mercy","force"].includes(choice))return;
  setState((s) => (s.expansion.campaigns[campaign] ?? 0) !== chapter ? s : { ...s, expansion: { ...s.expansion, storyChoices: { ...s.expansion.storyChoices, [`${campaign}_${chapter}`]: choice } } });
}