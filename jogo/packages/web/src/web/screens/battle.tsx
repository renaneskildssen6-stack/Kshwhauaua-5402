import { BattleCommands, preloadCommandArt } from "@/components/battle-commands";
import { UltimateArenaEffect, preloadUltimateArt, type ArenaUltimate } from "@/components/ultimate-cinematic";
import { Ground, Plinth, preloadFloorArt } from "@/components/arena-floor";
import { BattleWorld, type BattleShot } from "@/components/battle-world";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArenaBackdrop,
  Icon,
  Panel,
  PixelButton,
  RobotSprite,
  VfxSprite,
} from "@/components/pixel";
import {
  DIFFICULTY,
  activeOf,
  applyForcedSwap,
  reachesBench,
  battleReport,
  createBattle,
  damagePreview,
  effectLabel,
  fighterSkills,
  orderPreview,
  resolveCombatTurn,
  resolveTurn,
  ultimateOf,
  zoneOf,
  type AffinityTier,
  type Battle,
  type BattleAction,
  type BattleEvent,
  type CombatAction,
  type CombatSummary,
  type OrderEntry,
  type Side,
} from "@/game/battle";
import { animSpec, type AnimSpec } from "@/game/anim";
import { ITEM_MAP } from "@/game/config";
import { ELEMENT_MAP, TIER_COLOR, TIER_LABEL, type ElementDef } from "@/game/elements";
import type { RobotSave } from "@/game/engine";
import { RESOURCES, type ResourceDef } from "@/game/kits/types";
import { arenaName, arenaZones, type WeatherDef, type Zone } from "@/game/terrain";
import { faceUrl } from "@/game/robots";
import { Atmosphere } from "@/components/atmosphere";
import { VsScreen } from "@/components/vs-screen";
import { VictoryScreen, preloadVictoryArt } from "@/components/victory-screen";
import { recordBattle } from "@/game/meta-actions";
import { skinOfRobot } from "@/game/meta";
import { useGame } from "@/game/save";
import { combatView, type Combat } from "@/game/combat";
import type { OnlineEvent } from "../../api/online/events";

/** Batalha online: o servidor é a fonte da verdade; esta tela apenas reproduz e envia comandos. */
export interface RemoteBattle {
  battle: Battle;
  revision: number;
  transitions: { revision: number; events: OnlineEvent[] }[];
  mine: boolean;
  sending: boolean;
  send: (action: CombatAction) => void;
  /** Faixa do servidor (relógio, vez, desistência) exibida acima do console. */
  header: React.ReactNode;
  /** Mensagem exibida no lugar dos comandos enquanto o oponente decide. */
  waiting: React.ReactNode;
}

/** Converte a reprodução compacta do servidor em eventos do palco, partindo do último estado conhecido. */
function replayEvents(base: Combat, list: OnlineEvent[]): BattleEvent[] {
  const c: Combat = structuredClone(base);
  return list.map((e): BattleEvent => {
    if (e.t !== "patch") return e;
    for (const p of e.fighters) {
      const f = [...c.player.fighters, ...c.enemy.fighters].find((x) => x.uid === p.uid);
      if (f) Object.assign(f, p);
    }
    c.player.active = e.active.player; c.enemy.active = e.active.enemy;
    // O patch traz `ready` por lutador; o ponteiro da agenda acompanha para o HUD destacar quem age.
    c.ready = [...c.player.fighters, ...c.enemy.fighters].find((x) => x.ready)?.uid ?? null;
    const snap = structuredClone(c);
    return { t: "sync", combat: snap, battle: combatView(snap) };
  });
}

type Clip = "idle" | "attack" | "damage" | "guard" | "enter";
type Menu = "root" | "skills" | "items" | "swap" | "extra";

/** Fase G3: instancia viva de uma animacao do catalogo. */
interface AnimInst {
  key: number;
  side: Side;
  spec: AnimSpec;
}

interface Float {
  key: number;
  side: Side;
  text: string;
  tone: string;
}

/** Faixa de tela cheia disparada pelos eventos H1 (campo, carga, status...). */
interface Banner {
  key: number;
  text: string;
  sub: string;
  color: string;
  big: boolean;
}

const TONE_COLOR: Record<string, string> = {
  dmg: "#ff5b4d",
  crit: "#ffb43a",
  heal: "#57d76a",
  miss: "#cfe4ff",
  info: "#35e2f0",
};

const POS_ABBR: Record<string, string> = {
  guarda: "GDA",
  flanco: "FLC",
  suporte: "SUP",
  nucleo: "NUC",
};

const STATUS_TONE: Record<string, string> = { buff: "#57d76a", debuff: "#ff5b4d" };

export function BattleScreen({
  arena,
  round,
  playerTeam,
  enemyTeam,
  items,
  label,
  onFinish,
  onUseItem,
  startState,
  recordProgress = true,
  difficulty,
  remote,
}: {
  remote?: RemoteBattle;
  arena: string;
  recordProgress?: boolean;
  difficulty?: import("@/game/battle").Difficulty;
  round?: number;
  playerTeam: RobotSave[];
  enemyTeam: RobotSave[];
  items: Record<string, number>;
  label: string;
  onFinish: (
    result: "win" | "lose",
    snapshot?: Record<string, { hp: number; mp: number }>,
  ) => void;
  onUseItem: (itemId: string) => void;
  /** HP/MP herdados de uma luta anterior (Torre de Babel, sobrevivência...). */
  startState?: Record<string, { hp: number; mp: number }>;
}) {
  const [battle, setBattle] = useState<Battle>(() => {
    if (remote) return remote.battle;
    const b = createBattle({ arena, playerTeam, enemyTeam, items, difficulty });
    if (startState) {
      for (const f of b.player.fighters) {
        const st = startState[f.robotId];
        if (!st) continue;
        f.hp = Math.max(0, Math.min(f.maxHp, Math.round(f.maxHp * st.hp)));
        f.mp = Math.max(0, Math.min(f.maxMp, Math.round(f.maxMp * st.mp)));
      }
      const first = b.player.fighters.findIndex((f) => f.hp > 0);
      b.player.active = first >= 0 ? first : 0;
    }
    return b;
  });
  const finishedRef = useRef(false);
  const remoteRef = useRef(remote ? { revision: remote.revision, combat: remote.battle.combat } : null);
  useEffect(() => { void preloadVictoryArt(); preloadCommandArt(); }, []);
  useEffect(()=>{for(const robot of [...playerTeam,...enemyTeam])void preloadUltimateArt(robot.id);},[playerTeam,enemyTeam]);
  useEffect(() => { preloadFloorArt(arena); }, [arena]);
  const [vs, setVs] = useState(true);
  const [cinematic, setCinematic] = useState<ArenaUltimate|null>(null);
  const [queue, setQueue] = useState<BattleEvent[]>([]);
  const [shot, setShot] = useState<BattleShot | null>(null);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [stageActors, setStageActors] = useState<Partial<Record<Side, string>>>({});
  const [clips, setClips] = useState<Record<Side, Clip>>({ player: "enter", enemy: "enter" });
  const [vfx, setVfx] = useState<{ side: Side; url: string; key: number } | null>(null);
  const [floats, setFloats] = useState<Float[]>([]);
  const [message, setMessage] = useState(`${label} — LUTAR!`);
  const [menu, setMenu] = useState<Menu>("root");
  const [shake, setShake] = useState<{ side: Side; level: number; key: number } | null>(null);
  const [anims, setAnims] = useState<AnimInst[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [hitSeal, setHitSeal] = useState<{
    key: number;
    side: Side;
    value: number;
    element: string;
    tier: AffinityTier;
  } | null>(null);
  const [logOpen, setLogOpen] = useState(false);
  const [targetUid, setTargetUid] = useState<string | null>(null);
  const [selSkill, setSelSkill] = useState<string | null>(null);
  const keyRef = useRef(0);

  const busy = queue.length > 0;
  const combat = battle.combat;
  const pActive = activeOf(battle, "player");
  const eActive = activeOf(battle, "enemy");
  const pStage = battle.player.fighters.find((f) => f.uid === stageActors.player) ?? pActive;
  const eStage = battle.enemy.fighters.find((f) => f.uid === stageActors.enemy) ?? eActive;
  useEffect(() => {
    if (!busy) { setShot(null); setStageActors({}); }
  }, [busy]);
  const pSkills = fighterSkills(pActive);
  const pGuard = pSkills.find((s) => s.kind === "defense") ?? pSkills[pSkills.length - 1];

  // alvos vivos do lado inimigo (foco de alvo por uid)
  const [reachSel, setReachSel] = useState(false);
  const foeList = useMemo(
    () =>
      battle.enemy.fighters.filter(
        (f) => f.hp > 0 && (reachSel || f.uid === battle.enemy.fighters[battle.enemy.active]?.uid),
      ),
    [battle.enemy.fighters, battle.enemy.active, reachSel],
  );
  const foeUid = targetUid && foeList.some((f) => f.uid === targetUid)
    ? targetUid
    : foeList.find((f) => f.uid === eActive.uid)?.uid ?? foeList[0]?.uid ?? "";

  // paineis de leitura do motor
  const order = useMemo(() => orderPreview(combat), [combat, battle.turn, battle.phase]);
  const weather = combat.field.weather;
  const pRes = pActive.resId ? RESOURCES[pActive.resId] : null;
  const eRes = eActive.resId ? RESOURCES[eActive.resId] : null;
  const pZone = zoneOf(combat, pActive);
  const eZone = zoneOf(combat, eActive);
  const finalSkill = pSkills.find((s) => s.id === (selSkill ?? "")) ?? pSkills[0];
  const finalReach = !!combat.rules.targetId || (!!finalSkill && reachesBench(finalSkill));
  useEffect(() => {
    setReachSel(finalReach);
  }, [finalReach]);
  const finalUlt = ultimateOf(pActive);
  const diff = DIFFICULTY[combat.difficulty];

  // selo elemental: o golpe selecionado contra o alvo escolhido
  const seal = useMemo(() => {
    const vic = foeList.find((f) => f.uid === foeUid);
    if (!vic || !finalSkill || finalSkill.kind === "defense") return null;
    const fc = damagePreview(combat, pActive.uid, vic.uid, finalSkill.id);
    return fc ? { tier: fc.tier, element: fc.element } : null;
  }, [combat, pActive.uid, finalSkill, foeUid, foeList]);

  useEffect(() => {
    if (vs) return;
    const id = window.setTimeout(() => {
      setClips({ player: "idle", enemy: "idle" });
      setBattle((b) => ({ ...b, phase: b.phase === "intro" ? "menu" : b.phase }));
    }, 1100);
    return () => window.clearTimeout(id);
  }, [vs]);

  const nextFloat = useCallback((side: Side, text: string, tone: string) => {
    keyRef.current += 1;
    const key = keyRef.current;
    setFloats((f) => [...f, { key, side, text, tone }]);
    window.setTimeout(() => setFloats((f) => f.filter((x) => x.key !== key)), 900);
  }, []);

  const nextBanner = useCallback(
    (text: string, sub: string, color: string, big = false, hold = 1200) => {
      keyRef.current += 1;
      const key = keyRef.current;
      setBanners((b) => [...b.slice(-2), { key, text, sub, color, big }]);
      window.setTimeout(() => setBanners((b) => b.filter((x) => x.key !== key)), hold);
    },
    [],
  );

  /* Fase G3: dispara uma animacao do catalogo. Varias podem viver ao mesmo
   * tempo — cada camada (sprite/aura/burst/tela) desenha a sua. */
  const fire = useCallback((side: Side, id: string) => {
    const spec = animSpec(id);
    if (!spec) return;
    keyRef.current += 1;
    const key = keyRef.current;
    setAnims((a) => [...a.slice(-11), { key, side, spec }]);
    window.setTimeout(() => setAnims((a) => a.filter((x) => x.key !== key)), spec.duration + 80);
    if (spec.shake) {
      setShake({ side, level: spec.shake, key });
      window.setTimeout(
        () => setShake((s) => (s && s.key === key ? null : s)),
        220 + spec.shake * 90,
      );
    }
  }, []);

  // playback dos eventos
  useEffect(() => {
    if (queue.length === 0) return;
    const ev = queue[0];
    let delay = 260;
    if (ev.t === "msg") {
      setMessage(ev.text);
      // Anticipate a nearby action during its announcement, never past a sync boundary.
      for (const next of queue.slice(1, 7)) {
        if (next.t === "sync" || next.t === "order" || next.t === "end") break;
        if (next.t === "clip" && next.clip !== "idle" && next.clip !== "damage") {
          setShot({ side: next.side, kind: next.clip === "enter" ? "entry" : "action" });
          if (next.uid) setStageActors((a) => ({ ...a, [next.side]: next.uid }));
          break;
        }
      }
      delay = 520;
    } else if (ev.t === "clip") {
      setClips((c) => ({ ...c, [ev.side]: ev.clip as Clip }));
      if (ev.uid) setStageActors((a) => ({ ...a, [ev.side]: ev.uid }));
      if (ev.clip !== "idle") setShot({ side: ev.side, kind: ev.clip === "damage" ? "impact" : ev.clip === "enter" ? "entry" : "action" });
      delay = ev.clip === "enter" ? 700 : 480;
      window.setTimeout(() => setClips((c) => ({ ...c, [ev.side]: "idle" })), delay - 60);
    } else if (ev.t === "vfx") {
      keyRef.current += 1;
      const key = keyRef.current;
      if (ev.uid) setStageActors((a) => ({ ...a, [ev.side]: ev.uid }));
      setShot((previous) => previous ?? { side: ev.side, kind: "action" });
      setVfx({ side: ev.side, url: ev.url, key });
      setShake({ side: ev.side, level: 1, key });
      window.setTimeout(() => setShake((current) => current?.key === key ? null : current), 260);
      window.setTimeout(() => setVfx((current) => current?.key === key ? null : current), 600);
      delay = 360;
    } else if (ev.t === "float") {
      nextFloat(ev.side, ev.text, ev.tone);
      delay = 380;
    } else if (ev.t === "sync") {
      setBattle(ev.battle);
      delay = 60;
    } else if (ev.t === "anim") {
      fire(ev.side, ev.id);
      if (ev.uid) setStageActors((a) => ({ ...a, [ev.side]: ev.uid }));
      if (animSpec(ev.id)?.keyframe === "cinematic") setShot({ side: ev.side, kind: "power" });
      delay = ev.hold ?? 0;
    } else if (ev.t === "faint") {
      delay = 620;
    } else if (ev.t === "end") {
      setShot(null);
      delay = 500;
    } else if (ev.t === "order") {
      setShot(null);
      setStageActors({});
      delay = 30;
    } else if (ev.t === "field") {
      nextBanner(ev.label, ev.desc, ev.color, false, 1500);
      delay = 520;
    } else if (ev.t === "charge") {
      setBattle(b => {
        const team = b[ev.side];
        const fighters = team.fighters.map(f => f.uid === ev.uid ? {...f, ultimateCharge:ev.value} : f);
        const updated = {...team, fighters};
        return {...b, [ev.side]:updated, combat:{...b.combat, [ev.side]:{...b.combat[ev.side], fighters}}};
      });
      delay = 30;
    } else if (ev.t === "ultimate") {
      const key = ++keyRef.current;
      const targetSide=ev.side==="player"?"enemy":"player";
      setStageActors(a => ({...a,[ev.side]:ev.uid,[targetSide]:ev.targetUid}));
      setShot(null);
      setCinematic({...ev,key,startedAt:performance.now()});
      window.setTimeout(() => setCinematic(c => c?.key === key ? null : c), 1450);
      delay = 1490;
    } else if (ev.t === "passive") {
      nextBanner(ev.label, ev.text, "#c8a2ff", false, 1200);
      delay = 420;
    } else if (ev.t === "status") {
      nextBanner(
        ev.label,
        ev.tone === "buff" ? "BONUS ATIVO" : "PENALIDADE ATIVA",
        STATUS_TONE[ev.tone] ?? "#fff",
        false,
        1000,
      );
      delay = 300;
    } else if (ev.t === "phase") {
      setShot({ side: ev.side, kind: "power" });
      nextBanner(ev.name, ev.form, ev.color, true, 1600);
      delay = 700;
    } else if (ev.t === "dmg") {
      keyRef.current += 1;
      const key = keyRef.current;
      setShot({ side: ev.side, kind: "impact" });
      setHitSeal({
        key,
        side: ev.side,
        value: ev.value,
        element: ev.element,
        tier: ev.tier,
      });
      window.setTimeout(() => setHitSeal((current) => current?.key === key ? null : current), 720);
      delay = 180;
    }
    const id = window.setTimeout(() => setQueue((q) => q.slice(1)), delay);
    return () => window.clearTimeout(id);
  }, [queue, nextFloat, nextBanner, fire]);

  const push = useCallback((res: { battle: Battle; events: BattleEvent[] }) => {
    setQueue(res.events);
  }, []);

  // Online: cada revisão nova do servidor é reproduzida (se a cadeia estiver completa) e termina no estado autoritativo.
  useEffect(() => {
    const known = remoteRef.current;
    if (!remote || !known || remote.revision === known.revision) return;
    const steps = remote.transitions.filter((t) => t.revision > known.revision).sort((a, b) => a.revision - b.revision);
    const complete = steps.length === remote.revision - known.revision && steps.every((t, i) => t.revision === known.revision + i + 1);
    const final: BattleEvent = { t: "sync", combat: remote.battle.combat, battle: remote.battle };
    const flat = steps.flatMap((t) => t.events);
    // Reprodução longa atrasaria o relógio de 60 s do servidor: acima do limite, salta direto ao estado final.
    const events = complete && steps.length <= 3 && flat.length <= 140 ? [...replayEvents(known.combat, flat), final] : [final];
    remoteRef.current = { revision: remote.revision, combat: remote.battle.combat };
    setQueue((q) => (q.length + events.length > 180 ? [final] : [...q, ...events]));
  }, [remote]);

  const act = useCallback(
    (action: CombatAction) => {
      if (busy || battle.phase !== "menu") return;
      if (remote) {
        if (!remote.mine || remote.sending || action.kind === "item" || action.kind === "auto") return;
        setMenu("root");
        remote.send(action);
        return;
      }
      setMenu("root");
      if (action.kind === "item") onUseItem(action.itemId);
      push(resolveCombatTurn(battle, action));
    },
    [battle, busy, onUseItem, push, remote],
  );

  /** Caminho legado: skill sem alvo explicito / item por indice / troca. */
  const actLegacy = useCallback(
    (action: BattleAction) => {
      if (busy || battle.phase !== "menu") return;
      if (remote) {
        if (!remote.mine || remote.sending || action.kind === "item") return;
        setMenu("root");
        remote.send(action.kind === "swap"
          ? { kind: "reposition", withUid: battle.player.fighters[action.index]?.uid ?? "" }
          : { kind: "skill", skillId: action.skillId });
        return;
      }
      setMenu("root");
      if (action.kind === "item") onUseItem(action.itemId);
      push(resolveTurn(battle, action));
    },
    [battle, busy, onUseItem, push, remote],
  );

  const forcedSwap = useCallback(
    (index: number) => {
      push(applyForcedSwap(battle, index));
    },
    [battle, push],
  );

  const ownedItems = useMemo(
    () => Object.entries(battle.player.items).filter(([, q]) => q > 0),
    [battle.player.items],
  );

  const over = battle.phase === "over" && !busy;
  const report = useMemo(
    () => (battle.phase === "over" ? battleReport(combat) : null),
    [battle.phase, combat],
  );

  const continueBattle = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    if (recordProgress) recordBattle(
      battle.result ?? "lose",
      combat.rules.borrowed ? [] : battle.player.fighters.map((f) => f.robotId),
    );
    const snapshot = Object.fromEntries(battle.player.fighters.map((f) => [
      f.robotId, { hp: f.hp / f.maxHp, mp: f.mp / f.maxMp },
    ]));
    if (combat.rules.core !== undefined) snapshot.__core = { hp: combat.coreHp, mp: 0 };
    onFinish(battle.result ?? "lose", snapshot);
  };

  return (
    <div className="mk-battle" data-camera-fixed={!cameraEnabled}>

      {/* Fase G3: camada de tela cheia (flashes, vinheta, barras, faixas) */}
      <ScreenFx anims={anims.filter((a) => a.spec.layer === "screen")} />

      {/* HUD superior */}
      <div className="mk-battle-top">
      <div className="mk-battle-hud">
        <FighterHud
          side="player"
          name={pActive.name}
          hp={pActive.hp}
          maxHp={pActive.maxHp}
          mp={pActive.mp}
          maxMp={pActive.maxMp}
          level={pActive.level}
          robotId={pActive.robotId}
          effects={pActive.effects.map((e) => effectLabel(e.type))}
          res={pRes}
          resVal={pActive.res}
          charge={pActive.ultimateCharge}
          zone={pZone.label}
          zoneColor={pZone.color}
          element={ELEMENT_MAP[pActive.element] ?? null}
          team={battle.player.fighters.map((f) => ({ id: f.robotId, alive: f.hp > 0 }))}
        />
        <FighterHud
          side="enemy"
          name={eActive.name}
          hp={eActive.hp}
          maxHp={eActive.maxHp}
          mp={eActive.mp}
          maxMp={eActive.maxMp}
          level={eActive.level}
          robotId={eActive.robotId}
          effects={eActive.effects.map((e) => effectLabel(e.type))}
          res={eRes}
          resVal={eActive.res}
          charge={eActive.ultimateCharge}
          zone={eZone.label}
          zoneColor={eZone.color}
          seal={seal}
          element={ELEMENT_MAP[eActive.element] ?? null}
          team={battle.enemy.fighters.map((f) => ({ id: f.robotId, alive: f.hp > 0 }))}
        />
      </div>

      {/* Barra de ordem de turno + campo */}
      <div className="mk-battle-order">
        {(combat.rules.core !== undefined || combat.rules.deadline || combat.rules.targetId) && <div className="mk-title" style={{ fontSize: 7, padding: 7, background: "#070b14", color: "#ffb43a", zIndex: 3 }}>
          {combat.rules.core !== undefined && `NÚCLEO ${Math.round(combat.coreHp)}/100 · GUARDAR PROTEGE`}
          {combat.rules.deadline && `PRAZO: ROUND ${battle.turn}/${combat.rules.deadline}`}
          {combat.rules.targetId && `ALVO: ${battle.enemy.fighters.find((f) => f.robotId === combat.rules.targetId)?.name ?? "MARCADO"}`}
        </div>}
        <OrderBar
          order={order}
          cursor={combat.cursor}
          turn={battle.turn}
          label={label}
          arenaLabel={arenaName(arena)}
          weatherLabel={weather.label}
          weatherColor={weather.color}
          weatherDesc={weather.desc}
          difficulty={diff.label}
        />
      </div>
      </div>

      {/* Palco */}
      <BattleWorld shot={!vs && busy && !cinematic ? shot : null} enabled={cameraEnabled}>
        {(size, reduced) => <>
        <div className="mk-battle-scenery">
        <ArenaBackdrop arena={arena} round={round} />
        {!vs && <Atmosphere arena={arena} weather={weather.id} danger={pActive.hp / pActive.maxHp} />}
        </div>
        <div className="mk-battle-stage">
        <Ground arena={arena} />
        <div className="mk-battle-fighter mk-battle-fighter-player">
        <Stage
          arena={arena}
          side="player"
          robotId={pStage.robotId}
          hideActor={cinematic?.side==="player"}
          size={size}
          reduced={reduced}
          clip={clips.player}
          flip={false}
          dim={pStage.hp <= 0}
          shake={!reduced && shake?.side === "player" ? shake.level : 0}
          vfx={vfx?.side === "player" ? vfx : null}
          floats={floats.filter((f) => f.side === "player")}
          anims={anims.filter((a) => a.side === "player")}
          seal={hitSeal?.side === "player" ? hitSeal : null}
        />
        </div>
        <div className="mk-battle-fighter mk-battle-fighter-enemy">
        <Stage
          arena={arena}
          side="enemy"
          robotId={eStage.robotId}
          hideActor={cinematic?.side==="enemy"}
          size={size}
          reduced={reduced}
          clip={clips.enemy}
          flip
          dim={eStage.hp <= 0}
          shake={!reduced && shake?.side === "enemy" ? shake.level : 0}
          vfx={vfx?.side === "enemy" ? vfx : null}
          floats={floats.filter((f) => f.side === "enemy")}
          anims={anims.filter((a) => a.side === "enemy")}
          seal={hitSeal?.side === "enemy" ? hitSeal : null}
        />
        </div>
        {cinematic&&<UltimateArenaEffect key={cinematic.key} event={cinematic} size={size} reduced={reduced}/>}
        </div>
        </>}
      </BattleWorld>
      {!vs && busy && shot && <div className="mk-title mk-battle-action">
        {shot.side === "player" ? pStage.name : eStage.name} · {shot.kind === "impact" ? "IMPACTO" : shot.kind === "entry" ? "ENTRADA" : shot.kind === "power" ? "PODER MÁXIMO" : "EM AÇÃO"}
      </div>}

      {/* Faixas de evento (campo, carga, passiva, status, fase) */}
      <BannerLayer banners={banners} />

      {/* Registro de combate */}
      <button type="button" className="mk-btn mk-title mk-battle-camera" aria-pressed={cameraEnabled}
        title="Alternar aproximação de ações e tremores. Movimento reduzido mantém o plano fixo."
        onClick={() => setCameraEnabled((v) => !v)}>
        CÂMERA {cameraEnabled ? "DINÂMICA" : "FIXA"}
      </button>
      <button
        type="button"
        className="mk-btn mk-title"
        onClick={() => setLogOpen((v) => !v)}
        style={{
          position: "absolute",
          right: 8,
          bottom: 8,
          zIndex: 12,
          fontSize: 6,
          padding: "3px 6px",
        }}
      >
        LOG {combat.log.length}
      </button>
      {logOpen && (
        <LogPanel
          log={combat.log}
          zones={arenaZones(arena)}
          zonesOf={[pActive, eActive].map((m) => ({ name: m.name, zone: zoneOf(combat, m) }))}
          weather={weather}
          onClose={() => setLogOpen(false)}
        />
      )}

      {/* Caixa de mensagem + menu */}
      <div className="mk-battle-console">
        {remote?.header}
        <Panel variant="strip" className="mk-title mk-battle-message" style={undefined}>
          <div style={{ fontSize: 9, minHeight: 22, lineHeight: "1.5" }}>{message}</div>
        </Panel>

        {battle.phase === "forced_swap" && !busy && (
          <Panel className="mt-1">
            <div className="mk-title" style={{ fontSize: 9, marginBottom: 6 }}>
              ESCOLHA O PROXIMO ROBO
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {battle.player.fighters.map((f, i) =>
                f.hp > 0 ? (
                  <PixelButton key={f.uid} onClick={() => forcedSwap(i)}>
                    {f.name}
                  </PixelButton>
                ) : null,
              )}
            </div>
          </Panel>
        )}

        {remote && !remote.mine && battle.phase !== "over" && !busy && remote.waiting}
        {battle.phase === "menu" && !busy && (!remote || (remote.mine && !remote.sending)) && (
          <div style={{ marginTop: 4 }}>
            {menu === "root" && <>
              <TargetPicker foes={foeList} chosen={foeUid} activeUid={eActive.uid} onPick={setTargetUid}/>
              <BattleCommands key={pActive.uid} fighter={pActive} skills={pSkills} ultimate={finalUlt} competitive={!!remote}
                onSelect={setSelSkill}
                forecast={id=>damagePreview(combat,pActive.uid,foeUid,id)}
                onAction={action=>act(action.kind==="skill"||action.kind==="ultimate" ? {...action,targetUid:foeUid||undefined}:action)}
                items={remote ? [] : ownedItems.flatMap(([id, qty]) => {
                  const item = ITEM_MAP[id];
                  if (!item?.battle) return [];
                  const targetIndex = item.effect.kind === "revive" ? battle.player.fighters.findIndex((f) => f.hp <= 0) : battle.player.active;
                  return [{ id, label: item.name, sub: `x${qty}`, glyph: item.icon, tone: "#7dff8a",
                    blocked: targetIndex < 0 ? "SEM ALVO" : false,
                    info: { title: item.name, lines: [item.desc, `Você tem ${qty}.`, "Usar um item consome o turno."] },
                    run: () => actLegacy({ kind: "item", itemId: id, targetIndex }) }];
                })}
                team={battle.player.fighters.map((f, i) => ({ id: f.uid, label: f.name, sub: `${f.hp}/${f.maxHp} · ${POS_ABBR[f.pos] ?? f.pos}`,
                  glyph: faceUrl(f.robotId), tone: "#7dff8a",
                  blocked: f.hp <= 0 ? "FORA DE COMBATE" : i === battle.player.active ? "EM CAMPO" : false,
                  info: { title: f.name, lines: [`HP ${f.hp}/${f.maxHp} · MP ${f.mp}/${f.maxMp}`, `Posição: ${POS_ABBR[f.pos] ?? f.pos}`, "Trocar de robô consome o turno."] },
                  run: () => actLegacy({ kind: "swap", index: i }) }))}
                tactics={[
                  { id: "dodge", label: "ESQUIVA ATIVA", orb: "cycle", sub: "+1 RECURSO", info: { title: "ESQUIVA ATIVA", lines: ["+1 recurso e golpes erram no próximo turno."] }, run: () => act({ kind: "dodge" }) },
                  { id: "analyze", label: "ANALISAR ALVO", orb: "tactics", sub: "PREVISÃO", info: { title: "ANALISAR ALVO", lines: ["Marca o alvo e lê a previsão exata de dano."] }, run: () => act({ kind: "analyze", targetUid: foeUid }) },
                  { id: `guard-${pGuard.id}`, label: pGuard.name, orb: "defend", sub: `${pGuard.mp} MP`, info: { title: pGuard.name, lines: [pGuard.desc, `${pGuard.mp} MP`] }, run: () => actLegacy({ kind: "skill", skillId: pGuard.id }) },
                ]}/>
            </>}
          </div>
        )}
      </div>

      {vs && (
        <VsScreen
          playerId={activeOf(battle, "player").robotId}
          enemyId={activeOf(battle, "enemy").robotId}
          enemyLevel={enemyTeam[0]?.level ?? 1}
          label={label}
          onDone={() => setVs(false)}
        />
      )}

      {over && report && (report.result === "win"
        ? <VictoryScreen report={report} label={label} onContinue={continueBattle} />
        : <ReportOverlay report={report} onContinue={continueBattle} />)}
    </div>
  );
}

/** Abaixo disso o helper existe para o jogador escolher quem cobrir. */

/** Barra de ordem de turno: quem age agora e quem ainda espera no round. */
function OrderBar({
  order,
  cursor,
  turn,
  label,
  arenaLabel,
  weatherLabel,
  weatherColor,
  weatherDesc,
  difficulty,
}: {
  order: OrderEntry[];
  cursor: number;
  turn: number;
  label: string;
  arenaLabel: string;
  weatherLabel: string;
  weatherColor: string;
  weatherDesc: string;
  difficulty: string;
}) {
  const done = new Set(order.slice(0, cursor).map((o) => o.uid));
  return (
    <div style={{ display: "grid", gap: 3 }}>
      <div
        className="mk-title"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 6,
          background: "rgba(3,6,12,0.72)",
          border: "1px solid rgba(90,200,255,0.25)",
          padding: "2px 6px",
        }}
      >
        <span>
          <Icon name="trophy" size={10} /> {label} · T{turn}
        </span>
        <span style={{ color: "var(--mk-muted)" }}>{arenaLabel.toUpperCase()}</span>
        <span style={{ color: weatherColor }} title={weatherDesc}>
          {weatherLabel}
        </span>
        <span style={{ color: "var(--mk-accent)", marginLeft: "auto" }}>{difficulty}</span>
      </div>
      <div
        style={{
          display: "flex",
          gap: 3,
          overflowX: "auto",
          background: "rgba(3,6,12,0.6)",
          border: "1px solid rgba(90,200,255,0.18)",
          padding: "2px 4px",
        }}
      >
        <span className="mk-title" style={{ fontSize: 5, color: "var(--mk-muted)" }}>
          ORDEM
        </span>
        {order.map((o, i) => {
          const now = i === cursor;
          const past = done.has(o.uid);
          return (
            <span
              key={o.uid}
              className="mk-title"
              title={`${o.name} · ${o.pos} · AGI ${o.agl}${o.ready ? " · PRONTO" : ""}`}
              style={{
                fontSize: 5,
                padding: "1px 3px",
                border: `1px solid ${
                  now ? "var(--mk-accent2)" : o.side === "player" ? "#35e2f0" : "#ff5b4d"
                }`,
                background: now ? "rgba(255,196,58,0.22)" : "transparent",
                color: past ? "var(--mk-muted)" : o.side === "player" ? "#35e2f0" : "#ff8d8d",
                textDecoration: past ? "line-through" : undefined,
                opacity: o.alive ? 1 : 0.4,
                whiteSpace: "nowrap",
              }}
            >
              {now ? "▶ " : ""}
              {o.name.slice(0, 10)} {POS_ABBR[o.pos] ?? ""}
            </span>
          );
        })}
        {order.length === 0 && (
          <span className="mk-title" style={{ fontSize: 5, color: "var(--mk-muted)" }}>
            AGUARDANDO O ROUND
          </span>
        )}
      </div>
    </div>
  );
}

/** Escolha de alvo (foco de alvo antes do golpe). */
function TargetPicker({
  foes,
  chosen,
  activeUid,
  onPick,
}: {
  foes: { uid: string; name: string; hp: number; maxHp: number; robotId: string }[];
  chosen: string;
  activeUid: string;
  onPick: (uid: string) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 3, marginBottom: 5, flexWrap: "wrap" }}>
      <span className="mk-title" style={{ fontSize: 5, color: "var(--mk-muted)", alignSelf: "center" }}>
        ALVO
      </span>
      {foes.map((f) => {
        const on = f.uid === chosen;
        return (
          <button
            key={f.uid}
            type="button"
            onClick={() => onPick(f.uid)}
            className="mk-title"
            style={{
              fontSize: 5,
              padding: "2px 4px",
              cursor: "pointer",
              border: `2px solid ${on ? "var(--mk-accent2)" : "rgba(53,226,240,0.3)"}`,
              background: on ? "rgba(255,196,58,0.16)" : "rgba(8,18,32,0.8)",
              color: on ? "var(--mk-accent2)" : "var(--mk-muted)",
            }}
          >
            {f.name.slice(0, 9)} {Math.round((f.hp / f.maxHp) * 100)}%
            {f.uid === activeUid ? " ●" : ""}
          </button>
        );
      })}
    </div>
  );
}

/* ================================================== partes internas (B) */

/** Selo de impacto elemental mostrado sobre o alvo atingido. */
interface Seal {
  key: number;
  side: Side;
  value: number;
  element: string;
  tier: AffinityTier;
}

/** Faixas de tela cheia dos eventos H1 (campo, carga, passiva, status, fase). */
function BannerLayer({ banners }: { banners: Banner[] }) {
  if (banners.length === 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 14,
        display: "grid",
        alignContent: "center",
        justifyItems: "center",
        gap: 6,
      }}
    >
      {banners.map((b, i) => (
        <div
          key={b.key}
          className={`mk-a ${b.big ? "mk-a-banner-big" : "mk-a-banner"} mk-title`}
          style={
            {
              ["--mk-d" as string]: `${b.big ? 1500 : 1200}ms`,
              animationDelay: `${i * 40}ms`,
              borderTop: `2px solid ${b.color}`,
              borderBottom: `2px solid ${b.color}`,
              background: "rgba(3,6,12,0.82)",
              padding: b.big ? "10px 26px" : "4px 14px",
              textAlign: "center",
              color: b.color,
              letterSpacing: 2,
              textShadow: "2px 2px 0 #000",
              boxShadow: `0 0 14px ${b.color}55`,
            } as React.CSSProperties
          }
        >
          <div style={{ fontSize: b.big ? 18 : 10 }}>{b.text}</div>
          {b.sub && (
            <div style={{ fontSize: b.big ? 7 : 5, color: "var(--mk-muted)", marginTop: 3 }}>
              {b.sub}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/** Registro de combate + o campo em que a luta acontece. */
function LogPanel({
  log,
  zones,
  zonesOf,
  weather,
  onClose,
}: {
  log: string[];
  zones: Zone[];
  zonesOf: { name: string; zone: Zone }[];
  weather: WeatherDef;
  onClose: () => void;
}) {
  const recent = [...log].slice(-90).reverse();
  return (
    <div
      style={{
        position: "absolute",
        left: 6,
        right: 6,
        bottom: 38,
        top: 120,
        zIndex: 13,
        background: "rgba(3,6,12,0.94)",
        border: "2px solid rgba(90,200,255,0.4)",
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
        overflow: "hidden",
      }}
    >
      <div
        className="mk-title"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 7,
          padding: "4px 6px",
          borderBottom: "1px solid rgba(90,200,255,0.25)",
        }}
      >
        <span>REGISTRO DE COMBATE</span>
        <span style={{ color: "var(--mk-muted)" }}>{log.length}</span>
        <span style={{ color: weather.color, marginLeft: "auto" }} title={weather.desc}>
          {weather.label}
        </span>
      </div>

      <div style={{ overflowY: "auto", padding: "4px 6px", display: "grid", gap: 2 }}>
        {recent.map((line, i) => (
          <div
            key={`${log.length - i}-${line.slice(0, 12)}`}
            className="mk-title"
            style={{
              fontSize: 6,
              lineHeight: 1.5,
              color: i === 0 ? "var(--mk-accent2)" : "var(--mk-fg)",
              opacity: i > 60 ? 0.45 : 1,
            }}
          >
            {line}
          </div>
        ))}
        {recent.length === 0 && (
          <div className="mk-title" style={{ fontSize: 6, color: "var(--mk-muted)" }}>
            SEM EVENTOS AINDA
          </div>
        )}
      </div>

      <div
        style={{
          padding: "4px 6px",
          borderTop: "1px solid rgba(90,200,255,0.25)",
          display: "grid",
          gap: 3,
        }}
      >
        <div className="mk-title" style={{ fontSize: 5, color: "var(--mk-muted)" }}>
          ZONAS DA ARENA {zones.length ? `· ${zones.length}` : ""}
        </div>
        {zones.map((z) => (
          <div key={z.id} className="mk-title" style={{ fontSize: 5, color: z.color }} title={z.desc}>
            {z.label} · {POS_ABBR[z.position] ?? z.position} · {z.desc}
          </div>
        ))}
        <div className="mk-title" style={{ fontSize: 5, color: "var(--mk-accent)", marginTop: 2 }}>
          ONDE ESTAO AGORA
        </div>
        {zonesOf.map((z) => (
          <div key={z.name} className="mk-title" style={{ fontSize: 5, color: z.zone.color }}>
            {z.name} · {z.zone.label} ({POS_ABBR[z.zone.position] ?? z.zone.position})
          </div>
        ))}
        <PixelButton onClick={onClose}>FECHAR</PixelButton>
      </div>
    </div>
  );
}

/** Painel pos-luta: resultado, MVP, totais, metricas por robo e cronologia. */
function ReportOverlay({
  report,
  onContinue,
}: {
  report: ReturnType<typeof battleReport>;
  onContinue: () => void;
}) {
  const win = report.result === "win";
  const timeline = report.timeline.slice(-16).reverse();
  const cols: { key: keyof CombatSummary; label: string }[] = [
    { key: "damageDealt", label: "DANO" },
    { key: "damageTaken", label: "SOFREU" },
    { key: "healed", label: "CURA" },
    { key: "kills", label: "ABT" },
    { key: "crits", label: "CRIT" },
    { key: "parries", label: "APAR" },
    { key: "dodges", label: "ESQ" },
    { key: "statusApplied", label: "ST+" },
  ];
  const table = (rows: CombatSummary[], tint: string) => (
    <div style={{ display: "grid", gap: 2 }}>
      {rows.map((s) => (
        <div
          key={s.uid}
          className="mk-title"
          style={{
            fontSize: 5,
            borderLeft: `2px solid ${tint}`,
            paddingLeft: 3,
            opacity: s.alive ? 1 : 0.55,
          }}
        >
          <div style={{ color: s.alive ? "var(--mk-fg)" : "var(--mk-muted)" }}>
            {s.name} · {POS_ABBR[s.pos] ?? s.pos} · {s.hp}/{s.maxHp}
          </div>
          <div style={{ color: "var(--mk-muted)" }}>
            {cols.map((c) => `${c.label} ${String(s[c.key])}`).join(" · ")}
          </div>
          {s.topSkills.length > 0 && (
            <div style={{ color: "var(--mk-accent2)" }}>
              {s.topSkills
                .slice(0, 3)
                .map((t) => `${t.name}×${t.uses}`)
                .join(" · ")}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(3,6,12,0.9)",
        display: "grid",
        placeItems: "center",
        zIndex: 20,
        padding: 8,
      }}
    >
      <Panel style={{ width: "min(560px, 96vw)", maxHeight: "94%", overflowY: "auto" }}>
        <div
          className="mk-title"
          style={{
            fontSize: 16,
            textAlign: "center",
            color: win ? "var(--mk-accent2)" : "var(--mk-hp)",
          }}
        >
          {win ? "VITORIA!" : "DERROTA"}
        </div>
        <div
          className="mk-title"
          style={{ fontSize: 6, textAlign: "center", color: "var(--mk-muted)", margin: "4px 0" }}
        >
          {report.rounds} ROUNDS · DANO VOCE {report.totals.player} × INIMIGO {report.totals.enemy}
        </div>

        {report.mvp && (
          <div
            className="mk-title"
            style={{
              fontSize: 6,
              textAlign: "center",
              color: "var(--mk-accent)",
              border: "1px solid rgba(255,196,58,0.4)",
              padding: "3px 4px",
              marginBottom: 6,
            }}
          >
            MVP {report.mvp.name} · {report.mvp.damageDealt} dano · {report.mvp.kills} abates ·{" "}
            {report.mvp.crits} criticos
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div>
            <div className="mk-title" style={{ fontSize: 6, color: "#35e2f0", marginBottom: 3 }}>
              SUA EQUIPE
            </div>
            {table(report.player, "#35e2f0")}
          </div>
          <div>
            <div className="mk-title" style={{ fontSize: 6, color: "#ff5b4d", marginBottom: 3 }}>
              EQUIPE INIMIGA
            </div>
            {table(report.enemy, "#ff5b4d")}
          </div>
        </div>

        {timeline.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <div className="mk-title" style={{ fontSize: 6, color: "var(--mk-muted)", marginBottom: 3 }}>
              CRONOLOGIA
            </div>
            <div style={{ display: "grid", gap: 1 }}>
              {timeline.map((line, i) => (
                <div
                  key={`tl-${i}-${line.slice(0, 10)}`}
                  className="mk-title"
                  style={{ fontSize: 5, color: i === 0 ? "var(--mk-accent2)" : "var(--mk-muted)" }}
                >
                  {line}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "grid", placeItems: "center", marginTop: 8 }}>
          <PixelButton onClick={onContinue}>CONTINUAR</PixelButton>
        </div>
      </Panel>
    </div>
  );
}

function Stage({
  arena,
  side,
  robotId,
  size,
  reduced,
  clip,
  flip,
  dim,
  shake,
  vfx,
  floats,
  anims,
  seal,
  hideActor=false,
}: {
  arena: string;
  side: Side;
  robotId: string;
  size: number;
  reduced: boolean;
  clip: Clip;
  flip: boolean;
  dim: boolean;
  shake: number;
  vfx: { url: string; key: number } | null;
  floats: Float[];
  anims: AnimInst[];
  seal: Seal | null;
  hideActor?: boolean;
}) {
  const game = useGame();
  const skin = side === "player" ? skinOfRobot(game, robotId) : null;
  /* Direcao do lado: o jogador empurra para a direita, o inimigo para a
   * esquerda. As animacoes leem isso via --mk-dir. */
  const dir = side === "player" ? 1 : -1;
  const sprites = anims.filter((a) => a.spec.layer === "sprite");
  const sprite = sprites.length ? sprites[sprites.length - 1] : null;
  const auras = anims.filter((a) => a.spec.layer === "aura");
  const bursts = anims.filter((a) => a.spec.layer === "burst");
  const decals = anims.filter((a) => a.spec.layer === "decal");
  const shots = anims.filter((a) => a.spec.layer === "projectile" || a.spec.layer === "trail");
  const shakeCls =
    shake >= 3 ? "mk-shake-3" : shake === 2 ? "mk-shake-2" : shake === 1 ? "mk-shake" : "";

  return (
    <div style={{ position: "relative", ["--mk-dir" as string]: String(dir) }} className={shakeCls}>
      <Plinth arena={arena} side={side} size={size} />
      {/* decalques de chao: marcas deixadas no piso, sob o robo */}
      {decals.map((a) => (
        <AnimVfx key={a.key} inst={a} size={150} offset={(size - 150) / 2} floor />
      ))}
      {/* auras ficam atras do robo */}
      {auras.map((a) => (
        <AnimVfx key={a.key} inst={a} size={188} offset={(size - 188) / 2} />
      ))}

      <div
        key={sprite?.key ?? "still"}
        className={sprite && !reduced ? `mk-a mk-a-${sprite.spec.keyframe}` : undefined}
        style={
          sprite
            ? ({ ["--mk-d" as string]: `${sprite.spec.duration}ms`,visibility:hideActor?"hidden":undefined } as React.CSSProperties)
            : {visibility:hideActor?"hidden":undefined}
        }
      >
        <RobotSprite
          robotId={robotId}
          clip={clip}
          size={size}
          skin={skin}
          flip={flip}
          fps={clip === "idle" ? 4 : 8}
          loop={clip === "idle"}
          dim={dim}
        />
      </div>

      {/* projeteis e rastros viajam na direcao do alvo */}
      {shots.map((a) => (
        <AnimVfx key={a.key} inst={a} size={120} offset={(size - 120) / 2} />
      ))}
      {/* bursts por cima */}
      {bursts.map((a) => (
        <AnimVfx key={a.key} inst={a} size={196} offset={(size - 196) / 2} />
      ))}

      {vfx && (
        <div key={vfx.key} style={{ position: "absolute", left: (size - 160) / 2, top: (size - 160) / 2 }}>
          <VfxSprite url={vfx.url} size={160} />
        </div>
      )}

      {/* Selo de impacto: valor do dano + afinidade elemental do golpe. */}
      {seal && (
        <div
          key={seal.key}
          className="mk-a mk-a-pulse mk-title"
          style={
            {
              position: "absolute",
              left: side === "player" ? -6 : 66,
              top: -18,
              zIndex: 9,
              ["--mk-d" as string]: "620ms",
              border: `2px solid ${TIER_COLOR[seal.tier]}`,
              background: "rgba(3,6,12,0.88)",
              color: TIER_COLOR[seal.tier],
              fontSize: 8,
              padding: "2px 5px",
              whiteSpace: "nowrap",
              textShadow: "2px 2px 0 #000",
              pointerEvents: "none",
            } as React.CSSProperties
          }
          title={`${TIER_LABEL[seal.tier]} · ${ELEMENT_MAP[seal.element]?.label ?? seal.element}`}
        >
          -{seal.value} {ELEMENT_MAP[seal.element]?.abbr ?? ""}
          {seal.tier !== "neutro" ? ` · ${TIER_LABEL[seal.tier]}` : ""}
        </div>
      )}

      {floats.map((f, idx) => (
        <div
          key={f.key}
          className="mk-float mk-title"
          style={{
            position: "absolute",
            left: 8,
            top: 10 + idx * 16,
            fontSize: 9,
            color: TONE_COLOR[f.tone] ?? "#fff",
            textShadow: "2px 2px 0 #000",
            whiteSpace: "nowrap",
          }}
        >
          {f.text}
        </div>
      ))}
    </div>
  );
}

/** Uma camada de VFX animada: sprite sheet existente + recoloracao + keyframe. */
function AnimVfx({ inst, size, offset, floor }: { inst: AnimInst; size: number; offset: number; floor?: boolean }) {
  const { spec } = inst;
  if (!spec.vfx) return null;
  return (
    <div
      className={`mk-a mk-a-${spec.keyframe}`}
      style={
        {
          position: "absolute",
          left: offset,
          top: floor ? undefined : offset,
          bottom: floor ? -34 : undefined,
          zIndex: floor ? 0 : undefined,
          transformOrigin: "50% 50%",
          pointerEvents: "none",
          filter: spec.filter,
          ["--mk-d"]: `${spec.duration}ms`,
          ["--mk-s"]: String(spec.scale ?? 1),
        } as React.CSSProperties
      }
    >
      <VfxSprite url={spec.vfx} size={size} />
    </div>
  );
}

/** Camada de tela cheia: flashes, vinhetas, barras, linhas e faixas de texto. */
function ScreenFx({ anims }: { anims: AnimInst[] }) {
  if (anims.length === 0) return null;
  return (
    <div className="mk-battle-screen-fx" style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 5 }}>
      {anims.map((a) => {
        const banner = a.spec.keyframe === "banner" || a.spec.keyframe === "banner-big";
        return (
          <div
            key={a.key}
            className={`mk-a mk-a-${a.spec.keyframe} ${banner ? "mk-title" : ""}`}
            style={
              {
                position: "absolute",
                inset: 0,
                display: banner ? "grid" : undefined,
                placeItems: banner ? "center" : undefined,
                fontSize: a.spec.keyframe === "banner-big" ? 26 : 16,
                color: a.spec.color,
                textShadow: "3px 3px 0 #000",
                letterSpacing: 2,
                ["--mk-d"]: `${a.spec.duration}ms`,
                ["--mk-c"]: a.spec.color ?? "#fff",
              } as React.CSSProperties
            }
          >
            {a.spec.vfx && (
              <div style={{ position: "absolute", inset: "5%", display: "grid", placeItems: "center", opacity: a.spec.keyframe === "distort" ? 0.45 : 0.85, mixBlendMode: "screen" }}>
                <VfxSprite url={a.spec.vfx} size={a.spec.keyframe === "cinematic" ? 340 : 440} />
              </div>
            )}
            {(banner || a.spec.keyframe === "cinematic") && <span className="mk-title" style={{ position: "absolute", top: "32%", left: 0, right: 0, textAlign: "center", fontSize: 18 }}>{a.spec.text}</span>}
          </div>
        );
      })}
    </div>
  );
}

/** HUD de um lutador: HP, MP, recurso alternativo, carga, zona e selo. */
function FighterHud({
  side,
  name,
  hp,
  maxHp,
  mp,
  maxMp,
  level,
  robotId,
  effects,
  res,
  resVal,
  charge,
  zone,
  zoneColor,
  seal,
  element,
  team,
}: {
  side: Side;
  name: string;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  level: number;
  robotId: string;
  effects: string[];
  res: ResourceDef | null;
  resVal: number;
  charge: number;
  zone: string;
  zoneColor: string;
  seal?: { tier: AffinityTier; element: string } | null;
  element: ElementDef | null;
  team: { id: string; alive: boolean }[];
}) {
  const right = side === "enemy";
  const pips = res ? Math.max(0, Math.min(resVal, res.max)) : 0;
  return (
    <div
      className={`mc-fighter-hud ${right ? "mc-hud-enemy" : "mc-hud-player"}`}
      style={{
        flex: 1,
        background: "rgba(4,10,20,0.78)",
        border: "2px solid rgba(53,226,240,0.5)",
        padding: 4,
        display: "flex",
        flexDirection: right ? "row-reverse" : "row",
        gap: 4,
        alignItems: "flex-start",
      }}
    >
      <img
        className="mc-hud-portrait"
        src={faceUrl(robotId)}
        alt=""
        width={34}
        height={34}
        style={{ imageRendering: "pixelated" }}
      />
      <div className="mc-hud-data" style={{ flex: 1, textAlign: right ? "right" : "left", minWidth: 0 }}>
        <div className="mc-hud-eyebrow">{right ? "ADVERSÁRIO / ENEMY UNIT" : "SEU ROBÔ / ACTIVE UNIT"}</div>
        <div
          className="mk-title mc-hud-name"
          style={{
            fontSize: 7,
            marginBottom: 2,
            display: "flex",
            gap: 4,
            flexDirection: right ? "row-reverse" : "row",
            alignItems: "center",
          }}
        >
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {name}
          </span>
          {element && (
            <span
              title={element.motto}
              style={{
                border: `1px solid ${element.color}`,
                color: element.color,
                fontSize: 5,
                padding: "0 2px",
                whiteSpace: "nowrap",
              }}
            >
              {element.abbr}
            </span>
          )}
          <span style={{ color: "var(--mk-accent2)" }}>Lv{level}</span>
        </div>
        <div className="mc-hud-vital"><span>HP</span><div className="mc-hud-gauge"><img src="/ui/bar_frame.png" alt=""/><div style={{width:`${Math.max(0, Math.min(100, hp / Math.max(1,maxHp)*100))}%`}}><img src="/ui/bar_hp.png" alt=""/></div></div><b>{hp}<small> / {maxHp}</small></b></div>
        <div className="mc-hud-vital mc-hud-mp"><span>MP</span><div className="mc-hud-gauge"><img src="/ui/bar_frame.png" alt=""/><div style={{width:`${Math.max(0, Math.min(100, mp / Math.max(1,maxMp)*100))}%`}}><img src="/ui/bar_mp.png" alt=""/></div></div><b>{mp}<small> / {maxMp}</small></b></div>
        <div
          className="mk-title mc-hud-legacy-values"
          style={{ fontSize: 6, color: "var(--mk-muted)", marginTop: 2 }}
        >
          {hp}/{maxHp} HP · {mp}/{maxMp} MP
        </div>

        {/* recurso alternativo do chassi */}
        {res && (
          <div
            className="mk-title mc-hud-resource"
            style={{
              display: "flex",
              gap: 2,
              alignItems: "center",
              marginTop: 2,
              flexDirection: right ? "row-reverse" : "row",
            }}
            title={`${res.label} ${resVal}/${res.max} — ${res.desc}`}
          >
            <span style={{ fontSize: 5, color: res.color }}>{res.abbr}</span>
            <span
              style={{
                flex: 1,
                height: 4,
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.2)",
                position: "relative",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: right ? undefined : 0,
                  right: right ? 0 : undefined,
                  width: `${Math.min(100, (resVal / res.max) * 100)}%`,
                  background: res.color,
                }}
              />
            </span>
            <span style={{ fontSize: 5, color: "var(--mk-muted)" }}>{pips}</span>
          </div>
        )}

        <div className="mk-title mc-hud-ultimate" title="Carga individual de ultimate: 100% libera o golpe exclusivo, sem MP."
          style={{display:"flex",alignItems:"center",gap:4,marginTop:3,fontSize:5,color:charge>=100?"#ffe278":"var(--mk-muted)"}}>
          <span>ULT {charge}%</span>
          <span style={{flex:1,height:4,background:"#ffffff22"}}><span style={{display:"block",height:"100%",width:`${charge}%`,background:"#ffe278"}}/></span>
        </div>

        {effects.length > 0 && (
          <div className="mk-title mc-hud-effects" style={{ fontSize: 6, color: "var(--mk-accent)", marginTop: 2 }}>
            {effects.join(" ")}
          </div>
        )}

        {/* zona de terreno + selo elemental recebido */}
        <div
          className="mk-title mc-hud-zone"
          style={{
            display: "flex",
            gap: 4,
            marginTop: 2,
            flexDirection: right ? "row-reverse" : "row",
            fontSize: 5,
          }}
        >
          <span style={{ color: zoneColor }} title="zona de terreno">
            ZONA {zone}
          </span>
          {seal && (
            <span style={{ color: TIER_COLOR[seal.tier] }} title="afinidade do golpe recebido">
              {TIER_LABEL[seal.tier]} {ELEMENT_MAP[seal.element]?.abbr ?? ""}
            </span>
          )}
        </div>

        <div
          className="mc-hud-team"
          style={{
            display: "flex",
            gap: 2,
            marginTop: 3,
            justifyContent: right ? "flex-end" : "flex-start",
          }}
        >
          {team.map((t, i) => (
            <img
              key={`${t.id}-${i}`}
              src={faceUrl(t.id)}
              alt=""
              width={14}
              height={14}
              style={{
                imageRendering: "pixelated",
                filter: t.alive ? undefined : "grayscale(1) brightness(0.4)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
