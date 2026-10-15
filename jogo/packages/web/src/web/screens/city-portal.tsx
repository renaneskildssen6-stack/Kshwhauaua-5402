import { useMemo, useState } from "react";
import { CityStage, CityArt, GateArt, CityHeading, CityMeter, CityToast, CityHelp } from "@/components/city-stage";
import { PixelButton, RobotSprite } from "@/components/pixel";
import { useGame } from "@/game/save";
import { ROBOT_MAP } from "@/game/robots";
import { NPC_DEFS } from "@/game/enemies";
import { detectElement } from "@/game/elements";
import { DIMENSIONS, CAMPAIGNS, type DimensionId, type DimensionRun } from "@/game/expansion";
import { BLESSINGS, CHALLENGES, gateTierUnlocked, type GateBlessing } from "@/game/city-development";
import { startDimension, draftPool, dimensionTeam, dimensionEnemies, dimensionRules, launchDimension, finishDimension, useRunItem, runChoice, closeRun, campaignMode } from "@/game/dimension-actions";
import { chooseStory } from "@/game/city-actions";
import { calibrateGate } from "@/game/city-research-actions";
import { BattleScreen } from "@/screens/battle";

const CHOICES: Record<string, [string, string, string][]> = {
  rift: [["vital", "CORAÇÃO ANCESTRAL", "+35 HP máximo; recupera 25% HP e 20% MP, reativa caídos a 15%."], ["power", "FOME DE COMBATE", "+8 força para o restante do percurso."], ["speed", "PASSO CRONAL", "+8 agilidade para o restante do percurso."]],
  caravan: [["supplies", "SUPRIMENTOS", "150 ouro do banco: +2 reparos e +1 célula."], ["repair", "ACAMPAMENTO", "150 ouro do banco: +25% HP, +20% MP; caídos voltam a 15%."], ["continue", "SEM PARAR", "Mantém banco, HP, MP e itens restantes."]],
  maze: [["shrine", "SANTUÁRIO", "Cura 25% HP, 20% MP, reativa caídos a 15%. Próximo encontro seguro."], ["treasure", "TESOURO", "+200 no banco. Próximo inimigo +20%; prêmio dobrado."], ["shortcut", "ATALHO", "+10 agilidade. Inimigos futuros +12%; próximo encontro perigoso."]],
  stakes: [["cash", "RETIRAR BANCO", "Encerra e recebe ouro acumulado. Não conta como vitória do percurso."], ["risk", "DOBRAR PRÊMIO", "Próximo inimigo +20%. Derrota perde todo o banco."], ["safe", "MESA SEGURA", "Prêmio normal. Sem cura; o banco continua em risco."]],
  common: [["repair", "OFICINA", "+25% HP, +20% MP, caídos a 15%. No Cerco: +15 pontos de núcleo."], ["offense", "AVANÇO OFENSIVO", "+8 força permanente; próximo inimigo +20% e prêmio dobrado."], ["safe", "ROTA SEGURA", "Mantém recursos e bônus. Próximo encontro sem risco extra."]],
};
export function PortalScreen({ onBack }: { onBack: () => void }) {
  const g = useGame(), e = g.expansion, run = e.run;
  const [tab, setTab] = useState("gates"), [selected, setSelected] = useState<DimensionId>("rift"), [preparing, setPreparing] = useState(false), [picks, setPicks] = useState<string[]>([]), [family, setFamily] = useState(""), [campaign, setCampaign] = useState<string | undefined>(), [note, setNote] = useState(""), [tier, setTier] = useState(0), [blessing, setBlessing] = useState<GateBlessing>("vital"), [npcIndex, setNpcIndex] = useState(0);
  const pool = useMemo(() => draftPool(), [e.runSeq]);
  const families = [...new Set(g.robots.map((r) => detectElement(ROBOT_MAP[r.id]?.element ?? "")))], element = family || families[0] || "LUZ";
  const mode = DIMENSIONS.find((m) => m.id === selected)!, calibration = e.development.attunement[selected] ?? 0;
  const challenge = CHALLENGES[tier], npc = NPC_DEFS[npcIndex];
  const select = (id: DimensionId, campaignId?: string) => { setSelected(id); setPicks([]); setTier(0); setCampaign(campaignId); setPreparing(!!campaignId); setTab("gates"); setNote(""); };
  const start = () => { const ok = startDimension(selected,picks,element,campaign,tier,blessing); setNote(ok ? "Travessia iniciada. Seu percurso foi salvo." : "Confira equipe, energia, alimentação, seleção Draft e tier liberado."); if (ok) { setPreparing(false); setCampaign(undefined); } };
  if (run?.phase === "battle") return <BattleScreen key={`${run.uid}_${run.stage}`} arena={`m_${run.mode}`} round={run.stage} playerTeam={dimensionTeam(run)} enemyTeam={dimensionEnemies(run)} items={run.items} label={`${DIMENSIONS.find((m) => m.id === run.mode)?.name} · ${run.stage}/${run.length}`} startState={run.carry} onUseItem={(id) => useRunItem(run.uid,id)} onFinish={(result,carry) => finishDimension(run.uid,run.stage,result,carry)} />;
  return <CityStage system="portal" onBack={onBack} subtitle="SANTUÁRIO DIMENSIONAL · PORTAIS VIVOS">
    <CityHeading tag={`${DIMENSIONS.length} DIMENSÕES · 3 CAMPANHAS · ${e.counters.runsCompleted ?? 0} TRAVESSIAS LIQUIDADAS`} title={run ? "O outro lado espera." : "Dez portas. Infinitos destinos."}>Calibre uma passagem, escolha o desafio e prepare sua equipe para o desconhecido.</CityHeading>
    {run ? <DimensionJourney run={run} onClose={() => { closeRun(run.uid); setNote(""); }} onNote={setNote} /> : <>
      <div className="mk-city-tabs mk-portal-tabs">{[["gates","PORTAIS"],["stories","CAMPANHAS"],["bestiary","GUARDIÕES"]].map(([id,name]) => <button key={id} aria-pressed={tab === id} onClick={() => { setTab(id); setPreparing(false); setCampaign(undefined); }}>{name}</button>)}</div>
      {tab === "gates" && <>
        <div className="mk-portal-sanctuary"><section className="mk-portal-focus" key={selected}>
          <CityArt name="portal" className="mk-city-scene-fill" /><div className="mk-city-scene-vignette" />
          <div className="mk-portal-focus-caption"><span>PASSAGEM {String(DIMENSIONS.findIndex((m) => m.id === selected) + 1).padStart(2,"0")} / 10</span><h2>{mode.name}</h2><p>{mode.length} ENCONTROS · CALIBRAÇÃO R{calibration}</p></div>
          <GateArt id={selected} className="mk-portal-hero-gate" label={`Portal animado de ${mode.name}, 16 frames`} />
          <div className="mk-portal-focus-floor" aria-hidden="true" />
          <div className="mk-portal-focus-bottom"><span>{e.counters[`${selected}Wins`] ?? 0} TRAVESSIAS VENCIDAS</span><span>{e.distribution.portal ? "PASSAGEM ESTÁVEL" : "SEM ALIMENTAÇÃO"}</span></div>
        </section>
        <aside className="mk-portal-briefing mk-city-console">
          <span className="mk-city-kicker">{preparing ? "PREPARAÇÃO DE TRAVESSIA" : "INTELIGÊNCIA DIMENSIONAL"}</span><h2>{mode.name}</h2><p>{mode.desc}</p>
          {campaign && <p className="mk-portal-campaign-label">{CAMPAIGNS.find((c) => c.id === campaign)?.name} · CAPÍTULO {(e.campaigns[campaign] ?? 0) + 1}</p>}
          <div className="mk-portal-boss"><RobotSprite robotId={mode.boss} size={72} /><div><small>GUARDIÃO DA DIMENSÃO</small><strong>{ROBOT_MAP[mode.boss]?.name}</strong><span>EXCLUSIVO · NÃO RECRUTÁVEL</span></div></div>
          {preparing ? <>
            <span className="mk-city-kicker">ESCALA DO DESAFIO</span><div className="mk-portal-challenges">{CHALLENGES.map((c) => <button key={c.tier} disabled={!gateTierUnlocked(g,selected,c.tier)} aria-pressed={tier === c.tier} onClick={() => setTier(c.tier)}><b>{c.name}</b><small>INIMIGO ×{c.scale} · OURO ×{c.reward}</small><span>{gateTierUnlocked(g,selected,c.tier) ? `${c.cost} ENERGIA` : `${c.tier === 1 ? 1 : 3} VITÓRIAS NESTE MODO`}</span></button>)}</div>
            <span className="mk-city-kicker">BÊNÇÃO INICIAL · R{calibration}</span><div className="mk-portal-blessings">{BLESSINGS.map((b) => <button key={b.id} aria-pressed={blessing === b.id} onClick={() => setBlessing(b.id)}><strong>{b.name}</strong><small>{b.desc}</small></button>)}</div>
            {!calibration && <p className="mk-city-muted">Calibre o portal para ativar a bênção escolhida. R0 não concede bônus.</p>}
            {mode.id === "draft" ? <><p>Escolha 4 chassis temporários: {picks.length}/4.</p><div className="mk-portal-draft">{pool.map((id) => <button key={id} aria-pressed={picks.includes(id)} onClick={() => setPicks((old) => old.includes(id) ? old.filter((r) => r !== id) : old.length < 4 ? [...old,id] : old)}><RobotSprite robotId={id} size={64} /><span>{ROBOT_MAP[id]?.name}</span></button>)}</div></> : mode.id === "mono" ? <label className="mk-portal-family">FAMÍLIA ELEMENTAL<select value={element} aria-label="Família elemental" onChange={(ev) => setFamily(ev.target.value)}>{families.map((id) => <option key={id} value={id}>{id} · {g.robots.filter((r) => detectElement(ROBOT_MAP[r.id]?.element ?? "") === id).length} CHASSIS</option>)}</select><p>Até quatro chassis desta família entram.</p></label> : <div className="mk-portal-prepared-team">{g.team.map((id) => <div key={id}><RobotSprite robotId={id} size={58} /><small>{ROBOT_MAP[id]?.name}</small></div>)}</div>}
            <PixelButton disabled={e.energy < challenge.cost || !e.distribution.portal || mode.id === "draft" && picks.length !== 4} onClick={start}>ATRAVESSAR · {challenge.cost} ENERGIA</PixelButton><button className="mk-city-text-button" onClick={() => { setPreparing(false); setCampaign(undefined); }}>VOLTAR À INTELIGÊNCIA</button>
          </> : <>
            <CityMeter value={calibration} max={3} label="CALIBRAÇÃO" tone="gold" /><p>Calibrar libera força inicial, vitalidade ou suprimentos em todas as futuras travessias deste portal.</p>
            <PixelButton disabled={calibration >= 3 || !e.distribution.portal || e.energy < 5 || g.gold < 350 * (calibration + 1)} onClick={() => setNote(calibrateGate(selected) ? `Portal calibrado para R${calibration + 1}.` : "Calibração indisponível.")}>{calibration >= 3 ? "PORTAL CALIBRADO AO MÁXIMO" : `CALIBRAR · ${350 * (calibration + 1)} OURO + 5 E`}</PixelButton>
            <PixelButton onClick={() => setPreparing(true)}>PREPARAR TRAVESSIA</PixelButton>
          </>}
        </aside></div>
        <nav className="mk-portal-gate-gallery" aria-label="Seleção de portais">{DIMENSIONS.map((m,i) => <button key={m.id} aria-pressed={m.id === selected} onClick={() => { select(m.id); setPreparing(false); }}><span className="mk-portal-gate-number">{String(i + 1).padStart(2,"0")}</span><GateArt id={m.id} /><strong>{m.name}</strong><small>{m.length} ETAPAS · R{e.development.attunement[m.id] ?? 0}</small></button>)}</nav>
      </>}
      {tab === "stories" && <div className="mk-portal-campaigns"><CityArt name="portal" className="mk-city-scene-fill" />{CAMPAIGNS.map((c) => {
        const chapter = e.campaigns[c.id] ?? 0, choice = e.storyChoices[`${c.id}_${chapter}`], modeId = campaignMode(c.id,chapter), currentMode = DIMENSIONS.find((m) => m.id === modeId)!;
        return <section key={c.id} className="mk-portal-story"><span className="mk-city-kicker">CRÔNICA RAMIFICADA</span><h2>{c.name}</h2><CityMeter value={chapter} max={6} label="CAPÍTULOS" tone="gold" /><ol>{c.nodes.map((name,i) => <li key={name} className={i < chapter ? "is-done" : i === chapter ? "is-current" : ""}><span>{i + 1}</span><div><strong>{name}</strong><small>{i < chapter ? "CONCLUÍDO" : i === chapter ? "CAPÍTULO ATUAL" : "BLOQUEADO"}</small></div></li>)}</ol>
          {chapter < 6 ? <><p>{chapter === 1 || chapter === 3 ? "Bifurcação: a decisão muda a dimensão e a dificuldade." : "Sua abordagem define a dificuldade: assalto aumenta inimigos em 8%."}</p><div className="mk-portal-story-choice"><button aria-pressed={choice === "mercy"} onClick={() => chooseStory(c.id,chapter,"mercy")}>DIPLOMACIA / RESGATE</button><button aria-pressed={choice === "force"} onClick={() => chooseStory(c.id,chapter,"force")}>ASSALTO / CONFRONTO</button></div><p>OPERAÇÃO: {currentMode.name}</p><PixelButton disabled={!choice} onClick={() => select(campaignMode(c.id,chapter),c.id)}>PREPARAR CAPÍTULO {chapter + 1}</PixelButton></> : <p>CRÔNICA COMPLETA. Seu legado está salvo.</p>}
        </section>;
      })}</div>}
      {tab === "bestiary" && <div className="mk-portal-bestiary"><nav>{NPC_DEFS.map((def,i) => <button key={def.id} aria-pressed={i === npcIndex} onClick={() => setNpcIndex(i)}><RobotSprite robotId={def.id} size={64} /><span>{def.name}</span></button>)}</nav><section className="mk-portal-guardian-stage"><CityArt name="portal" className="mk-city-scene-fill" /><div className="mk-city-scene-vignette" /><div><RobotSprite key={npc.id} robotId={npc.id} size={200} /><span className="mk-city-kicker">GUARDIÃO EXCLUSIVO · 16 FRAMES</span><h2>{npc.name}</h2><p>{npc.element}</p><p>{npc.bio}</p><small>Este chassi não pode ser recrutado.</small></div></section></div>}
    </>}
    <CityToast>{note || (!e.distribution.portal ? "Portal sem alimentação: aloque pelo menos um ponto na usina." : "Portais animados com 16 frames por imagem. Calibração e percursos são preservados no seu save.")}</CityToast>
    <CityHelp>Itens da dimensão não usam o inventário geral. Energia é paga uma vez na entrada. Veterano exige uma vitória neste modo; Cataclismo, três. A escala de desafio aumenta inimigos, ouro por encontro e diamantes finais. Calibração é permanente, mas sua bênção é escolhida a cada travessia. Sair para a cidade preserva o percurso; abandonar perde o banco. Apostas utiliza somente ouro virtual do percurso.</CityHelp>
  </CityStage>;
}

function DimensionJourney({ run, onClose, onNote }: { run: DimensionRun; onClose: () => void; onNote: (message: string) => void }) {
  const [confirm, setConfirm] = useState(false);
  const def = DIMENSIONS.find((m) => m.id === run.mode)!, rules = dimensionRules(run), choices = CHOICES[run.mode] ?? CHOICES.common;
  const terminal = ["won","lost","cashed"].includes(run.phase);
  return <section className="mk-dimension-journey">
    <div className="mk-dimension-world"><CityArt name="portal" className="mk-city-scene-fill" /><div className="mk-city-scene-vignette" /><GateArt id={run.mode} className="mk-dimension-route-gate" />
      <div className="mk-dimension-route-heading"><span className="mk-city-kicker">{CHALLENGES[run.challenge ?? 0]?.name} · INIMIGOS ×{run.enemyScale.toFixed(2)}</span><h2>{def.name}</h2><p>{def.desc}</p></div>
      <div className="mk-dimension-route-nodes">{Array.from({ length: run.length },(_,i) => <div key={i} className={i + 1 < run.stage || terminal && run.phase === "won" ? "is-done" : i + 1 === run.stage ? "is-current" : ""}><span>{i === run.length - 1 ? "CHEFE" : `0${i + 1}`}</span><strong>{i + 1 < run.stage ? "VENCIDO" : i + 1 === run.stage ? "ATUAL" : "ADENTRAR"}</strong></div>)}</div>
      <div className="mk-dimension-team">{run.team.map((r) => <div key={r.id}><RobotSprite robotId={r.id} size={74} dim={run.carry[r.id]?.hp === 0} /><strong>{ROBOT_MAP[r.id]?.name}</strong><CityMeter value={Math.round((run.carry[r.id]?.hp ?? 1) * 100)} max={100} label="HP" /><small>MP {Math.round((run.carry[r.id]?.mp ?? 1) * 100)}% · LV {r.level}</small></div>)}</div>
    </div>
    <aside className="mk-dimension-mission-control mk-city-console"><span className="mk-city-kicker">PERCURSO SALVO · ETAPA {run.stage}/{run.length}</span><h2>{terminal ? "RELATÓRIO FINAL" : "PRÓXIMO ENCONTRO"}</h2><div className="mk-city-facts"><span>{run.bank}<small>{terminal ? "BANCO LIQUIDADO" : "OURO EM RISCO"}</small></span><span>{run.items.repair_kit ?? 0}<small>REPAROS</small></span><span>{run.items.energy_cell ?? 0}<small>CÉLULAS</small></span></div>
      {rules.core !== undefined && <CityMeter value={Math.round(run.core)} max={100} label="NÚCLEO DO CERCO" tone="gold" />}{rules.deadline && <p>PRAZO: {rules.deadline} RODADAS</p>}{rules.targetId && <p>ALVO: {ROBOT_MAP[rules.targetId]?.name}</p>}
      <p>BÔNUS {Object.entries(run.bonus).map(([key,value]) => `${key.toUpperCase()} +${value}`).join(" · ") || "NENHUM"}</p><p className="mk-city-muted">Bênção: {BLESSINGS.find((b) => b.id === run.blessing)?.name ?? "Sem bênção anterior"}. Rota: {run.route === "risky" ? "+20% inimigos / prêmio dobrado" : "segura"}.</p>
      {run.phase === "ready" && <><div className="mk-dimension-foes">{dimensionEnemies(run).map((r,i) => <div key={`${r.id}-${i}`}><RobotSprite robotId={r.id} size={66} /><span>{ROBOT_MAP[r.id]?.name}</span></div>)}</div><PixelButton onClick={() => launchDimension(run.uid,run.stage)}>ATRAVESSAR / ENTRAR EM COMBATE</PixelButton></>}
      {run.phase === "choice" && <><p>Vitória confirmada. Escolha um caminho abaixo para preparar a próxima etapa.</p></>}
      {terminal ? <><p>{run.phase === "won" ? "Travessia concluída. Ouro, XP e diamantes já creditados uma única vez." : run.phase === "cashed" ? "Banco retirado. Ouro e XP creditados; não conta como vitória da dimensão." : "Equipe derrotada. O banco foi perdido, mas sua coleção permanece intacta."}</p><PixelButton onClick={onClose}>RETORNAR AOS PORTAIS</PixelButton></> : confirm ? <div className="mk-city-confirm"><p>Abandonar perde o banco e as melhorias temporárias.</p><PixelButton onClick={onClose}>CONFIRMAR ABANDONO</PixelButton><button onClick={() => setConfirm(false)}>MANTER TRAVESSIA</button></div> : <button className="mk-city-text-button" onClick={() => setConfirm(true)}>ABANDONAR TRAVESSIA</button>}
    </aside>
    {run.phase === "choice" && <div className="mk-dimension-branches">{choices.map(([id,name,desc],i) => <button key={id} disabled={run.mode === "caravan" && ["supplies","repair"].includes(id) && run.bank < 150} onClick={() => onNote(runChoice(run.uid,id) ? `Caminho escolhido: ${name.toLowerCase()}.` : "Escolha indisponível ou banco insuficiente.")}><span>CAMINHO 0{i + 1}</span><GateArt id={i === 0 ? "mirror" : i === 1 ? "stakes" : "maze"} /><strong>{name}</strong><p>{desc}</p><b>ESCOLHER ESTE CAMINHO</b></button>)}</div>}
    {run.path.length > 0 && <div className="mk-dimension-history"><span>ESCOLHAS DA TRAVESSIA</span>{run.path.map((id,i) => <b key={`${i}-${id}`}>{(CHOICES[run.mode] ?? CHOICES.common).find((c) => c[0] === id)?.[1] ?? id}</b>)}</div>}
  </section>;
}