import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { BattleScreen } from "@/screens/battle";
import { spendItem, teamSaves, useGame } from "@/game/save";
import { ITEM_MAP } from "@/game/config";
import { ROBOT_MAP } from "@/game/robots";
import {
  SPEAKERS, STORY_CHAPTERS, chapterUnlocked, completeStoryChapter, markStoryOpened, payStoryFight,
  setStoryFlag, storyEnemies, type SpeakerId, type StoryBattle, type StoryChapter, type StoryChoice, type StoryLine,
} from "@/game/story";
import "./story.css";

type Mode = "map" | "scene" | "battle" | "defeat" | "result";
interface Cursor { i: number; pending: StoryLine[] }
interface LogEntry { who: SpeakerId; text: string }
interface ResultInfo { first: boolean; gold: number; xp: number; item?: string; qty?: number; fightGold: number; fightXp: number; levelUps: string[] }

const reducedMotion = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
const ALLIES: SpeakerId[] = ["lyra", "lyra_orbit", "nara", "aurorion"];

export function StoryScreen({ onBack }: { onBack: () => void }) {
  const g = useGame();
  const [mode, setMode] = useState<Mode>("map");
  const [chapter, setChapter] = useState<StoryChapter | null>(null);
  const [cursor, setCursor] = useState<Cursor>({ i: 0, pending: [] });
  const [attempt, setAttempt] = useState(0);
  const [log, setLog] = useState<LogEntry[]>([]);
  const fights = useRef({ gold: 0, xp: 0, levelUps: [] as string[] });
  const paid = useRef(new Set<string>());
  const [result, setResult] = useState<ResultInfo | null>(null);
  const team = teamSaves(g);

  const flags = g.story.flags;
  const visible = useCallback((l: StoryLine) => !l.when || flags[l.when[0]] === l.when[1], [flags]);

  /** Avança o cursor até a próxima batida exibível (pula falas condicionais e fundos). */
  const settle = useCallback((c: Cursor, ch: StoryChapter): Cursor => {
    let { i, pending } = c;
    pending = pending.filter(visible);
    if (pending.length) return { i, pending };
    while (i < ch.beats.length) {
      const b = ch.beats[i];
      if (b.kind === "line" && !visible(b)) { i++; continue; }
      if (b.kind === "bg") { i++; continue; }
      break;
    }
    return { i, pending };
  }, [visible]);

  const beat = chapter ? (cursor.pending[0] ?? chapter.beats[cursor.i]) : undefined;

  const finishChapter = useCallback((ch: StoryChapter) => {
    const r = completeStoryChapter(ch.id);
    setResult({ ...r, fightGold: fights.current.gold, fightXp: fights.current.xp, levelUps: fights.current.levelUps });
    setMode("result");
  }, []);

  const advance = useCallback(() => {
    if (!chapter) return;
    setCursor((c) => {
      const next = c.pending.length ? { i: c.i, pending: c.pending.slice(1) } : { i: c.i + 1, pending: [] };
      const s = settle(next, chapter);
      if (!s.pending.length && s.i >= chapter.beats.length) queueMicrotask(() => finishChapter(chapter));
      return s;
    });
  }, [chapter, settle, finishChapter]);

  const open = (ch: StoryChapter) => {
    markStoryOpened(ch.id);
    fights.current = { gold: 0, xp: 0, levelUps: [] };
    paid.current.clear();
    setLog([]);
    setResult(null);
    setChapter(ch);
    setCursor(settle({ i: 0, pending: [] }, ch));
    setMode("scene");
  };

  const choose = (b: StoryChoice, value: string) => {
    setStoryFlag(b.flag, value);
    const opt = b.options.find((o) => o.value === value);
    setLog((l) => [...l, { who: "narrador", text: `▸ ${opt?.label ?? value}` }]);
    setCursor((c) => ({ i: c.i + 1, pending: opt?.reply ?? [] }));
  };

  const onFight = (b: StoryBattle, res: "win" | "lose") => {
    const key = `${b.id}#${attempt}`;
    if (paid.current.has(key)) return;
    paid.current.add(key);
    const r = payStoryFight(b, res === "win");
    fights.current.gold += r.gold;
    fights.current.xp += r.xp;
    fights.current.levelUps.push(...r.levelUps.map((u) => `${u.name} NV ${u.level}`));
    if (res === "lose") { setMode("defeat"); return; }
    setMode("scene");
    advance();
  };

  // ---------------------------------------------------------------- telas
  if (mode === "battle" && chapter && beat?.kind === "battle") {
    return (
      <BattleScreen
        key={`${beat.id}-${attempt}`}
        arena={beat.arena}
        playerTeam={team}
        enemyTeam={storyEnemies(beat)}
        items={g.items}
        label={`CAP. ${chapter.num} · ${beat.label}`}
        onUseItem={(id) => spendItem(id, 1)}
        onFinish={(r) => onFight(beat, r)}
      />
    );
  }

  if (mode === "map" || !chapter) {
    return <StoryMap cleared={g.story.cleared} last={g.story.last} hasTeam={team.length > 0} playerLevel={g.playerLevel} onOpen={open} onBack={onBack} />;
  }

  if (mode === "result" && result) {
    const item = result.item ? ITEM_MAP[result.item] : undefined;
    const isFinal = chapter.num === STORY_CHAPTERS.length;
    const nextIdx = STORY_CHAPTERS.findIndex((c) => c.id === chapter.id) + 1;
    return (
      <div className="ms-root ms-result" data-testid="story-result">
        <img className="ms-bg is-still" src={chapter.art} alt="" />
        <div className="ms-shade" />
        <section className="ms-result-card">
          <small>CAPÍTULO {chapter.num} CONCLUÍDO</small>
          <h2>{chapter.title}</h2>
          <ul>
            <li><span>Lutas</span><b>+{result.fightGold}g · +{result.fightXp} XP</b></li>
            {result.first
              ? <li className="is-first"><span>Estreia</span><b>+{result.gold}g · +{result.xp} XP{item ? ` · ${result.qty}× ${item.name}` : ""}</b></li>
              : <li><span>Estreia</span><b>já recebida — replays pagam só as lutas</b></li>}
            {result.levelUps.map((u) => <li key={u}><span>Evolução</span><b>{u}</b></li>)}
          </ul>
          {isFinal && result.first && <p className="ms-epilogue">A cidade amanheceu. Obrigado por jogar as Crônicas da Primeira Luz.</p>}
          <div className="ms-result-actions">
            {!isFinal && nextIdx < STORY_CHAPTERS.length && <button className="ai-plate is-primary" onClick={() => open(STORY_CHAPTERS[nextIdx])}>PRÓXIMO CAPÍTULO ▸</button>}
            <button className="ai-plate" onClick={() => setMode("map")}>MAPA DA HISTÓRIA</button>
          </div>
        </section>
      </div>
    );
  }

  if (mode === "defeat" && beat?.kind === "battle") {
    return (
      <div className="ms-root ms-result" data-testid="story-defeat">
        <img className="ms-bg is-still" src={chapter.art} alt="" />
        <div className="ms-shade is-red" />
        <section className="ms-result-card">
          <small>SINAL PERDIDO</small>
          <h2>{beat.label}</h2>
          <p>Seu esquadrão recuou para o hangar. A cena continua daqui — nenhum diálogo precisa ser repetido.</p>
          <div className="ms-result-actions">
            <button className="ai-plate is-primary" onClick={() => { setAttempt((n) => n + 1); setMode("battle"); }}>TENTAR DE NOVO</button>
            <button className="ai-plate" onClick={() => setMode("map")}>VOLTAR AO MAPA</button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <StoryScene
      key={chapter.id}
      chapter={chapter}
      beat={beat}
      stepKey={`${cursor.i}-${cursor.pending.length}`}
      log={log}
      onLine={(l) => setLog((x) => [...x, { who: l.who, text: l.text }])}
      onAdvance={advance}
      onChoose={choose}
      onFight={() => setMode("battle")}
      hasTeam={team.length > 0}
      onSkip={() => {
        // Pula falas até a próxima escolha/batalha (ou o fim do capítulo).
        setCursor((c) => {
          let i = c.i + 1;
          while (i < chapter.beats.length && (chapter.beats[i].kind === "line" || chapter.beats[i].kind === "bg")) i++;
          if (i >= chapter.beats.length) queueMicrotask(() => finishChapter(chapter));
          return { i, pending: [] };
        });
      }}
      onExit={() => setMode("map")}
    />
  );
}

// ------------------------------------------------------------------ mapa
function StoryMap({ cleared, last, hasTeam, playerLevel, onOpen, onBack }: { cleared: string[]; last: string | null; hasTeam: boolean; playerLevel: number; onOpen: (c: StoryChapter) => void; onBack: () => void }) {
  const focus = useRef<HTMLElement | null>(null);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const [mapView, setMapView] = useState({ x: 0, y: 0, zoom: 1 });
  useEffect(() => { focus.current?.scrollIntoView({ block: "center", behavior: reducedMotion() ? "auto" : "smooth" }); }, []);
  const nextOpen = STORY_CHAPTERS.findIndex((c, i) => chapterUnlocked(cleared, i) && !cleared.includes(c.id));
  const points = STORY_CHAPTERS.map((c, i) => c.map ?? { x: 22 + (i % 2) * 44, y: 92 - i * 9, region: i < 6 ? "CINTURÃO AURORA" : "ROTA HELIX" });
  const mapDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, ox: mapView.x, oy: mapView.y };
  };
  const mapMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    setMapView((v) => ({ ...v, x: drag.current!.ox + e.clientX - drag.current!.x, y: drag.current!.oy + e.clientY - drag.current!.y }));
  };
  const mapUp = () => { drag.current = null; };
  const zoom = (delta: number) => setMapView((v) => ({ ...v, zoom: Math.max(.72, Math.min(1.8, +(v.zoom + delta).toFixed(2))) }));
  return (
    <div className="ms-root ms-map" data-testid="story-map">
      <img className="ms-bg" src="/story/cover.webp" alt="" />
      <div className="ms-shade" />
      <header className="ms-map-head">
        <button className="ai-plate" onClick={onBack}>← CIDADE</button>
        <div>
          <small>MODO HISTÓRIA</small>
          <h1>CRÔNICAS DA PRIMEIRA LUZ</h1>
        </div>
        <span className="ms-progress" aria-label={`${cleared.length} de ${STORY_CHAPTERS.length} capítulos`}>{cleared.length}/{STORY_CHAPTERS.length}</span>
      </header>
      {!hasTeam && <p className="ms-warn">Conclua o tutorial e monte uma equipe no Hangar para lutar na história.</p>}
      <section className="ms-route-panel" aria-label="Mapa de lugares da campanha">
        <header className="ms-route-head"><div><small>ATLAS DE NAVEGAÇÃO · ARRASTE PARA EXPLORAR</small><h2>ROTA DA PRIMEIRA LUZ</h2></div><div className="ms-route-tools"><button className="ai-plate" aria-label="Afastar mapa" onClick={() => zoom(-.12)}>−</button><strong>{Math.round(mapView.zoom * 100)}%</strong><button className="ai-plate" aria-label="Aproximar mapa" onClick={() => zoom(.12)}>+</button><button className="ai-plate" onClick={() => setMapView({ x: 0, y: 0, zoom: 1 })}>CENTRAR</button></div></header>
        <div className="ms-route-viewport" onPointerDown={mapDown} onPointerMove={mapMove} onPointerUp={mapUp} onPointerCancel={mapUp} onWheel={(e) => zoom(e.deltaY < 0 ? .06 : -.06)}>
          <div className="ms-route-world" style={{ transform: `translate(${mapView.x}px, ${mapView.y}px) scale(${mapView.zoom})` }}>
            <div className="ms-route-glow" />
            <svg className="ms-route-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points={points.map((p) => `${p.x},${p.y}`).join(" ")} /></svg>
            {points.map((p, i) => { const c = STORY_CHAPTERS[i]; const unlocked = chapterUnlocked(cleared, i); const done = cleared.includes(c.id); return <button key={c.id} className={`ms-route-node${done ? " is-done" : ""}${unlocked ? "" : " is-locked"}${i === nextOpen ? " is-next" : ""}`} style={{ left: `${p.x}%`, top: `${p.y}%` }} disabled={!unlocked} onClick={() => onOpen(c)} aria-label={`${c.title}, ${p.region}, ${unlocked ? "disponível" : "bloqueado"}`}><span>{String(c.num).padStart(2, "0")}</span><b>{c.title}</b><small>{p.region}</small></button>; })}
          </div>
        </div>
        <p className="ms-route-hint">PINÇA OU RODA DO MOUSE: ZOOM · ARRASTE COM UM DEDO: APROXIME-SE DE CADA REGIÃO</p>
      </section>
      <ol className="ms-chapters">
        {STORY_CHAPTERS.map((c, i) => {
          const unlocked = chapterUnlocked(cleared, i);
          const done = cleared.includes(c.id);
          const isFocus = (last ? c.id === last : i === Math.max(0, nextOpen));
          return (
            <li key={c.id} ref={isFocus ? (el) => { focus.current = el; } : undefined} className={`ms-chapter${done ? " is-done" : ""}${unlocked ? "" : " is-locked"}${i === nextOpen ? " is-next" : ""}`} style={{ ["--i" as string]: i }}>
              <div className="ms-chapter-art"><img src={c.thumb} alt="" loading="lazy" /><span>{String(c.num).padStart(2, "0")}</span></div>
              <div className="ms-chapter-body">
                <small>{done ? "CONCLUÍDO" : unlocked ? (i === nextOpen ? "NOVO" : "DISPONÍVEL") : "BLOQUEADO"} · NV RECOMENDADO {c.recommended}{unlocked && !done && playerLevel < c.recommended ? " ⚠" : ""}</small>
                <h2>{c.title}</h2>
                <p>{unlocked ? c.synopsis : `Vença “${STORY_CHAPTERS[i - 1].title}” para liberar.`}</p>
                <em>{done ? "Estreia recebida · replay paga as lutas" : `Estreia: ${c.reward.gold}g · ${c.reward.xp} XP · ${c.reward.qty}× ${ITEM_MAP[c.reward.item]?.name ?? c.reward.item}`}</em>
              </div>
              <button className={`ai-plate${unlocked && !done ? " is-primary" : ""}`} data-testid={`story-play-${c.id}`} disabled={!unlocked} onClick={() => onOpen(c)}>{done ? "REJOGAR" : unlocked ? "JOGAR" : "🔒"}</button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// ------------------------------------------------------------------ cena
function StoryScene({ chapter, beat, stepKey, log, onLine, onAdvance, onChoose, onFight, onSkip, onExit, hasTeam }: {
  chapter: StoryChapter;
  beat: StoryChapter["beats"][number] | undefined;
  stepKey: string;
  log: LogEntry[];
  onLine: (l: StoryLine) => void;
  onAdvance: () => void;
  onChoose: (b: StoryChoice, value: string) => void;
  onFight: () => void;
  onSkip: () => void;
  onExit: () => void;
  hasTeam: boolean;
}) {
  const still = useMemo(reducedMotion, []);
  const [title, setTitle] = useState(true);
  const [shown, setShown] = useState(0);
  const [auto, setAuto] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [slots, setSlots] = useState<{ left?: SpeakerId; right?: SpeakerId }>({});
  const line = beat?.kind === "line" ? beat : undefined;
  const full = line?.text.length ?? 0;
  const typing = !!line && shown < full;

  useEffect(() => { if (title) { const t = setTimeout(() => setTitle(false), still ? 900 : 2600); return () => clearTimeout(t); } }, [title, still]);

  // nova fala: registra no log, ocupa o lado do retrato, reinicia a datilografia
  useEffect(() => {
    if (!line) return;
    onLine(line);
    const sp = SPEAKERS[line.who];
    if (sp.portrait) {
      const side = ALLIES.includes(line.who) ? "left" : "right";
      setSlots((s) => (s[side] === line.who ? s : { ...s, [side]: line.who }));
    }
    setShown(still ? line.text.length : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepKey]);

  useEffect(() => {
    if (!typing || title) return;
    const t = setInterval(() => setShown((n) => Math.min(full, n + 2)), 28);
    return () => clearInterval(t);
  }, [typing, full, title, stepKey]);

  useEffect(() => {
    if (!auto || !line || typing || title || logOpen) return;
    const t = setTimeout(onAdvance, 900 + full * 28);
    return () => clearTimeout(t);
  }, [auto, line, typing, title, logOpen, full, onAdvance]);

  const tap = useCallback(() => {
    if (title) { setTitle(false); return; }
    if (logOpen || !line) return;
    if (typing) setShown(full); else onAdvance();
  }, [title, logOpen, line, typing, full, onAdvance]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key === " " || e.key === "Enter") {
        if (beat?.kind === "battle" && !title && !logOpen) { if (hasTeam) onFight(); e.preventDefault(); return; }
        if (line || title) { e.preventDefault(); tap(); }
      } else if (e.key.toLowerCase() === "a") setAuto((v) => !v);
      else if (e.key === "Escape") { if (logOpen) setLogOpen(false); else onSkip(); }
      else if (beat?.kind === "choice" && /^[1-9]$/.test(e.key)) {
        const opt = beat.options[Number(e.key) - 1];
        if (opt) onChoose(beat, opt.value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [beat, line, title, logOpen, tap, onSkip, onChoose, onFight, hasTeam]);

  const speaker = line ? SPEAKERS[line.who] : undefined;
  const activeSide = line && speaker?.portrait ? (ALLIES.includes(line.who) ? "left" : "right") : null;
  const fx = line?.fx && !still ? line.fx : undefined;
  const enemies = beat?.kind === "battle" ? beat.enemies : [];

  return (
    <div className={`ms-root ms-scene${fx ? ` fx-${fx}` : ""}`} data-testid="story-scene" data-step={stepKey}>
      <img className={`ms-bg${still ? " is-still" : ""}`} src={chapter.art} alt="" />
      <div className="ms-shade is-scene" />
      {fx === "flash" && <div className="ms-flash" key={`f${stepKey}`} />}
      {fx === "alarm" && <div className="ms-alarm" key={`a${stepKey}`} />}

      <header className="ms-scene-bar">
        <span>CAP. {chapter.num} · {chapter.title}</span>
        <div>
          <button className="ai-plate" aria-pressed={logOpen} onClick={() => setLogOpen((v) => !v)}>LOG</button>
          <button className="ai-plate" aria-pressed={auto} data-testid="story-auto" onClick={() => setAuto((v) => !v)}>AUTO</button>
          <button className="ai-plate" data-testid="story-skip" onClick={onSkip}>PULAR ▸▸</button>
          <button className="ai-plate" onClick={onExit}>SAIR</button>
        </div>
      </header>

      <div className="ms-stage">
        {(["left", "right"] as const).map((side) => {
          const id = slots[side];
          if (!id) return null;
          const sp = SPEAKERS[id];
          const isNpcBust = (sp.portrait ?? "").includes("/busts/");
          return (
            <img key={`${side}-${id}`} src={sp.portrait} alt={sp.name}
              className={`ms-portrait is-${side}${activeSide === side ? " is-active" : activeSide ? " is-dim" : " is-idle"}${isNpcBust ? " is-bust" : ""}`}
              style={{ ["--tone" as string]: sp.tone }} />
          );
        })}
      </div>

      {line && (
        <button type="button" data-skin="none" className="ms-dialog" onClick={tap} aria-live="polite" data-testid="story-dialog" style={{ ["--tone" as string]: speaker?.tone }}>
          {speaker?.name && <span className="ms-name">{speaker.name}</span>}
          <span className={`ms-text${line.who === "narrador" ? " is-narration" : ""}${line.who === "sistema" ? " is-system" : ""}`}>
            {line.text.slice(0, shown)}<span className="ms-ghost" aria-hidden>{line.text.slice(shown)}</span>
          </span>
          {!typing && <span className="ms-caret" aria-hidden>▼</span>}
        </button>
      )}

      {beat?.kind === "choice" && !title && (
        <section className="ms-choice" data-testid="story-choice">
          <h3>{beat.prompt}</h3>
          {beat.options.map((o, i) => <button key={o.value} className="ai-plate" data-testid={`story-choice-${o.value}`} onClick={() => onChoose(beat, o.value)}><b>{i + 1}</b>{o.label}</button>)}
        </section>
      )}

      {beat?.kind === "battle" && !title && (
        <section className="ms-vs" data-testid="story-battle-intro">
          <small>CONFRONTO</small>
          <h3>{beat.label}</h3>
          <div className="ms-vs-row">
            <img src="/busts/aurorion_bust.png" alt="Seu esquadrão" />
            <strong>VS</strong>
            <div className="ms-vs-enemies">{enemies.map((e, i) => <figure key={`${e.id}-${i}`}><img src={`/busts/${e.id}_bust.png`} alt="" /><figcaption>{ROBOT_MAP[e.id]?.name ?? e.id} · NV {e.level}</figcaption></figure>)}</div>
          </div>
          {hasTeam
            ? <button className="ai-plate is-primary" data-testid="story-fight" onClick={onFight}>LUTAR ▸</button>
            : <p className="ms-warn">Monte uma equipe no Hangar para lutar.</p>}
        </section>
      )}

      {logOpen && (
        <section className="ms-log" aria-label="Histórico de diálogos">
          <header><strong>HISTÓRICO</strong><button className="ai-plate" onClick={() => setLogOpen(false)}>FECHAR</button></header>
          <ol>{log.map((l, i) => <li key={i}><b style={{ color: SPEAKERS[l.who].tone }}>{SPEAKERS[l.who].name || "—"}</b>{l.text}</li>)}</ol>
        </section>
      )}

      {title && (
        <div className="ms-title-card" onClick={() => setTitle(false)} data-testid="story-title">
          <i className="ms-bar top" /><i className="ms-bar bottom" />
          <small>CAPÍTULO {chapter.num}</small>
          <h2>{chapter.title}</h2>
          <p>{chapter.subtitle}</p>
        </div>
      )}
    </div>
  );
}
