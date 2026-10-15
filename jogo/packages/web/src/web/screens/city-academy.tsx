import { useState } from "react";
import { CityStage, CityArt, CityHeading, CityMeter, CityToast, CityHelp, RelicArt } from "@/components/city-stage";
import { RobotSprite, PixelButton } from "@/components/pixel";
import { useGame } from "@/game/save";
import { ROBOT_MAP, faceUrl } from "@/game/robots";
import { TALENT_NODES, talentBudget, cityBonus } from "@/game/expansion";
import { talentCost, type DrillBranch } from "@/game/city-development";
import { learnTalent, resetTalents } from "@/game/city-actions";
import { runSimulation } from "@/game/city-research-actions";

const BRANCHES = [{ name: "OFENSIVA", stat: "str" as DrillBranch, desc: "Golpes, foco e supremacia." }, { name: "FORTIFICAÇÃO", stat: "def" as DrillBranch, desc: "Armadura, égide e vitalidade." }, { name: "TECNOLOGIA", stat: "agl" as DrillBranch, desc: "Sincronia, reserva e agilidade." }];
export function AcademyScreen({ onBack }: { onBack: () => void }) {
  const g = useGame(), e = g.expansion;
  const [robotId, setRobot] = useState(g.team[0] ?? g.robots[0]?.id ?? ""), [selected, setSelected] = useState("atk_0"), [note, setNote] = useState(""), [reset, setReset] = useState(false), [pulse, setPulse] = useState(0);
  const robot = g.robots.find((r) => r.id === robotId), def = ROBOT_MAP[robotId];
  const learned = e.talents[robotId] ?? [], budget = talentBudget(g, robotId), bonus = cityBonus(g, robotId);
  const node = TALENT_NODES.find((n) => n.id === selected) ?? TALENT_NODES[0], owned = learned.includes(node.id);
  const previous = node.tier === 0 || learned.includes(TALENT_NODES.find((n) => n.branch === node.branch && n.tier === node.tier - 1)!.id);
  const capped = node.tier === 3 && learned.some((id) => TALENT_NODES.some((n) => n.id === id && n.tier === 3));
  const cost = talentCost(e, node.tier), power = e.distribution.academy ?? 0;
  const records = e.development.drills[robotId] ?? {};
  const simulate = (branch: DrillBranch) => { const ok = runSimulation(robotId, branch); if (ok) setPulse((n) => n + 1); setNote(ok ? `Simulação concluída: +${25 + power * 3} maestria. Certificação avançou; a cada 5 sessões, +1 ${branch.toUpperCase()} permanente.` : "Cargas, energia ou ouro insuficientes, ou certificação completa."); };
  return <CityStage system="academy" onBack={onBack} subtitle="LABORATÓRIO DE TALENTOS · SIMULAÇÃO TÁTICA">
    <CityHeading tag={`REDE ${power} P · ${e.development.drillCharges}/5 CARGAS DE SIMULAÇÃO`} title="Forje o próximo campeão.">Três árvores. Um ápice por chassi. Treine, certifique e monte sua especialização.</CityHeading>
    <div className="mk-academy-roster" aria-label="Seleção de chassi">{g.robots.map((r) => <button key={r.id} aria-pressed={r.id === robotId} onClick={() => { setRobot(r.id); setReset(false); setNote(""); }}><img src={faceUrl(r.id)} alt="" width={40} height={40} /><span>{ROBOT_MAP[r.id]?.name}<small>LV {r.level}</small></span></button>)}</div>
    <div className="mk-academy-workspace">
      <section className="mk-academy-chamber">
        <CityArt name="academy" className="mk-city-scene-fill" />
        <div className="mk-city-scene-vignette" />
        <div className="mk-academy-chassis" key={`${robotId}-${pulse}`}><RobotSprite robotId={robotId} size={180} /><div className={pulse ? "mk-academy-pulse" : ""} aria-hidden="true" /></div>
        <div className="mk-academy-chamber-hud"><span className="mk-city-kicker">CHASSI EM ANÁLISE</span><h2>{def?.name}</h2><p>LV {robot?.level ?? 1} · {g.mastery[robotId]?.pts ?? 0} MAESTRIA</p><CityMeter value={budget - learned.length} max={budget} label="PONTOS DISPONÍVEIS" tone="gold" /></div>
        <div className="mk-academy-bonus">{Object.entries(bonus).map(([stat, value]) => <span key={stat}><small>{stat.toUpperCase()}</small><b>+{value}</b></span>)}</div>
      </section>
      <section className="mk-talent-workbench" aria-label="Árvores de talentos">
        <div className="mk-talent-trees">{BRANCHES.map((branch, b) => <div className={`mk-talent-tree mk-talent-tree-${b}`} key={branch.name}>
          <header><h2>{branch.name}</h2><p>{branch.desc}</p></header>
          {TALENT_NODES.filter((n) => n.branch === b).map((n) => {
            const done = learned.includes(n.id), unlocked = n.tier === 0 || learned.includes(TALENT_NODES.find((p) => p.branch === b && p.tier === n.tier - 1)!.id);
            return <button key={n.id} className={`mk-talent-node${done ? " is-learned" : ""}${!unlocked ? " is-locked" : ""}${selected === n.id ? " is-selected" : ""}`} aria-pressed={selected === n.id} onClick={() => setSelected(n.id)}>
              <span className="mk-talent-node-connector" aria-hidden="true" /><RelicArt index={b * 4 + n.tier} size={44} locked={!unlocked && !done} />
              <strong>{n.name}</strong><span>{n.stat.toUpperCase()} +{n.value}</span><small>{done ? "APRENDIDO" : n.tier === 3 ? "ÁPICE EXCLUSIVO" : unlocked ? "DISPONÍVEL" : "REQUER ANTERIOR"}</small>
            </button>;
          })}
        </div>)}</div>
        <aside className="mk-talent-inspector mk-city-console"><div><span className="mk-city-kicker">NÓ {node.tier + 1} · {BRANCHES[node.branch].name}</span><h2>{node.name}</h2><p>+{node.value} {node.stat.toUpperCase()} permanente em batalha.</p><p className="mk-city-muted">{owned ? "Talento aprendido para este chassi." : !previous ? "Aprenda o nó anterior desta árvore." : capped ? "Você já escolheu outro ápice. Reinicie para trocar." : budget <= learned.length ? "Pontos esgotados: avance nível ou maestria." : `${cost} ouro · 3 energia · 1 ponto de talento`}</p></div>
          <PixelButton disabled={owned || !previous || capped || learned.length >= budget || g.gold < cost || e.energy < 3 || !power} onClick={() => { if (learnTalent(robotId, node.id)) { setPulse((n) => n + 1); setNote(`${node.name} integrado ao chassi.`); } else setNote("Requisitos não atendidos."); }}>{owned ? "APRENDIDO" : "INTEGRAR TALENTO"}</PixelButton>
        </aside>
      </section>
    </div>
    <CityToast>{note || (!power ? "Academia desligada. Alimente o prédio na usina." : "Selecione um nó para visualizar custo e requisitos. Os bônus exibidos incluem talentos, certificações e museu.")}</CityToast>
    <section className="mk-academy-simulations"><header><span className="mk-city-kicker">SIMULADOR HOLOGRÁFICO</span><h2>CERTIFICAÇÕES DE CAMPO</h2><p>1 carga + 80 ouro + 2 energia por sessão. Cada batalha concluída repõe uma carga, até 5.</p></header>
      <div className="mk-academy-sim-lanes">{BRANCHES.map((branch, i) => { const completed = records[branch.stat] ?? 0; return <div key={branch.stat} className="mk-city-console"><span className="mk-city-kicker">PROTOCOLO {i + 1}</span><h3>{branch.name}</h3><CityMeter value={completed} max={20} label="SESSÕES" /><p>Certificação: +{Math.min(4,Math.floor(completed / 5))} {branch.stat.toUpperCase()} · próximo bônus em {completed >= 20 ? 0 : 5 - completed % 5} sessões.</p><PixelButton disabled={!power || !e.development.drillCharges || g.gold < 80 || e.energy < 2 || completed >= 20} onClick={() => simulate(branch.stat)}>{completed >= 20 ? "CERTIFICAÇÃO COMPLETA" : `SIMULAR · +${25 + power * 3} MAESTRIA`}</PixelButton></div>; })}</div>
    </section>
    <div className="mk-academy-reset">{reset ? <><p>Reiniciar devolve os pontos e remove os talentos. Compras não são reembolsadas. Certificações permanecem.</p><PixelButton disabled={g.gold < 300} onClick={() => { resetTalents(robotId); setReset(false); setNote("Talentos reiniciados. Certificações e maestria preservadas."); }}>CONFIRMAR · 300 OURO</PixelButton><button className="mk-city-text-button" onClick={() => setReset(false)}>CANCELAR</button></> : <button className="mk-city-text-button" disabled={!learned.length || g.gold < 300} onClick={() => setReset(true)}>REINICIAR ESPECIALIZAÇÃO · 300 OURO</button>}</div>
    <CityHelp>Você recebe 2 pontos iniciais, +1 a cada 5 níveis do robô e +1 a cada 500 de maestria (máximo 8). Cada árvore tem quatro nós sequenciais; só um ápice pode ser aprendido. Potência extra reduz o custo de talentos em 5% por ponto acima do primeiro e amplia a maestria das simulações. Simulações não contam como vitórias.</CityHelp>
  </CityStage>;
}