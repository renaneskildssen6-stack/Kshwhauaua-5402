import { useState } from "react";
import { CityStage, CityArt, CityHeading, CityMeter, CityToast, CityHelp, RelicArt } from "@/components/city-stage";
import { PixelButton } from "@/components/pixel";
import { useGame } from "@/game/save";
import { RELICS, ROUTES, relicSetCount } from "@/game/expansion";
import { SET_NAMES, SET_STATS } from "@/game/city-development";
import { upgradeResonance } from "@/game/city-research-actions";

const PLINTHS = [[15,64],[37,78],[63,78],[85,64]];
export function MuseumScreen({ onBack }: { onBack: () => void }) {
  const g = useGame(), e = g.expansion;
  const [set, setSet] = useState(0), [piece, setPiece] = useState(0), [note, setNote] = useState("");
  const relics = RELICS.filter((r) => r.set === set), relic = relics[piece], owned = e.relics.includes(relic.id);
  const count = relicSetCount(e, set), power = e.distribution.museum ?? 0, level = e.development.resonance[set] ?? 0;
  const base2 = set === 1 ? 20 : 3, base4 = (set === 1 ? 30 : 5) + power, resonance = level * (set === 1 ? 10 : 2);
  return <CityStage system="museum" onBack={onBack} subtitle="SALÃO ANCESTRAL · RELÍQUIAS E RESSONÂNCIA">
    <CityHeading tag={`${e.relics.length}/24 PEÇAS CATALOGADAS · ${power ? "GALERIA ENERGIZADA" : "BÔNUS PAUSADOS"}`} title="O passado ainda pulsa.">Seis civilizações. Vinte e quatro memórias. Um legado que fortalece toda a equipe.</CityHeading>
    <nav className="mk-museum-wings" aria-label="Alas do museu">{SET_NAMES.map((name, i) => <button key={name} aria-pressed={i === set} onClick={() => { setSet(i); setPiece(0); }}><RelicArt index={i * 4} size={36} /><span>{name}<small>{relicSetCount(e,i)}/4 · R{e.development.resonance[i] ?? 0}</small></span></button>)}</nav>
    <div className="mk-museum-workspace">
      <section className={`mk-museum-hall mk-museum-hall-${set}`} aria-label={`Galeria do conjunto ${SET_NAMES[set]}`}>
        <CityArt name="museum" className="mk-city-scene-fill" /><div className="mk-city-scene-vignette" />
        <div className="mk-museum-hall-label"><span>ALA {String(set + 1).padStart(2,"0")}</span><h2>{SET_NAMES[set]}</h2><p>{count === 4 ? "CONJUNTO COMPLETO" : `${count} RELÍQUIAS DESCOBERTAS`}</p></div>
        <div className="mk-museum-featured" key={relic.id}><RelicArt index={relic.icon} size={132} locked={!owned} /><span>{owned ? "MEMÓRIA RESTAURADA" : "MEMÓRIA AUSENTE"}</span></div>
        {relics.map((r, i) => <button className={`mk-museum-vitrine${piece === i ? " is-selected" : ""}${e.relics.includes(r.id) ? " is-owned" : ""}`} key={r.id} aria-pressed={i === piece} onClick={() => setPiece(i)} style={{ left: `${PLINTHS[i][0]}%`, top: `${PLINTHS[i][1]}%` }}>
          <RelicArt index={r.icon} size={70} locked={!e.relics.includes(r.id)} /><span>{r.name}</span><small>{e.relics.includes(r.id) ? "CATALOGADA" : "NÃO DESCOBERTA"}</small>
        </button>)}
      </section>
      <aside className="mk-museum-curator mk-city-console"><span className="mk-city-kicker">REGISTRO {String(relic.icon + 1).padStart(2,"0")} / 24</span><h2>{relic.name}</h2><p>{relic.desc}</p><p className="mk-city-muted">Origem: {ROUTES[set].name}. {owned ? "Peça preservada no seu acervo." : "Conclua uma expedição desta rota para receber a próxima peça ausente."}</p>
        <CityMeter label="CONJUNTO" value={count} max={4} tone="gold" />
        <div className="mk-museum-bonuses">
          <div className={count >= 2 && power ? "is-active" : ""}><span>2 PEÇAS</span><strong>+{base2} {SET_STATS[set]}</strong><small>{count >= 2 && power ? "ATIVO" : "INATIVO"}</small></div>
          <div className={count >= 4 && power ? "is-active" : ""}><span>4 PEÇAS</span><strong>+{base4} {SET_STATS[set]}</strong><small>{count >= 4 && power ? "ATIVO" : "INATIVO"}</small></div>
          <div className={count >= 2 && power && level ? "is-active" : ""}><span>RESSONÂNCIA R{level}</span><strong>+{resonance} {SET_STATS[set]}</strong><small>{count >= 2 && power && level ? "ATIVA" : "SEM PESQUISA ATIVA"}</small></div>
        </div>
        <h3>AMPLIFICAR A MEMÓRIA</h3><p>Até três pesquisas por conjunto. Com duas peças, cada nível dá +{set === 1 ? 10 : 2} {SET_STATS[set]} extra à equipe.</p>
        <PixelButton disabled={level >= 3 || count < 2 || !power || g.gold < 400 * (level + 1) || e.energy < 6} onClick={() => setNote(upgradeResonance(set) ? `Ressonância ${SET_NAMES[set]} ampliada para R${level + 1}.` : "São necessárias duas peças, alimentação e recursos.")}>{level >= 3 ? "RESSONÂNCIA MÁXIMA" : `PESQUISAR · ${400 * (level + 1)} OURO + 6 E`}</PixelButton>
      </aside>
    </div>
    <CityToast>{note || (!power ? "Museu sem energia: acervo preservado, bônus suspensos. Alimente o prédio na usina." : "Selecione uma vitrine para consultar sua origem e a ressonância do conjunto.")}</CityToast>
    <section className="mk-museum-catalogue"><header><span className="mk-city-kicker">PANORAMA DO ACERVO</span><h2>SEIS LEGADOS, UMA EQUIPE.</h2></header><div>{SET_NAMES.map((name, i) => <button key={name} aria-pressed={set === i} onClick={() => { setSet(i); setPiece(0); }}><span>{name}</span><div>{RELICS.filter((r) => r.set === i).map((r) => <RelicArt key={r.id} index={r.icon} size={40} locked={!e.relics.includes(r.id)} />)}</div><small>{relicSetCount(e, i)}/4 PEÇAS · +{SET_STATS[i]} · R{e.development.resonance[i] ?? 0}</small></button>)}</div></section>
    <CityHelp>Os bônus de duas peças, quatro peças e ressonância se acumulam em toda a equipe. Alimentação extra reforça conjuntos completos. Desligar o museu não remove peças nem pesquisas. Expedições nunca entregam uma peça repetida enquanto houver relíquias ausentes naquele conjunto.</CityHelp>
  </CityStage>;
}