import { useState } from "react";
import { Frame, Panel, PixelButton } from "@/components/pixel";
import {
  CHIPS,
  CHIP_MAP,
  GADGET_MAP,
  GADGET_MAX_LEVEL,
  GADGET_MAX_SOCKETS,
  GADGET_MK_CAPS,
  GADGET_ROBOT_LEVEL,
  GADGET_SOCKET_LEVELS,
  chipColor,
  gadgetArt,
  gadgetDesc,
  gadgetMkLabel,
  gadgetSockets,
  gadgetTotals,
  gadgetUpgradeBars,
  KIND_LABEL,
  upgradeCost,
  type ChipDef,
} from "@/game/gadgets";
import {
  buyChip,
  buyGadget,
  equipChip,
  gadgetChipsOf,
  totalBars,
  upgradeGadget,
  useGame,
} from "@/game/save";
import { faceUrl, ROBOT_MAP } from "@/game/robots";
import { TopBar } from "@/screens/roster";

type Tab = "gadgets" | "chips";

/** Miniatura de um chip: quadro colorido pelo tier com a sigla do efeito. */
function ChipIcon({ def, size = 26 }: { def: ChipDef; size?: number }) {
  const color = chipColor(def);
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "grid",
        placeItems: "center",
        background: "rgba(4,10,20,0.95)",
        border: `2px solid ${color}`,
        boxShadow: `inset 0 0 0 2px rgba(2,6,12,0.9), 0 0 6px ${color}55`,
      }}
    >
      <span className="mk-title" style={{ fontSize: size > 22 ? 6 : 5, color }}>
        {KIND_LABEL[def.kind].slice(0, 3)}
      </span>
      <span
        className="mk-title"
        style={{ fontSize: 5, color: "rgba(200,220,240,0.8)", lineHeight: 1 }}
      >
        T{def.tier}
      </span>
    </div>
  );
}

/** Oficina do Engenheiro: gadgets MK-I/II/III, sockets e forja de chips. */
export function EngineerScreen({ onBack }: { onBack: () => void }) {
  const g = useGame();
  const [msg, setMsg] = useState("");
  const [tab, setTab] = useState<Tab>("gadgets");
  const [picker, setPicker] = useState<{ robotId: string; slot: number } | null>(null);

  const bars = totalBars(g);
  const ownedChips = CHIPS.filter((c) => g.chips.includes(c.id));

  const eligible = g.robots
    .filter((r) => GADGET_MAP[r.id])
    .sort((a, b) => {
      const la = (g.gadgets[a.id] ?? 0) > 0 ? 0 : 1;
      const lb = (g.gadgets[b.id] ?? 0) > 0 ? 0 : 1;
      if (la !== lb) return la - lb;
      return b.level - a.level;
    });

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
      <TopBar title="OFICINA DO ENGENHEIRO" gold={g.gold} onBack={onBack} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 4,
          padding: "5px 8px",
          background: "rgba(4,10,20,0.9)",
        }}
      >
        {([
          { id: "gadgets" as Tab, label: "GADGETS" },
          { id: "chips" as Tab, label: `FORJA DE CHIPS (${ownedChips.length}/${CHIPS.length})` },
        ]).map((t) => (
          <button
            key={t.id}
            type="button"
            className="mk-title"
            onClick={() => setTab(t.id)}
            style={{
              fontSize: 6,
              padding: "5px 2px",
              background: tab === t.id ? "rgba(53,226,240,0.22)" : "rgba(10,18,32,0.9)",
              border: `2px solid ${tab === t.id ? "var(--mk-accent)" : "rgba(80,100,130,0.45)"}`,
              color: tab === t.id ? "var(--mk-accent)" : "var(--mk-muted)",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div
        className="mk-scroll"
        style={{
          flex: 1,
          padding: 8,
          backgroundImage:
            "linear-gradient(rgba(4,9,18,0.82), rgba(4,9,18,0.94)), url(/ui/bg_gadget_modal.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          imageRendering: "pixelated",
        }}
      >
        <div
          className="mk-title"
          style={{ fontSize: 7, color: "var(--mk-muted)", marginBottom: 6, lineHeight: 1.6 }}
        >
          {tab === "gadgets"
            ? `LIBERA NO NIVEL ${GADGET_ROBOT_LEVEL} DO ROBO · MAX Lv${GADGET_MAX_LEVEL} EM 3 MARCOS (${GADGET_MK_CAPS.join("/")}) · SOCKETS EM Lv${GADGET_SOCKET_LEVELS.join("/")} · LINGOTES: ${bars}`
            : `${CHIPS.length} CHIPS EM 4 TIERS · ENCAIXAM EM QUALQUER GADGET COM SOCKET LIVRE · LINGOTES: ${bars}`}
        </div>
        {msg && (
          <div
            className="mk-title"
            style={{ fontSize: 7, color: "var(--mk-accent)", marginBottom: 6 }}
          >
            {msg}
          </div>
        )}

        {tab === "gadgets" && (
          <div style={{ display: "grid", gap: 6 }}>
            {eligible.map((r) => {
              const def = GADGET_MAP[r.id];
              const robot = ROBOT_MAP[r.id];
              const level = g.gadgets[r.id] ?? 0;
              const owned = level > 0;
              const locked = r.level < GADGET_ROBOT_LEVEL;
              const maxed = level >= GADGET_MAX_LEVEL;
              const cost = owned ? upgradeCost(def, level) : def.price;
              const upBars = owned ? gadgetUpgradeBars(def, level) : 0;
              const sockets = gadgetSockets(level);
              const slots = gadgetChipsOf(g, r.id);
              const totals = gadgetTotals(def, level, slots);

              return (
                <Panel key={r.id} style={{ padding: 6 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div style={{ position: "relative" }}>
                      <Frame rarity={def.rarity} size={46}>
                        <img
                          src={owned ? gadgetArt(r.id) : faceUrl(r.id)}
                          alt=""
                          style={{
                            width: "100%",
                            height: "100%",
                            imageRendering: "pixelated",
                            opacity: locked ? 0.4 : 1,
                          }}
                        />
                      </Frame>
                      {owned && (
                        <span
                          className="mk-title"
                          style={{
                            position: "absolute",
                            bottom: -2,
                            left: -2,
                            fontSize: 5,
                            padding: "1px 2px",
                            background: "rgba(2,6,12,0.92)",
                            color: "#ffd24a",
                            border: "1px solid rgba(255,210,74,0.5)",
                          }}
                        >
                          {gadgetMkLabel(level)}
                        </span>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="mk-title" style={{ fontSize: 7 }}>
                        {def.name}
                        {owned && (
                          <span style={{ color: "var(--mk-accent2)" }}>
                            {" "}
                            Lv{level}/{GADGET_MAX_LEVEL}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--mk-muted)" }}>
                        {robot.name} · Lv{r.level} · {KIND_LABEL[def.kind]} · {def.element}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--mk-fg)" }}>
                        {gadgetDesc(def, Math.max(1, level))}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="mk-btn mk-btn-sq"
                      disabled={
                        locked || maxed || g.gold < cost || (upBars > 0 && bars < upBars)
                      }
                      onClick={() => {
                        const ok = owned ? upgradeGadget(r.id) : buyGadget(r.id);
                        setMsg(
                          ok
                            ? owned
                              ? `${def.name} MELHORADO!`
                              : `${def.name} INSTALADO!`
                            : "NAO FOI POSSIVEL",
                        );
                      }}
                      style={{ fontSize: 7, padding: 0, minWidth: 70 }}
                    >
                      {locked
                        ? `Lv${GADGET_ROBOT_LEVEL}`
                        : maxed
                          ? "MAX"
                          : `${owned ? "+1 " : ""}${cost}${upBars > 0 ? ` +${upBars}L` : ""}`}
                    </button>
                  </div>

                  {owned && (
                    <>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          marginTop: 6,
                        }}
                      >
                        <span
                          className="mk-title"
                          style={{ fontSize: 6, color: "var(--mk-muted)" }}
                        >
                          SOCKETS
                        </span>
                        {Array.from({ length: GADGET_MAX_SOCKETS }).map((_, i) => {
                          const open = i < sockets;
                          const chip = slots[i] ? CHIP_MAP[slots[i] as string] : undefined;
                          return (
                            <button
                              key={`sk${i}`}
                              type="button"
                              disabled={!open}
                              onClick={() => setPicker({ robotId: r.id, slot: i })}
                              style={{
                                background: "transparent",
                                border: "none",
                                padding: 0,
                                cursor: open ? "pointer" : "default",
                                opacity: open ? 1 : 0.35,
                              }}
                            >
                              {chip ? (
                                <ChipIcon def={chip} />
                              ) : (
                                <div
                                  style={{
                                    width: 26,
                                    height: 26,
                                    display: "grid",
                                    placeItems: "center",
                                    background: "rgba(4,10,20,0.9)",
                                    border: "2px dashed rgba(120,140,170,0.5)",
                                  }}
                                >
                                  <span
                                    className="mk-title"
                                    style={{ fontSize: 5, color: "var(--mk-muted)" }}
                                  >
                                    {open ? "+" : `L${GADGET_SOCKET_LEVELS[i]}`}
                                  </span>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                      <div
                        style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 5 }}
                      >
                        {Object.entries(totals).map(([k, v]) => (
                          <span
                            key={k}
                            className="mk-title"
                            style={{
                              fontSize: 6,
                              padding: "2px 4px",
                              border: "1px solid rgba(53,226,240,0.4)",
                              color: "var(--mk-accent)",
                            }}
                          >
                            {KIND_LABEL[k as keyof typeof KIND_LABEL]} +{v}
                          </span>
                        ))}
                      </div>
                    </>
                  )}

                  {!owned && !locked && (
                    <div style={{ fontSize: 9, color: "var(--mk-muted)", marginTop: 4 }}>
                      {def.flavor}
                    </div>
                  )}
                </Panel>
              );
            })}
          </div>
        )}

        {tab === "chips" && (
          <div style={{ display: "grid", gap: 6 }}>
            {CHIPS.map((c) => {
              const has = g.chips.includes(c.id);
              const can = !has && g.gold >= c.price && bars >= c.bars;
              return (
                <Panel key={c.id} style={{ padding: 6 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <ChipIcon def={c} size={38} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        className="mk-title"
                        style={{ fontSize: 6, color: chipColor(c) }}
                      >
                        {c.name}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--mk-fg)" }}>{c.desc}</div>
                      <div style={{ fontSize: 9, color: "var(--mk-muted)" }}>
                        TIER {c.tier} · {c.price} G + {c.bars} LINGOTES
                      </div>
                    </div>
                    <button
                      type="button"
                      className="mk-btn mk-btn-sq"
                      disabled={!can}
                      onClick={() => {
                        const ok = buyChip(c.id);
                        setMsg(ok ? `${c.name} FORJADO!` : "RECURSOS INSUFICIENTES");
                      }}
                      style={{ fontSize: 7, padding: 0, minWidth: 66 }}
                    >
                      {has ? "OK" : "FORJAR"}
                    </button>
                  </div>
                </Panel>
              );
            })}
          </div>
        )}

        <div style={{ height: 12 }} />
        <PixelButton onClick={onBack}>SAIR DA OFICINA</PixelButton>
        <div style={{ height: 16 }} />
      </div>

      {picker && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(2,6,12,0.85)",
            display: "grid",
            placeItems: "center",
            padding: 12,
            zIndex: 5,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setPicker(null);
          }}
        >
          <Panel
            style={{ padding: 8, width: "100%", maxWidth: 320, maxHeight: "88%", overflowY: "auto" }}
          >
            <div className="mk-title" style={{ fontSize: 7, color: "var(--mk-accent)" }}>
              SOCKET {picker.slot + 1} · {GADGET_MAP[picker.robotId]?.name}
            </div>
            <div style={{ fontSize: 9, color: "var(--mk-muted)", marginTop: 3 }}>
              {ownedChips.length === 0
                ? "Nenhum chip forjado ainda. Va na aba FORJA DE CHIPS."
                : "Escolha um chip para encaixar."}
            </div>
            <div style={{ display: "grid", gap: 4, marginTop: 6 }}>
              {ownedChips.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const ok = equipChip(picker.robotId, picker.slot, c.id);
                    setMsg(ok ? `${c.name} ENCAIXADO!` : "NAO FOI POSSIVEL");
                    setPicker(null);
                  }}
                  style={{
                    display: "flex",
                    gap: 6,
                    alignItems: "center",
                    textAlign: "left",
                    background: "rgba(6,13,24,0.92)",
                    border: `2px solid ${chipColor(c)}`,
                    padding: 4,
                  }}
                >
                  <ChipIcon def={c} />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span className="mk-title" style={{ fontSize: 6, color: chipColor(c) }}>
                      {c.name}
                    </span>
                    <span
                      style={{ display: "block", fontSize: 9, color: "var(--mk-muted)" }}
                    >
                      {c.desc}
                    </span>
                  </span>
                </button>
              ))}
            </div>
            <div style={{ display: "grid", gap: 6, marginTop: 8 }}>
              <PixelButton
                onClick={() => {
                  equipChip(picker.robotId, picker.slot, null);
                  setMsg("SOCKET LIBERADO");
                  setPicker(null);
                }}
              >
                ESVAZIAR SOCKET
              </PixelButton>
              <PixelButton onClick={() => setPicker(null)}>FECHAR</PixelButton>
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}
