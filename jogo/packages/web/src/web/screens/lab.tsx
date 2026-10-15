import { useEffect, useMemo, useState } from "react";
import { Panel, RobotSprite } from "@/components/pixel";
import { setCustomSet } from "@/game/compose";
import {
  CORES,
  CORE_MAP,
  LAB_HUES,
  LAB_MAX,
  SLOT_LABEL,
  SLOT_OPTIONS,
  buildCost,
  draftRatios,
  draftPower,
  draftRarity,
  emptyDraft,
  partLabel,
  partSetOf,
  partStats,
  scrapValue,
  toDraft,
  type LabDraft,
  type Slot,
} from "@/game/lab";
import { buildCustom, scrapCustom, totalBars, useGame } from "@/game/save";
import { TopBar } from "@/screens/roster";

const PREVIEW_ID = "lab_preview";
const SLOTS: Slot[] = ["head", "torso", "arm", "leg", "deco"];

const RARITY_COLOR: Record<string, string> = {
  bronze: "#c98b4b",
  silver: "#c8d6e5",
  gold: "#ffb43a",
};

const RARITY_LABEL: Record<string, string> = {
  bronze: "BRONZE",
  silver: "PRATA",
  gold: "OURO",
};

/** Seletor em carrossel: seta, valor no meio, seta. */
function Carousel({
  label,
  value,
  sub,
  index,
  total,
  onPrev,
  onNext,
  color = "var(--mk-accent)",
}: {
  label: string;
  value: string;
  sub?: string;
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  color?: string;
}) {
  return (
    <div style={{ marginBottom: 6 }}>
      <div
        className="mk-title"
        style={{ fontSize: 6, color: "var(--mk-muted)", marginBottom: 3 }}
      >
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "stretch", gap: 4 }}>
        <button
          type="button"
          className="mk-btn mk-btn-sq"
          onClick={onPrev}
          aria-label={`${label} anterior`}
          style={{ fontSize: 10, padding: "0 8px", minWidth: 30 }}
        >
          {"<"}
        </button>
        <div
          style={{
            flex: 1,
            minWidth: 0,
            textAlign: "center",
            padding: "5px 4px",
            background: "rgba(4,10,18,0.9)",
            border: "2px solid rgba(60,80,104,0.55)",
          }}
        >
          <div className="mk-title" style={{ fontSize: 7, color }}>
            {value}
          </div>
          <div
            className="mk-title"
            style={{ fontSize: 5, color: "var(--mk-muted)", marginTop: 3 }}
          >
            {sub ?? `${index + 1}/${total}`}
          </div>
        </div>
        <button
          type="button"
          className="mk-btn mk-btn-sq"
          onClick={onNext}
          aria-label={`${label} proximo`}
          style={{ fontSize: 10, padding: "0 8px", minWidth: 30 }}
        >
          {">"}
        </button>
      </div>
    </div>
  );
}

function StatRow({ name, value }: { name: string; value: number }) {
  const pct = Math.max(0, Math.min(1, (value - 60) / 85));
  const color = value >= 120 ? "var(--mk-ok)" : value >= 95 ? "var(--mk-accent)" : "#c98b4b";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
      <span className="mk-title" style={{ fontSize: 6, width: 26, color: "var(--mk-muted)" }}>
        {name}
      </span>
      <div
        style={{
          flex: 1,
          height: 7,
          background: "rgba(0,0,0,0.65)",
          border: "1px solid rgba(255,255,255,0.16)",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct * 100}%`,
            background: color,
            transition: "width 200ms linear",
          }}
        />
      </div>
      <span className="mk-title" style={{ fontSize: 6, width: 20, textAlign: "right" }}>
        {value}
      </span>
    </div>
  );
}

/** Fase F — laboratório de construção de robôs. */
export function LabScreen({ onBack }: { onBack: () => void }) {
  const g = useGame();
  const [tab, setTab] = useState<"montar" | "hangar">("montar");
  const [draft, setDraft] = useState<LabDraft>(() => emptyDraft());
  const [rev, setRev] = useState(0);
  const [msg, setMsg] = useState("");

  // Recompõe o sprite de preview sempre que o rascunho muda.
  useEffect(() => {
    setCustomSet(PREVIEW_ID, partSetOf(draft));
    setRev((n) => n + 1);
  }, [draft]);

  const ratios = useMemo(() => draftRatios(draft), [draft]);
  const power = draftPower(draft);
  const rarity = draftRarity(draft);
  const cost = buildCost(draft);
  const bars = totalBars(g);
  const core = CORE_MAP[draft.core] ?? CORES[0];
  const full = g.customs.length >= LAB_MAX;
  const canBuild = !full && g.gold >= cost.gold && bars >= cost.bars;

  function cycleSlot(slot: Slot, dir: number) {
    const opts = SLOT_OPTIONS[slot];
    setDraft((d) => {
      if (slot === "deco") {
        // o módulo é opcional: a lista ganha um "NENHUM" no início
        const list: (string | null)[] = [null, ...opts];
        const i = list.indexOf(d.deco);
        const next = list[(i + dir + list.length) % list.length];
        return { ...d, deco: next };
      }
      const cur = d[slot] as string;
      const i = Math.max(0, opts.indexOf(cur));
      return { ...d, [slot]: opts[(i + dir + opts.length) % opts.length] };
    });
  }

  function cycleHue(dir: number) {
    setDraft((d) => {
      const i = Math.max(0, LAB_HUES.findIndex((h) => h.hue === d.hue));
      return { ...d, hue: LAB_HUES[(i + dir + LAB_HUES.length) % LAB_HUES.length].hue };
    });
  }

  function cycleCore(dir: number) {
    setDraft((d) => {
      const i = Math.max(0, CORES.findIndex((c) => c.id === d.core));
      return { ...d, core: CORES[(i + dir + CORES.length) % CORES.length].id };
    });
  }

  function doBuild() {
    const id = buildCustom(draft);
    if (!id) {
      setMsg(full ? "LABORATORIO CHEIO" : "RECURSOS INSUFICIENTES");
      return;
    }
    setMsg(`${draft.name || "PROTOTIPO"} CONSTRUIDO!`);
    setDraft(emptyDraft());
    setTab("hangar");
  }

  const hueName =
    LAB_HUES.find((h) => h.hue === draft.hue)?.name ?? `${draft.hue}°`;
  const hueIndex = Math.max(0, LAB_HUES.findIndex((h) => h.hue === draft.hue));
  const coreIndex = Math.max(0, CORES.findIndex((c) => c.id === draft.core));

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
      <TopBar title="LABORATORIO" gold={g.gold} onBack={onBack} />

      {/* --------------------------------------------------------- abas */}
      <div style={{ display: "flex", gap: 4, padding: "6px 8px 0" }}>
        {([
          { id: "montar", label: "BANCADA" },
          { id: "hangar", label: `PROTOTIPOS ${g.customs.length}/${LAB_MAX}` },
        ] as const).map((t) => (
          <button
            key={t.id}
            type="button"
            className="mk-title"
            onClick={() => setTab(t.id)}
            style={{
              flex: 1,
              fontSize: 6,
              padding: "5px 4px",
              cursor: "pointer",
              color: tab === t.id ? "#04121c" : "var(--mk-muted)",
              background: tab === t.id ? "var(--mk-accent)" : "rgba(12,24,40,0.9)",
              border: `2px solid ${tab === t.id ? "var(--mk-accent)" : "rgba(60,80,104,0.55)"}`,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "montar" ? (
        <div className="mk-scroll" style={{ flex: 1, padding: 8 }}>
          {/* ------------------------------------------------- preview */}
          <div
            style={{
              position: "relative",
              height: 190,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 8,
              overflow: "hidden",
              backgroundImage:
                "linear-gradient(rgba(4,9,18,0.25), rgba(4,9,18,0.8)), url(/ui/bg_lab.png)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              imageRendering: "pixelated",
              border: "2px solid rgba(53,226,240,0.4)",
            }}
          >
            <div
              style={{
                position: "absolute",
                bottom: 10,
                width: 130,
                height: 14,
                borderRadius: "50%",
                background: "rgba(53,226,240,0.18)",
                filter: "blur(3px)",
              }}
            />
            <RobotSprite key={rev} robotId={PREVIEW_ID} clip="idle" size={168} />
            <div
              className="mk-title"
              style={{
                position: "absolute",
                top: 6,
                left: 6,
                fontSize: 7,
                color: RARITY_COLOR[rarity],
              }}
            >
              {RARITY_LABEL[rarity]} · POT {power}
            </div>
            <div
              className="mk-title"
              style={{ position: "absolute", top: 6, right: 6, fontSize: 7, color: "var(--mk-accent2)" }}
            >
              {core.element}
            </div>
          </div>

          {/* --------------------------------------------------- stats */}
          <Panel variant="strip" style={{ padding: 8, marginBottom: 8 }}>
            <StatRow name="HP" value={ratios.hp} />
            <StatRow name="MP" value={ratios.mp} />
            <StatRow name="FOR" value={ratios.str} />
            <StatRow name="DEF" value={ratios.def} />
            <StatRow name="AGI" value={ratios.ag} />
            <div
              className="mk-title"
              style={{ fontSize: 6, color: "var(--mk-muted)", marginTop: 5, lineHeight: 1.6 }}
            >
              {core.desc}
            </div>
          </Panel>

          {/* ------------------------------------------------ carrosséis */}
          <Panel variant="strip" style={{ padding: 8, marginBottom: 8 }}>
            {SLOTS.map((slot) => {
              const opts = SLOT_OPTIONS[slot];
              const cur = slot === "deco" ? draft.deco : (draft[slot] as string);
              const st = cur ? partStats(slot, cur) : null;
              const total = slot === "deco" ? opts.length + 1 : opts.length;
              const idx = cur ? opts.indexOf(cur) + (slot === "deco" ? 1 : 0) : 0;
              return (
                <Carousel
                  key={slot}
                  label={SLOT_LABEL[slot]}
                  value={cur ? partLabel(slot, cur) : "SEM MODULO"}
                  sub={
                    st
                      ? `${idx + 1}/${total} · HP${st.hp} FOR${st.str} DEF${st.def} AGI${st.ag}`
                      : `1/${total} · sem bônus`
                  }
                  index={idx}
                  total={total}
                  onPrev={() => cycleSlot(slot, -1)}
                  onNext={() => cycleSlot(slot, 1)}
                />
              );
            })}
            <Carousel
              label="PALETA"
              value={hueName}
              index={hueIndex}
              total={LAB_HUES.length}
              onPrev={() => cycleHue(-1)}
              onNext={() => cycleHue(1)}
              color="var(--mk-accent2)"
            />
            <Carousel
              label="NUCLEO"
              value={core.element}
              index={coreIndex}
              total={CORES.length}
              onPrev={() => cycleCore(-1)}
              onNext={() => cycleCore(1)}
              color="var(--mk-accent2)"
            />
          </Panel>

          {/* -------------------------------------------- nome e construir */}
          <Panel variant="strip" style={{ padding: 8 }}>
            <div
              className="mk-title"
              style={{ fontSize: 6, color: "var(--mk-muted)", marginBottom: 3 }}
            >
              NOME DO CHASSI
            </div>
            <input
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value.slice(0, 14) }))}
              placeholder="PROTOTIPO"
              aria-label="nome do chassi"
              className="mk-title"
              style={{
                width: "100%",
                fontSize: 7,
                padding: "6px 6px",
                color: "var(--mk-text)",
                background: "rgba(4,10,18,0.9)",
                border: "2px solid rgba(60,80,104,0.55)",
                outline: "none",
                marginBottom: 7,
              }}
            />
            <div
              className="mk-title"
              style={{ fontSize: 7, display: "flex", justifyContent: "space-between", marginBottom: 6 }}
            >
              <span style={{ color: g.gold >= cost.gold ? "var(--mk-ok)" : "var(--mk-hp)" }}>
                {cost.gold}g
              </span>
              <span style={{ color: bars >= cost.bars ? "var(--mk-ok)" : "var(--mk-hp)" }}>
                {cost.bars} LINGOTES ({bars})
              </span>
            </div>
            <button
              type="button"
              className="mk-btn"
              onClick={doBuild}
              disabled={!canBuild}
              style={{ width: "100%", fontSize: 9, padding: "8px 4px" }}
            >
              CONSTRUIR
            </button>
            {msg && (
              <div
                className="mk-title"
                style={{ fontSize: 6, color: "var(--mk-accent2)", marginTop: 6, textAlign: "center" }}
              >
                {msg}
              </div>
            )}
            <div
              className="mk-title"
              style={{ fontSize: 5, color: "var(--mk-muted)", marginTop: 6, lineHeight: 1.7 }}
            >
              LINGOTES SAEM DA REFINARIA DA MINA PROFUNDA.
            </div>
          </Panel>
        </div>
      ) : (
        <div className="mk-scroll" style={{ flex: 1, padding: 8 }}>
          {g.customs.length === 0 && (
            <div
              className="mk-title"
              style={{ fontSize: 7, color: "var(--mk-muted)", textAlign: "center", padding: 24, lineHeight: 1.8 }}
            >
              NENHUM PROTOTIPO AINDA.
              <br />
              MONTE O PRIMEIRO NA BANCADA.
            </div>
          )}
          {g.customs.map((c) => {
            const d = toDraft(c);
            const r = draftRatios(d);
            const rar = draftRarity(d);
            const lvl = g.robots.find((x) => x.id === c.id)?.level ?? 1;
            return (
              <Panel
                key={c.id}
                variant="card"
                style={{ padding: 8, marginBottom: 8, display: "flex", gap: 8, alignItems: "center" }}
              >
                <div style={{ flexShrink: 0 }}>
                  <RobotSprite robotId={c.id} clip="idle" size={72} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="mk-title" style={{ fontSize: 8, color: RARITY_COLOR[rar] }}>
                    {c.name}
                  </div>
                  <div
                    className="mk-title"
                    style={{ fontSize: 6, color: "var(--mk-muted)", marginTop: 4, lineHeight: 1.7 }}
                  >
                    NV {lvl} · {(CORE_MAP[c.core] ?? CORES[0]).element}
                    <br />
                    HP{r.hp} MP{r.mp} FOR{r.str} DEF{r.def} AGI{r.ag}
                  </div>
                  <button
                    type="button"
                    className="mk-btn"
                    onClick={() => {
                      const got = scrapCustom(c.id);
                      setMsg(`DESMONTADO +${got}g`);
                    }}
                    style={{ fontSize: 6, padding: "4px 6px", marginTop: 6 }}
                  >
                    DESMONTAR +{scrapValue(c)}g
                  </button>
                </div>
              </Panel>
            );
          })}
          {msg && (
            <div
              className="mk-title"
              style={{ fontSize: 6, color: "var(--mk-accent2)", textAlign: "center", padding: 6 }}
            >
              {msg}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
