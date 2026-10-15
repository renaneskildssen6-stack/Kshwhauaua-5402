import { useState } from "react";
import { CityStage, CityArt, CityHeading, CityMeter, CityToast, CityHelp } from "@/components/city-stage";
import { PixelButton } from "@/components/pixel";
import { useGame } from "@/game/save";
import { MISSIONS, MISSION_MAP, CONTRACT_CHAINS, missionReady, metricValue, type Mission } from "@/game/expansion";
import { contractRank } from "@/game/city-development";
import { claimContract } from "@/game/city-actions";
import { toggleTrackedContract, claimContractChain, CONTRACT_MILESTONES, claimContractMilestone } from "@/game/city-research-actions";

export function ContractsScreen({ onBack }: { onBack: () => void }) {
  const g = useGame(), e = g.expansion;
  const [chain, setChain] = useState(0), [selected, setSelected] = useState("contract_0_0"), [search, setSearch] = useState(""), [filter, setFilter] = useState("active"), [page, setPage] = useState(0), [note, setNote] = useState("");
  const readyCount = MISSIONS.filter((m) => missionReady(g, m)).length;
  const claimed = e.missionsClaimed.length, tracked = e.development.tracked;
  const mission = MISSION_MAP[selected] ?? MISSIONS[0];
  const selectedClaimed = e.missionsClaimed.includes(mission.id), ready = missionReady(g, mission), locked = !!mission.prev && !e.missionsClaimed.includes(mission.prev);
  const list = MISSIONS.filter((m) => {
    if (chain >= 0 && m.chain !== chain || !`${m.name} ${m.goals.map((o) => o.label).join(" ")}`.toLowerCase().includes(search.toLowerCase())) return false;
    const done = e.missionsClaimed.includes(m.id), unlocked = !m.prev || e.missionsClaimed.includes(m.prev);
    return filter === "ready" ? missionReady(g, m) : filter === "claimed" ? done : filter === "tracked" ? tracked.includes(m.id) : filter === "active" ? !done && unlocked : true;
  });
  const pages = Math.max(1,Math.ceil(list.length / 12)), current = Math.min(page,pages - 1);
  const focus = (m: Mission) => { setSelected(m.id); setChain(m.chain); setPage(0); };
  const selectChain = (index: number) => { const next = MISSIONS.find((m) => m.chain === index && !e.missionsClaimed.includes(m.id)) ?? MISSIONS.filter((m) => m.chain === index)[14]; setChain(index); setSelected(next.id); setPage(0); };
  return <CityStage system="contracts" onBack={onBack} subtitle="CENTRAL DE OPERAÇÕES · 360 CONTRATOS">
    <CityHeading tag={`PATENTE ${contractRank(claimed)} · ${claimed}/360 RESGATADAS · ${readyCount} PRONTAS`} title="Cada missão deixa uma marca.">Selecione uma operação no mapa, acompanhe objetivos e construa sua reputação.</CityHeading>
    <div className="mk-contract-command">
      <section className="mk-contract-map" aria-label="Mapa de 24 operações">
        <CityArt name="contracts" className="mk-city-scene-fill" /><div className="mk-city-scene-vignette" />
        <div className="mk-contract-radar" aria-hidden="true" />
        <div className="mk-contract-beacons">{CONTRACT_CHAINS.map((name, i) => {
          const done = MISSIONS.filter((m) => m.chain === i && e.missionsClaimed.includes(m.id)).length;
          const canClaim = MISSIONS.some((m) => m.chain === i && missionReady(g,m));
          return <button key={name} className={`${chain === i ? "is-selected " : ""}${canClaim ? "is-ready " : ""}${done === 15 ? "is-complete" : ""}`} aria-pressed={chain === i} onClick={() => selectChain(i)} title={name}>
            <span>{String(i + 1).padStart(2,"0")}</span><b>{name}</b><small>{done}/15 · {canClaim ? "RECOMPENSA PRONTA" : done === 15 ? "CONCLUÍDA" : "EM OPERAÇÃO"}</small>
          </button>;
        })}</div>
        <div className="mk-contract-map-label">24 OPERAÇÕES CONECTADAS · DADOS DO SEU SAVE</div>
      </section>
      <aside className="mk-contract-tracker mk-city-console"><span className="mk-city-kicker">PAINEL DO AGENTE</span><h2>MISSÕES FIXADAS <small>{tracked.length}/3</small></h2>
        {tracked.length ? tracked.map((id) => { const m = MISSION_MAP[id]; if (!m) return null; return <button key={id} className="mk-contract-tracked" onClick={() => focus(m)}><strong>{m.name}</strong>{m.goals.map((o) => <span key={o.metric}>{o.label}: {Math.min(metricValue(g,o.metric),o.target)}/{o.target}</span>)}<b>{missionReady(g,m) ? "PRONTA PARA RESGATAR" : "ACOMPANHANDO"}</b></button>; }) : <p>Fixe até três contratos. Seus objetivos aparecerão aqui mesmo ao trocar de operação.</p>}
        <CityMeter value={claimed} max={360} label="CARREIRA DO AGENTE" tone="gold" /><p>Reputação {e.reputation}: +{(e.reputation / 20).toFixed(1)}% ouro de percursos. Rede da central: +{e.distribution.contracts ?? 0} reputação por contrato.</p>
        <PixelButton disabled={!readyCount} onClick={() => setNote(`${claimContractChain()} contratos resgatados em sequência. Recompensas creditadas uma única vez.`)}>RESGATAR TODAS AS PRONTAS</PixelButton>
      </aside>
    </div>
    <CityToast>{note}</CityToast>
    <section className="mk-contract-dossier">
      <div className="mk-contract-browser">
        <div className="mk-contract-filters"><input aria-label="Buscar missão ou objetivo" placeholder="Buscar missão ou objetivo…" value={search} onChange={(ev) => { setSearch(ev.target.value); setPage(0); }} /><select aria-label="Operação selecionada" value={chain} onChange={(ev) => { const value = Number(ev.target.value); if (value >= 0) selectChain(value); else { setChain(-1); setPage(0); } }}><option value={-1}>TODAS AS OPERAÇÕES</option>{CONTRACT_CHAINS.map((name,i) => <option key={name} value={i}>{name}</option>)}</select></div>
        <div className="mk-city-tabs">{[["active","ATIVAS"],["ready","PRONTAS"],["all","TODAS"],["tracked","FIXADAS"],["claimed","RESGATADAS"]].map(([id,name]) => <button key={id} aria-pressed={filter === id} onClick={() => { setFilter(id); setPage(0); }}>{name}</button>)}</div>
        <div className="mk-contract-list">{list.slice(current * 12,current * 12 + 12).map((m) => {
          const done = e.missionsClaimed.includes(m.id), canClaim = missionReady(g,m), progress = Math.round(m.goals.reduce((sum,o) => sum + Math.min(1,metricValue(g,o.metric)/o.target),0) / m.goals.length * 100);
          return <button key={m.id} aria-pressed={selected === m.id} onClick={() => setSelected(m.id)}><span>{String(m.chapter).padStart(2,"0")}</span><div><strong>{m.name}</strong><small>{done ? "RESGATADA" : canClaim ? "PRONTA" : m.prev && !e.missionsClaimed.includes(m.prev) ? "BLOQUEADA" : "EM ANDAMENTO"} · {progress}% OBJETIVOS</small><div className="mk-contract-row-progress"><b style={{ width: `${progress}%` }} /></div></div><b>{tracked.includes(m.id) ? "FIXADA" : `${m.gold} G`}</b></button>;
        })}{!list.length && <p className="mk-city-empty">Nenhum contrato neste filtro. Veja todas as missões ou escolha outra operação.</p>}</div>
        <div className="mk-contract-pagination"><button disabled={!current} onClick={() => setPage(current - 1)}>ANTERIOR</button><span>{current + 1}/{pages} · {list.length} CONTRATOS</span><button disabled={current >= pages - 1} onClick={() => setPage(current + 1)}>PRÓXIMA</button></div>
      </div>
      <aside className="mk-contract-mission mk-city-console"><span className="mk-city-kicker">DOSSIÊ · {selectedClaimed ? "RESGATADO" : locked ? "BLOQUEADO" : ready ? "CONCLUÍDO" : "EM ANDAMENTO"}</span><h2>{mission.name}</h2><p>Complete os dois objetivos cumulativos. {locked ? `Liberado após o capítulo ${mission.chapter - 1}.` : "Seu progresso anterior também conta."}</p>
        <div className="mk-contract-chapters">{MISSIONS.filter((m) => m.chain === mission.chain).map((m) => <button key={m.id} aria-label={`Capítulo ${m.chapter}`} aria-pressed={selected === m.id} className={e.missionsClaimed.includes(m.id) ? "is-complete" : ""} onClick={() => setSelected(m.id)}>{m.chapter}</button>)}</div>
        {mission.goals.map((o) => <CityMeter key={o.metric} value={Math.min(metricValue(g,o.metric),o.target)} max={o.target} label={o.label.toUpperCase()} />)}
        <div className="mk-contract-rewards"><span><b>+{mission.gold}</b>OURO</span><span><b>+{mission.diamonds}</b>DIAMANTES</span><span><b>+{mission.reputation + (e.distribution.contracts ?? 0)}</b>REPUTAÇÃO</span></div>
        <PixelButton disabled={!ready} onClick={() => setNote(claimContract(mission.id) ? `${mission.name}: recompensas recebidas.` : "Objetivos ou capítulo anterior pendentes.")}>{selectedClaimed ? "RECOMPENSA JÁ RECEBIDA" : "RESGATAR RECOMPENSA"}</PixelButton>
        <button className="mk-city-text-button" disabled={selectedClaimed || !tracked.includes(mission.id) && tracked.length >= 3} onClick={() => setNote(toggleTrackedContract(mission.id) ? tracked.includes(mission.id) ? "Contrato desafixado." : "Contrato fixado no painel do agente." : "Limite de três contratos fixados.")}>{tracked.includes(mission.id) ? "DESAFIXAR" : "FIXAR NO PAINEL"}</button>
        <PixelButton disabled={!MISSIONS.some((m) => m.chain === mission.chain && missionReady(g,m))} onClick={() => setNote(`${claimContractChain(mission.chain)} capítulos prontos desta operação foram resgatados.`)}>RESGATAR SEQUÊNCIA DESTA OPERAÇÃO</PixelButton>
      </aside>
    </section>
    <section className="mk-contract-milestones"><header><span className="mk-city-kicker">MARCO DE CARREIRA</span><h2>RECOMPENSAS DO COMANDO</h2></header><div>{CONTRACT_MILESTONES.map((count) => { const done = e.development.milestones.includes(count); return <button key={count} disabled={done || claimed < count} onClick={() => setNote(claimContractMilestone(count) ? `Marco de ${count} contratos recebido: ouro e diamantes de jogo.` : "Marco ainda indisponível.")}><strong>{count}</strong><span>CONTRATOS</span><small>+{count * 30} G · +{Math.max(3,Math.floor(count/15))} D</small><b>{done ? "RECEBIDO" : claimed >= count ? "RESGATAR" : `${claimed}/${count}`}</b></button>; })}</div></section>
    <CityHelp>360 missões divididas em 24 operações de 15 capítulos. O progresso vem de métricas reais do save. Resgatar um capítulo libera o seguinte; o resgate em sequência inclui os próximos capítulos já prontos, sem duplicar créditos. Fixar não aceita nem reinicia uma missão: apenas facilita acompanhar objetivos. Marcos de carreira são prêmios únicos adicionais.</CityHelp>
  </CityStage>;
}