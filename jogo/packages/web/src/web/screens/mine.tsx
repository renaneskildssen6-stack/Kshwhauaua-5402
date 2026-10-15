import { useEffect, useMemo, useRef, useState } from "react";
import { Panel, PixelButton, RobotSprite } from "@/components/pixel";
import {
  BAR_COST,
  DEPTHS,
  DRILL_MAX,
  MAX_DEPTH,
  ORE_MAP,
  ORES,
  PICK_MAX,
  REFINERY_MAX,
  SILO_MAX,
  VEIN_RESPAWN_MS,
  VEIN_SLOTS,
  barValue,
  drillCost,
  drillRate,
  fmtDuration,
  pickCost,
  pickDamage,
  refineBatch,
  refineMs,
  refineryCost,
  rollOre,
  siloCapacity,
  siloCost,
  storedTotal,
  totalDrillRate,
  veinHp,
  veinYield,
  type Vein,
} from "@/game/mining";
import {
  collectRefine,
  descendMine,
  explorerId,
  mineOre,
  miningTick,
  sellMining,
  siloRoom,
  startRefine,
  upgradeDrill,
  upgradePick,
  upgradeRefinery,
  upgradeSilo,
  useGame,
} from "@/game/save";
import { TopBar } from "@/screens/roster";

type Floater = { id: number; text: string; x: number; y: number; color: string };

function makeVein(id: number, depth: number, now: number): Vein {
  const ore = rollOre(depth, Math.random());
  const hp = veinHp(ore, depth);
  return {
    id,
    ore,
    hp,
    maxHp: hp,
    x: 8 + (id % 3) * 33 + Math.random() * 10,
    y: 10 + Math.floor(id / 3) * 42 + Math.random() * 12,
    respawnAt: now,
  };
}

/** Fase E — sala de mineração em tempo real. */
export function MineScreen({ onBack }: { onBack: () => void }) {
  const g = useGame();
  const m = g.mining;
  const hero = explorerId(g);

  const [veins, setVeins] = useState<Vein[]>(() =>
    Array.from({ length: VEIN_SLOTS }, (_, i) => makeVein(i, m.depth, Date.now())),
  );
  const [swing, setSwing] = useState(0);
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const [msg, setMsg] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const [tab, setTab] = useState<"veios" | "drills" | "refino" | "estoque">("veios");
  const fid = useRef(0);
  const depthRef = useRef(m.depth);

  // Produção offline: recolhida uma vez ao abrir a mina.
  useEffect(() => {
    const r = miningTick();
    if (r.gained > 0) {
      setMsg(`PERFURATRIZES RENDERAM ${r.gained} MINERIOS EM ${fmtDuration(r.ms)}`);
    }
  }, []);

  // Relógio da sala + banco periódico da produção automática.
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 200);
    const bank = window.setInterval(() => miningTick(), 5000);
    return () => {
      window.clearInterval(t);
      window.clearInterval(bank);
    };
  }, []);

  // Ao descer de camada os veios são refeitos.
  useEffect(() => {
    if (depthRef.current !== m.depth) {
      depthRef.current = m.depth;
      setVeins(Array.from({ length: VEIN_SLOTS }, (_, i) => makeVein(i, m.depth, Date.now())));
    }
  }, [m.depth]);

  const depth = DEPTHS[m.depth - 1];
  const cap = siloCapacity(m.silo);
  const stored = storedTotal(m);
  const room = siloRoom(m);
  const rate = totalDrillRate(m);
  const dmg = pickDamage(m.pick);

  const stock = useMemo(
    () =>
      ORES.map((o) => ({ ore: o, raw: m.ores[o.id] ?? 0, bars: m.bars[o.id] ?? 0 })).filter(
        (r) => r.raw > 0 || r.bars > 0,
      ),
    [m.ores, m.bars],
  );
  const totalValue = useMemo(
    () =>
      stock.reduce((a, r) => a + r.raw * r.ore.value + r.bars * barValue(r.ore.id), 0),
    [stock],
  );

  function pop(text: string, x: number, y: number, color: string) {
    const id = ++fid.current;
    setFloaters((f) => [...f.slice(-8), { id, text, x, y, color }]);
    window.setTimeout(() => setFloaters((f) => f.filter((v) => v.id !== id)), 900);
  }

  function hit(v: Vein) {
    if (v.respawnAt > now) return;
    setSwing((s) => s + 1);
    if (room <= 0) {
      setMsg("SILO CHEIO — VENDA OU MELHORE O SILO");
      return;
    }
    const left = v.hp - dmg;
    if (left > 0) {
      setVeins((list) => list.map((x) => (x.id === v.id ? { ...x, hp: left } : x)));
      pop(`-${dmg}`, v.x, v.y, "#ffffff");
      return;
    }
    const qty = veinYield(v.ore, m.depth);
    const got = mineOre(v.ore, qty);
    pop(`+${got} ${ORE_MAP[v.ore].name}`, v.x, v.y, ORE_MAP[v.ore].color);
    setVeins((list) =>
      list.map((x) =>
        x.id === v.id
          ? { ...makeVein(v.id, m.depth, now + VEIN_RESPAWN_MS), x: x.x, y: x.y }
          : x,
      ),
    );
  }

  const job = m.job;
  const jobLeft = job ? Math.max(0, job.endsAt - now) : 0;
  const jobDone = Boolean(job && jobLeft <= 0);

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
      <TopBar title="MINA PROFUNDA" gold={g.gold} onBack={onBack} />

      {/* -------------------------------------------------- parede de rocha */}
      <div
        style={{
          position: "relative",
          height: 230,
          flexShrink: 0,
          overflow: "hidden",
          backgroundImage:
            "linear-gradient(rgba(4,9,18,0.35), rgba(4,9,18,0.75)), url(/ui/bg_mine.png)",
          backgroundSize: "cover",
          backgroundPosition: "center 30%",
          imageRendering: "pixelated",
          borderBottom: "2px solid rgba(53,226,240,0.4)",
        }}
      >
        {veins.map((v) => {
          const asleep = v.respawnAt > now;
          const pct = Math.max(0, v.hp / v.maxHp);
          const def = ORE_MAP[v.ore];
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => hit(v)}
              aria-label={`veio de ${def.name}`}
              style={{
                position: "absolute",
                left: `${v.x}%`,
                top: `${v.y}%`,
                width: 52,
                padding: 0,
                border: "none",
                background: "transparent",
                cursor: asleep ? "default" : "pointer",
                opacity: asleep ? 0.22 : 1,
                transition: "opacity 160ms linear",
              }}
            >
              <img
                src={def.icon}
                alt=""
                style={{
                  width: 44,
                  height: 44,
                  imageRendering: "pixelated",
                  filter: `drop-shadow(0 0 5px ${def.color})`,
                }}
              />
              {!asleep && (
                <div
                  style={{
                    height: 4,
                    width: 44,
                    background: "rgba(0,0,0,0.7)",
                    border: "1px solid rgba(255,255,255,0.25)",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${pct * 100}%`,
                      background: def.color,
                      transition: "width 90ms linear",
                    }}
                  />
                </div>
              )}
              {asleep && (
                <div className="mk-title" style={{ fontSize: 6, color: "var(--mk-muted)" }}>
                  {Math.ceil((v.respawnAt - now) / 1000)}s
                </div>
              )}
            </button>
          );
        })}

        {floaters.map((f) => (
          <div
            key={f.id}
            className="mk-title"
            style={{
              position: "absolute",
              left: `${f.x}%`,
              top: `${f.y}%`,
              fontSize: 7,
              color: f.color,
              textShadow: "0 1px 0 #000",
              pointerEvents: "none",
              animation: "mk-float-up 900ms steps(9) forwards",
            }}
          >
            {f.text}
          </div>
        ))}

        {/* robô minerando */}
        <div style={{ position: "absolute", left: 4, bottom: -6, pointerEvents: "none" }}>
          <RobotSprite
            key={swing}
            robotId={hero}
            clip={swing > 0 ? "attack" : "idle"}
            size={104}
            fps={swing > 0 ? 10 : 4}
            loop={swing === 0}
          />
        </div>

        {/* faixa de status */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            padding: "3px 6px",
            background: "rgba(2,6,12,0.82)",
            display: "flex",
            justifyContent: "space-between",
            gap: 6,
          }}
        >
          <span className="mk-title" style={{ fontSize: 6, color: "var(--mk-accent2)" }}>
            N{m.depth} {depth.name}
          </span>
          <span className="mk-title" style={{ fontSize: 6, color: "var(--mk-muted)" }}>
            PICARETA {dmg} · AUTO {rate}/min
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------ silo */}
      <div style={{ padding: "5px 8px 0", flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span className="mk-title" style={{ fontSize: 6 }}>
            SILO {stored}/{cap}
          </span>
          <span className="mk-title" style={{ fontSize: 6, color: "var(--mk-accent)" }}>
            ESTOQUE VALE {totalValue}
          </span>
        </div>
        <div
          style={{
            height: 7,
            background: "rgba(0,0,0,0.6)",
            border: "1px solid rgba(53,226,240,0.35)",
            marginTop: 2,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${Math.min(100, (stored / cap) * 100)}%`,
              background: stored >= cap ? "var(--mk-danger, #ff5a3c)" : "var(--mk-accent2)",
            }}
          />
        </div>
      </div>

      {msg && (
        <div
          className="mk-title"
          style={{ fontSize: 6, color: "var(--mk-accent)", padding: "4px 8px 0", lineHeight: 1.6 }}
        >
          {msg}
        </div>
      )}

      {/* ------------------------------------------------------------ abas */}
      <div style={{ display: "flex", gap: 4, padding: "6px 8px 0", flexShrink: 0 }}>
        {(
          [
            ["veios", "MINA"],
            ["drills", "PERFURATRIZ"],
            ["refino", "REFINO"],
            ["estoque", "ESTOQUE"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className="mk-btn mk-btn-sq"
            onClick={() => setTab(id)}
            style={{
              fontSize: 6,
              padding: "4px 2px",
              flex: 1,
              opacity: tab === id ? 1 : 0.55,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mk-scroll" style={{ flex: 1, padding: 8 }}>
        {tab === "veios" && (
          <div style={{ display: "grid", gap: 6 }}>
            <Panel style={{ padding: 6 }}>
              <div className="mk-title" style={{ fontSize: 7, marginBottom: 4 }}>
                CAMADA {m.depth}/{MAX_DEPTH} · {depth.name}
              </div>
              <div style={{ fontSize: 10, color: "var(--mk-muted)", marginBottom: 6 }}>
                Toque nos veios para minerar. Cada veio renasce em{" "}
                {Math.round(VEIN_RESPAWN_MS / 1000)}s. Descer abre minérios mais valiosos e veios
                mais duros.
              </div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 6 }}>
                {depth.ores.map((o) => (
                  <span
                    key={o}
                    className="mk-title"
                    style={{ fontSize: 6, color: ORE_MAP[o].color }}
                  >
                    {ORE_MAP[o].name} ({ORE_MAP[o].value}g)
                  </span>
                ))}
              </div>
              {m.depth < MAX_DEPTH ? (
                <PixelButton
                  disabled={g.gold < DEPTHS[m.depth].cost}
                  onClick={() =>
                    setMsg(
                      descendMine()
                        ? `DESCEU PARA ${DEPTHS[m.depth].name}`
                        : "OURO INSUFICIENTE",
                    )
                  }
                >
                  DESCER · {DEPTHS[m.depth].cost}g
                </PixelButton>
              ) : (
                <div className="mk-title" style={{ fontSize: 7, color: "var(--mk-accent2)" }}>
                  FUNDO DA MINA ALCANCADO
                </div>
              )}
            </Panel>

            <Panel style={{ padding: 6 }}>
              <div className="mk-title" style={{ fontSize: 7, marginBottom: 4 }}>
                EQUIPAMENTO
              </div>
              <UpgradeRow
                label={`PICARETA Lv${m.pick}`}
                desc={`${dmg} de dano por golpe`}
                cost={m.pick >= PICK_MAX ? null : pickCost(m.pick)}
                gold={g.gold}
                onBuy={() => setMsg(upgradePick() ? "PICARETA MELHORADA!" : "OURO INSUFICIENTE")}
              />
              <UpgradeRow
                label={`SILO Lv${m.silo}`}
                desc={`guarda ${cap} minérios`}
                cost={m.silo >= SILO_MAX ? null : siloCost(m.silo)}
                gold={g.gold}
                onBuy={() => setMsg(upgradeSilo() ? "SILO AMPLIADO!" : "OURO INSUFICIENTE")}
              />
            </Panel>
          </div>
        )}

        {tab === "drills" && (
          <div style={{ display: "grid", gap: 6 }}>
            <Panel style={{ padding: 6 }}>
              <div className="mk-title" style={{ fontSize: 7 }}>
                PRODUCAO AUTOMATICA · {rate}/min
              </div>
              <div style={{ fontSize: 10, color: "var(--mk-muted)", marginTop: 3 }}>
                As perfuratrizes trabalham com o jogo fechado (até 8h acumuladas) e param quando o
                silo enche.
              </div>
            </Panel>
            {DEPTHS.filter((d) => d.level <= m.depth).map((d) => {
              const lvl = m.drills[String(d.level)] ?? 0;
              const cost = drillCost(d.level, lvl);
              const maxed = lvl >= DRILL_MAX;
              return (
                <Panel key={d.level} style={{ padding: 6 }}>
                  <UpgradeRow
                    label={`N${d.level} ${d.name}${lvl > 0 ? ` Lv${lvl}` : ""}`}
                    desc={
                      lvl > 0
                        ? `${drillRate(d.level, lvl)}/min → ${drillRate(d.level, lvl + 1)}/min`
                        : `instala e rende ${drillRate(d.level, 1)}/min`
                    }
                    cost={maxed ? null : cost}
                    gold={g.gold}
                    onBuy={() =>
                      setMsg(
                        upgradeDrill(d.level)
                          ? `PERFURATRIZ N${d.level} ${lvl > 0 ? "MELHORADA" : "INSTALADA"}!`
                          : "OURO INSUFICIENTE",
                      )
                    }
                  />
                </Panel>
              );
            })}
          </div>
        )}

        {tab === "refino" && (
          <div style={{ display: "grid", gap: 6 }}>
            <Panel style={{ padding: 6 }}>
              <div className="mk-title" style={{ fontSize: 7, marginBottom: 4 }}>
                REFINARIA Lv{m.refinery}
              </div>
              <div style={{ fontSize: 10, color: "var(--mk-muted)", marginBottom: 6 }}>
                {BAR_COST} minérios brutos viram 1 lingote (vale 3,5x). Lote de até{" "}
                {refineBatch(m.refinery)} lingotes.
              </div>
              <UpgradeRow
                label="MELHORAR FORNALHA"
                desc={`lotes maiores e ${Math.round(((refineMs(1, m.refinery) - refineMs(1, m.refinery + 1)) / refineMs(1, m.refinery)) * 100)}% mais rápida`}
                cost={m.refinery >= REFINERY_MAX ? null : refineryCost(m.refinery)}
                gold={g.gold}
                onBuy={() =>
                  setMsg(upgradeRefinery() ? "FORNALHA MELHORADA!" : "OURO INSUFICIENTE")
                }
              />
            </Panel>

            {job ? (
              <Panel style={{ padding: 6 }}>
                <div className="mk-title" style={{ fontSize: 7, marginBottom: 4 }}>
                  FUNDINDO {job.bars}x {ORE_MAP[job.ore].name}
                </div>
                <div
                  style={{
                    height: 8,
                    background: "rgba(0,0,0,0.6)",
                    border: "1px solid rgba(53,226,240,0.35)",
                    marginBottom: 6,
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${jobDone ? 100 : 100 - (jobLeft / refineMs(job.bars, m.refinery)) * 100}%`,
                      background: ORE_MAP[job.ore].color,
                    }}
                  />
                </div>
                <PixelButton
                  disabled={!jobDone}
                  onClick={() => {
                    const n = collectRefine();
                    if (n > 0) setMsg(`${n} LINGOTES RECOLHIDOS!`);
                  }}
                >
                  {jobDone ? "RECOLHER LINGOTES" : `PRONTO EM ${fmtDuration(jobLeft)}`}
                </PixelButton>
              </Panel>
            ) : (
              <Panel style={{ padding: 6 }}>
                <div className="mk-title" style={{ fontSize: 7, marginBottom: 4 }}>
                  ESCOLHA O MINERIO
                </div>
                {stock.filter((r) => r.raw >= BAR_COST).length === 0 && (
                  <div style={{ fontSize: 10, color: "var(--mk-muted)" }}>
                    Você precisa de pelo menos {BAR_COST} unidades de um minério.
                  </div>
                )}
                <div style={{ display: "grid", gap: 4 }}>
                  {stock
                    .filter((r) => r.raw >= BAR_COST)
                    .map((r) => {
                      const n = Math.min(
                        refineBatch(m.refinery),
                        Math.floor(r.raw / BAR_COST),
                      );
                      return (
                        <button
                          key={r.ore.id}
                          type="button"
                          className="mk-btn mk-btn-sq"
                          onClick={() =>
                            setMsg(
                              startRefine(r.ore.id, n)
                                ? `FUNDINDO ${n} LINGOTES DE ${r.ore.name}`
                                : "NAO FOI POSSIVEL",
                            )
                          }
                          style={{
                            fontSize: 6,
                            padding: 4,
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <img
                            src={r.ore.icon}
                            alt=""
                            style={{ width: 24, height: 24, imageRendering: "pixelated" }}
                          />
                          <span style={{ flex: 1, textAlign: "left" }}>
                            {r.ore.name} · {n} LINGOTES
                          </span>
                          <span style={{ color: "var(--mk-muted)" }}>
                            {fmtDuration(refineMs(n, m.refinery))}
                          </span>
                        </button>
                      );
                    })}
                </div>
              </Panel>
            )}
          </div>
        )}

        {tab === "estoque" && (
          <div style={{ display: "grid", gap: 6 }}>
            {stock.length === 0 && (
              <Panel style={{ padding: 8 }}>
                <div style={{ fontSize: 10, color: "var(--mk-muted)" }}>
                  Silo vazio. Minere os veios ou instale uma perfuratriz.
                </div>
              </Panel>
            )}
            {stock.map((r) => (
              <Panel key={r.ore.id} style={{ padding: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <img
                    src={r.ore.icon}
                    alt=""
                    style={{ width: 34, height: 34, imageRendering: "pixelated" }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="mk-title" style={{ fontSize: 7, color: r.ore.color }}>
                      {r.ore.name}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--mk-muted)" }}>
                      {r.raw} brutos ({r.ore.value}g) · {r.bars} lingotes ({barValue(r.ore.id)}g)
                    </div>
                  </div>
                  <div className="mk-title" style={{ fontSize: 7, color: "var(--mk-accent)" }}>
                    {r.raw * r.ore.value + r.bars * barValue(r.ore.id)}g
                  </div>
                </div>
              </Panel>
            ))}
            <PixelButton
              disabled={totalValue <= 0}
              onClick={() => {
                const gold = sellMining();
                setMsg(gold > 0 ? `VENDIDO POR ${gold} DE OURO!` : "NADA PARA VENDER");
              }}
            >
              VENDER TUDO · {totalValue}g
            </PixelButton>
            <Panel style={{ padding: 6 }}>
              <div style={{ fontSize: 10, color: "var(--mk-muted)" }}>
                Total minerado: {m.totalMined} · ouro obtido na mina: {m.totalGold}
              </div>
            </Panel>
          </div>
        )}

        <div style={{ height: 12 }} />
        <PixelButton onClick={onBack}>SAIR DA MINA</PixelButton>
        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}

function UpgradeRow({
  label,
  desc,
  cost,
  gold,
  onBuy,
}: {
  label: string;
  desc: string;
  cost: number | null;
  gold: number;
  onBuy: () => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="mk-title" style={{ fontSize: 7 }}>
          {label}
        </div>
        <div style={{ fontSize: 10, color: "var(--mk-muted)" }}>{desc}</div>
      </div>
      <button
        type="button"
        className="mk-btn mk-btn-sq"
        disabled={cost === null || gold < cost}
        onClick={onBuy}
        style={{ fontSize: 6, padding: 0, minWidth: 66 }}
      >
        {cost === null ? "MAX" : `${cost}g`}
      </button>
    </div>
  );
}
