import { useEffect, useRef, useState } from "react";
import { EXPLORE_CELL, EX_W, T, WW, WH, getWorld, regionAt, terrainTile, type Site } from "@/game/world";

export function WorldAtlas({ explored, px, py, won, playerLevel, lit, onWarp, onClose, onEnterSite }: { explored: Uint8Array; found: number; px: number; py: number; won: string[]; playerLevel: number; lit: Set<number>; onWarp: (x: number, y: number) => void; onClose: () => void; onEnterSite?: (s: Site) => void }) {
  const world = getWorld();
  const [selected, setSelected] = useState(regionAt(px / T));
  const [filter, setFilter] = useState("");
  const ref = useRef<HTMLCanvasElement>(null);
  const r = world.regions[selected];
  const width = 320, height = 480;
  const seen = (x: number, y: number) => explored[Math.floor(y / EXPLORE_CELL) * EX_W + Math.floor(x / EXPLORE_CELL)] === 1;
  useEffect(() => {
    const c = ref.current, ctx = c?.getContext("2d"); if (!c || !ctx) return;
    c.width = width; c.height = height;
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#080f1b"; ctx.fillRect(0, 0, width, height);
    const sx = width / (r.end - r.start + 1), sy = height / WH;
    // Overview samples analytic tiles; never generates every chunk of the giant world.
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      const tx = Math.floor(r.start + x / sx), ty = Math.floor(y / sy);
      if (!seen(tx, ty)) continue;
      const v = terrainTile(world, tx, ty);
      ctx.fillStyle = v === 0 ? ty < world.surf[tx] ? "#214660" : "#12202e" : r.color;
      ctx.fillRect(x, y, 1, 1);
    }
    ctx.setLineDash([3, 4]); ctx.strokeStyle = "#8cefff";
    ctx.beginPath(); ctx.moveTo((r.skyX - r.start) * sx, 80 * sy); ctx.lineTo((r.skyX - r.start) * sx, r.peak * sy); ctx.stroke();
    ctx.strokeStyle = "#ffc35a"; ctx.beginPath(); ctx.moveTo((r.shaftX - r.start) * sx, world.surf[r.shaftX] * sy); ctx.lineTo((r.shaftX - r.start) * sx, (WH - 24) * sy); ctx.stroke(); ctx.setLineDash([]);
    for (const L of world.lanterns) if (lit.has(L.id) && regionAt(L.x / T) === selected) { ctx.fillStyle = "#7fe9ff"; ctx.fillRect((L.x / T - r.start) * sx - 3, L.y / T * sy - 3, 6, 6); }
    if (seen(r.site.tx, r.site.ty) || playerLevel >= r.site.t.requiredLevel) { ctx.fillStyle = won.includes(r.id) ? "#ffd23a" : playerLevel < r.site.t.requiredLevel ? "#ff6a5a" : "#35e2f0"; ctx.fillRect((r.site.tx - r.start) * sx - 4, r.site.ty * sy - 4, 8, 8); }
    if (regionAt(px / T) === selected) { ctx.fillStyle = "#fff"; ctx.fillRect((px / T - r.start) * sx - 3, py / T * sy - 3, 6, 6); }
  }, [selected, explored, px, py, lit, won, playerLevel]);
  const visibleRegions = world.regions.filter(region => region.name.toLowerCase().includes(filter.toLowerCase()));
  return <div data-testid="minimap" style={{ position: "absolute", inset: 0, zIndex: 30, background: "rgba(3,8,16,.98)", padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
    <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}><div className="mk-title" style={{ fontSize: 8, color: "#35e2f0", lineHeight: 1.8 }}>ATLAS DO COLOSSO<br /><span style={{ fontSize: 6, color: "#93b1c8" }}>{WW}×{WH} TILES · 205 BIOMAS · 100× G4</span></div><button className="mk-btn" data-testid="close-map" onClick={onClose}>FECHAR</button></header>
    <input aria-label="Buscar região" placeholder="Buscar torneio / bioma" value={filter} onChange={e => setFilter(e.target.value)} style={{ minHeight: 36, background: "#0d2033", color: "#e0f4ff", border: "2px solid #345569", padding: 8 }} />
    <select aria-label="Região do mapa" value={selected} onChange={e => setSelected(Number(e.target.value))} style={{ minHeight: 38, background: "#0d2033", color: "#e0f4ff", border: "2px solid #345569" }}>{visibleRegions.map(region => <option key={region.id} value={region.index}>{region.index + 1}. {region.name}</option>)}</select>
    <div style={{ flex: 1, minHeight: 0, overflow: "auto", display: "flex", gap: 10, flexWrap: "wrap" }}>
      <canvas ref={ref} style={{ imageRendering: "pixelated", width: "min(100%,320px)", height: 480, border: "2px solid #294d61", flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 160, color: "#b9d5e4", fontSize: 11 }}>
        <h3 className="mk-title" style={{ fontSize: 8, color: r.color, lineHeight: 1.8 }}>{r.name}</h3>
        <p>Trilha ciano: subida ao céu. Trilha âmbar: descida às galerias. Degraus a cada 3 tiles (salto simples) e corrente ascendente no centro: segure pulo para subir.</p>
        {playerLevel >= r.site.t.requiredLevel ? <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
          <button className="mk-btn" data-testid="atlas-enter" onClick={() => onEnterSite?.(r.site)} style={{ fontSize: 7, minHeight: 44, color: "#03121a", background: "var(--mk-accent)" }}>ENTRAR NO TORNEIO</button>
          <button className="mk-btn" data-testid="atlas-travel" onClick={() => onWarp(r.site.tx * T, r.site.ty * T)} style={{ fontSize: 7, minHeight: 44 }}>IR AO PORTAL</button>
        </div> : <p className="mk-title" style={{ fontSize: 7, color: "#ff6a5a" }}>TORNEIO REQUER NIVEL {r.site.t.requiredLevel}</p>}
        <p>Lanternas acesas: toque para viajar. A viagem só permite checkpoints descobertos.</p>
        {world.lanterns.filter(L => lit.has(L.id) && regionAt(L.x / T) === selected).map(L => <button className="mk-btn" key={L.id} data-testid="warp-lantern" onClick={() => onWarp(L.x, L.y)} style={{ display: "block", fontSize: 7, marginBottom: 6, minHeight: 44 }}>LANTERNA {L.id} · {Math.round((1960 - L.y / T) * 2)}M</button>)}
        <p>1 torneio · 5 missões · duelo rápido · corrida · cerco · oficina · relíquia</p>
      </div>
    </div>
  </div>;
}