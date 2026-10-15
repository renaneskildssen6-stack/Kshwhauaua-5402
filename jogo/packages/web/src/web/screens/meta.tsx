import { useMemo, useState } from "react";
import { Panel, PixelButton, RobotSprite } from "@/components/pixel";
import { AchIcon, AnimBg, BattleCard, Cell, DiamondIcon, Diamonds, RankSeal } from "@/components/meta-ui";
import { TopBar } from "@/screens/roster";
import { useGame } from "@/game/save";
import {
  ACHIEVEMENTS,
  ACH_TIERS,
  CARD_BGS,
  EQUIP_MAP,
  EQUIP_MAX,
  EQUIP_SLOTS,
  EQUIP_TYPES,
  FORGE_DIAMONDS,
  FORGE_GOLD,
  MASTERY_RANKS,
  RARITIES,
  SKINS,
  WIN_MILESTONES,
  achUnlocked,
  ensureMastery,
  equipSellValue,
  equipStats,
  equipUpgradeCost,
  rankIndexOf,
  skinOfRobot,
  statOf,
  type EquipItem,
} from "@/game/meta";
import {
  applySkin,
  buyCardBg,
  buySkin,
  claimAchievement,
  claimAllAchievements,
  claimMastery,
  equipTo,
  forge,
  sellEquip,
  setProfile,
  togglePin,
  unequip,
  upgradeEquip,
} from "@/game/meta-actions";
import { ROBOT_MAP } from "@/game/robots";

const WRAP: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  flexDirection: "column",
};
const BODY: React.CSSProperties = {
  flex: 1,
  padding: 8,
  display: "flex",
  flexDirection: "column",
  gap: 8,
  background: "linear-gradient(rgba(4,9,18,0.9), rgba(4,9,18,0.98))",
};
const SMALL: React.CSSProperties = { fontSize: 6, color: "var(--mk-muted)" };

function Tabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 4, overflowX: "auto", flexShrink: 0 }}>
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          className="mk-title"
          onClick={() => onChange(t.id)}
          style={{
            fontSize: 7,
            padding: "6px 8px",
            whiteSpace: "nowrap",
            cursor: "pointer",
            color: value === t.id ? "#06121f" : "#dff6ff",
            background: value === t.id ? "var(--mk-accent)" : "rgba(6,14,26,0.8)",
            border: "2px solid rgba(53,226,240,0.4)",
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ================================================================= PERFIL
type ProfTab = "card" | "conq";

export function ProfileScreen({ onBack }: { onBack: () => void }) {
  const g = useGame();
  const [tab, setTab] = useState<ProfTab>("card");
  const [tier, setTier] = useState<number>(-1);
  const [sheet, setSheet] = useState<number>(0);
  const champion = g.team[0] ?? g.robots[0]?.id ?? "aurorion";
  const done = ACHIEVEMENTS.filter((a) => g.achClaimed.includes(a.id)).length;
  const ready = ACHIEVEMENTS.filter((a) => !g.achClaimed.includes(a.id) && achUnlocked(g, a)).length;

  const list = useMemo(
    () => ACHIEVEMENTS.filter((a) => a.sheet === sheet && (tier < 0 || a.tier === tier)),
    [sheet, tier],
  );

  return (
    <div style={WRAP}>
      <TopBar title="PERFIL" gold={g.gold} onBack={onBack} />
      <div className="mk-scroll" style={BODY}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Diamonds n={g.diamonds} />
          <span className="mk-title" style={SMALL}>
            CONQUISTAS {done}/{ACHIEVEMENTS.length}
          </span>
        </div>
        <Tabs
          tabs={[
            { id: "card" as ProfTab, label: "CARD DE BATALHA" },
            { id: "conq" as ProfTab, label: `CONQUISTAS${ready ? ` (${ready})` : ""}` },
          ]}
          value={tab}
          onChange={setTab}
        />

        {tab === "card" && (
          <>
            <BattleCard robotId={champion} height={210} />
            <Panel style={{ padding: 8 }}>
              <div className="mk-title" style={SMALL}>NOME NO CARD</div>
              <input
                value={g.profile.name}
                maxLength={14}
                onChange={(e) => setProfile({ name: e.target.value.toUpperCase() })}
                className="mk-title"
                style={{ width: "100%", fontSize: 10, padding: 6, marginTop: 4, background: "#06121f", color: "#fff", border: "2px solid rgba(53,226,240,0.5)" }}
              />
              <div className="mk-title" style={{ ...SMALL, marginTop: 8 }}>
                DESTAQUES ({g.profile.pins.length}/3) — fixe na aba CONQUISTAS
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                {[0, 1, 2].map((i) => {
                  const id = g.profile.pins[i];
                  return (
                    <div key={i} style={{ width: 48, height: 48, display: "grid", placeItems: "center", border: "2px dashed rgba(53,226,240,0.4)" }}>
                      {id && <AchIcon id={id} size={40} />}
                    </div>
                  );
                })}
              </div>
            </Panel>
            <div className="mk-title" style={SMALL}>PLANO DE FUNDO (ANIMADO, 9 FRAMES)</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
              {CARD_BGS.map((b) => {
                const owned = g.bgOwned.includes(b.id);
                const sel = g.profile.bg === b.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => (owned ? setProfile({ bg: b.id }) : buyCardBg(b.id))}
                    style={{ position: "relative", height: 78, padding: 0, cursor: "pointer", overflow: "hidden", border: `2px solid ${sel ? "#ffe36a" : "rgba(255,255,255,0.3)"}` }}
                  >
                    <AnimBg bg={b.id} />
                    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", padding: 2 }}>
                      <div className="mk-title" style={{ fontSize: 5, color: "#fff" }}>{b.name}</div>
                      <div className="mk-title" style={{ fontSize: 6, color: owned ? "#5fe08a" : g.diamonds >= b.cost ? "#7fe4ff" : "#ff6a6a" }}>
                        {owned ? (sel ? "EM USO" : "SEU") : `${b.cost} DIAMANTES`}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {tab === "conq" && (
          <>
            <div style={{ display: "flex", gap: 6 }}>
              <PixelButton disabled={!ready} onClick={() => claimAllAchievements()}>
                RESGATAR TUDO ({ready})
              </PixelButton>
            </div>
            <Tabs
              tabs={[0, 1, 2, 3, 4].map((i) => ({ id: String(i), label: ["COMBATE", "COLECAO", "ECONOMIA", "MODOS", "ELEMENTOS"][i] }))}
              value={String(sheet)}
              onChange={(v) => setSheet(Number(v))}
            />
            <Tabs
              tabs={[{ id: "-1", label: "TODAS" }, ...ACH_TIERS.map((t, i) => ({ id: String(i), label: t }))]}
              value={String(tier)}
              onChange={(v) => setTier(Number(v))}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {list.map((a) => {
                const cur = Math.min(a.target, statOf(g, a.stat));
                const ok = achUnlocked(g, a);
                const claimed = g.achClaimed.includes(a.id);
                const pinned = g.profile.pins.includes(a.id);
                return (
                  <div key={a.id} style={{ display: "flex", gap: 8, alignItems: "center", padding: 5, background: "rgba(8,18,32,0.9)", border: `2px solid ${claimed ? "rgba(255,227,106,0.6)" : "rgba(53,226,240,0.2)"}` }}>
                    <AchIcon id={a.id} size={44} locked={!ok} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="mk-title" style={{ fontSize: 7, color: ok ? "#fff" : "#8aa0b5" }}>{a.name}</div>
                      <div style={{ fontSize: 9, color: "var(--mk-muted)" }}>{a.desc}</div>
                      <div style={{ height: 4, background: "#0a1626", marginTop: 3 }}>
                        <div style={{ height: 4, width: `${(cur / a.target) * 100}%`, background: ok ? "#5fe08a" : "var(--mk-accent)" }} />
                      </div>
                      <div className="mk-title" style={{ fontSize: 5, color: "var(--mk-muted)", marginTop: 2 }}>
                        {cur.toLocaleString("pt-BR")}/{a.target.toLocaleString("pt-BR")} · {a.gold} OURO{a.diamonds ? ` · ${a.diamonds} DIAMANTES` : ""}
                      </div>
                    </div>
                    {!claimed ? (
                      <button type="button" disabled={!ok} className="mk-btn mk-btn-sq" onClick={() => claimAchievement(a.id)} style={{ fontSize: 6, padding: "4px 6px", opacity: ok ? 1 : 0.4 }}>
                        PEGAR
                      </button>
                    ) : (
                      <button type="button" className="mk-btn mk-btn-sq" onClick={() => togglePin(a.id)} style={{ fontSize: 6, padding: "4px 6px", color: pinned ? "#ffe36a" : undefined }}>
                        {pinned ? "FIXADA" : "FIXAR"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ================================================================ MAESTRIA
export function MasteryScreen({ onBack }: { onBack: () => void }) {
  const g = useGame();
  const [sel, setSel] = useState(g.team[0] ?? g.robots[0]?.id ?? "");
  const [note, setNote] = useState("");
  const m = ensureMastery(g.mastery[sel]);
  const r = rankIndexOf(m.pts);
  const next = MASTERY_RANKS[Math.min(MASTERY_RANKS.length - 1, r + 1)];
  const cur = MASTERY_RANKS[r];
  const pct = r >= MASTERY_RANKS.length - 1 ? 100 : ((m.pts - cur.pts) / (next.pts - cur.pts)) * 100;
  const def = ROBOT_MAP[sel];
  const skin = skinOfRobot(g, sel);
  const pendingRanks = Math.max(0, r - m.claimed);
  const pendingWins = WIN_MILESTONES.filter((w, i) => m.wins >= w.wins && i >= m.winClaimed).length;

  return (
    <div style={WRAP}>
      <TopBar title="MAESTRIA" gold={g.gold} onBack={onBack} />
      <div className="mk-scroll" style={BODY}>
        <div style={{ display: "flex", gap: 4, overflowX: "auto", flexShrink: 0, paddingBottom: 2 }}>
          {g.robots.map((rb) => {
            const rk = rankIndexOf(g.mastery[rb.id]?.pts ?? 0);
            return (
              <button
                key={rb.id}
                type="button"
                onClick={() => setSel(rb.id)}
                style={{ position: "relative", padding: 0, cursor: "pointer", flexShrink: 0, background: "rgba(6,14,26,0.9)", border: `2px solid ${sel === rb.id ? "#ffe36a" : "rgba(53,226,240,0.3)"}` }}
              >
                <RobotSprite robotId={rb.id} size={56} fps={3} />
                <div style={{ position: "absolute", right: 0, bottom: 0 }}>
                  <RankSeal rank={rk} size={22} />
                </div>
              </button>
            );
          })}
        </div>

        {def && (
          <Panel style={{ padding: 8 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <RobotSprite robotId={sel} size={92} skin={skin} fps={4} />
              <div style={{ flex: 1 }}>
                <div className="mk-title" style={{ fontSize: 10 }}>{def.name}</div>
                <div className="mk-title" style={{ fontSize: 7, color: "#ffe36a" }}>{cur.name}</div>
                <div className="mk-title" style={{ ...SMALL, marginTop: 4 }}>
                  {m.pts} PTS · {m.wins} VITORIAS
                </div>
                <div style={{ height: 8, background: "#0a1626", marginTop: 4, border: "1px solid rgba(53,226,240,0.4)" }}>
                  <div style={{ height: 8, width: `${pct}%`, background: "linear-gradient(90deg,#35e2f0,#ffe36a)" }} />
                </div>
                <div className="mk-title" style={{ fontSize: 5, color: "var(--mk-muted)", marginTop: 2 }}>
                  {r >= MASTERY_RANKS.length - 1 ? "RANK MAXIMO" : `PROXIMO: ${next.name} EM ${next.pts} PTS`}
                </div>
              </div>
              <RankSeal rank={r} size={64} />
            </div>
            <div style={{ fontSize: 9, color: "var(--mk-muted)", marginTop: 6 }}>
              Vitoria = +12 pts, derrota = +4 pts para todos da equipe. Cada rank soma HP, FOR, DEF e AGL permanentes.
            </div>
            <div style={{ marginTop: 6 }}>
              <PixelButton
                disabled={pendingRanks + pendingWins === 0}
                onClick={() => setNote(claimMastery(sel).join(" · "))}
              >
                RESGATAR MARCOS ({pendingRanks + pendingWins})
              </PixelButton>
              {note && <div className="mk-title" style={{ fontSize: 6, color: "#5fe08a", marginTop: 4 }}>{note}</div>}
            </div>
          </Panel>
        )}

        <div className="mk-title" style={SMALL}>TRILHA DE RANKS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {MASTERY_RANKS.map((rk, i) => {
            const reached = i <= r;
            const claimed = i <= m.claimed;
            return (
              <div key={rk.name} style={{ display: "flex", alignItems: "center", gap: 8, padding: 4, background: reached ? "rgba(255,227,106,0.08)" : "rgba(8,18,32,0.9)", border: `2px solid ${reached ? "rgba(255,227,106,0.5)" : "rgba(53,226,240,0.15)"}`, opacity: reached ? 1 : 0.65 }}>
                <RankSeal rank={i} size={40} />
                <div style={{ flex: 1 }}>
                  <div className="mk-title" style={{ fontSize: 7 }}>{rk.name}{rk.title ? ` · "${rk.title}"` : ""}</div>
                  <div className="mk-title" style={{ fontSize: 5, color: "var(--mk-muted)" }}>
                    {rk.pts} PTS · {rk.gold} OURO{rk.diamonds ? ` · ${rk.diamonds} DIAMANTES` : ""}{rk.chest ? ` · BAU ${RARITIES[rk.chest].name}+` : ""}
                  </div>
                </div>
                <span className="mk-title" style={{ fontSize: 6, color: claimed ? "#5fe08a" : reached ? "#ffe36a" : "#6c8196" }}>
                  {i === 0 ? "" : claimed ? "PEGO" : reached ? "PRONTO" : "BLOQ."}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mk-title" style={SMALL}>MARCOS DE VITORIAS</div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {WIN_MILESTONES.map((w, i) => (
            <div key={w.wins} style={{ padding: 6, background: "rgba(8,18,32,0.9)", border: `2px solid ${i < m.winClaimed ? "#5fe08a" : m.wins >= w.wins ? "#ffe36a" : "rgba(53,226,240,0.2)"}` }}>
              <div className="mk-title" style={{ fontSize: 7 }}>{w.wins} VIT.</div>
              <div className="mk-title" style={{ fontSize: 5, color: "var(--mk-muted)" }}>
                {w.gold} OURO{w.diamonds ? ` + ${w.diamonds}D` : ""}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ================================================================== SKINS
export function SkinsScreen({ onBack }: { onBack: () => void }) {
  const g = useGame();
  const [sel, setSel] = useState(g.team[0] ?? g.robots[0]?.id ?? "");
  const cur = g.skinOf[sel];
  const previewSkin = (id: string | null) => (id ? SKINS.find((s) => s.id === id) ?? null : null);
  const [hover, setHover] = useState<string | null>(null);
  const shown = previewSkin(hover ?? cur ?? null);

  return (
    <div style={WRAP}>
      <TopBar title="SKINS" gold={g.gold} onBack={onBack} />
      <div className="mk-scroll" style={BODY}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Diamonds n={g.diamonds} />
          <span className="mk-title" style={SMALL}>DIAMANTES SAO RAROS: CONQUISTAS, MAESTRIA, TORNEIOS</span>
        </div>
        <div style={{ display: "flex", gap: 4, overflowX: "auto", flexShrink: 0 }}>
          {g.robots.map((rb) => (
            <button key={rb.id} type="button" onClick={() => setSel(rb.id)} style={{ padding: 0, cursor: "pointer", flexShrink: 0, background: "rgba(6,14,26,0.9)", border: `2px solid ${sel === rb.id ? "#ffe36a" : "rgba(53,226,240,0.3)"}` }}>
              <RobotSprite robotId={sel === rb.id ? rb.id : rb.id} size={52} skin={skinOfRobot(g, rb.id)} fps={3} />
            </button>
          ))}
        </div>
        <div style={{ position: "relative", height: 170, overflow: "hidden", border: "2px solid rgba(255,255,255,0.3)" }}>
          <AnimBg bg={g.profile.bg} />
          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
            <RobotSprite robotId={sel} size={150} skin={shown} fps={4} />
          </div>
          <div className="mk-title" style={{ position: "absolute", left: 6, bottom: 4, fontSize: 8, color: "#fff", textShadow: "0 2px 0 #000" }}>
            {ROBOT_MAP[sel]?.name} · {shown ? shown.name : "ORIGINAL"}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          <SkinTile name="ORIGINAL" sub={!cur ? "EM USO" : "APLICAR"} active={!cur} onClick={() => applySkin(sel, null)} onHover={() => setHover(null)} />
          {SKINS.map((s) => {
            const owned = g.skinsOwned.includes(s.id);
            return (
              <SkinTile
                key={s.id}
                name={s.name}
                sub={owned ? (cur === s.id ? "EM USO" : "APLICAR") : `${s.cost} DIAMANTES`}
                active={cur === s.id}
                locked={!owned}
                affordable={g.diamonds >= s.cost}
                preview={s.preview}
                onHover={() => setHover(s.id)}
                onClick={() => (owned ? applySkin(sel, s.id) : buySkin(s.id))}
                badge={s.aura ? "DETALHES" : undefined}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SkinTile({
  name, sub, active, locked, affordable, preview, onClick, onHover, badge,
}: {
  name: string; sub: string; active: boolean; locked?: boolean; affordable?: boolean; preview?: number;
  onClick: () => void; onHover: () => void; badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onPointerEnter={onHover}
      onFocus={onHover}
      style={{ display: "flex", gap: 6, alignItems: "center", padding: 5, cursor: "pointer", textAlign: "left", background: "rgba(8,18,32,0.9)", border: `2px solid ${active ? "#ffe36a" : "rgba(53,226,240,0.25)"}` }}
    >
      {preview !== undefined ? (
        <Cell src="/ui/misc.png" cols={4} rows={3} index={preview} size={40} />
      ) : (
        <DiamondIcon size={22} />
      )}
      <div>
        <div className="mk-title" style={{ fontSize: 6, color: "#fff" }}>{name}</div>
        <div className="mk-title" style={{ fontSize: 6, color: locked ? (affordable ? "#7fe4ff" : "#ff6a6a") : "#5fe08a" }}>{sub}</div>
        {badge && <div className="mk-title" style={{ fontSize: 5, color: "#ffe36a" }}>{badge}</div>}
      </div>
    </button>
  );
}

// ============================================================== EQUIPAMENTOS
/** Segunda tela do card do robo no hangar. */
export function EquipPanel({ robotId }: { robotId: string }) {
  const g = useGame();
  const [pick, setPick] = useState<number | null>(null);
  const [msg, setMsg] = useState("");
  const mine = (g.equipped[robotId] ?? [])
    .map((u) => g.equipment.find((e) => e.uid === u))
    .filter((e): e is EquipItem => !!e);
  const free = g.equipment.filter((e) => !mine.some((m) => m.uid === e.uid));
  const sel = g.equipment.find((e) => e.uid === pick) ?? null;
  const total = mine.reduce(
    (a, e) => {
      const s = equipStats(e);
      return { hp: a.hp + (s.hp ?? 0), mp: a.mp + (s.mp ?? 0), str: a.str + (s.str ?? 0), def: a.def + (s.def ?? 0), agl: a.agl + (s.agl ?? 0) };
    },
    { hp: 0, mp: 0, str: 0, def: 0, agl: 0 },
  );

  return (
    <div>
      <div className="mk-title" style={{ fontSize: 8, marginBottom: 4 }}>EQUIPADOS ({mine.length}/{EQUIP_SLOTS})</div>
      <div style={{ display: "flex", gap: 6 }}>
        {Array.from({ length: EQUIP_SLOTS }).map((_, i) => {
          const e = mine[i];
          return (
            <div key={i} onClick={() => e && setPick(e.uid)} style={{ flex: 1, minHeight: 62, display: "grid", placeItems: "center", cursor: e ? "pointer" : "default", background: "rgba(6,14,26,0.9)", border: `2px ${e ? "solid" : "dashed"} ${e ? RARITIES[e.rarity].color : "rgba(53,226,240,0.3)"}` }}>
              {e ? <ItemChip e={e} /> : <span className="mk-title" style={{ fontSize: 6, color: "var(--mk-muted)" }}>VAZIO</span>}
            </div>
          );
        })}
      </div>
      <div className="mk-title" style={{ fontSize: 6, color: "#5fe08a", margin: "4px 0" }}>
        BONUS: HP+{total.hp} MP+{total.mp} FOR+{total.str} DEF+{total.def} AGL+{total.agl}
      </div>

      {sel && <ItemDetail e={sel} robotId={robotId} equipped={mine.some((m) => m.uid === sel.uid)} onDone={() => setPick(null)} />}

      <div style={{ display: "flex", gap: 6, margin: "6px 0" }}>
        <PixelButton disabled={g.gold < FORGE_GOLD} onClick={() => { const it = forge(false); setMsg(it ? `FORJADO: ${EQUIP_MAP[it.type].name} (${RARITIES[it.rarity].name})` : ""); }}>
          FORJAR {FORGE_GOLD}
        </PixelButton>
        <PixelButton disabled={g.diamonds < FORGE_DIAMONDS} onClick={() => { const it = forge(true); setMsg(it ? `FORJADO: ${EQUIP_MAP[it.type].name} (${RARITIES[it.rarity].name})` : ""); }}>
          ELITE {FORGE_DIAMONDS}D
        </PixelButton>
      </div>
      {msg && <div className="mk-title" style={{ fontSize: 6, color: "#ffe36a" }}>{msg}</div>}
      <div className="mk-title" style={{ fontSize: 8, margin: "6px 0 4px" }}>ESTOQUE ({free.length})</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4 }}>
        {free.map((e) => (
          <div key={e.uid} onClick={() => setPick(e.uid)} style={{ cursor: "pointer", padding: 2, display: "grid", placeItems: "center", background: pick === e.uid ? "rgba(255,227,106,0.15)" : "rgba(6,14,26,0.9)", border: `2px solid ${RARITIES[e.rarity].color}` }}>
            <ItemChip e={e} compact />
          </div>
        ))}
      </div>
      {!free.length && <div style={{ fontSize: 9, color: "var(--mk-muted)" }}>Sem itens. Forje ou ganhe baus na Maestria.</div>}
      <div style={{ fontSize: 8, color: "var(--mk-muted)", marginTop: 4 }}>
        {EQUIP_TYPES.length} tipos · {RARITIES.length} raridades · nivel max {EQUIP_MAX}. Um item por tipo.
      </div>
    </div>
  );
}

function ItemChip({ e, compact }: { e: EquipItem; compact?: boolean }) {
  const t = EQUIP_MAP[e.type];
  return (
    <div style={{ display: "grid", placeItems: "center" }}>
      <Cell src="/ui/equip.png" cols={4} rows={3} index={t.icon} size={compact ? 44 : 44} style={{ filter: `drop-shadow(0 0 4px ${RARITIES[e.rarity].color})` }} />
      <div className="mk-title" style={{ fontSize: 5, color: RARITIES[e.rarity].color }}>
        {compact ? `Lv${e.level}` : `${t.name.split(" ")[0]} Lv${e.level}`}
      </div>
    </div>
  );
}

function ItemDetail({ e, robotId, equipped, onDone }: { e: EquipItem; robotId: string; equipped: boolean; onDone: () => void }) {
  const g = useGame();
  const t = EQUIP_MAP[e.type];
  const st = equipStats(e);
  const cost = equipUpgradeCost(e);
  return (
    <Panel style={{ padding: 6, marginTop: 6 }}>
      <div className="mk-title" style={{ fontSize: 8, color: RARITIES[e.rarity].color }}>
        {t.name} · {RARITIES[e.rarity].name} · Lv{e.level}/{EQUIP_MAX}
      </div>
      <div className="mk-title" style={{ fontSize: 6, margin: "3px 0" }}>
        {Object.entries(st).map(([k, v]) => `${k.toUpperCase()}+${v}`).join("  ")}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
        <PixelButton onClick={() => { if (equipped) unequip(robotId, e.uid); else equipTo(robotId, e.uid); onDone(); }}>
          {equipped ? "TIRAR" : "EQUIPAR"}
        </PixelButton>
        <PixelButton disabled={e.level >= EQUIP_MAX || g.gold < cost} onClick={() => upgradeEquip(e.uid)}>
          {e.level >= EQUIP_MAX ? "MAXIMO" : `NIVEL ${cost}`}
        </PixelButton>
      </div>
      <div style={{ marginTop: 4 }}>
        <PixelButton onClick={() => { sellEquip(e.uid); onDone(); }}>VENDER {equipSellValue(e)}</PixelButton>
      </div>
    </Panel>
  );
}
