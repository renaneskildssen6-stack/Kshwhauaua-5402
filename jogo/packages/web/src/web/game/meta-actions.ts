import { bump, energyCap } from "./expansion";
import { generation, capacitorCap, capacitorGain } from "./city-development";
import { getState, setState } from "./save";
import {
  ACH_MAP,
  CARD_BG_MAP,
  EQUIP_MAP,
  EQUIP_MAX,
  EQUIP_SLOTS,
  EQUIP_TYPES,
  FORGE_DIAMONDS,
  FORGE_GOLD,
  MASTERY_LOSE_PTS,
  MASTERY_RANKS,
  MASTERY_WIN_PTS,
  SKIN_MAP,
  WIN_MILESTONES,
  achUnlocked,
  ensureMastery,
  equipSellValue,
  equipUpgradeCost,
  rankIndexOf,
  rollRarity,
  type EquipItem,
  type Profile,
} from "./meta";

function gain(s: ReturnType<typeof getState>, gold: number, dia: number) {
  return {
    gold: s.gold + gold,
    diamonds: s.diamonds + dia,
    diamondsEarned: s.diamondsEarned + dia,
  };
}

// ----------------------------------------------------------------- perfil
export function setProfile(p: Partial<Profile>) {
  setState((s) => ({ ...s, profile: { ...s.profile, ...p } }));
}
export function buyCardBg(id: string): boolean {
  const s = getState();
  const bg = CARD_BG_MAP[id];
  if (!bg || s.bgOwned.includes(id) || s.diamonds < bg.cost) return false;
  setState((x) => ({ ...x, diamonds: x.diamonds - bg.cost, bgOwned: [...x.bgOwned, id] }));
  return true;
}

// -------------------------------------------------------------- conquistas
export function claimAchievement(id: string): boolean {
  const s = getState();
  const a = ACH_MAP[id];
  if (!a || s.achClaimed.includes(id) || !achUnlocked(s, a)) return false;
  setState((x) => ({ ...x, ...gain(x, a.gold, a.diamonds), achClaimed: [...x.achClaimed, id] }));
  return true;
}
export function claimAllAchievements(): number {
  const s = getState();
  const ids = Object.values(ACH_MAP).filter((a) => !s.achClaimed.includes(a.id) && achUnlocked(s, a));
  if (!ids.length) return 0;
  setState((x) => {
    let gold = 0;
    let dia = 0;
    for (const a of ids) {
      gold += a.gold;
      dia += a.diamonds;
    }
    return { ...x, ...gain(x, gold, dia), achClaimed: [...x.achClaimed, ...ids.map((a) => a.id)] };
  });
  return ids.length;
}
/** Fixa/solta uma conquista no card (maximo 3). */
export function togglePin(id: string) {
  setState((x) => {
    const pins = x.profile.pins;
    if (pins.includes(id)) return { ...x, profile: { ...x.profile, pins: pins.filter((p) => p !== id) } };
    if (pins.length >= 3 || !x.achClaimed.includes(id)) return x;
    return { ...x, profile: { ...x.profile, pins: [...pins, id] } };
  });
}

// ----------------------------------------------------------------- maestria
/** Chamado ao fim de cada luta: todos os robos da equipe ganham pontos. */
export function recordBattle(result: "win" | "lose", robotIds: string[]) {
  const pts = result === "win" ? MASTERY_WIN_PTS : MASTERY_LOSE_PTS;
  setState((x) => {
    const mastery = { ...x.mastery };
    for (const id of new Set(robotIds.filter((id) => x.robots.some((r) => r.id === id)))) {
      const m = ensureMastery(mastery[id]);
      mastery[id] = { ...m, pts: m.pts + pts, wins: m.wins + (result === "win" ? 1 : 0) };
    }
    const energy = Math.min(energyCap(x.expansion.plant) - x.expansion.energy, generation(x.expansion));
    const e = bump(x.expansion, "energyEarned", energy);
    return { ...x, mastery, expansion: { ...e, energy: e.energy + energy, development: { ...e.development,
      capacitor: Math.min(capacitorCap(e), e.development.capacitor + capacitorGain(e)),
      drillCharges: Math.min(5, e.development.drillCharges + 1),
    } } };
  });
}
export function masteryClaimable(robotId: string): number {
  const m = ensureMastery(getState().mastery[robotId]);
  const r = rankIndexOf(m.pts);
  const wins = WIN_MILESTONES.filter((w, i) => m.wins >= w.wins && i >= m.winClaimed).length;
  return Math.max(0, r - m.claimed) + wins;
}
export function claimMastery(robotId: string): string[] {
  const notes: string[] = [];
  setState((x) => {
    if(!x.robots.some(r=>r.id===robotId))return x;
    const m = ensureMastery(x.mastery[robotId]);
    const r = rankIndexOf(m.pts);
    let gold = 0;
    let dia = 0;
    let seq = x.equipSeq;
    const equipment = [...x.equipment];
    for (let i = m.claimed + 1; i <= r; i++) {
      const rk = MASTERY_RANKS[i];
      gold += rk.gold;
      dia += rk.diamonds;
      if (rk.chest > 0) {
        const it = makeItem(seq++, rk.chest);
        equipment.push(it);
        notes.push(`${EQUIP_MAP[it.type].name}`);
      }
    }
    let wc = m.winClaimed;
    while (wc < WIN_MILESTONES.length && m.wins >= WIN_MILESTONES[wc].wins) {
      gold += WIN_MILESTONES[wc].gold;
      dia += WIN_MILESTONES[wc].diamonds;
      wc++;
    }
    if (!gold && !dia && r === m.claimed) return x;
    notes.unshift(`+${gold} OURO${dia ? ` +${dia} DIAMANTES` : ""}`);
    return {
      ...x,
      ...gain(x, gold, dia),
      equipment,
      equipSeq: seq,
      mastery: { ...x.mastery, [robotId]: { ...m, claimed: Math.max(m.claimed, r), winClaimed: wc } },
    };
  });
  return notes;
}

// ------------------------------------------------------------ equipamentos
function makeItem(uid: number, minRarity = 0, premium = false): EquipItem {
  const type = EQUIP_TYPES[Math.floor(Math.random() * EQUIP_TYPES.length)].id;
  return { uid, type, rarity: rollRarity(Math.random, minRarity, premium), level: 1 };
}
export function forge(premium: boolean): EquipItem | null {
  const s = getState();
  if (premium ? s.diamonds < FORGE_DIAMONDS : s.gold < FORGE_GOLD) return null;
  const it = makeItem(s.equipSeq, 0, premium);
  setState((x) => ({
    ...x,
    gold: premium ? x.gold : x.gold - FORGE_GOLD,
    diamonds: premium ? x.diamonds - FORGE_DIAMONDS : x.diamonds,
    equipment: [...x.equipment, it],
    equipSeq: x.equipSeq + 1,
  }));
  return it;
}
export function upgradeEquip(uid: number): boolean {
  const s = getState();
  const it = s.equipment.find((e) => e.uid === uid);
  if (!it || it.level >= EQUIP_MAX) return false;
  const cost = equipUpgradeCost(it);
  if (s.gold < cost) return false;
  setState((x) => ({
    ...x,
    gold: x.gold - cost,
    equipment: x.equipment.map((e) => (e.uid === uid ? { ...e, level: e.level + 1 } : e)),
  }));
  return true;
}
export function sellEquip(uid: number) {
  setState((x) => {
    const it = x.equipment.find((e) => e.uid === uid);
    if (!it) return x;
    const equipped: Record<string, number[]> = {};
    for (const [k, v] of Object.entries(x.equipped)) equipped[k] = v.filter((u) => u !== uid);
    return { ...x, gold: x.gold + equipSellValue(it), equipment: x.equipment.filter((e) => e.uid !== uid), equipped };
  });
}
/** Equipa no robo (um por tipo, ate 3 espacos). Tira de outro robo se preciso. */
export function equipTo(robotId: string, uid: number) {
  setState((x) => {
    if(!x.robots.some(r=>r.id===robotId))return x;
    const it = x.equipment.find((e) => e.uid === uid);
    if (!it) return x;
    const equipped: Record<string, number[]> = {};
    for (const [k, v] of Object.entries(x.equipped)) equipped[k] = v.filter((u) => u !== uid);
    let mine = equipped[robotId] ?? [];
    mine = mine.filter((u) => x.equipment.find((e) => e.uid === u)?.type !== it.type);
    if (mine.length >= EQUIP_SLOTS) mine = mine.slice(1);
    equipped[robotId] = [...mine, uid];
    return { ...x, equipped };
  });
}
export function unequip(robotId: string, uid: number) {
  setState((x) => ({ ...x, equipped: { ...x.equipped, [robotId]: (x.equipped[robotId] ?? []).filter((u) => u !== uid) } }));
}

// -------------------------------------------------------------------- skins
export function buySkin(id: string): boolean {
  const s = getState();
  const sk = SKIN_MAP[id];
  if (!sk || s.skinsOwned.includes(id) || s.diamonds < sk.cost) return false;
  setState((x) => ({ ...x, diamonds: x.diamonds - sk.cost, skinsOwned: [...x.skinsOwned, id] }));
  return true;
}
export function applySkin(robotId: string, id: string | null) {
  setState((x) => {
    if(!x.robots.some(r=>r.id===robotId)||id&&(!SKIN_MAP[id]||!x.skinsOwned.includes(id)))return x;
    const skinOf = { ...x.skinOf };
    if (id) skinOf[robotId] = id;
    else delete skinOf[robotId];
    return { ...x, skinOf };
  });
}
