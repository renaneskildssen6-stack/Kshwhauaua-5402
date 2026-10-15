import { useEffect, useMemo, useState } from "react";
import { Panel, PixelButton } from "@/components/pixel";
import {
  PET_KIND_LABEL,
  PET_MAX_LEVEL,
  PET_SLOT_LEVELS,
  PET_SLOT_MAX,
  PET_STAGE_CAPS,
  PETS,
  SPECIES,
  STRAINS,
  petArt,
  petFilter,
  petPower,
  petStage,
  petStageLabel,
  petUpgradeBars,
  petUpgradeCost,
  petValue,
  petValue2,
  type PetDef,
} from "@/game/pets";
import { buyPet, togglePetSlot, totalBars, upgradePet, useGame } from "@/game/save";
import { TopBar } from "@/screens/roster";

type Filtro = "todos" | "meus" | "novos";
const FILTRO_LABEL: Record<Filtro, string> = {
  todos: "TODOS",
  meus: "MEUS",
  novos: "A ADOTAR",
};
const FILTRO_ORDEM: Filtro[] = ["todos", "meus", "novos"];

const RARITY_COLOR: Record<string, string> = {
  bronze: "#c98b4b",
  silver: "#cfd8e3",
  gold: "#f2c14b",
};

/** Seta grande do carrossel. */
function Arrow({
  dir,
  label,
  onClick,
  disabled,
}: {
  dir: "<" | ">";
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className="mk-btn mk-btn-sq"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      style={{
        fontSize: 16,
        minWidth: 40,
        height: 78,
        padding: 0,
        lineHeight: 1,
      }}
    >
      {dir}
    </button>
  );
}

/** Rancho dos Pets — carrossel: um pet no centro, setas nas laterais. */
export function PetsScreen({ onBack }: { onBack: () => void }) {
  const g = useGame();
  const [msg, setMsg] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1);
  const [anim, setAnim] = useState(0);

  const slots = PET_SLOT_LEVELS.filter((lv) => g.playerLevel >= lv).length;
  const bars = totalBars(g);

  const lista = useMemo(() => {
    const all = PETS.filter((p) => {
      const lvl = g.pets[p.id] ?? 0;
      if (filtro === "meus") return lvl > 0;
      if (filtro === "novos") return lvl <= 0;
      return true;
    });
    return all.length ? all : PETS;
  }, [filtro, g.pets]);

  // mantem o indice dentro da lista quando o filtro muda
  useEffect(() => {
    setIdx((i) => (i >= lista.length ? 0 : i));
  }, [lista.length]);

  const def: PetDef = lista[Math.min(idx, lista.length - 1)] ?? PETS[0];
  const level = g.pets[def.id] ?? 0;
  const owned = level > 0;
  const ativo = g.activePets.includes(def.id);
  const locked = g.playerLevel < def.requiredLevel;
  const maxed = level >= PET_MAX_LEVEL;
  const custo = owned ? petUpgradeCost(def, level) : def.price;
  const custoBars = owned ? petUpgradeBars(def, level) : 0;
  const stage = petStage(Math.max(1, level));
  const evolveNext =
    level === PET_STAGE_CAPS[0] || level === PET_STAGE_CAPS[1] ? true : false;

  function go(step: number) {
    setDir(step);
    setIdx((i) => (i + step + lista.length) % lista.length);
    setAnim((a) => a + 1);
    setMsg("");
  }

  function goSpecies(step: number) {
    const atual = SPECIES.findIndex((s) => s.id === def.species);
    const alvo = SPECIES[(atual + step + SPECIES.length) % SPECIES.length];
    // procura na lista atual o primeiro pet da especie alvo
    const found = lista.findIndex((p) => p.species === alvo.id);
    if (found >= 0) {
      setDir(step);
      setIdx(found);
      setAnim((a) => a + 1);
      setMsg("");
    }
  }

  const especieIdx = SPECIES.findIndex((s) => s.id === def.species) + 1;
  const linhagemIdx = STRAINS.findIndex((s) => s.id === def.strain) + 1;
  const equipados = g.activePets
    .map((id) => PETS.find((p) => p.id === id))
    .filter((p): p is PetDef => Boolean(p));

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
      <TopBar title="RANCHO DOS PETS" gold={g.gold} onBack={onBack} />
      <div
        className="mk-scroll"
        style={{
          flex: 1,
          padding: 8,
          backgroundImage:
            "linear-gradient(rgba(4,9,18,0.8), rgba(4,9,18,0.96)), url(/ui/bg_heroes.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          imageRendering: "pixelated",
        }}
      >
        {/* ---------------------------------------------- slots da equipe */}
        <Panel style={{ padding: 6, marginBottom: 6 }}>
          <div
            className="mk-title"
            style={{ fontSize: 6, color: "var(--mk-muted)", marginBottom: 4 }}
          >
            EQUIPE · {equipados.length}/{slots} SLOT{slots === 1 ? "" : "S"} ·{" "}
            {slots < PET_SLOT_MAX
              ? `PROXIMO NO NIVEL ${PET_SLOT_LEVELS[slots]}`
              : "TODOS LIBERADOS"}
          </div>
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            {Array.from({ length: PET_SLOT_MAX }).map((_, i) => {
              const p = equipados[i];
              const livre = i < slots;
              return (
                <div
                  key={i}
                  style={{
                    width: 38,
                    height: 38,
                    border: `2px solid ${p ? "var(--mk-accent)" : "rgba(60,80,104,0.55)"}`,
                    background: "rgba(4,10,18,0.85)",
                    display: "grid",
                    placeItems: "center",
                    opacity: livre ? 1 : 0.35,
                  }}
                >
                  {p ? (
                    <img
                      src={petArt(p.id)}
                      alt=""
                      style={{
                        width: 34,
                        height: 34,
                        maxWidth: "none",
                        imageRendering: "pixelated",
                        filter: petFilter(p),
                      }}
                    />
                  ) : (
                    <span className="mk-title" style={{ fontSize: 12, color: "var(--mk-muted)" }}>
                      {livre ? "+" : "×"}
                    </span>
                  )}
                </div>
              );
            })}
            <div style={{ flex: 1 }} />
            <button
              type="button"
              className="mk-btn"
              aria-label="filtro"
              onClick={() => {
                const n = FILTRO_ORDEM[(FILTRO_ORDEM.indexOf(filtro) + 1) % 3];
                setFiltro(n);
                setIdx(0);
                setMsg("");
              }}
              style={{ fontSize: 7, padding: "5px 7px" }}
            >
              {FILTRO_LABEL[filtro]}
            </button>
          </div>
        </Panel>

        {/* -------------------------------------------- carrossel de especie */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 5 }}>
          <button
            type="button"
            className="mk-btn mk-btn-sq"
            aria-label="especie anterior"
            onClick={() => goSpecies(-1)}
            style={{ fontSize: 9, minWidth: 34, padding: "5px 0" }}
          >
            {"<<"}
          </button>
          <div
            className="mk-title"
            style={{
              flex: 1,
              textAlign: "center",
              fontSize: 7,
              padding: "5px 2px",
              background: "rgba(4,10,18,0.9)",
              border: "2px solid rgba(60,80,104,0.55)",
              color: "var(--mk-accent2)",
            }}
          >
            ESPECIE {especieIdx}/{SPECIES.length} · LINHAGEM {linhagemIdx}/{STRAINS.length}
          </div>
          <button
            type="button"
            className="mk-btn mk-btn-sq"
            aria-label="especie proxima"
            onClick={() => goSpecies(1)}
            style={{ fontSize: 9, minWidth: 34, padding: "5px 0" }}
          >
            {">>"}
          </button>
        </div>

        {/* ------------------------------------------------ palco do pet */}
        <Panel
          style={{
            padding: 8,
            marginBottom: 6,
            border: ativo ? "2px solid var(--mk-accent)" : undefined,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Arrow dir="<" label="pet anterior" onClick={() => go(-1)} />
            <div
              style={{
                flex: 1,
                minWidth: 0,
                display: "grid",
                placeItems: "center",
                position: "relative",
                padding: "4px 0",
              }}
            >
              {/* aura da raridade */}
              <div
                className="mk-aura"
                style={{
                  position: "absolute",
                  width: 158,
                  height: 158,
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${RARITY_COLOR[def.rarity]}55 0%, transparent 68%)`,
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  width: 148,
                  height: 148,
                  display: "grid",
                  placeItems: "center",
                  position: "relative",
                  border: `3px solid ${RARITY_COLOR[def.rarity]}`,
                  outline: "2px solid rgba(4,10,18,0.9)",
                  background:
                    "linear-gradient(180deg, rgba(10,22,38,0.92), rgba(4,10,18,0.96))",
                  boxShadow: `inset 0 0 0 2px rgba(4,10,18,0.9), 0 0 12px ${RARITY_COLOR[def.rarity]}44`,
                }}
              >
                {/* sombra no chao */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 14,
                    width: 74,
                    height: 12,
                    borderRadius: "50%",
                    background: "rgba(0,0,0,0.55)",
                  }}
                />
                <div
                  key={`${def.id}-${anim}`}
                  className="mk-petin"
                  style={
                    {
                      width: "100%",
                      height: "100%",
                      display: "grid",
                      placeItems: "center",
                      "--mk-in": `${dir > 0 ? 26 : -26}px`,
                    } as React.CSSProperties
                  }
                >
                  <img
                    className="mk-petbob"
                    src={petArt(def.id)}
                    alt={def.name}
                    style={{
                      width: [104, 120, 136][stage],
                      height: [104, 120, 136][stage],
                      maxWidth: "none",
                      imageRendering: "pixelated",
                      filter: owned
                        ? petFilter(def)
                        : `${petFilter(def) ?? ""} grayscale(0.85) brightness(0.5)`,
                    }}
                  />
                </div>
                {/* etiqueta de estagio */}
                {owned && (
                  <div
                    className="mk-title"
                    style={{
                      position: "absolute",
                      bottom: -2,
                      right: -2,
                      fontSize: 6,
                      padding: "2px 4px",
                      background: "rgba(4,10,18,0.94)",
                      border: `2px solid ${RARITY_COLOR[def.rarity]}`,
                      color: RARITY_COLOR[def.rarity],
                    }}
                  >
                    {["I", "II", "III"][stage]}
                  </div>
                )}
              </div>
              <div
                className="mk-title"
                style={{ fontSize: 6, color: "var(--mk-muted)", marginTop: 4 }}
              >
                {Math.min(idx, lista.length - 1) + 1} / {lista.length}
              </div>
            </div>
            <Arrow dir=">" label="pet proximo" onClick={() => go(1)} />
          </div>

          <div style={{ textAlign: "center", marginTop: 4 }}>
            <div className="mk-title" style={{ fontSize: 8, lineHeight: 1.5 }}>
              {def.name}
            </div>
            <div
              className="mk-title"
              style={{ fontSize: 6, color: RARITY_COLOR[def.rarity], marginTop: 3 }}
            >
              {def.rarity.toUpperCase()} · {def.element} ·{" "}
              {owned ? `${petStageLabel(level)} Lv${level}/${PET_MAX_LEVEL}` : "NAO ADOTADO"}
            </div>
            {ativo && (
              <div
                className="mk-title mk-blink"
                style={{ fontSize: 6, color: "var(--mk-accent)", marginTop: 3 }}
              >
                NA EQUIPE
              </div>
            )}
          </div>

          {/* barra de nivel */}
          <div
            style={{
              marginTop: 6,
              height: 8,
              background: "rgba(4,10,18,0.9)",
              border: "2px solid rgba(60,80,104,0.55)",
            }}
          >
            <div
              style={{
                width: `${(level / PET_MAX_LEVEL) * 100}%`,
                height: "100%",
                background: "linear-gradient(90deg, var(--mk-accent2), var(--mk-accent))",
              }}
            />
          </div>
        </Panel>

        {msg && (
          <div
            className="mk-title"
            style={{ fontSize: 7, color: "var(--mk-accent)", marginBottom: 6, lineHeight: 1.6 }}
          >
            {msg}
          </div>
        )}

        {/* ---------------------------------------------------- ficha */}
        <Panel style={{ padding: 6, marginBottom: 6 }}>
          <div className="mk-title" style={{ fontSize: 6, color: "var(--mk-accent2)" }}>
            {PET_KIND_LABEL[def.kind]} · PODER {petPower(def, Math.max(1, level))}
          </div>
          <div style={{ fontSize: 9, color: "var(--mk-text)", marginTop: 4 }}>
            ► {def.desc.replace(String(def.base), String(petValue(def, Math.max(1, level))))}
          </div>
          <div style={{ fontSize: 9, color: "var(--mk-muted)", marginTop: 3 }}>
            ► {PET_KIND_LABEL[def.kind2]} secundario: {petValue2(def, Math.max(1, level))}
          </div>
          <div
            className="mk-title"
            style={{ fontSize: 6, color: "var(--mk-muted)", marginTop: 6 }}
          >
            TRACOS
          </div>
          {def.traits.map((t) => (
            <div key={t} style={{ fontSize: 9, color: "rgba(150,170,195,0.85)", marginTop: 2 }}>
              • {t}
            </div>
          ))}
          <div
            style={{
              fontSize: 9,
              color: "rgba(150,170,195,0.62)",
              marginTop: 5,
              lineHeight: 1.5,
            }}
          >
            {def.flavor}
          </div>
        </Panel>

        {/* ---------------------------------------------------- acoes */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          <PixelButton
            disabled={
              locked || (owned && maxed) || g.gold < custo || (custoBars > 0 && bars < custoBars)
            }
            onClick={() => {
              const ok = owned ? upgradePet(def.id) : buyPet(def.id);
              if (!ok) {
                setMsg("Recursos insuficientes ou requisito nao atendido.");
                return;
              }
              if (!owned && filtro === "novos") {
                // o pet sai do filtro "a adotar": segue nele na lista completa
                setFiltro("todos");
                setIdx(PETS.findIndex((p) => p.id === def.id));
              }
              setMsg(
                owned
                  ? evolveNext
                    ? `${def.name} EVOLUIU para ${petStageLabel(level + 1)}!`
                    : `${def.name} subiu para Lv${level + 1}.`
                  : `${def.name} entrou no rancho!`,
              );
            }}
          >
            {locked
              ? `NIVEL ${def.requiredLevel}`
              : owned
                ? maxed
                  ? "NIVEL MAXIMO"
                  : `${evolveNext ? "EVOLUIR" : "TREINAR"} · ${custo}${custoBars > 0 ? ` +${custoBars}L` : ""}`
                : `ADOTAR · ${def.price}`}
          </PixelButton>
          <PixelButton
            disabled={!owned || (!ativo && g.activePets.length >= slots)}
            onClick={() => {
              const ok = togglePetSlot(def.id);
              if (!ok) {
                setMsg("Nenhum slot livre. Dispense um pet primeiro.");
                return;
              }
              setMsg(ativo ? "Pet dispensado." : `${def.name} entrou na equipe.`);
            }}
          >
            {ativo ? "DISPENSAR" : "LEVAR"}
          </PixelButton>
        </div>

        <div
          className="mk-title"
          style={{
            fontSize: 6,
            color: "var(--mk-muted)",
            marginTop: 8,
            lineHeight: 1.7,
          }}
        >
          {PETS.length} COMPANHEIROS · {SPECIES.length} ESPECIES × {STRAINS.length} LINHAGENS ·
          MAX Lv{PET_MAX_LEVEL} EM 3 ESTAGIOS · LINGOTES: {bars}
        </div>
        <div style={{ height: 48 }} />
      </div>
    </div>
  );
}
