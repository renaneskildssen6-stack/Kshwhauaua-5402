import { useMemo, useState } from "react";
import { BattleScreen } from "./battle";
import { RobotSprite } from "@/components/pixel";
import { useGame, spendItem, teamSaves } from "@/game/save";
import { TUTORIAL_CHAPTERS, completeTutorialChapter, tutorialEnemy } from "@/game/tutorial";
import type { RobotSave } from "@/game/engine";
import "./tutorial.css";

const practiceRobot = (id: string): RobotSave => ({ id, level: 1, xp: 0, trained: { str: 0, def: 0, agl: 0 }, borrowed: true });

export function TutorialScreen({ practice, onExit }: { practice: boolean; onExit: () => void }) {
  const g = useGame();
  const [chapter, setChapter] = useState(() => practice ? 0 : Math.min(4, g.tutorial.chapter));
  const [view, setView] = useState<"story" | "fight" | "win" | "lose" | "done">("story");
  const [attempt, setAttempt] = useState(0);
  const [dialoguePage, setDialoguePage] = useState(0);
  const [practiceItems, setPracticeItems] = useState<Record<string, number>>({ repair_kit: 1 });
  const mission = TUTORIAL_CHAPTERS[chapter];
  const dialogue = useMemo(() => mission.text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((text) => text.trim()) ?? [mission.text], [mission.text]);
  const currentDialogue = Math.min(dialoguePage, dialogue.length - 1);
  const completed = practice ? chapter : Math.min(chapter, g.tutorial.chapter);
  const progress = Math.round((completed / TUTORIAL_CHAPTERS.length) * 100);
  const team = practice ? [practiceRobot("aurorion"), ...(chapter >= 3 ? [practiceRobot("ferrovax")] : [])] : teamSaves(g);
  const advanceDialogue = () => { if (currentDialogue < dialogue.length - 1) setDialoguePage((n) => n + 1); else setView("fight"); };
  const finish = (result: "win" | "lose") => { if (result === "win" && !practice) completeTutorialChapter(chapter); setView(result); };

  if (view === "fight") return <div className="mc-tutorial-battle"><BattleScreen key={`${chapter}-${attempt}`} arena="hangar" difficulty="facil" recordProgress={false} playerTeam={team} enemyTeam={tutorialEnemy(chapter)} items={practice ? practiceItems : g.items} label={`MISSÃO ${chapter + 1} · ${mission.title}`} onFinish={finish} onUseItem={(id) => practice ? setPracticeItems((items) => ({ ...items, [id]: Math.max(0, (items[id] ?? 0) - 1) })) : spendItem(id)} /><div className="mc-tutorial-hint"><b>OBJETIVO TÁTICO</b>{mission.hint}</div></div>;

  const resultTitle = view === "done" ? "VOCÊ É UM CAMPEÃO" : view === "win" ? "SINAL PROTEGIDO" : view === "lose" ? "AINDA HÁ UMA CHANCE" : mission.title;
  const resultText = view === "story" ? dialogue[currentDialogue] : view === "lose" ? "Seu chassi voltou ao hangar. A missão não avança com uma derrota. Leia os golpes, combine ataques e defesas e tente de novo." : view === "done" ? "O hangar está seguro. A cidade é sua: visite o Hangar, a Arena e o Coliseu. Novos sistemas aparecem com seu nível de piloto." : practice ? "Objetivo concluído. Esta simulação não altera sua coleção, ouro, itens ou progresso." : `Missão concluída: +${mission.gold} ouro e +180 XP de piloto. ${chapter === 2 ? "Ferrovax e um kit de reparo chegaram ao hangar." : "Seu próximo sinal está pronto."}`;
  const cta = view === "story" ? currentDialogue < dialogue.length - 1 ? "PRÓXIMA MENSAGEM" : "INICIAR BATALHA" : view === "lose" ? "TENTAR NOVAMENTE" : view === "done" ? "ENTRAR NA CIDADE" : "CONTINUAR";

  return <div className="mc-story mc-tutorial-command">
    <header className="mc-story-head"><button onClick={onExit}>‹ SAIR</button><span>{practice ? "SIMULAÇÃO · SEM RECOMPENSAS" : "OPERAÇÃO PRIMEIRA LUZ"}</span><strong>{String(chapter + 1).padStart(2, "0")} / {String(TUTORIAL_CHAPTERS.length).padStart(2, "0")}</strong></header>
    <section className="mc-tutorial-meter" aria-label={`Progresso ${progress}%`}><div><small>PROGRESSO DA ACADEMIA</small><b>{progress}%</b></div><span><i style={{ width: `${progress}%` }} /></span><em>{completed === 0 ? "PRIMEIRO SINAL" : completed >= TUTORIAL_CHAPTERS.length ? "CERTIFICADO" : "TREINAMENTO EM ANDAMENTO"}</em></section>
    <nav className="mc-story-progress" aria-label={`Missão ${chapter + 1} de ${TUTORIAL_CHAPTERS.length}`}>{TUTORIAL_CHAPTERS.map((m, i) => <button key={m.title} type="button" data-active={i === chapter} data-done={i < completed} onClick={() => { if (practice || i <= g.tutorial.chapter) { setChapter(i); setDialoguePage(0); setView("story"); } }} disabled={!practice && i > g.tutorial.chapter}><span>{String(i + 1).padStart(2, "0")}</span><small>{m.title}</small></button>)}</nav>
    <main className="mc-tutorial-main"><aside className="mc-tutorial-brief"><small>ARQUIVO DE MISSÃO</small><b>{mission.mentor}</b><span>ALVO CONFIRMADO</span><strong>{mission.enemy.toUpperCase()}</strong><div><span>RECOMPENSA</span><b>+{mission.gold} OURO</b></div><div><span>DIFICULDADE</span><b>{chapter === 4 ? "FINAL" : chapter >= 2 ? "TÁTICA" : "INICIAL"}</b></div></aside><div className="mc-story-machine"><div className="mc-machine-scan">UNIDADE DE COMANDO · {String(chapter + 1).padStart(2, "0")}</div><RobotSprite robotId={chapter >= 3 ? "ferrovax" : "aurorion"} size={208} clip="idle" /><div className="mc-machine-floor" /></div><section className="mc-story-dialogue" role="status"><div className="mc-dialogue-top"><small>{view === "story" ? mission.mentor : view === "lose" ? "LYRA · CANAL DE RESGATE" : "LYRA · RELATÓRIO"}</small><span>{view === "story" ? `TRANSMISSÃO ${currentDialogue + 1}/${dialogue.length}` : "REGISTRO ATUALIZADO"}</span></div><h1>{resultTitle}</h1><p className="mc-dialogue-line">{resultText}</p>{view === "story" && <div className="mc-dialogue-pages"><button disabled={currentDialogue === 0} onClick={() => setDialoguePage((n) => n - 1)}>ANTERIOR</button><span>{currentDialogue + 1}/{dialogue.length} · CANAL ABERTO</span><button onClick={() => setDialoguePage(dialogue.length - 1)}>LER OBJETIVO</button></div>}{view === "story" && <blockquote><b>LEITURA TÁTICA</b>{mission.hint}</blockquote>}<button className="mc-story-primary" onClick={() => { if (view === "story") { advanceDialogue(); return; } if (view === "lose") { setAttempt((n) => n + 1); setDialoguePage(0); setView("story"); return; } if (view === "done") { onExit(); return; } if (chapter === 4) { setView("done"); return; } setChapter((n) => n + 1); setDialoguePage(0); setView("story"); }}>{cta}</button><small className="mc-story-save">{practice ? "Cinco batalhas de treino isoladas. Nenhum recurso é consumido." : "Progresso salvo após cada vitória. Você pode retomar pelo título."}</small></section></main>
  </div>;
}
