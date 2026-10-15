import { useMemo, useState } from "react";
import { CityPage, CityNotice, Progress } from "@/components/city-ui";
import { Panel, PixelButton, RobotSprite } from "@/components/pixel";
import { useGame } from "@/game/save";
import { ROBOT_MAP } from "@/game/robots";
import { NPC_DEFS } from "@/game/enemies";
import { detectElement } from "@/game/elements";
import { DIMENSIONS, CAMPAIGNS, type DimensionId, type DimensionRun } from "@/game/expansion";
import { startDimension, draftPool, dimensionTeam, dimensionEnemies, dimensionRules, launchDimension, finishDimension, useRunItem, runChoice, closeRun, campaignMode } from "@/game/dimension-actions";
import { chooseStory } from "@/game/city-actions";
import { BattleScreen } from "@/screens/battle";

const CHOICES: Record<string, [string, string, string][]> = {
  rift: [["vital", "CORAÇÃO ANCESTRAL", "+35 HP máximo; recupera 25% HP e 20% MP, reativa caídos a 15%."], ["power", "FOME DE COMBATE", "+8 força para o restante do percurso."], ["speed", "PASSO CRONAL", "+8 agilidade para o restante do percurso."]],
  caravan: [["supplies", "COMPRAR SUPRIMENTOS", "150 ouro do banco: +2 reparos e +1 célula."], ["repair", "ACAMPAR", "150 ouro do banco: +25% HP, +20% MP; caídos voltam a 15%."], ["continue", "SEGUIR SEM PARAR", "Não gasta banco. HP, MP e itens restantes são preservados."]],
  maze: [["shrine", "SANTUÁRIO", "Cura 25% HP, 20% MP, reativa caídos a 15%. Próximo encontro seguro."], ["treasure", "CÂMARA DO TESOURO", "+200 no banco. Próximo inimigo 20% mais forte; prêmio dobrado."], ["shortcut", "ATALHO ENRAIZADO", "+10 agilidade. Inimigos futuros +12%; próximo encontro perigoso."]],
  stakes: [["cash", "RETIRAR O BANCO", "Encerra o percurso e recebe seu ouro acumulado. Não conta como percurso vencido."], ["risk", "DOBRAR O PRÓXIMO PRÊMIO", "Próximo inimigo 20% mais forte. Derrota perde todo o banco."], ["safe", "CONTINUAR NA MESA SEGURA", "Prêmio normal. Sem cura; o banco continua em risco."]],
  common: [["repair", "OFICINA DE CAMPO", "+25% HP e +20% MP; caídos a 15%. No Cerco também restaura 15 pontos do núcleo."], ["offense", "AVANÇO OFENSIVO", "+8 força permanente no percurso; próximo inimigo +20% e prêmio dobrado."], ["safe", "ROTA SEGURA", "Mantém recursos e bônus. Próximo encontro sem multiplicador de risco."]],
};

export function PortalScreen({ onBack }: { onBack: () => void }) {
  const g = useGame(), run = g.expansion.run;
  const [tab, setTab] = useState("modes"), [selected, setSelected] = useState<DimensionId | null>(null), [picks, setPicks] = useState<string[]>([]), [family, setFamily] = useState(""), [campaign, setCampaign] = useState<string | undefined>(), [note, setNote] = useState("");
  const pool = useMemo(() => draftPool(), [g.expansion.runSeq]);
  const families = [...new Set(g.robots.map((r) => detectElement(ROBOT_MAP[r.id]?.element ?? "")))];
  const element = family || families[0] || "LUZ";
  const mode = DIMENSIONS.find((m) => m.id === selected);

  function select(id: DimensionId, campaignId?: string) { setSelected(id); setPicks([]); setCampaign(campaignId); setNote(""); }
  function start() {
    if (!selected) return;
    const ok = startDimension(selected, picks, element, campaign);
    setNote(ok ? "Percurso iniciado." : "Confira equipe, energia, alimentação do portal e seleção do Draft.");
    if (ok) { setSelected(null); setCampaign(undefined); }
  }
  if (run?.phase === "battle") return <BattleScreen key={`${run.uid}_${run.stage}`} arena={`m_${run.mode}`} round={run.stage} playerTeam={dimensionTeam(run)} enemyTeam={dimensionEnemies(run)} items={run.items} label={`${DIMENSIONS.find((m) => m.id === run.mode)?.name} · ${run.stage}/${run.length}`} startState={run.carry} onUseItem={(id) => useRunItem(run.uid, id)} onFinish={(result, carry) => finishDimension(run.uid, run.stage, result, carry)} />;

  return <CityPage system="portal" onBack={onBack}>
    {run ? <RunPanel run={run} onClose={() => { closeRun(run.uid); setNote(""); }} onNote={setNote} /> : <>
      <p className="mk-exp-copy">10 dimensões com regras próprias, 3 campanhas ramificadas e 8 inimigos exclusivos. Cada entrada custa 10 energia; itens de percurso são separados do inventário. Percursos e escolhas são salvos. Sair para a cidade não abandona o percurso.</p>
      <div className="mk-exp-tabs">{[["modes", "DIMENSÕES"], ["story", "CAMPANHAS"], ["bestiary", "INIMIGOS EXCLUSIVOS"]].map(([id, name]) => <button key={id} aria-pressed={tab === id} onClick={() => { setTab(id); setSelected(null); }}>{name}</button>)}</div>
      {mode ? <Panel>
        <img src={`/modes/x_${mode.id}.png`} alt="" style={{ width: "100%", height: 140, objectFit: "cover" }} />
        <h2 className="mk-title mk-exp-title">{mode.name}</h2><p className="mk-exp-copy">{mode.desc}<br />{mode.length} encontros · +diamantes ao concluir</p>
        {campaign && <CityNotice>CAPÍTULO {(g.expansion.campaigns[campaign] ?? 0) + 1} · {CAMPAIGNS.find((c) => c.id === campaign)?.name}</CityNotice>}
        {mode.id === "draft" && <><p className="mk-exp-copy">Escolha exatamente 4 chassis: {picks.length}/4. Eles não serão adicionados à sua coleção e não recebem maestria.</p><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>{pool.map((id) => <button key={id} aria-pressed={picks.includes(id)} onClick={() => setPicks((p) => p.includes(id) ? p.filter((r) => r !== id) : p.length < 4 ? [...p, id] : p)} style={{ background: picks.includes(id) ? "#1b3a5c" : "#070b14", color: "#e8f4ff", border: `2px solid ${picks.includes(id) ? "#ffb43a" : "#1b3a5c"}`, display: "grid", placeItems: "center", padding: 4 }}><RobotSprite robotId={id} size={78} /><span style={{ fontSize: 8 }}>{ROBOT_MAP[id]?.name}</span></button>)}</div></>}
        {mode.id === "mono" && <label className="mk-exp-copy">FAMÍLIA ELEMENTAL<select aria-label="Família da liga" value={element} onChange={(ev) => setFamily(ev.target.value)} style={{ background: "#070b14", color: "#e8f4ff", width: "100%", padding: 8 }}>{families.map((el) => <option key={el} value={el}>{el} · {g.robots.filter((r) => detectElement(ROBOT_MAP[r.id]?.element ?? "") === el).length} chassis</option>)}</select><p>Até 4 chassis dessa família entram; equipes de 1 são permitidas.</p></label>}
        <div style={{ display: "grid", gap: 6, marginTop: 10 }}><PixelButton disabled={g.expansion.energy < 10 || !g.expansion.distribution.portal || mode.id === "draft" && picks.length !== 4} onClick={start}>INICIAR · 10 ENERGIA</PixelButton><PixelButton onClick={() => setSelected(null)}>VOLTAR À LISTA</PixelButton></div>
      </Panel> : <>
        {tab === "modes" && DIMENSIONS.map((m) => <Panel key={m.id}><img src={`/modes/x_${m.id}.png`} alt="" style={{ width: "100%", height: 116, objectFit: "cover" }} /><h2 className="mk-title mk-exp-title">{m.name}</h2><p className="mk-exp-copy">{m.desc}<br />CONCLUÍDOS: {g.expansion.counters[`${m.id}Wins`] ?? 0}</p><PixelButton onClick={() => select(m.id)}>PREPARAR EQUIPE</PixelButton></Panel>)}
        {tab === "story" && CAMPAIGNS.map((c) => {
          const chapter = g.expansion.campaigns[c.id] ?? 0, choice = g.expansion.storyChoices[`${c.id}_${chapter}`];
          const id = campaignMode(c.id, chapter), def = DIMENSIONS.find((m) => m.id === id)!;
          return <Panel key={c.id}><h2 className="mk-title mk-exp-title">{c.name}</h2><Progress value={chapter} max={6} /><p className="mk-exp-copy">{chapter}/6 capítulos. Cada vitória completa uma operação inteira. Capítulos posteriores aumentam a força inimiga.</p>
            {c.nodes.map((name, i) => <div key={name} className="mk-exp-copy" style={{ padding: 5, color: i < chapter ? "#57d76a" : i === chapter ? "#ffb43a" : "#7d94ad", borderLeft: "2px solid #1b3a5c", marginLeft: 8 }}>{i < chapter ? "CONCLUÍDO" : i === chapter ? "ATUAL" : "BLOQUEADO"} · {i + 1}. {name}</div>)}
            {chapter < 6 && <><p className="mk-exp-copy">{chapter === 1 || chapter === 3 ? "BIFURCAÇÃO: sua decisão altera o modo deste capítulo e a dificuldade." : "Abordagem: diplomacia mantém dificuldade; assalto aumenta inimigos em 8%."}<br />OPERAÇÃO: {def.name}</p><div style={{ display: "grid", gap: 6 }}><PixelButton onClick={() => chooseStory(c.id, chapter, "mercy")}>{choice === "mercy" ? "ESCOLHIDA · " : ""}DIPLOMACIA / RESGATE</PixelButton><PixelButton onClick={() => chooseStory(c.id, chapter, "force")}>{choice === "force" ? "ESCOLHIDA · " : ""}ASSALTO / CONFRONTO</PixelButton><PixelButton disabled={!choice} onClick={() => select(campaignMode(c.id, chapter), c.id)}>PREPARAR CAPÍTULO {chapter + 1}</PixelButton></div></>}
          </Panel>;
        })}
        {tab === "bestiary" && NPC_DEFS.map((npc) => <Panel key={npc.id}><div className="mk-exp-row"><RobotSprite robotId={npc.id} size={112} /><div><h2 className="mk-title mk-exp-title">{npc.name}</h2><div className="mk-exp-copy">{npc.element}<br />EXCLUSIVO · NÃO RECRUTÁVEL<br />16 FRAMES DE ANIMAÇÃO</div></div></div><p className="mk-exp-copy">{npc.bio}</p></Panel>)}
      </>}
    </>}
    <CityNotice>{note}</CityNotice>
  </CityPage>;
}

function RunPanel({ run, onClose, onNote }: { run: DimensionRun; onClose: () => void; onNote: (s: string) => void }) {
  const [confirm, setConfirm] = useState(false);
  const def = DIMENSIONS.find((m) => m.id === run.mode)!, rules = dimensionRules(run), choices = CHOICES[run.mode] ?? CHOICES.common;
  const terminal = ["won", "lost", "cashed"].includes(run.phase);
  return <>
    <img src={`/modes/x_${run.mode}.png`} alt="" style={{ width: "100%", height: 140, objectFit: "cover", flexShrink: 0 }} />
    <h2 className="mk-title mk-exp-title">{def.name} · ETAPA {run.stage}/{run.length}</h2>
    <p className="mk-exp-copy">{def.desc}</p><Progress value={run.stage - (terminal ? 0 : 1)} max={run.length} />
    <Panel><p className="mk-exp-copy" style={{ color: "#ffb43a" }}>BANCO: {run.bank} OURO · {terminal ? "JÁ LIQUIDADO" : "NÃO RECEBIDO AINDA"}<br />REPAROS {run.items.repair_kit ?? 0} · CÉLULAS {run.items.energy_cell ?? 0}<br />BÔNUS: {Object.entries(run.bonus).map(([k, v]) => `${k.toUpperCase()} +${v}`).join(" · ") || "NENHUM"}<br />{rules.core !== undefined && `NÚCLEO: ${Math.round(run.core)}/100`}{rules.deadline && `PRAZO DO ENCONTRO: ${rules.deadline} ROUNDS`}{rules.targetId && `ALVO: ${ROBOT_MAP[rules.targetId]?.name}`}</p>
      <div className="mk-exp-row">{run.team.map((r) => <div key={r.id} style={{ textAlign: "center" }}><RobotSprite robotId={r.id} size={68} dim={run.carry[r.id]?.hp === 0} /><div className="mk-exp-copy">Lv{r.level}<br />{Math.round((run.carry[r.id]?.hp ?? 1) * 100)}% HP</div></div>)}</div>
    </Panel>
    {run.path.length > 0 && <p className="mk-exp-copy">CAMINHO: {run.path.join(" → ")}</p>}
    {run.phase === "ready" && <><Panel><h3 className="mk-title mk-exp-title">PRÓXIMO ENCONTRO</h3><p className="mk-exp-copy">{dimensionEnemies(run).map((r) => ROBOT_MAP[r.id]?.name).join(" / ")}<br />{run.route === "risky" ? "ROTA PERIGOSA: +20% inimigo · prêmio dobrado" : "ROTA SEGURA: prêmio normal"}</p></Panel><PixelButton onClick={() => launchDimension(run.uid, run.stage)}>ENTRAR EM COMBATE</PixelButton></>}
    {run.phase === "choice" && <><h3 className="mk-title mk-exp-title">ESCOLHA O PRÓXIMO PASSO</h3>{choices.map(([id, name, desc]) => <Panel key={id}><h4 className="mk-title mk-exp-title">{name}</h4><p className="mk-exp-copy">{desc}</p><PixelButton disabled={run.mode === "caravan" && ["supplies", "repair"].includes(id) && run.bank < 150} onClick={() => onNote(runChoice(run.uid, id) ? "Escolha salva." : "Banco insuficiente ou escolha indisponível.")}>ESCOLHER</PixelButton></Panel>)}</>}
    {terminal ? <><CityNotice>{run.phase === "won" ? "PERCURSO CONCLUÍDO. Ouro, XP e diamantes já foram creditados uma única vez." : run.phase === "cashed" ? "BANCO RETIRADO. Ouro e XP já creditados; não conta como vitória do percurso." : "PERCURSO ENCERRADO. O banco foi perdido. Tente uma nova configuração."}</CityNotice><PixelButton onClick={onClose}>VOLTAR ÀS DIMENSÕES</PixelButton></> : <div style={{ marginTop: 12 }}>
      {confirm ? <><CityNotice>Abandonar perde todo o banco e as melhorias temporárias. Sua coleção não muda.</CityNotice><div className="mk-exp-row"><PixelButton onClick={onClose}>CONFIRMAR ABANDONO</PixelButton><PixelButton onClick={() => setConfirm(false)}>MANTER PERCURSO</PixelButton></div></> : <PixelButton onClick={() => setConfirm(true)}>ABANDONAR PERCURSO</PixelButton>}
    </div>}
  </>;
}