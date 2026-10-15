import { useState } from "react";
import { Frame, Panel, PixelButton, RobotSprite, StatBar } from "@/components/pixel";
import { Icon } from "@/components/pixel";
import { LoadoutEditor } from "@/components/loadout";
import { EquipPanel } from "@/screens/meta";
import { skinOfRobot } from "@/game/meta";
import { TRAIN_COST_PER_POINT } from "@/game/config";
import { baseStats, maxTrained, robotMaxXP, type RobotSave } from "@/game/engine";
import { setTeam, useGame } from "@/game/save";
import { trainRobotStat } from "@/game/economy-actions";
import { TeamWorkbench } from "@/components/team-workbench";
import { ScreenBoundary } from "@/components/screen-boundary";
import { isCustom } from "@/game/lab";
import { faceUrl, ROBOT_MAP, ROBOTS } from "@/game/robots";

const RARITY_GLOW: Record<string, string> = {
  bronze: "rgba(205,127,50,0.9)",
  silver: "rgba(198,214,232,0.9)",
  gold: "rgba(255,196,58,0.95)",
};

type RosterTab = "todos" | "equipe" | "meus" | "bronze" | "silver" | "gold" | "locked";

const PAGE = 120;

const TABS: { id: RosterTab; label: string }[] = [
  { id: "todos", label: "TODOS" },
  { id: "equipe", label: "EQUIPE" },
  { id: "meus", label: "MEUS" },
  { id: "bronze", label: "BRONZE" },
  { id: "silver", label: "PRATA" },
  { id: "gold", label: "OURO" },
  { id: "locked", label: "BLOQUEADOS" },
];

export function RosterScreen({ onBack }: { onBack: () => void }) {
  const g = useGame();
  const [focus, setFocus] = useState<string>(g.robots[0]?.id ?? ROBOTS[0].id);
  const [detail, setDetail] = useState<string | null>(null);
  const [tab, setTab] = useState<RosterTab>("todos");
  const [query, setQuery] = useState("");
  // com mais de 1000 robos a grade e paginada: cada robo modular tem o sprite
  // montado sob demanda, entao renderizamos em lotes.
  const [limit, setLimit] = useState(PAGE);

  const owned = g.robots;
  const focused = owned.find((r) => r.id === focus) ?? owned[0] ?? null;
  const focusDef = ROBOT_MAP[focused ? focused.id : focus];
  const inTeam = focused ? g.team.includes(focused.id) : false;
  const locked = !focused || focused.id !== focus;

  function toggleTeam() {
    if (!focused) return;
    if (inTeam) {
      if (g.team.length <= 1) return;
      setTeam(g.team.filter((id) => id !== focused.id));
    } else {
      if (g.team.length >= 4) return;
      setTeam([...g.team, focused.id]);
    }
  }

  const lockedDef = locked ? ROBOT_MAP[focus] : null;
  const showDef = lockedDef ?? focusDef;

  const q = query.trim().toUpperCase();
  // robôs montados no laboratório (Fase F) aparecem sempre no topo da grade
  const visible = [...ROBOTS]
    .sort((a, b) => Number(isCustom(b.id)) - Number(isCustom(a.id)))
    .filter((def) => {
    if (q && !def.name.includes(q) && !def.element.includes(q)) return false;
    switch (tab) {
      case "equipe":
        return g.team.includes(def.id);
      case "meus":
        return owned.some((r) => r.id === def.id);
      case "locked":
        return !owned.some((r) => r.id === def.id);
      case "bronze":
      case "silver":
      case "gold":
        return def.rarity === tab;
      default:
        return true;
    }
  });

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
      <TopBar title="HANGAR MECHA" gold={g.gold} onBack={onBack} />

      {/* PALCO — estilo seleção de brawlers */}
      <div
        style={{
          position: "relative",
          height: 232,
          flexShrink: 0,
          backgroundImage:
            "linear-gradient(rgba(4,9,18,0.35), rgba(4,9,18,0.9)), url(/ui/bg_heroes.png)",
          backgroundSize: "cover",
          backgroundPosition: "center 30%",
          imageRendering: "pixelated",
          borderBottom: "2px solid var(--mk-accent)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: 46,
            transform: "translateX(-50%)",
            width: 168,
            height: 34,
            borderRadius: "50%",
            background: `radial-gradient(closest-side, ${RARITY_GLOW[showDef.rarity]}, transparent)`,
            opacity: 0.55,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: 42,
            transform: "translateX(-50%)",
            filter: locked ? "brightness(0) opacity(0.75)" : undefined,
          }}
        >
          {locked ? (
            <img
              src={faceUrl(focus)}
              alt=""
              width={132}
              height={132}
              style={{ imageRendering: "pixelated" }}
            />
          ) : (
            <RobotSprite robotId={focus} clip="idle" size={132} fps={4} />
          )}
        </div>

        <div style={{ position: "absolute", left: 8, top: 8 }}>
          <div
            className="mk-title"
            style={{
              fontSize: 6,
              padding: "3px 5px",
              border: `2px solid ${RARITY_GLOW[showDef.rarity]}`,
              background: "rgba(6,14,26,0.85)",
              color: RARITY_GLOW[showDef.rarity],
            }}
          >
            {showDef.rarity.toUpperCase()}
          </div>
          <div
            className="mk-title"
            style={{
              fontSize: 6,
              marginTop: 4,
              padding: "3px 5px",
              border: "2px solid var(--mk-accent)",
              background: "rgba(6,14,26,0.85)",
              color: "var(--mk-accent)",
            }}
          >
            {showDef.element}
          </div>
        </div>

        <div style={{ position: "absolute", left: 0, right: 0, bottom: 4, textAlign: "center" }}>
          <div className="mk-title" style={{ fontSize: 13, textShadow: "3px 3px 0 #000" }}>
            {locked ? "? ? ? ?" : showDef.name}
          </div>
          <div
            className="mk-title"
            style={{ fontSize: 7, color: locked ? "var(--mk-muted)" : "var(--mk-accent2)" }}
          >
            {locked
              ? "BLOQUEADO — USE CAPSULA MECHA"
              : `Lv${focused!.level} · ${inTeam ? "NA EQUIPE" : "NA RESERVA"}`}
          </div>
        </div>
      </div>

      {/* AÇÕES */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 6,
          padding: "6px 8px",
          background: "rgba(6,12,22,0.95)",
          borderBottom: "2px solid rgba(53,226,240,0.3)",
          flexShrink: 0,
        }}
      >
        <PixelButton disabled={locked} onClick={toggleTeam}>
          {inTeam ? "TIRAR DA EQUIPE" : "ESCALAR"}
        </PixelButton>
        <PixelButton disabled={locked} onClick={() => setDetail(focus)}>
          TREINAR / INFO
        </PixelButton>
      </div>

      {/* FILTROS ESTILO BRAWL STARS */}
      <div
        style={{
          flexShrink: 0,
          padding: "6px 8px 4px",
          background: "rgba(6,12,22,0.95)",
          borderBottom: "2px solid rgba(53,226,240,0.2)",
        }}
      >
        <div style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 4 }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className="mk-title"
              onClick={() => {
                setTab(t.id);
                setLimit(PAGE);
              }}
              style={{
                flexShrink: 0,
                fontSize: 6,
                padding: "4px 7px",
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
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setLimit(PAGE);
          }}
          placeholder="BUSCAR HEROI OU ELEMENTO"
          className="mk-title"
          style={{
            width: "100%",
            fontSize: 6,
            padding: "5px 6px",
            color: "var(--mk-text)",
            background: "rgba(4,10,18,0.9)",
            border: "2px solid rgba(60,80,104,0.55)",
            outline: "none",
          }}
        />
      </div>

      {/* GRADE DE HEROIS */}
      <div className="mk-scroll" style={{ flex: 1, padding: 8 }}>
        <TeamWorkbench onInspect={id=>{setFocus(id);setDetail(id);}}/>
        <div
          className="mk-title"
          style={{
            fontSize: 7,
            color: "var(--mk-muted)",
            marginBottom: 6,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>EQUIPE {g.team.length}/4</span>
          <span style={{ color: "var(--mk-accent2)" }}>
            COLECAO {owned.length}/{ROBOTS.length}
          </span>
        </div>
        <div
          style={{
            height: 8,
            marginBottom: 8,
            border: "2px solid rgba(60,80,104,0.55)",
            background: "rgba(4,10,18,0.9)",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${Math.round((owned.length / ROBOTS.length) * 100)}%`,
              background: "linear-gradient(90deg, var(--mk-accent), var(--mk-accent2))",
            }}
          />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(84px, 1fr))",
            gap: 8,
          }}
        >
          {visible.slice(0, limit).map((def) => {
            const save = owned.find((r) => r.id === def.id) ?? null;
            const isLocked = !save;
            const active = focus === def.id;
            const teamed = g.team.includes(def.id);
            return (
              <button
                key={def.id}
                type="button"
                onClick={() => setFocus(def.id)}
                style={{
                  position: "relative",
                  background: isLocked
                    ? "rgba(8,14,24,0.85)"
                    : `linear-gradient(rgba(10,22,38,0.9), ${RARITY_GLOW[def.rarity].replace("0.9", "0.22").replace("0.95", "0.22")})`,
                  border: `2px solid ${active ? "var(--mk-accent2)" : isLocked ? "rgba(60,80,104,0.45)" : RARITY_GLOW[def.rarity]}`,
                  boxShadow: active ? "0 0 0 2px rgba(53,226,240,0.5)" : undefined,
                  padding: 4,
                  display: "grid",
                  placeItems: "center",
                  gap: 2,
                  cursor: "pointer",
                  transform: active ? "translateY(-2px)" : undefined,
                }}
              >
                <Frame rarity={def.rarity} size={68}>
                  <img
                    src={faceUrl(def.id)}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      imageRendering: "pixelated",
                      filter: isLocked ? "grayscale(1) brightness(0.3) contrast(1.2)" : undefined,
                    }}
                  />
                </Frame>
                <span
                  className="mk-title"
                  style={{ fontSize: 6, color: isLocked ? "var(--mk-muted)" : undefined }}
                >
                  {isLocked ? "? ? ? ?" : def.name}
                </span>
                <span
                  className="mk-title"
                  style={{ fontSize: 6, color: isLocked ? "var(--mk-muted)" : "var(--mk-accent2)" }}
                >
                  {isLocked ? def.rarity.toUpperCase() : `Lv${save!.level}`}
                </span>
                {teamed && (
                  <span
                    className="mk-title"
                    style={{
                      position: "absolute",
                      top: 2,
                      right: 2,
                      fontSize: 5,
                      padding: "1px 3px",
                      background: "var(--mk-accent)",
                      color: "#04121c",
                    }}
                  >
                    EQUIPE
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {visible.length > limit && (
          <div style={{ display: "grid", placeItems: "center", marginTop: 10 }}>
            <PixelButton onClick={() => setLimit((l) => l + PAGE)}>
              MOSTRAR MAIS ({visible.length - limit})
            </PixelButton>
          </div>
        )}
        <div style={{ height: 52 }} />
      </div>

      {detail && owned.some((r) => r.id === detail) && (
        <ScreenBoundary key={detail} exitLabel="VOLTAR AO HANGAR" onExit={() => setDetail(null)}>
          <RobotDetail save={owned.find((r) => r.id === detail)!} onClose={() => setDetail(null)} />
        </ScreenBoundary>
      )}
    </div>
  );
}

export function RobotDetail({ save, onClose }: { save: RobotSave; onClose: () => void }) {
  const g = useGame();
  const def = ROBOT_MAP[save.id];
  const base = baseStats(def.ratios, save.level);
  const cap = maxTrained(def.ratios, save.level);
  const cost = TRAIN_COST_PER_POINT * save.level;
  const inTeam = g.team.includes(save.id);
  const [page, setPage] = useState<"status" | "equip">("status");
  const [note,setNote]=useState("");

  function train(stat: "str" | "def" | "agl") {
    const result=trainRobotStat(save.id,stat);
    setNote(result.ok?`+1 ${stat.toUpperCase()} integrado · −${result.cost} ouro`:result.reason);
  }

  function toggleTeam() {
    if (inTeam) {
      if (g.team.length <= 1) return;
      setTeam(g.team.filter((id) => id !== save.id));
    } else {
      if (g.team.length >= 4) return;
      setTeam([...g.team, save.id]);
    }
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(3,6,12,0.86)",
        display: "grid",
        placeItems: "center",
        padding: 8,
        zIndex: 5,
      }}
    >
      <Panel style={{ width: "min(94vw, 420px)", maxHeight: "88vh", overflow: "hidden" }}>
        <div className="mk-scroll" style={{ maxHeight: "76vh", paddingRight: 4 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <RobotSprite robotId={save.id} clip="idle" size={104} fps={4} skin={skinOfRobot(g, save.id)} />
            <div style={{ flex: 1 }}>
              <div className="mk-title" style={{ fontSize: 11 }}>
                {def.name}
              </div>
              <div className="mk-title" style={{ fontSize: 7, color: "var(--mk-accent)" }}>
                {def.element} · {def.rarity.toUpperCase()} · Lv{save.level}
              </div>
              <div style={{ marginTop: 4 }}>
                <StatBar kind="xp" value={save.xp} max={robotMaxXP(save.level)} width={150} />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 4, margin: "8px 0" }}>
            {(["status", "equip"] as const).map((p) => (
              <button
                key={p}
                type="button"
                className="mk-title"
                onClick={() => setPage(p)}
                style={{
                  flex: 1,
                  fontSize: 7,
                  padding: 6,
                  cursor: "pointer",
                  color: page === p ? "#06121f" : "#dff6ff",
                  background: page === p ? "var(--mk-accent)" : "rgba(6,14,26,0.9)",
                  border: "2px solid rgba(53,226,240,0.5)",
                }}
              >
                {p === "status" ? "STATUS" : "EQUIPAMENTOS"}
              </button>
            ))}
          </div>
          {page === "equip" && <EquipPanel robotId={save.id} />}
          {page === "status" && (
            <>
          <div style={{ fontSize: 10, color: "var(--mk-muted)", margin: "8px 0" }}>{def.bio}</div>

          <div className="mk-title" style={{ fontSize: 8, marginBottom: 4 }}>
            ATRIBUTOS
          </div>
          <StatRow label="HP" value={base.hp} />
          <StatRow label="MP" value={base.mp} />
          <TrainRow
            label="FORCA"
            base={base.str}
            trained={save.trained.str}
            cap={cap.str}
            cost={cost}
            gold={g.gold}
            onTrain={() => train("str")}
          />
          <TrainRow
            label="DEFESA"
            base={base.def}
            trained={save.trained.def}
            cap={cap.def}
            cost={cost}
            gold={g.gold}
            onTrain={() => train("def")}
          />
          <TrainRow
            label="AGILIDADE"
            base={base.agl}
            trained={save.trained.agl}
            cap={cap.agl}
            cost={cost}
            gold={g.gold}
            onTrain={() => train("agl")}
          />

          <LoadoutEditor robotId={save.id} />
          {note&&<p className="mc-workbench-note" role="status">{note}</p>}
            </>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 8 }}>
            <PixelButton onClick={toggleTeam}>{inTeam ? "TIRAR DA EQUIPE" : "ESCALAR"}</PixelButton>
            <PixelButton onClick={onClose}>FECHAR</PixelButton>
          </div>
        </div>
      </Panel>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div
      className="mk-title"
      style={{ fontSize: 7, display: "flex", justifyContent: "space-between", padding: "2px 0" }}
    >
      <span>{label}</span>
      <span style={{ color: "var(--mk-text)" }}>{value}</span>
    </div>
  );
}

function TrainRow({
  label,
  base,
  trained,
  cap,
  cost,
  gold,
  onTrain,
}: {
  label: string;
  base: number;
  trained: number;
  cap: number;
  cost: number;
  gold: number;
  onTrain: () => void;
}) {
  const full = trained >= cap;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 6,
        padding: "3px 0",
      }}
    >
      <span className="mk-title" style={{ fontSize: 7 }}>
        {label}
      </span>
      <span className="mk-title" style={{ fontSize: 7, flex: 1, textAlign: "right" }}>
        {base + trained}{" "}
        <span style={{ color: "var(--mk-accent)" }}>
          ({trained}/{cap})
        </span>
      </span>
      <button
        type="button"
        className="mk-btn mk-btn-sq"
        disabled={full || gold < cost}
        onClick={onTrain}
        title={`Treinar por ${cost} de ouro`}
        style={{ fontSize: 7, padding: 0 }}
      >
        {full ? "MAX" : `+1 · ${cost}`}
      </button>
    </div>
  );
}

export function TopBar({
  title,
  gold,
  onBack,
}: {
  title: string;
  gold: number;
  onBack: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 8px",
        background: "rgba(6,12,22,0.95)",
        borderBottom: "2px solid rgba(53,226,240,0.4)",
      }}
    >
      <button
        type="button"
        className="mk-btn mk-btn-sq"
        onClick={onBack}
        style={{ fontSize: 8, padding: 0 }}
      >
        VOLTAR
      </button>
      <span className="mk-title" style={{ fontSize: 9, flex: 1 }}>
        {title}
      </span>
      <span className="mk-title" style={{ fontSize: 8, color: "var(--mk-accent2)" }}>
        <Icon name="coins" size={12} /> {gold}
      </span>
    </div>
  );
}
