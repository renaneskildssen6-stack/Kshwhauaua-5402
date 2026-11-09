import { useState } from 'react';
import { useGame } from '@/game/save';
import { purchaseSupplies } from '@/game/economy-actions';
import { ITEMS } from '@/game/config';
import { ORES } from '@/game/mining';
import { donateOre } from '@/game/city-life-actions';
import { METRO_STOPS } from '@/game/city-life';
import type { Screen } from '@/screens/menu';
import { UndergroundStation } from './underground-station';
import './city-life.css';

export function CityDestination({kind,onClose,onTravel,onEnter}:{kind:string;onClose:()=>void;onTravel:(x:number,id:string)=>void;onEnter:(s:Exclude<Screen,'menu'>)=>void}){
 const g=useGame();const [msg,setMsg]=useState('');
 const titles:Record<string,string>={metro:'METRÔ SUBTERRÂNEO',supermarket:'SUPERMERCADO ÓRBITA',npc:'PRAÇA DOS PILOTOS',construction:'CANTEIRO DE NARA',museum:'MUSEU DE MINERAIS'};
 return <section className="mc-life-panel"><header><button onClick={onClose}>← CIDADE</button><strong>{titles[kind]||'DISTRITO'}</strong><span>{g.gold}g</span></header><div className="mc-life-scroll"><div className="mc-life-hero"><small>CIDADE VIVA / NOVO DISTRITO</small><h2>{titles[kind]}</h2></div>{msg&&<p role="status">{msg}</p>}
 {kind==='metro'&&<><UndergroundStation onExit={onClose}/><p>Explore a plataforma com A/D e pulo duplo, ou pelos controles abaixo do cenário. Escolha uma das sete saídas para embarcar. Transporte gratuito; os níveis exigidos pelos sistemas continuam valendo.</p>{METRO_STOPS.map(s=><article key={s.id}><div><h3>{s.name}</h3><p>{g.cityLife.metroVisits.includes(s.id)?'Estação visitada':'Novo destino'}</p></div><button onClick={()=>onTravel(s.x,s.id)}>EMBARCAR →</button></article>)}</>}
 {kind==='supermarket'&&<><p>Itens reais para combate. Os mesmos preços da loja, mostrados antes de comprar.</p>{ITEMS.filter(item=>['repair_kit','energy_cell'].includes(item.id)).map(item=><article key={item.id}><img src={item.icon} alt=""/><div><h3>{item.name}</h3><p>Estoque do piloto: {g.items[item.id]||0} · {item.price} ouro/un.</p></div><button disabled={g.gold<item.price} onClick={()=>{const r=purchaseSupplies(item.id,1);setMsg(r.ok?`COMPRA CONFIRMADA · ${r.cost} OURO`:r.reason)}}>COMPRAR 1 · {item.price}g</button></article>)}<button onClick={()=>onEnter('shop')}>ABRIR CATÁLOGO COMPLETO</button></>}
 {kind==='npc'&&<><article><img src="/overhaul/pilot.webp" alt="Lyra"/><div><h3>COMANDANTE LYRA</h3><p>“WASD ou as setas movem pelo chão da cidade. Espaço / Z dá pulo duplo. Cruze a avenida, procure as entradas nas calçadas e use E para interagir. Os prédios ocupam espaço: contorne os quarteirões.”</p></div></article><p>O metrô está sob esta mesma cidade. Entre pela escadaria marcada M, embarque na plataforma e suba na estação de destino. Não há atalho que libere sistemas antes do nível exigido.</p><button onClick={()=>onEnter('contracts')}>CENTRAL DE CONTRATOS</button></>}
 {kind==='construction'&&<><article><img src="/city-sprites/280.png" alt="Nara"/><div><h3>ENGENHEIRA NARA</h3><p>“A biometria, o catálogo de amostras e o projetor ambiental pertencem à sua casa. Colete dados lá antes de iniciar projetos.”</p></div></article><p>Canteiro industrial conectado às construções reais: oficina, usina e laboratório de chassis. Sem cobrança por construções falsas ou passivas inexistentes.</p><button onClick={()=>onEnter('engineer')}>OFICINA</button> <button onClick={()=>onEnter('power')}>USINA</button></>}
 {kind==='museum'&&<><p>Doe 20 unidades de cada minério para uma exposição permanente. Doação única; não rende ouro nem consome lingotes.</p>{ORES.map((o,i)=><article key={o.id}><img src={`/mining-sprites/${String(i+1).padStart(3,'0')}.png`} alt=""/><div><h3>{o.name}</h3><p>{g.cityLife.museumDonations.includes(o.id)?'EM EXPOSIÇÃO':`${g.mining.ores[o.id]||0}/20 para doar`}</p></div><button disabled={g.cityLife.museumDonations.includes(o.id)||(g.mining.ores[o.id]||0)<20} onClick={()=>setMsg(donateOre(o.id)?'EXPOSIÇÃO ATUALIZADA':'Não foi possível doar')}>DOAR</button></article>)}<button onClick={()=>onEnter('museum')}>MUSEU DA CIDADE</button></>}
 </div></section>;
}