import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

/* ---------------------------------------------------------------------------
 * Transição "portão de ferro": duas metades fecham da esquerda e da direita,
 * a ação acontece escondida atrás delas e o portão reabre no destino.
 * ------------------------------------------------------------------------- */

type GateCtx = { transition: (fn: () => void) => void; busy: boolean };

const Ctx = createContext<GateCtx>({ transition: (fn) => fn(), busy: false });

export const useGate = () => useContext(Ctx);

const CLOSE_MS = 460;
const HOLD_MS = 190;
const OPEN_MS = 520;

export function GateProvider({ children }: { children: ReactNode }) {
  const [closed, setClosed] = useState(false);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);

  const transition = useCallback((fn: () => void) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setClosed(true);
    window.setTimeout(() => {
      fn();
      window.setTimeout(() => {
        setClosed(false);
        window.setTimeout(() => {
          lock.current = false;
          setBusy(false);
        }, OPEN_MS);
      }, HOLD_MS);
    }, CLOSE_MS);
  }, []);

  const half = (side: "left" | "right") => (
    <div
      key={side}
      aria-hidden
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        [side]: 0,
        width: "50.5%",
        backgroundImage: "url(/ui/gate_plate.png)",
        backgroundSize: "auto 100%",
        backgroundRepeat: "repeat-x",
        backgroundPosition: side === "left" ? "right center" : "left center",
        imageRendering: "pixelated",
        transform: closed
          ? "translateX(0)"
          : `translateX(${side === "left" ? "-100.5%" : "100.5%"})`,
        transition: `transform ${closed ? CLOSE_MS : OPEN_MS}ms cubic-bezier(0.7,0,0.3,1)`,
        boxShadow:
          side === "left"
            ? "inset -6px 0 0 rgba(53,226,240,0.55), 8px 0 26px rgba(0,0,0,0.8)"
            : "inset 6px 0 0 rgba(53,226,240,0.55), -8px 0 26px rgba(0,0,0,0.8)",
      }}
    />
  );

  return (
    <Ctx.Provider value={{ transition, busy }}>
      {children}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 60,
          overflow: "hidden",
          pointerEvents: busy ? "auto" : "none",
        }}
      >
        {half("left")}
        {half("right")}
        <div
          className="mk-title"
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%,-50%)",
            fontSize: 8,
            letterSpacing: 2,
            color: "var(--mk-accent)",
            textShadow: "0 0 8px rgba(53,226,240,0.8)",
            opacity: closed ? 1 : 0,
            transition: "opacity 160ms linear",
          }}
        >
          ▮▮▮ ACESSANDO ▮▮▮
        </div>
      </div>
    </Ctx.Provider>
  );
}
