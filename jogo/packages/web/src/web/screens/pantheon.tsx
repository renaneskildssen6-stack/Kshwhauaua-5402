import { useState } from "react";
import { PixelButton, RobotSprite } from "@/components/pixel";
import { fightReward, grantXP } from "@/game/engine";
import { ROBOT_MAP, faceUrl } from "@/game/robots";
import {
  PANTHEONS,
  TRIAL_STAGES,
  missionDone,
  missionProgress,
  robotsOf,
  summonBlock,
  trialOf,
  trialStage,
  trialWins,
  type PantheonId,
  type TrialStage,
} from "@/game/pantheon";
import {
  addGold,
  addPlayerXP,
  applyPetRewards,
  incBattlesWon,
  recordTrialWin,
  spendItem,
  summonPantheon,
  teamSaves,
  updateRobots,
  useGame,
} from "@/game/save";
import { BattleScreen } from "@/screens/battle";
import "./pantheon.css";

/** Folha 5×5 (25 frames, 25 fps) animada só com CSS. */
function Sheet({ src, size, className = "" }: { src: string; size: number; className?: string }) {
  return <span className={`pt-sheet ${className}`} style={{ width: size, height: size, backgroundImage: `url(${src})` }} aria-hidden />;
}

const RARITY_LABEL: Record<string, string> = { bronze: "BRONZE", silver: "PRATA", gold: "OURO" };

const BLOCK_TEXT: Record<string, string> = {
  owned: "DESPERTADO",
  battles: "VENÇA AS 3 PROVAÇÕES",
  missions: "CUMPRA AS MISSÕES",
  diamonds: "DIAMANTES INSUFICIENTES",
  unknown: "INDISPONÍVEL",
};

type Fight = { id: string; stage: number; setup: TrialStage };

export function PantheonScreen({ onBack }: { onBack: () => void }) {
  const g = useGame();
  const [gate, setGate] = useState<PantheonId>("norse");
  const [focus, setFocus] = useState<string>(robotsOf("norse")[0]);
  const [fight, setFight] = useState<Fight | null>(null);
  const [summoned, setSummoned] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const team = teamSaves(g);
  const pan = PANTHEONS.find((p) => p.id === gate)!;
  const def = ROBOT_MAP[focus];
  const trial = trialOf(focus)!;
  const wins = trialWins(g, focus);
  const block = summonBlock(g, focus);
  const owned = block === "owned";

  function pick(p: PantheonId) {
    setGate(p);
    setFocus(robotsOf(p)[0]);
    setNote(null);
  }

  function finish(result: "win" | "lose", snap?: Record<string, { hp: number; mp: number }>) {
    if (!fight) return;
    const base = fight.setup.enemies.reduce(
      (a, e) => {
        const r = fightReward(ROBOT_MAP[e.id].ratios, e.level);
        return { gold: a.gold + r.gold, xp: a.xp + r.xp };
      },
      { gold: 0, xp: 0 },
    );
    const k = result === "win" ? fight.setup.reward : 0.25;
    const rw = applyPetRewards({ gold: Math.round(base.gold * k), xp: Math.round(base.xp * k) });
    addGold(rw.gold);
    addPlayerXP(rw.xp);
    const ids = new Set(g.team);
    updateRobots(g.robots.map((r) => (ids.has(r.id) ? grantXP(r, rw.xp).save : r)));
    if (result === "win") {
      incBattlesWon();
      const flawless = team.every((r) => (snap?.[r.id]?.hp ?? 1) > 0);
      recordTrialWin(fight.id, fight.stage, flawless);
      setNote(`PROVAÇÃO ${fight.stage + 1} VENCIDA · +${rw.gold} OURO`);
    } else setNote(`DERROTA · +${rw.gold} OURO · TENTE DE NOVO`);
    setFight(null);
  }

  if (fight) {
    return (
      <BattleScreen
        key={`${fight.id}-${fight.stage}`}
        arena={fight.setup.arena}
        playerTeam={team}
        enemyTeam={fight.setup.enemies}
        items={g.items}
        label={fight.setup.label}
        onUseItem={(id) => spendItem(id, 1)}
        onFinish={finish}
      />
    );
  }

  function startTrial() {
    if (!team.length || wins >= TRIAL_STAGES) return;
    setNote(null);
    setFight({ id: focus, stage: wins, setup: trialStage(focus, wins, team) });
  }

  function awaken() {
    if (summonPantheon(focus)) {
      setSummoned(focus);
      setNote(`${def.name} DESPERTOU E ENTROU NO HANGAR`);
    }
  }

  return (
    <div className="pt-root" data-testid="pantheon" style={{ ["--pt-c" as string]: pan.color, ["--pt-g" as string]: pan.glow }}>
      <div className="pt-bg" aria-hidden />
      <header className="pt-top">
        <button className="pt-back mk-title" onClick={onBack}>◀ CIDADE</button>
        <div className="pt-title">
          <Sheet src="/mythic/emblem.webp" size={34} />
          <div>
            <h1 className="mk-title">PANTEÃO</h1>
            <small>27 CHASSIS EXCLUSIVOS · 3 PORTAIS</small>
          </div>
        </div>
        <div className="pt-wallet mk-title">
          <Sheet src="/mythic/diamond.webp" size={22} />
          {g.diamonds}
        </div>
      </header>

      <nav className="pt-gates">
        {PANTHEONS.map((p) => (
          <button
            key={p.id}
            className="mk-title"
            aria-pressed={p.id === gate}
            style={{ ["--pt-c" as string]: p.color }}
            onClick={() => pick(p.id)}
          >
            <span>{p.name}</span>
            <small>{p.realm}</small>
            <em>{robotsOf(p.id).filter((id) => g.robots.some((r) => r.id === id)).length}/9</em>
          </button>
        ))}
      </nav>

      <div className="pt-body">
        <section className="pt-grid" aria-label={`Deuses de ${pan.name}`}>
          {robotsOf(gate).map((id) => {
            const d = ROBOT_MAP[id];
            const have = g.robots.some((r) => r.id === id);
            const w = trialWins(g, id);
            return (
              <button key={id} className="pt-card" aria-pressed={id === focus} data-owned={have} onClick={() => { setFocus(id); setNote(null); }}>
                <img src={faceUrl(id)} alt="" width={40} height={40} />
                <span className="mk-title">{d.name}</span>
                <i>{have ? "★ DESPERTO" : `${w}/${TRIAL_STAGES}`}</i>
              </button>
            );
          })}
        </section>

        <section className="pt-detail">
          <div className="pt-stage">
            <Sheet src="/mythic/aura.webp" size={176} className="pt-aura" />
            <div className="pt-robot">
              <RobotSprite robotId={focus} size={128} clip="idle" dim={!owned && wins < TRIAL_STAGES} />
            </div>
            {summoned === focus && <Sheet key={summoned} src="/mythic/summon.webp" size={210} className="pt-summon" />}
          </div>
          <div className="pt-info">
            <h2 className="mk-title">{def.name}</h2>
            <small>{def.element} · {pan.name} · {RARITY_LABEL[def.rarity]}</small>
            <p>{def.bio}</p>

            <h3 className="mk-title">PROVAÇÕES {wins}/{TRIAL_STAGES}</h3>
            <div className="pt-trials">
              {Array.from({ length: TRIAL_STAGES }, (_, i) => (
                <span key={i} data-done={i < wins} data-next={i === wins}>{i === TRIAL_STAGES - 1 ? "DEUS" : `G${i + 1}`}</span>
              ))}
            </div>
            {!owned && wins < TRIAL_STAGES && (
              <PixelButton onClick={startTrial} disabled={!team.length}>
                LUTAR · PROVAÇÃO {wins + 1}
              </PixelButton>
            )}

            <h3 className="mk-title">MISSÕES</h3>
            <ul className="pt-missions">
              {trial.missions.map((m) => {
                const done = missionDone(g, focus, m);
                return (
                  <li key={m.id} data-done={done}>
                    <Sheet src="/mythic/seal.webp" size={22} className={done ? "" : "pt-off"} />
                    <span>{m.label}</span>
                    <b>{Math.min(m.n, missionProgress(g, focus, m))}/{m.n}</b>
                  </li>
                );
              })}
            </ul>

            <div className="pt-offer">
              <span className="mk-title">OFERENDA</span>
              <Sheet src="/mythic/diamond.webp" size={26} />
              <b className="mk-title" data-short={g.diamonds < trial.cost}>{trial.cost}</b>
            </div>
            <button className="pt-awaken mk-title" disabled={block !== null} onClick={awaken}>
              {block === null ? "DESPERTAR" : BLOCK_TEXT[block]}
            </button>
            {note && <div className="pt-note mk-title" role="status">{note}</div>}
          </div>
        </section>
      </div>
    </div>
  );
}
