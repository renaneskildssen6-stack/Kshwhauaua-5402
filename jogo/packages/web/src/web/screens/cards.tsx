import { useMemo, useState } from "react";
import { Panel, PixelButton } from "@/components/pixel";
import {
  BASE_CARDS,
  CARD_MAP,
  CARD_MAX_REFINE,
  CARD_RARITY_COLOR,
  CARD_STAT_LABEL,
  CARD_TAG_LABEL,
  MAX_CARDS,
  SEALS,
  cardArt,
  cardFilter,
  cardModsAt,
  cardSlots,
  deckBudget,
  nearSynergies,
  refineBars,
  refineCost,
  resolveDeck,
  sealedVariants,
  type BaseCard,
  type CardDef,
  type CardStat,
} from "@/game/cards";
import {
  buyCard,
  cardRefineOf,
  clearDeck,
  refineCard,
  toggleCard,
  totalBars,
  useGame,
} from "@/game/save";
import { TopBar } from "@/screens/roster";

type Tab = "todos" | "deck" | "meus" | "loja";

const TABS: { id: Tab; label: string }[] = [
  { id: "deck", label: "DECK" },
  { id: "meus", label: "MEUS" },
  { id: "loja", label: "LOJA" },
  { id: "todos", label: "TODOS" },
];

function modLine(stat: CardStat, value: number): string {
  const sign = value >= 0 ? "+" : "";
  const suffix = stat === "mpregen" ? "" : "%";
  return `${CARD_STAT_LABEL[stat]} ${sign}${value}${suffix}`;
}

/** Arte do card com o tom do selo aplicado. */
function CardArt({
  def,
  width,
  dim,
}: {
  def: CardDef;
  width?: number;
  dim?: boolean;
}) {
  const tint = cardFilter(def);
  // um card nao possuido continua com o tom do selo, so mais apagado
  const filter = dim ? `${tint ? `${tint} ` : ""}grayscale(0.3) brightness(0.62)` : tint;
  return (
    <img
      src={cardArt(def.id)}
      alt={def.name}
      width={width}
      style={{
        width: width ? undefined : "100%",
        maxWidth: "none",
        imageRendering: "pixelated",
        filter,
      }}
    />
  );
}

/** Salao de Cards: 30 bases x 7 selos, refino ate +10 e deck de ate 5 slots. */
export function CardsScreen({ onBack }: { onBack: () => void }) {
  const g = useGame();
  const [tab, setTab] = useState<Tab>("deck");
  const [msg, setMsg] = useState("");
  const [detail, setDetail] = useState<BaseCard | null>(null);
  const [sealIdx, setSealIdx] = useState(0);

  const deck = useMemo(() => resolveDeck(g.deck, g.cardRefine), [g.deck, g.cardRefine]);
  const slots = cardSlots(g.playerLevel);
  const near = useMemo(() => nearSynergies(g.deck, slots), [g.deck, slots]);
  const budget = deckBudget(g.playerLevel);
  const owned = new Set(g.cards);
  const bars = totalBars(g);

  const rows = BASE_CARDS.map((base) => {
    const variants = sealedVariants(base.id);
    const mine = variants.filter((v) => owned.has(v.id));
    const inDeck = variants.filter((v) => g.deck.includes(v.id));
    const show = inDeck[0] ?? mine[mine.length - 1] ?? variants[0];
    return { base, variants, mine, inDeck, show };
  }).filter((r) => {
    if (tab === "deck") return r.inDeck.length > 0;
    if (tab === "meus") return r.mine.length > 0;
    if (tab === "loja") return r.mine.length < r.variants.length;
    return true;
  });

  const sel = detail ? sealedVariants(detail.id)[sealIdx] : null;
  const selRefine = sel ? cardRefineOf(g, sel.id) : 1;
  const selMods = sel ? cardModsAt(sel, selRefine) : {};
  const rCost = sel ? refineCost(sel, selRefine) : 0;
  const rBars = sel ? refineBars(sel, selRefine) : 0;

  const openDetail = (base: BaseCard, idx: number) => {
    setDetail(base);
    setSealIdx(idx);
  };

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
      <TopBar title="SALAO DE CARDS" gold={g.gold} onBack={onBack} />

      {/* faixa do deck */}
      <div
        style={{
          padding: "6px 8px",
          background: "rgba(6,12,22,0.95)",
          borderBottom: "2px solid rgba(53,226,240,0.3)",
        }}
      >
        <div
          className="mk-title"
          style={{ fontSize: 7, display: "flex", justifyContent: "space-between" }}
        >
          <span>
            DECK {g.deck.length}/{slots}
            {slots < MAX_CARDS ? ` (MAX ${MAX_CARDS})` : ""}
          </span>
          <span style={{ color: deck.cost > budget ? "#ff6b6b" : "var(--mk-accent2)" }}>
            ENERGIA {deck.cost}/{budget}
          </span>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${Math.max(3, slots)}, 1fr)`,
            gap: 5,
            marginTop: 5,
          }}
        >
          {Array.from({ length: Math.max(3, slots) }).map((_, i) => {
            const id = g.deck[i];
            const def = id ? CARD_MAP[id] : undefined;
            const locked = i >= slots;
            const ref = def ? cardRefineOf(g, def.id) : 1;
            return (
              <button
                key={`slot${i}`}
                type="button"
                onClick={() => def && toggleCard(def.id)}
                style={{
                  position: "relative",
                  aspectRatio: "3 / 4",
                  background: "rgba(4,10,20,0.9)",
                  border: `2px solid ${def ? CARD_RARITY_COLOR[def.rarity] : "rgba(90,110,140,0.5)"}`,
                  padding: 2,
                  display: "grid",
                  placeItems: "center",
                  cursor: def ? "pointer" : "default",
                  overflow: "hidden",
                  opacity: locked ? 0.45 : 1,
                }}
              >
                {def ? (
                  <>
                    <CardArt def={def} />
                    {ref > 1 && (
                      <span
                        className="mk-title"
                        style={{
                          position: "absolute",
                          bottom: 1,
                          right: 1,
                          fontSize: 5,
                          padding: "1px 2px",
                          background: "rgba(2,6,12,0.9)",
                          color: "#ffd24a",
                        }}
                      >
                        +{ref - 1}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="mk-title" style={{ fontSize: 6, color: "var(--mk-muted)" }}>
                    {locked ? `Lv${[1, 1, 1, 20, 45][i] ?? 99}` : "VAZIO"}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {deck.synergies.length > 0 && (
          <div style={{ marginTop: 5, display: "grid", gap: 3 }}>
            {deck.synergies.map((s) => (
              <div
                key={s.id}
                className="mk-title"
                style={{
                  fontSize: 6,
                  color: "#7cffb2",
                  background: "rgba(20,60,40,0.55)",
                  border: "1px solid rgba(124,255,178,0.4)",
                  padding: "3px 4px",
                }}
              >
                ★ {s.name} — {s.desc}
              </div>
            ))}
          </div>
        )}
        {near.length > 0 && (
          <div
            className="mk-title"
            style={{ fontSize: 6, color: "var(--mk-muted)", marginTop: 4 }}
          >
            A 1 CARD DE: {near.slice(0, 2).map((s) => s.name).join(" · ")}
          </div>
        )}
        {Object.keys(deck.mods).length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 3,
              marginTop: 4,
            }}
          >
            {(Object.entries(deck.mods) as [CardStat, number][]).map(([k, v]) => (
              <span
                key={k}
                className="mk-title"
                style={{
                  fontSize: 6,
                  padding: "2px 4px",
                  border: "1px solid rgba(53,226,240,0.4)",
                  color: v >= 0 ? "var(--mk-accent)" : "#ff8a8a",
                }}
              >
                {modLine(k, v)}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* abas */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${TABS.length}, 1fr)`,
          gap: 4,
          padding: "5px 8px",
          background: "rgba(4,10,20,0.9)",
        }}
      >
        {TABS.map((t) => (
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
        className="mk-title"
        style={{
          fontSize: 6,
          color: "var(--mk-muted)",
          padding: "3px 8px",
          background: "rgba(4,10,20,0.9)",
        }}
      >
        {BASE_CARDS.length} BASES x {SEALS.length} SELOS = {BASE_CARDS.length * SEALS.length} CARDS
        · LINGOTES: {bars}
      </div>

      {msg && (
        <div
          className="mk-title"
          style={{ fontSize: 7, color: "var(--mk-accent)", padding: "4px 8px" }}
        >
          {msg}
        </div>
      )}

      <div
        className="mk-scroll"
        style={{
          flex: 1,
          padding: 8,
          backgroundImage:
            "linear-gradient(rgba(4,9,18,0.86), rgba(4,9,18,0.96)), url(/ui/bg_heroes.png)",
          backgroundSize: "cover",
          imageRendering: "pixelated",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {rows.map((row) => {
            const def = row.show;
            const has = owned.has(def.id);
            const equipped = row.inDeck.length > 0;
            const locked = g.playerLevel < row.variants[0].requiredLevel;
            const idx = Math.max(0, sealedVariants(row.base.id).indexOf(def));
            return (
              <button
                key={row.base.id}
                type="button"
                onClick={() => openDetail(row.base, idx)}
                style={{
                  background: "rgba(6,13,24,0.92)",
                  border: `2px solid ${equipped ? "var(--mk-accent)" : CARD_RARITY_COLOR[def.rarity]}`,
                  padding: 4,
                  textAlign: "left",
                  display: "grid",
                  gap: 3,
                }}
              >
                <div style={{ position: "relative" }}>
                  <CardArt def={def} dim={row.mine.length === 0} />
                  <span
                    className="mk-title"
                    style={{
                      position: "absolute",
                      top: 2,
                      right: 2,
                      fontSize: 6,
                      padding: "2px 3px",
                      background: "rgba(2,6,12,0.85)",
                      color: "var(--mk-accent2)",
                      border: "1px solid rgba(53,226,240,0.5)",
                    }}
                  >
                    {def.cost}
                  </span>
                  <span
                    className="mk-title"
                    style={{
                      position: "absolute",
                      top: 2,
                      left: 2,
                      fontSize: 5,
                      padding: "2px 3px",
                      background: "rgba(2,6,12,0.85)",
                      color: row.mine.length > 0 ? "#ffd24a" : "var(--mk-muted)",
                    }}
                  >
                    {row.mine.length}/{row.variants.length}
                  </span>
                  {equipped && (
                    <span
                      className="mk-title"
                      style={{
                        position: "absolute",
                        bottom: 2,
                        left: 2,
                        fontSize: 6,
                        padding: "2px 3px",
                        background: "rgba(53,226,240,0.85)",
                        color: "#04121c",
                      }}
                    >
                      NO DECK
                    </span>
                  )}
                </div>
                <div
                  className="mk-title"
                  style={{ fontSize: 6, color: CARD_RARITY_COLOR[def.rarity] }}
                >
                  {row.base.name}
                </div>
                <div style={{ fontSize: 8, color: "var(--mk-muted)", lineHeight: 1.35 }}>
                  {row.base.desc}
                </div>
                <div className="mk-title" style={{ fontSize: 5, color: "rgba(150,170,195,0.75)" }}>
                  {row.base.tags.map((t) => CARD_TAG_LABEL[t]).join(" · ")}
                </div>
                <div className="mk-title" style={{ fontSize: 6, color: "var(--mk-accent2)" }}>
                  {has
                    ? equipped
                      ? "EQUIPADO"
                      : "NA COLECAO"
                    : locked
                      ? `Lv ${row.variants[0].requiredLevel}`
                      : `${row.variants[0].price} G`}
                </div>
              </button>
            );
          })}
        </div>
        {rows.length === 0 && (
          <div
            className="mk-title"
            style={{ fontSize: 7, color: "var(--mk-muted)", textAlign: "center", marginTop: 24 }}
          >
            NENHUM CARD AQUI AINDA
          </div>
        )}
        <div style={{ marginTop: 8 }}>
          <PixelButton disabled={g.deck.length === 0} onClick={() => { clearDeck(); setMsg("Deck esvaziado."); }}>
            LIMPAR DECK
          </PixelButton>
        </div>
        <div style={{ height: 40 }} />
      </div>

      {detail && sel && (
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
            // fecha so no toque fora do painel; cliques internos (comprar/refinar) nao fecham
            if (e.target === e.currentTarget) setDetail(null);
          }}
        >
          <Panel
            style={{
              padding: 8,
              width: "100%",
              maxWidth: 320,
              maxHeight: "92%",
              overflowY: "auto",
              border: `2px solid ${CARD_RARITY_COLOR[sel.rarity]}`,
            }}
          >
            <div style={{ display: "flex", gap: 8 }}>
              <CardArt def={sel} width={96} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="mk-title" style={{ fontSize: 7, color: CARD_RARITY_COLOR[sel.rarity] }}>
                  {sel.name}
                </div>
                <div className="mk-title" style={{ fontSize: 6, color: "var(--mk-accent2)", marginTop: 3 }}>
                  {sel.rarity.toUpperCase()} · {sel.element} · ENERGIA {sel.cost}
                </div>
                <div className="mk-title" style={{ fontSize: 6, color: "#ffd24a", marginTop: 3 }}>
                  SELO {sel.sealName} · REFINO +{selRefine - 1}/{CARD_MAX_REFINE - 1}
                </div>
                <div style={{ fontSize: 9, color: "var(--mk-muted)", marginTop: 4 }}>{sel.desc}</div>
                <div style={{ fontSize: 9, color: "rgba(150,170,195,0.7)", marginTop: 3 }}>
                  {sel.flavor}
                </div>
              </div>
            </div>

            {/* selos */}
            <div
              className="mk-title"
              style={{ fontSize: 6, color: "var(--mk-muted)", marginTop: 7 }}
            >
              SELOS
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${SEALS.length}, 1fr)`,
                gap: 3,
                marginTop: 3,
              }}
            >
              {sealedVariants(detail.id).map((v, i) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSealIdx(i);
                  }}
                  style={{
                    position: "relative",
                    aspectRatio: "3 / 4",
                    background: "rgba(4,10,20,0.9)",
                    border: `2px solid ${i === sealIdx ? "var(--mk-accent)" : CARD_RARITY_COLOR[v.rarity]}`,
                    padding: 1,
                    overflow: "hidden",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <CardArt def={v} dim={!owned.has(v.id)} />
                  {g.deck.includes(v.id) && (
                    <span
                      style={{
                        position: "absolute",
                        inset: 0,
                        border: "2px solid rgba(53,226,240,0.9)",
                      }}
                    />
                  )}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 6 }}>
              {(Object.entries(selMods) as [CardStat, number][]).map(([k, v]) => (
                <span
                  key={k}
                  className="mk-title"
                  style={{
                    fontSize: 6,
                    padding: "2px 4px",
                    border: "1px solid rgba(53,226,240,0.4)",
                    color: v >= 0 ? "var(--mk-accent)" : "#ff8a8a",
                  }}
                >
                  {modLine(k, v)}
                </span>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 8 }}>
              <PixelButton
                disabled={owned.has(sel.id) || g.playerLevel < sel.requiredLevel || g.gold < sel.price}
                onClick={() => {
                  const ok = buyCard(sel.id);
                  setMsg(ok ? `${sel.name} adquirido!` : "Ouro insuficiente ou nivel baixo.");
                }}
              >
                {owned.has(sel.id)
                  ? "JA POSSUI"
                  : g.playerLevel < sel.requiredLevel
                    ? `NIVEL ${sel.requiredLevel}`
                    : `COMPRAR · ${sel.price}`}
              </PixelButton>
              <PixelButton
                disabled={!owned.has(sel.id)}
                onClick={() => {
                  const wasIn = g.deck.includes(sel.id);
                  const ok = toggleCard(sel.id);
                  setMsg(
                    ok
                      ? wasIn
                        ? `${sel.name} removido do deck.`
                        : `${sel.name} equipado.`
                      : "Sem slot ou energia suficiente.",
                  );
                }}
              >
                {g.deck.includes(sel.id) ? "REMOVER" : "EQUIPAR"}
              </PixelButton>
            </div>

            {/* refino */}
            <div style={{ marginTop: 6 }}>
              <PixelButton
                disabled={
                  !owned.has(sel.id) ||
                  selRefine >= CARD_MAX_REFINE ||
                  g.gold < rCost ||
                  (rBars > 0 && bars < rBars)
                }
                onClick={() => {
                  const ok = refineCard(sel.id);
                  setMsg(ok ? `${sel.name} refinado para +${selRefine}.` : "Recursos insuficientes.");
                }}
              >
                {selRefine >= CARD_MAX_REFINE
                  ? `REFINO MAXIMO +${CARD_MAX_REFINE - 1}`
                  : `REFINAR +${selRefine} · ${rCost} G${rBars > 0 ? ` + ${rBars} LINGOTES` : ""}`}
              </PixelButton>
            </div>
            <div style={{ marginTop: 6 }}>
              <PixelButton onClick={() => setDetail(null)}>FECHAR</PixelButton>
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}
