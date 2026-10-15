import { useState } from "react";
import { Frame, Panel, PixelButton, RobotSprite } from "@/components/pixel";
import { ITEMS } from "@/game/config";
import { lockedRobotIds, useGame } from "@/game/save";
import { purchaseSupplies } from "@/game/economy-actions";
import { faceUrl, ROBOT_MAP } from "@/game/robots";
import { TopBar } from "@/screens/roster";

export function ShopScreen({ onBack }: { onBack: () => void }) {
  const g = useGame();
  const [unlocked, setUnlocked] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [quantity,setQuantity]=useState(1);

  function buy(id: string) {
    const result=purchaseSupplies(id,id==="capsule"?1:quantity);
    if(!result.ok){setMsg(result.reason);return;}
    setMsg(`COMPRA CONFIRMADA · ${result.quantity} UN. · −${result.cost} OURO`);
    if(result.robotId)setUnlocked(result.robotId);
  }

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
      <TopBar title="LOJA MECHA" gold={g.gold} onBack={onBack} />
      <div className="mk-scroll" style={{ flex: 1, padding: 8 }}>
        <div className="mc-supply-toolbar"><div><small>BANCADA DE SUPRIMENTOS</small><strong>Prepare. Repare. Recrute.</strong><p>Saldo {g.gold} ouro · compras sem gasto de turno.</p></div><div aria-label="Quantidade de suprimentos">{[1,5].map(n=><button key={n} aria-pressed={quantity===n} onClick={()=>setQuantity(n)}>×{n}</button>)}</div></div>
        {msg && (
          <div className="mk-title" style={{ fontSize: 7, color: "var(--mk-accent)", marginBottom: 6 }}>
            {msg}
          </div>
        )}
        <div style={{ display: "grid", gap: 6 }}>
          {ITEMS.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                border: "2px solid rgba(53,226,240,0.35)",
                background: "rgba(8,18,32,0.75)",
                padding: 6,
              }}
            >
              <img src={item.icon} alt="" width={28} height={28} style={{ imageRendering: "pixelated" }} />
              <div style={{ flex: 1 }}>
                <div className="mk-title" style={{ fontSize: 7 }}>
                  {item.name}{" "}
                  <span style={{ color: "var(--mk-muted)" }}>x{g.items[item.id] ?? 0}</span>
                </div>
                <div style={{ fontSize: 10, color: "var(--mk-muted)" }}>{item.desc}</div>
                <small className="mc-supply-cost">{item.id==="capsule"?`${lockedRobotIds().length} chassis ausentes · sem duplicatas`:`${item.price} ouro/un. · receber ${quantity} · saldo após compra ${Math.max(0,g.gold-item.price*quantity)}`}</small>
              </div>
              <button
                type="button"
                className="mk-btn mk-btn-sq"
                disabled={g.gold < item.price*(item.id==="capsule"?1:quantity)||(item.id==="capsule"&&!lockedRobotIds().length)}
                onClick={() => buy(item.id)}
                aria-label={`Comprar ${item.id==="capsule"?1:quantity} ${item.name} por ${item.price*(item.id==="capsule"?1:quantity)} ouro`}
                style={{ fontSize: 7, padding: 0, minWidth: 62 }}
              >
                {item.price*(item.id==="capsule"?1:quantity)}
              </button>
            </div>
          ))}
        </div>
      </div>

      {unlocked && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(3,6,12,0.88)",
            display: "grid",
            placeItems: "center",
            zIndex: 6,
          }}
        >
          <Panel style={{ width: "min(90vw, 340px)", textAlign: "center" }}>
            <div className="mk-title" style={{ fontSize: 10, color: "var(--mk-accent2)" }}>
              NOVO ROBO!
            </div>
            <div style={{ display: "grid", placeItems: "center", margin: "8px 0" }}>
              <RobotSprite robotId={unlocked} clip="enter" size={128} fps={4} />
              <Frame rarity={ROBOT_MAP[unlocked].rarity} size={64}>
                <img
                  src={faceUrl(unlocked)}
                  alt=""
                  style={{ width: "100%", height: "100%", imageRendering: "pixelated" }}
                />
              </Frame>
            </div>
            <div className="mk-title" style={{ fontSize: 9 }}>
              {ROBOT_MAP[unlocked].name}
            </div>
            <div style={{ fontSize: 10, color: "var(--mk-muted)", margin: "6px 0" }}>
              {ROBOT_MAP[unlocked].bio}
            </div>
            <PixelButton onClick={() => setUnlocked(null)}>RECRUTAR</PixelButton>
          </Panel>
        </div>
      )}
    </div>
  );
}
