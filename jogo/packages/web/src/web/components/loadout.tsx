import { useMemo, useState } from "react";
import { Icon, PixelButton } from "@/components/pixel";
import { loadoutOf, resetLoadout, setLoadout, useGame } from "@/game/save";
import { MAX_LOADOUT, exclusiveUltimate, type Skill } from "@/game/skills";
import { effectLabel } from "@/game/combat";
import { kitMechs, kitOf } from "@/game/kits";
import { RESOURCES } from "@/game/kits/types";
import { mechDef } from "@/game/mechanics";
import { ELEMENT_MAP } from "@/game/elements";

type Filter = "all" | "attack" | "defense";

const SLOT_LABEL = Array.from({ length: MAX_LOADOUT }, (_, i) => i < 4 ? `ATAQUE ${i + 1}` : `DEFESA ${i - 3}`);

function tierOf(s: Skill): string {
  if (s.kind === "defense") return "DEFESA";
  if (s.mp === 0) return "BASICO";
  if (s.power >= 10) return "SUPREMO";
  if (s.power >= 7.5) return "PESADO";
  return "ESPECIAL";
}

function tierColor(s: Skill): string {
  const t = tierOf(s);
  if (t === "DEFESA") return "#57d76a";
  if (t === "SUPREMO") return "#ff5ea8";
  if (t === "PESADO") return "#ffc43a";
  if (t === "BASICO") return "#9aa4b0";
  return "#35e2f0";
}

/**
 * Editor de kit por slots: toque num slot e depois numa habilidade para equipar,
 * ou toque direto na habilidade para preencher o primeiro slot livre.
 */
export function LoadoutEditor({ robotId }: { robotId: string }) {
  const g = useGame();
  const dossier = kitOf(robotId);
  const skills = dossier.skills;
  const equipped = loadoutOf(g, robotId);
  const [slot, setSlot] = useState(0);
  const [filter, setFilter] = useState<Filter>("all");

  const byId = useMemo(
    () => Object.fromEntries(skills.map((s) => [s.id, s])) as Record<string, Skill>,
    [skills],
  );

  const ultimate = exclusiveUltimate(skills)!;
  const list = skills.filter(s=>s.id!==ultimate.id).filter((s) =>
    filter === "all" ? true : filter === "defense" ? s.kind === "defense" : s.kind !== "defense",
  );

  const kit = equipped.map((id) => byId[id]).filter(Boolean) as Skill[];
  const attacks = kit.filter((s) => s.kind !== "defense");
  const defenses = kit.filter((s) => s.kind === "defense");
  const avgPower = attacks.length
    ? Math.round((attacks.reduce((a, s) => a + s.power, 0) / attacks.length) * 10) / 10
    : 0;
  const avgMp = kit.length ? Math.round(kit.reduce((a, s) => a + s.mp, 0) / kit.length) : 0;
  const freeCost = kit.filter((s) => s.mp === 0).length;
  const mechs = kitMechs(dossier);
  const elDef = ELEMENT_MAP[dossier.element as keyof typeof ELEMENT_MAP] ?? null;
  const resDef = dossier.resource ? RESOURCES[dossier.resource] : null;

  function equip(id: string) {
    const chosen = byId[id];
    if (!chosen || chosen.id === ultimate.id || chosen.kind !== (slot < 4 ? "attack" : "defense")) return;
    const already = equipped.indexOf(id);
    const next = [...equipped];
    if (already >= 0) {
      // já equipada: troca de posição com o slot selecionado
      const target = next[slot];
      next[already] = target as string;
      next[slot] = id;
    } else {
      next[slot] = id;
    }
    setLoadout(robotId, next);
    setSlot((s) => (s + 1) % MAX_LOADOUT);
  }

  function preset(kind: "offense" | "balanced" | "defense") {
    const ordinary=skills.filter(s=>s.id!==ultimate.id);
    const atk=ordinary.filter(s=>s.kind==="attack").sort((a,b)=>kind==="offense"?b.power-a.power:a.mp-b.mp);
    const dfs=ordinary.filter(s=>s.kind==="defense").sort((a,b)=>kind==="defense"?b.power-a.power:a.mp-b.mp);
    setLoadout(robotId,[...atk.slice(0,4),...dfs.slice(0,2)].map(s=>s.id));
    setSlot(0);
  }

  return (
    <div style={{ marginTop: 10 }}>
      <div
        className="mk-title"
        style={{ fontSize: 8, display: "flex", justifyContent: "space-between" }}
      >
        <span>KIT DE COMBATE</span>
        <span style={{ color: "var(--mk-accent)" }}>
          {MAX_LOADOUT}/{MAX_LOADOUT} · {skills.length-1} DISPONÍVEIS + ULTIMATE
        </span>
      </div>

      {/* SLOTS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 4,
          marginTop: 6,
        }}
      >
        {Array.from({ length: MAX_LOADOUT }).map((_, i) => {
          const s = byId[equipped[i] ?? ""];
          const active = slot === i;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setSlot(i)}
              style={{
                border: `2px solid ${active ? "var(--mk-accent2)" : s ? tierColor(s) : "rgba(53,226,240,0.3)"}`,
                background: active ? "rgba(255,196,58,0.14)" : "rgba(8,18,32,0.85)",
                padding: 4,
                display: "grid",
                gap: 2,
                cursor: "pointer",
                minHeight: 54,
              }}
            >
              <span className="mk-title" style={{ fontSize: 5, color: "var(--mk-muted)" }}>
                {SLOT_LABEL[i]}
              </span>
              <span className="mk-title" style={{ fontSize: 6, lineHeight: 1.25 }}>
                {s ? (
                  <>
                    <Icon name={s.kind === "defense" ? "shield" : "fist"} size={9} /> {s.name}
                  </>
                ) : (
                  "VAZIO"
                )}
              </span>
              <span className="mk-title" style={{ fontSize: 5, color: "var(--mk-accent)" }}>
                {s ? `${s.mp} MP` : "-"}
              </span>
            </button>
          );
        })}
      </div>

      <div style={{marginTop:6,padding:8,border:"1px solid #ffcc68",background:"#241906"}}>
        <strong className="mk-title" style={{fontSize:7,color:"#ffe39a"}}>ULTIMATE EXCLUSIVO · {ultimate.name}</strong>
        <p style={{fontSize:11,lineHeight:1.4,margin:"6px 0"}}>{ultimate.desc}</p>
        <small>Separado dos 4 ataques e 2 defesas · 100% de carga · sem MP.</small>
      </div>
      {/* RESUMO */}
      <div
        className="mk-title"
        style={{
          fontSize: 6,
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          justifyContent: "space-between",
          marginTop: 6,
          padding: "4px 5px",
          border: "2px solid rgba(53,226,240,0.25)",
          background: "rgba(6,14,26,0.7)",
        }}
      >
        <span>
          ATK <span style={{ color: "var(--mk-accent2)" }}>{attacks.length}</span>
        </span>
        <span>
          DEF <span style={{ color: "#57d76a" }}>{defenses.length}</span>
        </span>
        <span>
          POTENCIA <span style={{ color: "var(--mk-accent2)" }}>{avgPower}</span>
        </span>
        <span>
          MP MEDIO <span style={{ color: "var(--mk-accent)" }}>{avgMp}</span>
        </span>
        <span>
          SEM CUSTO <span style={{ color: "#9aa4b0" }}>{freeCost}</span>
        </span>
      </div>
      {defenses.length === 0 && (
        <div className="mk-title" style={{ fontSize: 6, color: "#ff6b6b", marginTop: 4 }}>
          AVISO: KIT SEM DEFESA — SEM REPARO NEM GUARDA NA ARENA.
        </div>
      )}
      {freeCost === 0 && (
        <div className="mk-title" style={{ fontSize: 6, color: "#ffc43a", marginTop: 4 }}>
          AVISO: TODOS OS GOLPES CUSTAM MP — VOCE PODE FICAR SEM ENERGIA.
        </div>
      )}

      {/* DOSSIE DO CHASSI: elemento, recurso, talento, passivas e mecanicas */}
      <div
        style={{
          marginTop: 8,
          padding: "5px 6px",
          border: `2px solid ${elDef?.color ?? "rgba(53,226,240,0.3)"}`,
          background: "rgba(6,14,26,0.72)",
        }}
      >
        <div
          className="mk-title"
          style={{ fontSize: 6, display: "flex", justifyContent: "space-between", gap: 6 }}
        >
          <span style={{ color: "var(--mk-accent)" }}>SISTEMAS DO CHASSI</span>
          <span style={{ color: elDef?.color ?? "var(--mk-accent2)" }}>
            {elDef?.label ?? dossier.element} · {dossier.talent.kind.toUpperCase()}
          </span>
        </div>
        <div className="mk-title" style={{ fontSize: 6, marginTop: 4, color: "var(--mk-accent2)" }}>
          TALENTO: {dossier.talent.name}
        </div>
        <div style={{ fontSize: 10, color: "var(--mk-muted)", lineHeight: 1.35 }}>
          {dossier.talent.desc}
        </div>
        {resDef && (
          <>
            <div
              className="mk-title"
              style={{ fontSize: 6, marginTop: 4, color: resDef.color }}
            >
              RECURSO: {resDef.label} (0-{resDef.max})
            </div>
            <div style={{ fontSize: 10, color: "var(--mk-muted)", lineHeight: 1.35 }}>
              {resDef.desc}
            </div>
          </>
        )}
        <div className="mk-title" style={{ fontSize: 6, marginTop: 5, color: "#57d76a" }}>
          PASSIVAS ({dossier.passives.length})
        </div>
        {dossier.passives.map((pv) => (
          <div key={pv.id} style={{ marginTop: 2 }}>
            <span className="mk-title" style={{ fontSize: 6, color: "#57d76a" }}>
              {pv.name}
            </span>
            <span className="mk-title" style={{ fontSize: 5, color: "var(--mk-muted)" }}>
              {" "}
              [{pv.hook}]
            </span>
            <div style={{ fontSize: 10, color: "var(--mk-muted)", lineHeight: 1.3 }}>{pv.desc}</div>
          </div>
        ))}
        <div className="mk-title" style={{ fontSize: 6, marginTop: 5, color: "#ff5ea8" }}>
          MECANICAS EXCLUSIVAS ({mechs.length})
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 3 }}>
          {mechs.map((id) => {
            const md = mechDef(id);
            return (
              <span
                key={id}
                title={md?.desc}
                style={{
                  fontSize: 9,
                  padding: "1px 4px",
                  border: "1px solid #ff5ea8",
                  color: "#ff5ea8",
                  background: "rgba(255,94,168,0.10)",
                }}
              >
                {md?.label ?? id}
              </span>
            );
          })}
        </div>
        {elDef && (
          <div style={{ fontSize: 10, color: "var(--mk-muted)", marginTop: 4, lineHeight: 1.3 }}>
            <span className="mk-title" style={{ fontSize: 6, color: elDef.color }}>
              {elDef.label}
            </span>{" "}
            {elDef.identity}
          </div>
        )}
      </div>

      {/* PRESETS + FILTROS */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, marginTop: 6 }}>
        <PixelButton onClick={() => preset("offense")}>OFENSIVO</PixelButton>
        <PixelButton onClick={() => preset("balanced")}>EQUILIBRADO</PixelButton>
        <PixelButton onClick={() => preset("defense")}>DEFENSIVO</PixelButton>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 4, marginTop: 4 }}>
        {(["all", "attack", "defense"] as Filter[]).map((f) => (
          <button
            key={f}
            type="button"
            className="mk-btn mk-btn-sq"
            onClick={() => setFilter(f)}
            style={{
              fontSize: 6,
              padding: 0,
              borderColor: filter === f ? "var(--mk-accent2)" : undefined,
            }}
          >
            {f === "all" ? "TUDO" : f === "attack" ? "ATAQUES" : "DEFESAS"}
          </button>
        ))}
        <button
          type="button"
          className="mk-btn mk-btn-sq"
          onClick={() => {
            resetLoadout(robotId);
            setSlot(0);
          }}
          style={{ fontSize: 6, padding: 0 }}
        >
          PADRAO
        </button>
      </div>

      <div className="mk-title" style={{ fontSize: 6, color: "var(--mk-muted)", margin: "6px 0 3px" }}>
        TOQUE NUM SLOT E ESCOLHA A HABILIDADE ({SLOT_LABEL[slot]})
      </div>

      {/* LISTA */}
      {list.map((s) => {
        const pos = equipped.indexOf(s.id);
        const on = pos >= 0;
        return (
          <button
            key={s.id}
            type="button"
            disabled={s.kind !== (slot < 4 ? "attack" : "defense")}
            onClick={() => equip(s.id)}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              border: `2px solid ${on ? "var(--mk-accent)" : "rgba(53,226,240,0.24)"}`,
              background: on ? "rgba(53,226,240,0.16)" : "rgba(8,18,32,0.7)",
              padding: 5,
              marginBottom: 4,
              cursor: "pointer",
            }}
          >
            <div
              className="mk-title"
              style={{ fontSize: 7, display: "flex", justifyContent: "space-between", gap: 6 }}
            >
              <span>
                <Icon name={s.kind === "defense" ? "shield" : "fist"} size={10} />{" "}
                {on ? `[${pos + 1}] ` : "[ ] "}
                {s.name}
              </span>
              <span style={{ color: "var(--mk-accent)" }}>{s.mp} MP</span>
            </div>
            <div
              className="mk-title"
              style={{ fontSize: 5, color: tierColor(s), margin: "2px 0" }}
            >
              {tierOf(s)} · POTENCIA {s.power}
              {s.effect ? ` · ${effectLabel(s.effect.type).toUpperCase()}` : ""}
              {s.effect ? ` ${Math.round(s.effect.chance * 100)}%` : ""}
            </div>
            <div style={{ fontSize: 10, color: "var(--mk-muted)" }}>{s.desc}</div>
          </button>
        );
      })}
    </div>
  );
}
