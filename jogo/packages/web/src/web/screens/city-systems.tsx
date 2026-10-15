import { useState } from "react";
import { CityPage, CityNotice, Progress } from "@/components/city-ui";
import { Panel, PixelButton, RobotSprite } from "@/components/pixel";
import { Cell } from "@/components/meta-ui";
import { useGame } from "@/game/save";
import { ROBOT_MAP } from "@/game/robots";
import { ROUTES, TALENT_NODES, talentBudget, RELICS, relicSetCount, cityBonus, MISSIONS, CONTRACT_CHAINS, missionReady, metricValue, energyCap, CITY_LABELS, type CitySystem } from "@/game/expansion";
import { startExpedition, expeditionChoice, evacuateExpedition, learnTalent, resetTalents, distributePower, upgradePlant, convertGoldToEnergy, claimContract } from "@/game/city-actions";

export function ObservatoryScreen({ onBack }: { onBack: () => void }) {
  const g = useGame(), e = g.expansion, job = e.expedition;
  const [note, setNote] = useState("");
  const route = ROUTES.find((r) => r.id === job?.route);
  return <CityPage system="observatory" onBack={onBack}>
    <p className="mk-exp-copy">Lance uma expedição de escolhas. Escanear é seguro, correr poupa provisões, investigar rende mais com risco de emboscada. Concluir uma rota entrega ouro e a próxima relíquia de seu conjunto. Energia alocada aumenta provisões e reduz riscos.</p>
    <CityNotice>{note || `${e.counters.expeditions ?? 0} expedições concluídas · ${e.discoveries.length}/48 descobertas`}</CityNotice>
    {job && route ? <Panel>
      <h2 className="mk-title mk-exp-title">{route.name}</h2>
      <p className="mk-exp-copy">ETAPA {job.step}/{route.length} · PROVISÕES {job.supply} · CARGA {job.cargo} OURO</p>
      <Progress value={job.step} max={route.length} />
      <div style={{ display: "grid", gap: 6 }}>
        <PixelButton onClick={() => setNote(expeditionChoice("scan"))}>ESCANEAR · 2 PROVISÕES · SEGURO</PixelButton>
        <PixelButton onClick={() => setNote(expeditionChoice("rush"))}>AVANÇAR · 1 PROVISÃO · RISCO {Math.max(0, route.risk - e.distribution.observatory * 3)}%</PixelButton>
        <PixelButton onClick={() => setNote(expeditionChoice("salvage"))}>INVESTIGAR · MAIOR CARGA · RISCO {Math.max(0, route.risk + 20 - e.distribution.observatory * 3)}%</PixelButton>
        <PixelButton onClick={() => { evacuateExpedition(); setNote("Evacuação: metade da carga recuperada."); }}>EVACUAR COM METADE DA CARGA</PixelButton>
      </div>
      <div className="mk-exp-copy" style={{ marginTop: 8 }}>{job.log.map((line, i) => <p key={i}>{line}</p>)}</div>
    </Panel> : ROUTES.map((r) => <Panel key={r.id}>
      <h2 className="mk-title mk-exp-title">{r.name}</h2><p className="mk-exp-copy">{r.desc}<br />{r.length} etapas · {r.cost} energia · risco base {r.risk}%<br />Relíquias do conjunto: {relicSetCount(e, r.set)}/4</p>
      <PixelButton disabled={e.energy < r.cost || !e.distribution.observatory} onClick={() => setNote(startExpedition(r.id) ? "Equipe a caminho." : "Energia ou alimentação insuficiente.")}>LANÇAR EXPEDIÇÃO</PixelButton>
    </Panel>)}
    {e.discoveries.length > 0 && <Panel><h2 className="mk-title mk-exp-title">ATLAS DE DESCOBERTAS</h2><div className="mk-exp-copy">{e.discoveries.map((id) => { const [key, n] = id.split("_"); return <div key={id}>{ROUTES.find((r) => r.id === key)?.name} · SINAL {Number(n) + 1}</div>; })}</div></Panel>}
  </CityPage>;
}

export function AcademyScreen({ onBack }: { onBack: () => void }) {
  const g = useGame();
  const [robotId, setRobot] = useState(g.team[0] ?? g.robots[0].id), [note, setNote] = useState("");
  const learned = g.expansion.talents[robotId] ?? [], budget = talentBudget(g, robotId), bonus = cityBonus(g, robotId);
  return <CityPage system="academy" onBack={onBack}>
    <p className="mk-exp-copy">Três árvores por chassi. Aprenda os nós em ordem; o último nó de uma árvore impede os outros ápices. Pontos: 2 iniciais, +1 a cada 5 níveis e +1 a cada 500 de maestria, até 8. Bônus entram nos atributos em batalha.</p>
    <label className="mk-exp-copy">CHASSI<select aria-label="Chassi da academia" value={robotId} onChange={(e) => { setRobot(e.target.value); setNote(""); }} style={{ width: "100%", padding: 8, background: "#070b14", color: "#e8f4ff" }}>{g.robots.map((r) => <option key={r.id} value={r.id}>{ROBOT_MAP[r.id]?.name} · Lv{r.level}</option>)}</select></label>
    <div className="mk-exp-row"><RobotSprite robotId={robotId} size={80} /><div className="mk-exp-copy">PONTOS {budget - learned.length}/{budget}<br />BÔNUS CIDADE: HP +{bonus.hp} · MP +{bonus.mp}<br />STR +{bonus.str} · DEF +{bonus.def} · AGL +{bonus.agl}</div></div>
    <CityNotice>{note}</CityNotice>
    {["OFENSIVA", "FORTIFICAÇÃO", "TECNOLOGIA"].map((branch, b) => <Panel key={branch}>
      <h2 className="mk-title mk-exp-title">{branch}</h2>
      {TALENT_NODES.filter((n) => n.branch === b).map((n) => {
        const owned = learned.includes(n.id), prev = n.tier === 0 || learned.includes(TALENT_NODES.find((p) => p.branch === b && p.tier === n.tier - 1)!.id);
        const crown = n.tier === 3 && learned.some((id) => TALENT_NODES.some((p) => p.id === id && p.tier === 3));
        const cost = 120 + n.tier * 180;
        return <div key={n.id} style={{ padding: "8px 0", opacity: !prev ? .5 : 1 }}><div className="mk-exp-copy" style={{ color: owned ? "var(--mk-ok)" : "var(--mk-text)" }}>{n.tier + 1}. {n.name} · {n.stat.toUpperCase()} +{n.value}{owned ? " · APRENDIDO" : ""}</div>
          {!owned && <PixelButton disabled={!prev || crown || learned.length >= budget || g.gold < cost || g.expansion.energy < 3 || !g.expansion.distribution.academy} onClick={() => setNote(learnTalent(robotId, n.id) ? `${n.name} aprendido.` : "Requisitos não atendidos.")}>APRENDER · {cost} OURO + 3 ENERGIA</PixelButton>}
        </div>;
      })}
    </Panel>)}
    <PixelButton disabled={!learned.length || g.gold < 300} onClick={() => setNote(resetTalents(robotId) ? "Árvores reiniciadas; pontos devolvidos, compras não reembolsadas." : "Ouro insuficiente.")}>REINICIAR TALENTOS · 300 OURO</PixelButton>
  </CityPage>;
}

export function PowerScreen({ onBack }: { onBack: () => void }) {
  const g = useGame(), e = g.expansion, [note, setNote] = useState("");
  const total = 4 + e.plant * 2, used = Object.values(e.distribution).reduce((a, n) => a + n, 0);
  const effects = { observatory: "Cada ponto: +2 provisões; -3% risco por escolha.", academy: "1+ ativa o ensino de talentos; 0 pausa novas compras.", museum: "1+ ativa bônus de conjunto; pontos extras reforçam conjuntos completos.", portal: "1+ permite iniciar percursos e campanhas." };
  return <CityPage system="power" onBack={onBack}>
    <Panel><h2 className="mk-title mk-exp-title">REATORE MK-{e.plant}</h2><p className="mk-exp-copy">Reserva {e.energy}/{energyCap(e.plant)} · distribuição {used}/{total}<br />Cada batalha concluída gera {3 + e.plant} energia. Melhorias ampliam capacidade, geração e pontos de distribuição. Sem temporizador obrigatório.</p><Progress value={e.energy} max={energyCap(e.plant)} />
      <div style={{ display: "grid", gap: 6 }}><PixelButton disabled={e.plant >= 10 || g.gold < e.plant * 500} onClick={() => setNote(upgradePlant() ? "Reator melhorado." : "Não foi possível melhorar.")}>MELHORAR · {e.plant < 10 ? `${e.plant * 500} OURO` : "MÁXIMO"}</PixelButton><PixelButton disabled={g.gold < 100 || e.energy >= energyCap(e.plant)} onClick={() => setNote(convertGoldToEnergy() ? "Sucata convertida em energia." : "Reserva cheia.")}>CONVERTER 100 OURO EM {20 + e.plant * 2} ENERGIA</PixelButton></div>
    </Panel>
    <CityNotice>{note}</CityNotice>
    {(Object.keys(effects) as (keyof typeof effects)[]).map((key) => <Panel key={key}><h2 className="mk-title mk-exp-title">{CITY_LABELS[key]}</h2><p className="mk-exp-copy">{effects[key]}<br />{e.distribution[key]} pontos · {e.distribution[key] ? "ATIVO" : "SEM ALIMENTAÇÃO"}</p><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}><PixelButton disabled={!e.distribution[key]} onClick={() => distributePower(key as CitySystem, -1)}>RETIRAR 1</PixelButton><PixelButton disabled={used >= total || e.distribution[key] >= 6} onClick={() => distributePower(key as CitySystem, 1)}>ALOCAR 1</PixelButton></div></Panel>)}
  </CityPage>;
}

export function MuseumScreen({ onBack }: { onBack: () => void }) {
  const g = useGame(), e = g.expansion;
  const [set, setSet] = useState(0);
  const names = ["CRONAL", "ABISSAL", "FORJA", "RAÍZES", "ASTRAL", "REGAL"], stats = ["AGL", "HP", "STR", "DEF", "MP", "STR"];
  const count = relicSetCount(e, set), bonus2 = set === 1 ? 20 : 3, bonus4 = (set === 1 ? 30 : 5) + (e.distribution.museum ?? 0);
  return <CityPage system="museum" onBack={onBack}>
    <p className="mk-exp-copy">{e.relics.length}/24 relíquias catalogadas. Cada expedição concluída entrega uma peça ainda ausente do conjunto da rota. Bônus de 2 e 4 peças se acumulam para toda a equipe. Sem energia alocada ao museu, os bônus ficam pausados.</p>
    <div className="mk-exp-tabs">{names.map((name, i) => <button key={name} aria-pressed={i === set} onClick={() => setSet(i)}>{name} {relicSetCount(e, i)}/4</button>)}</div>
    <Panel><h2 className="mk-title mk-exp-title">CONJUNTO {names[set]}</h2><p className="mk-exp-copy">2 peças: +{bonus2} {stats[set]} · {count >= 2 && e.distribution.museum ? "ATIVO" : "INATIVO"}<br />4 peças: +{bonus4} {stats[set]} adicional · {count >= 4 && e.distribution.museum ? "ATIVO" : "INATIVO"}</p><Progress value={count} max={4} /></Panel>
    {RELICS.filter((r) => r.set === set).map((r) => { const owned = e.relics.includes(r.id); return <Panel key={r.id}><div className="mk-exp-row"><Cell src="/ui/ach3.png" cols={10} rows={5} index={r.icon * 2} size={52} style={{ filter: owned ? undefined : "grayscale(1) brightness(.35)" }} /><div><h3 className="mk-title mk-exp-title">{r.name}</h3><div className="mk-exp-copy">{owned ? "CATALOGADA" : "NÃO DESCOBERTA"}</div></div></div><p className="mk-exp-copy">{r.desc}<br />Origem: {ROUTES[set].name}</p></Panel>; })}
  </CityPage>;
}

export function ContractsScreen({ onBack }: { onBack: () => void }) {
  const g = useGame(), e = g.expansion;
  const [chain, setChain] = useState(-1), [filter, setFilter] = useState("active"), [search, setSearch] = useState(""), [page, setPage] = useState(0), [note, setNote] = useState("");
  const ready = MISSIONS.filter((m) => missionReady(g, m)).length;
  const list = MISSIONS.filter((m) => {
    if (chain >= 0 && m.chain !== chain) return false;
    if (!`${m.name} ${m.goals.map((o) => o.label).join(" ")}`.toLowerCase().includes(search.toLowerCase())) return false;
    const claimed = e.missionsClaimed.includes(m.id), unlocked = !m.prev || e.missionsClaimed.includes(m.prev);
    return filter === "ready" ? missionReady(g, m) : filter === "claimed" ? claimed : filter === "active" ? !claimed && unlocked : true;
  });
  const pages = Math.max(1, Math.ceil(list.length / 12)), current = Math.min(page, pages - 1);
  return <CityPage system="contracts" onBack={onBack}>
    <p className="mk-exp-copy">360 missões em 24 cadeias de 15 capítulos. Cada contrato exige dois objetivos; resgatar o anterior libera o próximo. Progresso cumulativo do save conta, não reinicia ao aceitar. Recompensas são únicas. A reputação aumenta o ouro dos percursos em 1% a cada 20 pontos.</p>
    <div className="mk-exp-row"><span className="mk-title mk-exp-title">{e.missionsClaimed.length}/360 RESGATADAS</span><span className="mk-exp-copy">{ready} prontas</span></div>
    <input aria-label="Buscar missão" placeholder="Buscar missão ou objetivo…" value={search} onChange={(ev) => { setSearch(ev.target.value); setPage(0); }} style={{ background: "#070b14", padding: 10, color: "#e8f4ff" }} />
    <select aria-label="Cadeia de contratos" value={chain} onChange={(ev) => { setChain(Number(ev.target.value)); setPage(0); }} style={{ background: "#070b14", padding: 8, color: "#e8f4ff" }}><option value={-1}>TODAS AS CADEIAS</option>{CONTRACT_CHAINS.map((name, i) => <option value={i} key={name}>{name}</option>)}</select>
    <div className="mk-exp-tabs">{[["active", "ATIVAS"], ["ready", "PRONTAS"], ["all", "TODAS"], ["claimed", "RESGATADAS"]].map(([id, text]) => <button key={id} aria-pressed={filter === id} onClick={() => { setFilter(id); setPage(0); }}>{text}</button>)}</div>
    <CityNotice>{note}</CityNotice>
    {!list.length && <Panel><p className="mk-exp-copy">Nenhuma missão neste filtro. Explore a cidade ou veja todas as cadeias.</p></Panel>}
    {list.slice(current * 12, current * 12 + 12).map((m) => { const claimed = e.missionsClaimed.includes(m.id), ready = missionReady(g, m), locked = !!m.prev && !e.missionsClaimed.includes(m.prev); return <Panel key={m.id}>
      <h2 className="mk-title mk-exp-title">{m.name}</h2><p className="mk-exp-copy" style={{ color: claimed ? "var(--mk-ok)" : "var(--mk-accent2)" }}>{claimed ? "RESGATADA" : locked ? `LIBERA APÓS CAPÍTULO ${m.chapter - 1}` : ready ? "CONCLUÍDA · RESGATAR" : "EM ANDAMENTO"}</p>
      {m.goals.map((o) => { const value = metricValue(g, o.metric); return <div key={o.metric}><div className="mk-exp-copy">{o.label}: {Math.min(value, o.target)}/{o.target}</div><Progress value={value} max={o.target} /></div>; })}
      <p className="mk-exp-copy">+{m.gold} OURO · +{m.diamonds} DIAMANTES · +{m.reputation} REPUTAÇÃO</p>
      <PixelButton disabled={!ready} onClick={() => setNote(claimContract(m.id) ? `${m.name}: recompensa recebida.` : "Contrato ainda não concluído.")}>{claimed ? "JÁ RESGATADA" : "RESGATAR RECOMPENSA"}</PixelButton>
    </Panel>; })}
    <div className="mk-exp-row"><PixelButton disabled={!current} onClick={() => setPage(current - 1)}>ANTERIOR</PixelButton><span className="mk-exp-copy">{current + 1}/{pages} · {list.length} missões</span><PixelButton disabled={current >= pages - 1} onClick={() => setPage(current + 1)}>PRÓXIMA</PixelButton></div>
  </CityPage>;
}