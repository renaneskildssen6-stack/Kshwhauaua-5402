import { useState } from "react";
import { CityStage, CityArt, CityHeading, CityMeter, CityToast, CityHelp } from "@/components/city-stage";
import { PixelButton } from "@/components/pixel";
import { useGame } from "@/game/save";
import { ROUTES, relicSetCount } from "@/game/expansion";
import { APPROACHES, routeCost, routeDanger, type ExpeditionApproach } from "@/game/city-development";
import { startExpedition, expeditionChoice, evacuateExpedition } from "@/game/city-actions";
import { upgradeRoute } from "@/game/city-research-actions";

const POSITIONS = [[17,27],[45,19],[77,32],[84,68],[51,79],[22,67]];
const SIGNALS = ["ECO DE REATOR", "ARQUIVO FRAGMENTADO", "ÓRBITA ABANDONADA", "FREQUÊNCIA ANCESTRAL", "RUNA MECÂNICA", "CONSTELAÇÃO PERDIDA", "MEMÓRIA DE PILOTO", "ASSINATURA DO GUARDIÃO"];
export function ObservatoryScreen({ onBack }: { onBack: () => void }) {
  const g = useGame(), e = g.expansion, job = e.expedition;
  const [selected, setSelected] = useState(0), [approach, setApproach] = useState<ExpeditionApproach>("balanced"), [note, setNote] = useState(""), [evacuate, setEvacuate] = useState(false), [signal, setSignal] = useState(0);
  const index = job ? Math.max(0, ROUTES.findIndex((r) => r.id === job.route)) : selected;
  const route = ROUTES[index], research = e.development.routeResearch[route.id] ?? 0;
  const actualApproach = job?.approach ?? approach;
  const cost = routeCost(e, route.id, route.cost), danger = routeDanger(e, route.id, route.risk, actualApproach);
  const discovered = e.discoveries.filter((id) => id.startsWith(`${route.id}_`)).length;
  return <CityStage system="observatory" onBack={onBack} subtitle="CARTA ESTELAR · EXPLORAÇÃO E SINAIS">
    <CityHeading tag={`ATLAS ${e.discoveries.length}/48 · ${e.counters.expeditions ?? 0} ROTAS CONCLUÍDAS`} title="Além da última estrela.">Escolha uma constelação. Faça ciência, recupere carga ou arrisque um avanço.</CityHeading>
    <div className="mk-observatory-workspace">
      <section className="mk-star-chart" aria-label="Carta estelar com seis rotas de expedição">
        <CityArt name="observatory" className="mk-city-scene-fill" />
        <div className="mk-city-scene-vignette" />
        <div className="mk-star-scan" aria-hidden="true" />
        <svg className="mk-star-lines" viewBox="0 0 1000 700" preserveAspectRatio="none" aria-hidden="true"><path d="M170 189 L450 133 L770 224 L840 476 L510 553 L220 469 Z" /></svg>
        {ROUTES.map((r, i) => <button key={r.id} className={`mk-star-node mk-star-node-${i}${i === index ? " is-selected" : ""}`} style={{ left: `${POSITIONS[i][0]}%`, top: `${POSITIONS[i][1]}%` }} aria-pressed={i === index} disabled={!!job && i !== index} onClick={() => { setSelected(i); setSignal(0); setEvacuate(false); }}>
          <span className="mk-star-planet" aria-hidden="true" /><strong>{r.name}</strong><small>{e.discoveries.filter((id) => id.startsWith(`${r.id}_`)).length}/8 SINAIS · PESQ. {e.development.routeResearch[r.id] ?? 0}</small>
        </button>)}
        <div className="mk-star-chart-label">{job ? `EXPEDIÇÃO EM CURSO / SETOR ${index + 1}` : "SELECIONE UMA CONSTELAÇÃO"}<span>MAPEAMENTO PERSISTENTE</span></div>
      </section>
      <aside className="mk-observatory-flight mk-city-console">
        <span className="mk-city-kicker">SETOR {String(index + 1).padStart(2,"0")} · PESQUISA {research}/3</span><h2>{route.name}</h2><p>{route.desc}</p>
        <div className="mk-city-facts"><span>{route.length}<small>ETAPAS</small></span><span>{danger}%<small>RISCO ATUAL</small></span><span>{relicSetCount(e, route.set)}/4<small>RELÍQUIAS</small></span></div>
        {job ? <>
          <CityMeter label="PERCURSO" value={job.step} max={route.length} />
          <div className="mk-expedition-path">{Array.from({ length: route.length }, (_, i) => <span key={i} className={i < job.step ? "is-done" : i === job.step ? "is-current" : ""}>{i + 1}</span>)}</div>
          <div className="mk-city-facts"><span>{job.supply}<small>PROVISÕES</small></span><span>{job.cargo}<small>CARGA / OURO</small></span></div>
          <div className="mk-expedition-options">
            <button onClick={() => { setNote(expeditionChoice("scan")); setEvacuate(false); }}><b>ESCANEAR</b><span>Seguro · {actualApproach === "survey" ? 1 : 2} provisões · +1 sinal ausente</span></button>
            <button onClick={() => { setNote(expeditionChoice("rush")); setEvacuate(false); }}><b>AVANÇAR</b><span>1 provisão · {danger}% risco · carga média</span></button>
            <button onClick={() => { setNote(expeditionChoice("salvage")); setEvacuate(false); }}><b>INVESTIGAR</b><span>1 provisão · {routeDanger(e, route.id, route.risk, actualApproach, true)}% risco · carga alta</span></button>
          </div>
          {evacuate ? <div className="mk-city-confirm"><p>Recuperar metade da carga e encerrar a expedição?</p><PixelButton onClick={() => { evacuateExpedition(); setEvacuate(false); setNote("Expedição evacuada: metade da carga foi recuperada."); }}>CONFIRMAR EVACUAÇÃO</PixelButton><button onClick={() => setEvacuate(false)}>MANTER EXPEDIÇÃO</button></div> : <button className="mk-city-text-button" onClick={() => setEvacuate(true)}>EVACUAR</button>}
        </> : <>
          <span className="mk-city-kicker">PREPARAÇÃO DA EQUIPE</span>
          <div className="mk-expedition-approaches">{APPROACHES.map((a) => <button key={a.id} aria-pressed={approach === a.id} onClick={() => setApproach(a.id)}><b>{a.name}</b><span>{a.desc}</span></button>)}</div>
          <PixelButton disabled={!e.distribution.observatory || e.energy < cost} onClick={() => setNote(startExpedition(route.id, approach) ? "Expedição lançada. Escolha seu próximo passo no setor." : "Sem energia ou alimentação suficiente.")}>LANÇAR · {cost} ENERGIA</PixelButton>
          <PixelButton disabled={research >= 3 || !e.distribution.observatory || e.energy < 5 || g.gold < 250 * (research + 1)} onClick={() => setNote(upgradeRoute(route.id) ? "Sondas melhoradas: menos custo, menos risco, mais provisões." : "Pesquisa indisponível.")}>{research >= 3 ? "SONDAS NO MÁXIMO" : `MELHORAR SONDAS · ${250 * (research + 1)} OURO + 5 E`}</PixelButton>
          <p className="mk-city-muted">Cada pesquisa: −2 custo, −5% risco e +2 provisões. Máximo 3 níveis por rota.</p>
        </>}
      </aside>
    </div>
    <CityToast>{note || (!e.distribution.observatory ? "Observatório sem alimentação: distribua pelo menos 1 ponto na usina." : "As constelações guardam 48 sinais e seis conjuntos ancestrais.")}</CityToast>
    <section className="mk-observatory-atlas"><div><span className="mk-city-kicker">ARQUIVO DE SINAIS · {route.name}</span><h2>{discovered}/8 DESCOBERTAS</h2><div className="mk-atlas-signals">{SIGNALS.map((name, i) => {
      const owned = e.discoveries.includes(`${route.id}_${i}`);
      return <button key={name} aria-pressed={signal === i} className={owned ? "is-discovered" : ""} onClick={() => setSignal(i)}><span>{String(i + 1).padStart(2,"0")}</span><small>{owned ? name : "SINAL NÃO MAPEADO"}</small></button>;
    })}</div></div><div className="mk-city-console"><span className="mk-city-kicker">LEITURA DO ATLAS</span><h2>{SIGNALS[signal]}</h2><p>{e.discoveries.includes(`${route.id}_${signal}`) ? `Registro ${signal + 1} catalogado em ${route.name}. As sondas confirmaram uma assinatura única: ${SIGNALS[signal].toLowerCase()}. Este registro conta permanentemente para suas missões de cartografia.` : "Ainda não catalogado. Escaneie etapas desta rota para revelar sinais ausentes em ordem. Não é necessário repetir a mesma descoberta."}</p>{job && <div className="mk-expedition-log">{job.log.slice(-4).reverse().map((line, i) => <p key={`${i}-${line}`}>{line}</p>)}</div>}</div></section>
    <CityHelp>Escanear nunca causa emboscadas. Investigar e avançar arriscam perda de três provisões extras, mas preservam a carga anterior. Ao concluir, a carga vira ouro e uma relíquia ausente é catalogada. Sem provisões antes da última etapa, a equipe volta com metade da carga. Energia e pesquisa não dependem de tempo real.</CityHelp>
  </CityStage>;
}