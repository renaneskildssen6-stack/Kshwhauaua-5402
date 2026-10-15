import type { Screen } from "@/screens/menu";

export interface TutorialProgress {
  started: boolean;
  completed: boolean;
  chapter: number;
  legacyAccess: boolean;
}

export const UNLOCK_LEVEL: Record<Screen, number> = {
  menu:1, roster:1, modes:1, tournaments:1, profile:1,
  shop:2, engineer:3, contracts:3, ranked:4, academy:4,
  mine:5, pets:6, cards:7, power:8, observatory:9, museum:10,
  mastery:10, skins:10, lab:12, portal:15, pantheon:6,
  // PvP é independente do progresso offline (nível 10 fixo no servidor).
  online:1,
};
export function systemUnlocked(g: {playerLevel:number; tutorial:TutorialProgress}, id:Screen):boolean {
  return g.tutorial.legacyAccess || g.playerLevel >= UNLOCK_LEVEL[id];
}
export const freshTutorial = ():TutorialProgress => ({started:false,completed:false,chapter:0,legacyAccess:false});
export function normalizeTutorial(raw:Partial<TutorialProgress>|undefined, existingRobots:number):TutorialProgress {
  if(!raw)return {...freshTutorial(),legacyAccess:existingRobots>0,completed:existingRobots>0};
  return {started:!!raw.started,completed:!!raw.completed,chapter:Math.max(0,Math.min(5,Math.floor(Number(raw.chapter)||0))),legacyAccess:!!raw.legacyAccess};
}