import { useState } from "react";
import { BattleScreen } from "./battle";
import { RobotSprite } from "@/components/pixel";
import { useGame, spendItem, teamSaves } from "@/game/save";
import { TUTORIAL_CHAPTERS, completeTutorialChapter, tutorialEnemy } from "@/game/tutorial";
import type { RobotSave } from "@/game/engine";
import "./tutorial.css";

const practiceRobot=(id:string):RobotSave=>({id,level:1,xp:0,trained:{str:0,def:0,agl:0},borrowed:true});
export function TutorialScreen({practice,onExit}:{practice:boolean;onExit:()=>void}) {
  const g=useGame();
  const [chapter,setChapter]=useState(()=>practice?0:Math.min(4,g.tutorial.chapter));
  const [view,setView]=useState<"story"|"fight"|"win"|"lose"|"done">("story");
  const [attempt,setAttempt]=useState(0);
  const [dialoguePage,setDialoguePage]=useState(0);
  const [practiceItems,setPracticeItems]=useState<Record<string,number>>({repair_kit:1});
  const mission=TUTORIAL_CHAPTERS[chapter];
  const dialogue=mission.text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map(text=>text.trim())??[mission.text];
  const currentDialogue=Math.min(dialoguePage,dialogue.length-1);
  const advanceDialogue=()=>{if(currentDialogue<dialogue.length-1)setDialoguePage(n=>n+1);else setView("fight");};
  const team=practice?[practiceRobot("aurorion"),...(chapter>=3?[practiceRobot("ferrovax")]:[])]:teamSaves(g);
  const finish=(result:"win"|"lose")=>{
    if(result==="win"&&!practice)completeTutorialChapter(chapter);
    setView(result);
  };
  if(view==="fight")return <div className="mc-tutorial-battle">
    <BattleScreen key={`${chapter}-${attempt}`} arena="hangar" difficulty="facil" recordProgress={false}
      playerTeam={team} enemyTeam={tutorialEnemy(chapter)} items={practice?practiceItems:g.items}
      label={`MISSÃO ${chapter+1} · ${mission.title}`} onFinish={finish}
      onUseItem={id=>practice?setPracticeItems(items=>({...items,[id]:Math.max(0,(items[id]??0)-1)})):spendItem(id)}/>
    <div className="mc-tutorial-hint">{mission.hint}</div>
  </div>;
  return <div className="mc-story">
    <div className="mc-story-head"><span>{practice?"SIMULAÇÃO · SEM RECOMPENSAS":"OPERAÇÃO PRIMEIRA LUZ"}</span><button onClick={onExit}>SAIR</button></div>
    <div className="mc-story-progress" aria-label={`Missão ${chapter+1} de 5`}>{TUTORIAL_CHAPTERS.map((m,i)=><span key={m.title} data-active={i===chapter} data-done={i<chapter}>{String(i+1).padStart(2,"0")}</span>)}</div>
    <div className="mc-story-machine"><RobotSprite robotId={chapter>=3?"ferrovax":"aurorion"} size={208} clip="idle"/></div>
    <div className="mc-story-dialogue" role="status">
      <small>{view==="story"?mission.mentor:view==="lose"?"LYRA · CANAL DE RESGATE":"LYRA · RELATÓRIO"}</small>
      <h1>{view==="done"?"VOCÊ É UM CAMPEÃO":view==="win"?"SINAL PROTEGIDO":view==="lose"?"AINDA HÁ UMA CHANCE":mission.title}</h1>
      <p key={`${chapter}-${view}-${currentDialogue}`} className="mc-dialogue-line">{view==="story"?dialogue[currentDialogue]:view==="lose"?"Seu chassi voltou ao hangar. A missão não avança com uma derrota. Leia os golpes, combine ataques e defesas e tente de novo.":view==="done"?"O hangar está seguro. A cidade é sua: visite o Hangar, a Arena e o Coliseu. Novos sistemas aparecem com seu nível de piloto.":practice?"Objetivo concluído. Esta simulação não altera sua coleção, ouro, itens ou progresso.":`Missão concluída: +${mission.gold} ouro e +180 XP de piloto. ${chapter===2?"Ferrovax e um kit de reparo chegaram ao hangar.":"Seu próximo sinal está pronto."}`}</p>
      {view==="story"&&<div className="mc-dialogue-pages"><button disabled={currentDialogue===0} onClick={()=>setDialoguePage(n=>n-1)}>ANTERIOR</button><span>{currentDialogue+1}/{dialogue.length} · CANAL ABERTO</span><button onClick={()=>setDialoguePage(dialogue.length-1)}>LER OBJETIVO</button></div>}
      {view==="story"&&<blockquote>{mission.hint}</blockquote>}
      <button className="mc-story-primary" onClick={()=>{
        if(view==="story"){advanceDialogue();return;}
        if(view==="lose"){setAttempt(n=>n+1);setDialoguePage(0);setView("story");return;}
        if(view==="done"){onExit();return;}
        if(chapter===4){setView("done");return;}
        setChapter(n=>n+1);setDialoguePage(0);setView("story");
      }}>{view==="story"?currentDialogue<dialogue.length-1?"PRÓXIMA MENSAGEM":"INICIAR BATALHA":view==="lose"?"TENTAR NOVAMENTE":view==="done"?"ENTRAR NA CIDADE":"CONTINUAR"}</button>
      <small className="mc-story-save">{practice?"Cinco batalhas reais com esquadrão de treino isolado.":"Progresso salvo após cada vitória. Você pode retomar pelo título."}</small>
    </div>
  </div>;
}