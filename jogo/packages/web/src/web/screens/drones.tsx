import { useState } from 'react';
import { useGame } from '@/game/save';
import { drones } from '../drones-data';
import { droneCost, droneOreCost, droneEffect } from '@/game/drone-system';
import { upgradeDrone, toggleDrone } from '@/game/drone-actions';
import { TopBar } from './roster';

export function DroneScreen({ onBack }: { onBack: () => void }) {
  const g = useGame();
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const owned = g.robots.filter((r) => drones[r.id] && `${drones[r.id].name} ${drones[r.id].ownerName}`.toLowerCase().includes(search.toLowerCase()));
  return <div className="mc-drone-screen">
    <TopBar title="DRONES DE VÍNCULO" gold={g.gold} onBack={onBack} />
    <div className="mk-scroll mc-drone-body">
      <header className="mc-drone-hero">
        <div><span>HANGAR DE SUPORTE · OPERAÇÃO 03</span><h2>Pequenos aliados.<br /><strong>Grande impacto.</strong></h2><p>Construa, equipe e evolua um drone para cada chassi fixo. Eles não ocupam slots e seus bônus são equilibrados para manter o PvP justo.</p></div>
        <div className="mc-drone-hero-badge"><b>{owned.length}</b><span>PROJETOS<br />DISPONÍVEIS</span></div>
      </header>
      <div className="mc-drone-metrics"><div><small>FERRO</small><strong>{g.mining.ores.ferro ?? 0}</strong><span>minério em estoque</span></div><div><small>CONSTRUÍDOS</small><strong>{Object.keys(g.drones.levels).length}</strong><span>vínculos ativos</span></div><div><small>CATÁLOGO</small><strong>291</strong><span>chassis compatíveis</span></div></div>
      <div className="mc-drone-toolbar"><label><span>BUSCAR NO HANGAR</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nome do drone ou dono" aria-label="Buscar drone" /></label><small>ORDENADO POR · CHASSI DA EQUIPE</small></div>
      <p className="mc-drone-status" role="status">{message || `${owned.length} projetos encontrados · cada drone pode chegar ao nível 10`}</p>
      {owned.length === 0 && <p className="mc-drone-empty">Nenhum chassi fixo disponível nesta busca. Recrute robôs para abrir seus projetos.</p>}
      <div className="mc-drone-grid">{owned.map((r) => {
        const d = drones[r.id]; const level = g.drones.levels[r.id] ?? 0; const active = level > 0 && g.drones.enabled[r.id] !== false; const cost = droneCost(level); const iron = droneOreCost(level);
        return <article key={r.id} className={`mc-drone-card${active ? ' is-active' : ''}`}>
          <div className="mc-drone-card-head"><span>{d.role}</span><b>{level ? `NÍVEL ${level}/10` : 'NOVO PROJETO'}</b></div>
          <div className="mc-drone-art"><img src={`/drones/${r.id}_drone.png?v=3`} alt={d.name} /><img className="mc-drone-owner" src={`/portraits/${r.id}_face.png?v=3`} alt={d.ownerName} /></div>
          <div className="mc-drone-card-copy"><small>{d.ownerName}</small><h3>{d.name}</h3><p>{droneEffect(r.id, Math.max(1, level))}</p></div>
          <div className="mc-drone-card-foot"><span className={active ? 'is-on' : ''}><i /> {level ? (active ? 'ATIVO' : 'DESATIVADO') : 'AGUARDANDO CONSTRUÇÃO'}</span><div className="mc-drone-buttons"><button disabled={level >= 10 || g.gold < cost || (g.mining.ores.ferro ?? 0) < iron} onClick={() => setMessage(upgradeDrone(r.id) ? `${d.ownerName}: drone ${level ? 'melhorado' : 'construído'}.` : 'Recursos insuficientes.')}>{level >= 10 ? 'NÍVEL MÁXIMO' : `${level ? 'EVOLUIR' : 'CONSTRUIR'} · ${cost}g${iron ? ` + ${iron} ferro` : ''}`}</button>{level > 0 && <button aria-pressed={active} onClick={() => toggleDrone(r.id)}>{active ? 'DESATIVAR' : 'ATIVAR'}</button>}</div></div>
        </article>;
      })}</div>
      <a className="mc-drone-catalog" href="/galeria"><span>ARQUIVO VISUAL</span><b>Ver os 291 projetos e baixar PNGs</b><strong>↗</strong></a>
    </div>
  </div>;
}
