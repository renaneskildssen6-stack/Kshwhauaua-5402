import { getState, setState, addPlayerXP } from "./save";
import type { RobotSave } from "./engine";

export const TUTORIAL_CHAPTERS = [
  { title:"O SINAL NO ESCURO", mentor:"COMANDANTE LYRA", enemy:"ferrovax", text:"A cidade perdeu seus campeões. Mas um sinal ainda pulsa no hangar: Aurorion escolheu você. Os quatro ataques aparecem com nome e custo no painel de comandos. Toque no ‘i’ para conhecer um golpe e vença o sentinela de treinamento.", hint:"Escolha um dos 4 ataques. ‘i’ explica sem gastar seu turno.", gold:80 },
  { title:"NÃO É SÓ FORÇA", mentor:"LYRA · CANAL TÁTICO", enemy:"cryolance", text:"O gelo de Cryolance pune quem ataca sem pensar. As duas defesas ficam na faixa DEFESAS, separadas dos ataques: reduza dano, repare o chassi ou recupere energia. Cada defesa também carrega seu ultimate em quatorze pontos.", hint:"Faixa DEFESAS → 2 opções. Observe HP, MP e efeitos ativos.", gold:100 },
  { title:"UM REATOR, UMA DECISÃO", mentor:"AURORION · NÚCLEO", enemy:"voltronin", text:"Eu sinto cada impacto. Atacar carrega dezoito pontos; defender carrega quatorze; receber dano também alimenta meu reator. A carga é só minha, não da equipe. Quando chegar a cem por cento, meu painel dourado de ULTIMATE libera o especial sem usar MP.", hint:"Painel ULTIMATE: 100%, sem MP. A carga volta a zero ao usar.", gold:120 },
  { title:"NENHUM PILOTO SOZINHO", mentor:"ENGENHEIRA NARA", enemy:"ferrovax", text:"Lyra enviou Ferrovax como reforço. Use TROCAR para revezar seu robô ativo: cada um guarda a própria carga. Há um kit de reparo na bancada; abra SUPRIMENTOS para usar itens, quando precisar.", hint:"TROCAR preserva carga individual. SUPRIMENTOS consome os itens usados.", gold:140 },
  { title:"A PRIMEIRA LUZ", mentor:"COMANDANTE LYRA", enemy:"cryolance", text:"Um esquadrão rival interceptou o sinal. Esta não é mais uma simulação: use ataques, defesas, itens, troca e ultimate para proteger o hangar. Depois, a Arena e o Coliseu são seus. Outros distritos aparecem conforme seu nível de piloto cresce.", hint:"Duas máquinas inimigas. Use informação, recursos e o seu reator.", gold:200 },
] as const;

const robot=(id:string):RobotSave=>({id,level:1,xp:0,trained:{str:0,def:0,agl:0}});
export function startTutorial():void {
  setState(s=>{
    if(s.tutorial.started || s.tutorial.completed)return s;
    const has=s.robots.some(r=>r.id==="aurorion");
    return {...s,robots:has?s.robots:[...s.robots,robot("aurorion")],team:s.team.length?s.team:["aurorion"],tutorial:{...s.tutorial,started:true}};
  });
}
/** Reward transaction is guarded by persisted chapter, so retries/reloads cannot duplicate it. */
export function completeTutorialChapter(chapter:number):boolean {
  const g=getState();if(!Number.isInteger(chapter)||!g.tutorial.started||g.tutorial.completed || g.tutorial.chapter!==chapter)return false;
  const mission=TUTORIAL_CHAPTERS[chapter];if(!mission)return false;
  setState(s=>{
    if(s.tutorial.chapter!==chapter || s.tutorial.completed)return s;
    const next=chapter+1;
    const grant=next===3&&!s.robots.some(r=>r.id==="ferrovax");
    return {...s,gold:s.gold+mission.gold,battlesWon:s.battlesWon+1,
      robots:grant?[...s.robots,robot("ferrovax")]:s.robots,
      team:grant?[...s.team,"ferrovax"].slice(0,4):s.team,
      items:next===3?{...s.items,repair_kit:(s.items.repair_kit??0)+1}:s.items,
      tutorial:{...s.tutorial,chapter:next,completed:next>=5}};
  });
  addPlayerXP(180);return true;
}
export function tutorialEnemy(chapter:number):RobotSave[] {
  const mission=TUTORIAL_CHAPTERS[chapter]??TUTORIAL_CHAPTERS[0];
  // Training sentinels are genuine AI opponents, with mission-specific tuning.
  if(chapter===0)return [{...robot(mission.enemy),statScale:0.55}];
  if(chapter===2)return [{...robot(mission.enemy),statScale:0.75,runBonus:{hp:150,str:-4}}];
  return chapter===4?[robot(mission.enemy),robot("voltronin")]:[robot(mission.enemy)];
}