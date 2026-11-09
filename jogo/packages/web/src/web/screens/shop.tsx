import { useState } from "react";
import { Frame, Panel, PixelButton, RobotSprite } from "@/components/pixel";
import { ITEMS } from "@/game/config";
import { lockedRobotIds, useGame } from "@/game/save";
import { purchaseSupplies } from "@/game/economy-actions";
import { faceUrl, ROBOT_MAP } from "@/game/robots";
import { TopBar } from "@/screens/roster";
import './shop-evolution.css';

export function ShopScreen({ onBack }: { onBack: () => void }) {
  const g = useGame();
  const [unlocked, setUnlocked] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [quantity,setQuantity]=useState(1);
  const [category,setCategory]=useState('all');
  const [selected,setSelected]=useState<(typeof ITEMS)[number]|null>(null);
  const [search,setSearch]=useState('');
  const [affordable,setAffordable]=useState(false);
  const filtered=ITEMS.filter(item=>(category==='all'||category==='recruit'&&item.id==='capsule'||category==='repair'&&['repair_kit','mega_repair','revive_core'].includes(item.id)||category==='boost'&&!['repair_kit','mega_repair','revive_core','capsule'].includes(item.id))&&item.name.toLowerCase().includes(search.toLowerCase())&&(!affordable||g.gold>=item.price*(item.id==='capsule'?1:quantity)));

  function buy(id: string) {
    const result=purchaseSupplies(id,id==="capsule"?1:quantity);
    if(!result.ok){setMsg(result.reason);return;}
    setMsg(`COMPRA CONFIRMADA · ${result.quantity} UN. · −${result.cost} OURO`);
    if(result.robotId)setUnlocked(result.robotId);
  }

  return (
    <div className="mc-shop-evolved" style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
      <TopBar title="LOJA MECHA" gold={g.gold} onBack={onBack} />
      <div className="mk-scroll" style={{ flex: 1, padding: 8 }}>
        <header className="mc-shop-booth"><div><small>BAZAR DE ÓRBITA / MERCADOR DE CHASSIS</small><h2>ESCOLHA SEU<br/><em>PRÓXIMO IMPULSO.</em></h2><p>“Nada de duplicatas no meu balcão. Cada cápsula traz um chassi que você ainda não tem.”</p><span>{g.cityLife.purchases} ITENS COMPRADOS · {lockedRobotIds().length} CHASSIS A DESCOBRIR</span></div><img src="/city-sprites/289.png" alt="Mercador robótico"/></header>
        <nav className="mc-shop-tabs">{[['all','TUDO'],['repair','REPAROS'],['boost','SUPORTE'],['recruit','CHASSIS']].map(([id,label])=><button key={id} aria-pressed={category===id} onClick={()=>setCategory(id)}>{label}</button>)}</nav>
        <div className="mc-shop-search"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar no balcão…" aria-label="Buscar item"/><button aria-pressed={affordable} onClick={()=>setAffordable(!affordable)}>CABE NO SALDO</button></div>
        <div className="mc-supply-toolbar"><div><small>BANCADA DE SUPRIMENTOS</small><strong>Prepare. Repare. Recrute.</strong><p>Saldo {g.gold} ouro · compras sem gasto de turno.</p></div><div aria-label="Quantidade de suprimentos">{[1,5].map(n=><button key={n} aria-pressed={quantity===n} onClick={()=>setQuantity(n)}>×{n}</button>)}</div></div>
        {msg && (
          <div className="mk-title" style={{ fontSize: 7, color: "var(--mk-accent)", marginBottom: 6 }}>
            {msg}
          </div>
        )}
        <div className="mc-shop-grid">
          {filtered.map((item) => (
            <div
              className="mc-shop-product"
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
              <button className="mc-shop-preview-art" onClick={()=>setSelected(item)} aria-label={`Ver ${item.name}`}><img src={item.icon} alt="" width={52} height={52} style={{ imageRendering: "pixelated" }} /></button>
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
                onClick={() => setSelected(item)}
                aria-label={`Comprar ${item.id==="capsule"?1:quantity} ${item.name} por ${item.price*(item.id==="capsule"?1:quantity)} ouro`}
                style={{ fontSize: 7, padding: 0, minWidth: 62 }}
              >
                {item.price*(item.id==="capsule"?1:quantity)}
              </button>
            </div>
          ))}
        </div>
        {!filtered.length&&<p className="mc-shop-empty">Nenhum item encontrado neste filtro.</p>}
      </div>
      {selected&&<div className="mc-shop-detail"><Panel style={{width:'min(92%,360px)',textAlign:'center'}}><button className="mc-shop-detail-close" onClick={()=>setSelected(null)}>← VOLTAR AO BALCÃO</button><img src={selected.icon} width={100} height={100} alt=""/><h2>{selected.name}</h2><p>{selected.desc}</p><p>Receber: {selected.id==='capsule'?1:quantity} · custo: {selected.price*(selected.id==='capsule'?1:quantity)} ouro</p><p>Saldo depois: {g.gold-selected.price*(selected.id==='capsule'?1:quantity)} ouro</p>{selected.id==='capsule'&&<small>Chassi aleatório entre os ausentes. Nenhuma duplicata. Sem garantia de raridade específica.</small>}<PixelButton disabled={g.gold<selected.price*(selected.id==='capsule'?1:quantity)||selected.id==='capsule'&&!lockedRobotIds().length} onClick={()=>{buy(selected.id);setSelected(null)}}>CONFIRMAR COMPRA</PixelButton></Panel></div>}

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
