import { useState } from "react";
import { CityStage, CityArt, CityHeading, CityMeter, CityToast, CityHelp } from "@/components/city-stage";
import { PixelButton } from "@/components/pixel";
import { useGame } from "@/game/save";
import { CITY_LABELS, energyCap, type CitySystem } from "@/game/expansion";
import { generation, capacitorCap, capacitorGain, PROTOCOLS } from "@/game/city-development";
import { distributePower, upgradePlant, convertGoldToEnergy } from "@/game/city-actions";
import { setPowerProtocol, dischargeCapacitor, powerPreset } from "@/game/city-research-actions";

const BUILDINGS: { id: CitySystem; x: number; y: number; desc: string }[] = [
  { id: "observatory", x: 23, y: 23, desc: "Mais provisões e menos risco nas expedições." },
  { id: "academy", x: 76, y: 22, desc: "Ativa talentos. Pontos extras reduzem custos e reforçam simulações." },
  { id: "contracts", x: 16, y: 60, desc: "+1 reputação adicional por ponto em cada contrato resgatado." },
  { id: "portal", x: 84, y: 58, desc: "Alimentação mínima de 1 para abrir dimensões e calibrar portais." },
  { id: "museum", x: 68, y: 81, desc: "Ativa ressonâncias. Cada ponto reforça bônus de conjuntos completos." },
  { id: "power", x: 48, y: 46, desc: "+1 geração por 2 pontos e +3 capacidade do capacitor por ponto." },
];
export function PowerScreen({ onBack }: { onBack: () => void }) {
  const g = useGame(), e = g.expansion, dev = e.development;
  const [selected, setSelected] = useState<CitySystem>("power"), [note, setNote] = useState(""), [zoom, setZoom] = useState(1);
  const building = BUILDINGS.find((b) => b.id === selected)!;
  const capacity = 4 + e.plant * 2, used = Object.values(e.distribution).reduce((a, b) => a + b, 0);
  const allocated = e.distribution[selected] ?? 0;
  return <CityStage system="power" onBack={onBack} subtitle="REDE ELÉTRICA · DESPACHO DE CARGA">
    <CityHeading tag={`CENTRAL MK-${e.plant} / REDE ${used}/${capacity}`} title="A cidade tem um coração.">Distribua potência, escolha um protocolo e mantenha suas construções vivas.</CityHeading>
    <div className="mk-power-workspace">
      <section className="mk-power-map" aria-label="Mapa de distribuição elétrica da cidade">
        <div className="mk-power-map-canvas" style={{ transform: `scale(${zoom})` }}>
          <CityArt name="power" className="mk-city-scene-fill" />
          <div className="mk-city-scene-vignette" />
          <svg className="mk-power-wires" viewBox="0 0 1000 700" preserveAspectRatio="none" aria-hidden="true">
            {BUILDINGS.filter((b) => b.id !== "power").map((b) => {
              const active = (e.distribution[b.id] ?? 0) > 0;
              return <g key={b.id} className={active ? "mk-power-wire-active" : ""}>
                <path className="mk-power-wire-base" d={`M480 322 L${b.x * 10} 322 L${b.x * 10} ${b.y * 7}`} />
                {active && <path className="mk-power-wire-flow" style={{ animationDuration: `${3.5 - (e.distribution[b.id] ?? 0) * .35}s` }} d={`M480 322 L${b.x * 10} 322 L${b.x * 10} ${b.y * 7}`} />}
              </g>;
            })}
          </svg>
          {BUILDINGS.map((b) => <button className={`mk-power-building${selected === b.id ? " is-selected" : ""}${(e.distribution[b.id] ?? 0) > 0 || b.id === "power" ? " is-powered" : ""}`}
            key={b.id} style={{ left: `${b.x}%`, top: `${b.y}%` }} aria-pressed={selected === b.id}
            onClick={() => setSelected(b.id)} aria-label={`${CITY_LABELS[b.id]}, ${e.distribution[b.id] ?? 0} pontos de alimentação`}>
            <img src={`/city/b_${b.id}.png`} alt="" />
            <span>{CITY_LABELS[b.id]}</span><b>{b.id === "power" ? `MK-${e.plant} · ${allocated && selected === "power" ? allocated : e.distribution.power ?? 0} P` : `${e.distribution[b.id] ?? 0} P · ${(e.distribution[b.id] ?? 0) > 0 ? "LIGADO" : "DESLIGADO"}`}</b>
          </button>)}
        </div>
        <div className="mk-power-map-hud"><span>FLUXO VISUAL · GERAÇÃO POR BATALHA</span><div><button aria-label="Diminuir zoom" onClick={() => setZoom(Math.max(.9, zoom - .1))}>−</button><button aria-label="Restaurar zoom" onClick={() => setZoom(1)}>1:1</button><button aria-label="Aumentar zoom" onClick={() => setZoom(Math.min(1.3, zoom + .1))}>+</button></div></div>
      </section>
      <aside className="mk-power-dispatch mk-city-console" key={selected}>
        <span className="mk-city-kicker">PRÉDIO SELECIONADO</span><h2>{CITY_LABELS[selected]}</h2><p>{building.desc}</p>
        <div className="mk-power-load-number">{allocated}<small>PONTOS DE POTÊNCIA</small></div>
        <CityMeter label="ALIMENTAÇÃO" value={allocated} max={6} />
        <div className="mk-city-actions"><PixelButton disabled={allocated === 0} onClick={() => { distributePower(selected, -1); setNote("Potência devolvida à rede."); }}>− RETIRAR</PixelButton><PixelButton disabled={used >= capacity || allocated >= 6} onClick={() => { distributePower(selected, 1); setNote(`${CITY_LABELS[selected]} recebeu potência.`); }}>+ ALOCAR</PixelButton></div>
        <p className="mk-city-muted">{capacity - used} pontos livres. Reator nível {e.plant}.</p>
        <div className="mk-power-presets"><span>PERFIS DE DESPACHO</span>{([["balanced", "BALANCEADO"], ["exploration", "EXPLORAÇÃO"], ["combat", "COMBATE"]] as const).map(([id, name]) => <button key={id} onClick={() => { powerPreset(id); setNote(`Rede reorganizada: ${name.toLowerCase()}.`); }}>{name}</button>)}</div>
      </aside>
    </div>
    <CityToast>{note}</CityToast>
    <section className="mk-power-control-deck">
      <div className="mk-city-console"><span className="mk-city-kicker">RESERVA PRINCIPAL</span><h2>{e.energy}<small> / {energyCap(e.plant)}</small></h2><CityMeter value={e.energy} max={energyCap(e.plant)} label="ENERGIA" />
        <p>+{generation(e)} energia a cada batalha concluída. O mapa não produz energia por tempo.</p>
        <PixelButton disabled={g.gold < 100 || e.energy >= energyCap(e.plant)} onClick={() => setNote(convertGoldToEnergy() ? "Sucata convertida em energia." : "Conversão indisponível.")}>CONVERTER · 100 OURO → {20 + e.plant * 2} E</PixelButton>
        <PixelButton disabled={e.plant >= 10 || g.gold < e.plant * 500} onClick={() => setNote(upgradePlant() ? "Reator ampliado: nova capacidade de armazenamento e distribuição." : "Melhoria indisponível.")}>{e.plant >= 10 ? "REATOR NO MÁXIMO" : `AMPLIAR REATOR · ${e.plant * 500} OURO`}</PixelButton>
      </div>
      <div className="mk-city-console"><span className="mk-city-kicker">CAPACITOR DE EMERGÊNCIA</span><h2>{dev.capacitor}<small> CARGA</small></h2><CityMeter value={dev.capacitor} max={capacitorCap(e)} label="CARGA ARMAZENADA" tone="gold" /><p>+{capacitorGain(e)} carga por batalha. Descarregar transfere para a reserva, sem custo.</p><PixelButton disabled={dev.capacitor <= 0 || e.energy >= energyCap(e.plant)} onClick={() => setNote(`Capacitor descarregado: +${dischargeCapacitor()} energia.`)}>DESCARREGAR CAPACITOR</PixelButton></div>
      <div className="mk-city-console"><span className="mk-city-kicker">PROTOCOLO DO REATOR</span><h2>COMO GERAR?</h2><div className="mk-power-protocols">{PROTOCOLS.map((p) => <button key={p.id} aria-pressed={dev.protocol === p.id} onClick={() => { setPowerProtocol(p.id); setNote(`Protocolo ${p.name.toLowerCase()} ativo.`); }}><b>{p.name}</b><span>{p.desc}</span></button>)}</div></div>
    </section>
    <CityHelp>Construções desligadas pausam suas funções energizadas; o save e suas relíquias não são apagados. Batalhas, conversão de ouro e descarga abastecem a reserva. Perfis redistribuem seus pontos de forma determinística; você pode ajustá-los no mapa. Capacitor e cargas de simulação avançam ao concluir batalhas.</CityHelp>
  </CityStage>;
}