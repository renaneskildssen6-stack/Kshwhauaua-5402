import { useEffect, useRef, useState } from 'react';
import { explorerId, useGame } from '@/game/save';
import { HERO_FRAME, clipFrame, heroSheet, type HeroClip } from '@/game/hero';
import './underground-station.css';

/** Small playable underground platform; surface fast-travel remains level-gated. */
export function UndergroundStation({ onExit }: { onExit: () => void }) {
  const hero = explorerId(useGame());
  const canvas = useRef<HTMLCanvasElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const player = useRef({ x: 520, y: 0, vx: 0, vy: 0, face: 1, jumps: 0 });
  const keys = useRef({ left: false, right: false, run: false });
  const jumpPending = useRef(false);
  const image = useRef<HTMLImageElement | null>(null);
  const [visual, setVisual] = useState({ x: 520, y: 0, face: 1, camera: 280 });
  const exitRef = useRef(onExit); exitRef.current = onExit;
  const jump = () => { jumpPending.current = true; };
  useEffect(() => {
    const sprite = new Image(); sprite.src = heroSheet(hero); image.current = sprite;
    return () => { image.current = null; };
  }, [hero]);
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest('button,input,select,textarea') && ['Enter', ' '].includes(e.key)) return;
      const k = e.key.toLowerCase();
      if (['a', 'arrowleft'].includes(k)) { e.preventDefault(); keys.current.left = true; }
      if (['d', 'arrowright'].includes(k)) { e.preventDefault(); keys.current.right = true; }
      if (k === 'shift') keys.current.run = true;
      if (['w', 'z', 'arrowup', ' '].includes(k)) { e.preventDefault(); if (!e.repeat) jumpPending.current = true; }
      if (k === 'e' && player.current.x < 145 && player.current.y < 10) exitRef.current();
    };
    const up = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (['a', 'arrowleft'].includes(k)) keys.current.left = false;
      if (['d', 'arrowright'].includes(k)) keys.current.right = false;
      if (k === 'shift') keys.current.run = false;
    };
    const reset = () => { keys.current = { left: false, right: false, run: false }; jumpPending.current = false; };
    window.addEventListener('keydown', down); window.addEventListener('keyup', up); window.addEventListener('blur', reset);
    let raf = 0, last = 0, paint = 0, time = 0; let previous: HeroClip = 'idle';
    const frame = (now: number) => {
      const dt = Math.min(.033, (now - (last || now)) / 1000); last = now;
      const p = player.current, direction = Number(keys.current.right) - Number(keys.current.left);
      if (direction) {
        const max = keys.current.run ? 305 : 165;
        p.vx = Math.max(-max, Math.min(max, p.vx + direction * 2200 * dt)); p.face = direction;
      } else p.vx = Math.abs(p.vx) < 2600 * dt ? 0 : p.vx - Math.sign(p.vx) * 2600 * dt;
      if (jumpPending.current && p.jumps < 2) { p.vy = p.jumps ? 700 : 820; p.jumps++; }
      jumpPending.current = false;
      p.vy -= 2600 * dt; p.y += p.vy * dt;
      if (p.y <= 0) { p.y = 0; p.vy = 0; p.jumps = 0; }
      p.x = Math.max(50, Math.min(1130, p.x + p.vx * dt));
      const clip: HeroClip = p.y > 0 ? p.vy > 0 ? 'jump' : 'fall' : Math.abs(p.vx) > 180 ? 'run' : Math.abs(p.vx) > 8 ? 'walk' : 'idle';
      time = clip === previous ? time + dt : 0; previous = clip;
      const ctx = canvas.current?.getContext('2d'), im = image.current;
      if (ctx) { ctx.imageSmoothingEnabled = false; ctx.clearRect(0, 0, 128, 128); if (im?.complete && im.naturalWidth) ctx.drawImage(im, clipFrame(clip, time) * HERO_FRAME, 0, HERO_FRAME, HERO_FRAME, 0, 0, 128, 128); }
      if (now - paint > 33) { paint = now; const width = viewport.current?.clientWidth || 420; setVisual({ x: p.x, y: p.y, face: p.face, camera: Math.max(0, Math.min(1180 - width, p.x - width / 2)) }); }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('blur', reset); };
  }, []);
  const hold = (direction: 'left' | 'right') => ({
    onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => { e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); keys.current[direction] = true; },
    onPointerUp: () => { keys.current[direction] = false; },
    onPointerCancel: () => { keys.current[direction] = false; },
    onLostPointerCapture: () => { keys.current[direction] = false; },
  });
  return <div className="mc-subway-play">
    <div className="mc-subway-viewport" ref={viewport} aria-label="Plataforma subterrânea caminhável">
      <div className="mc-subway-world" style={{ transform: `translateX(${-visual.camera}px)` }}>
        <div className="mc-subway-tunnel"/><div className="mc-subway-rail"/>
        <img className="mc-subway-train" src="/city-sprites/146.png" alt="Trem da Linha Aurora"/>
        {[90, 410, 740, 1070].map(x => <div className="mc-subway-column" key={x} style={{ left: x }}><span>AURORA</span></div>)}
        <div className="mc-subway-sign" style={{ left: 440 }}>LINHA A / AURORA<br/><b>7 DESTINOS · TARIFA ZERO</b></div>
        <button className="mc-subway-stairs" style={{ left: 45 }} onClick={onExit}>↑ SUPERFÍCIE</button>
        <div className="mc-subway-terminal" style={{ left: 610 }}><span>ROTAS ↓</span><img src="/city-sprites/289.png" alt="Assistente da estação"/></div>
        <div className="mc-subway-floor"/>
        <canvas className="mc-subway-player" ref={canvas} width={128} height={128} style={{ left: visual.x, transform: `translateX(-50%) translateY(${-visual.y}px) scaleX(${visual.face})` }}/>
      </div>
      <small className="mc-subway-readout">SUBSOLO −24 M · PLATAFORMA 01</small>
    </div>
    <div className="mc-subway-controls"><button {...hold('left')} aria-label="Andar à esquerda na estação">←</button><button {...hold('right')} aria-label="Andar à direita na estação">→</button><button onClick={jump}>PULO ×2</button><span>A/D · ANDAR<br/>W · PULO / SHIFT · CORRER</span></div>
  </div>;
}