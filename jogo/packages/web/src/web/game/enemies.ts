import type { RobotDef } from "./robots";
import { buildKit } from "./skills";

// Map-only blueprints: these chassis must never enter ROBOTS or recruitment pools.
const DATA: [string, string, string, [string, string, string, string], string, number, number, number][] = [
  ["scrapking", "REI DA SUCATA", "METAL", ["DENTE DE SERRA", "TRONO DE FERRO", "FORNALHA REAL", "COURAÇA DE REFUGO"], "Soberano das peças rejeitadas. Devora blindagens para alimentar sua fornalha.", 160, 120, 80],
  ["chronoguard", "GUARDIÃO CRONAL", "QUANTICO", ["AGULHA DOS SEGUNDOS", "CORTE DO ONTEM", "HORA ZERO", "ESCUDO DO AMANHÃ"], "Sentinela dos reatores dimensionais. Prende inimigos entre dois segundos.", 120, 110, 150],
  ["siegetank", "BASTIÃO DE CERCO", "IMPACTO", ["TIRO DE ASSÉDIO", "ROMPE-MURALHAS", "BOMBARDEIO ÔMEGA", "CASCO DE GUERRA"], "Máquina de invasão autônoma, feita para esmagar o núcleo da cidade.", 180, 140, 65],
  ["voidarchon", "ARCONTE DO VAZIO", "SOMBRA", ["DECRETO VAZIO", "FOICE ABISSAL", "ECLIPSE DA EXISTÊNCIA", "MANTO SEM ESTRELAS"], "Regente não recrutável das fendas. Cada forma devora mais luz.", 145, 145, 110],
  ["scavenger", "CATADOR ÓPTICO", "TOXICO", ["GARRA DE COLETA", "DESMONTE ÁCIDO", "NINHO CORROSIVO", "CASULO DE SUCATA"], "Enxame de catadores que disputa as últimas peças da caravana.", 100, 100, 135],
  ["mirrorduelist", "DUELISTA PRISMÁTICO", "CRISTAL", ["ESTOCADA INVERSA", "LÂMINAS GÊMEAS", "REFLEXO FRAGMENTADO", "PARADOXO DE VIDRO"], "Campeão dos espelhos. Copia posturas e responde com lâminas de luz fria.", 110, 125, 145],
  ["minotaur", "MINOTAURO MUSGO", "BIO", ["CHIFRE ENRAIZADO", "MACHADO DA ALAMEDA", "LABIRINTO VIVO", "PAREDE DE MUSGO"], "Guardião do labirinto, fundido a raízes mecânicas de uma civilização perdida.", 170, 135, 85],
  ["dicelord", "LORD DOS DADOS", "ARCANO", ["ÁS DE LÂMINAS", "DADOS MARCADOS", "MÃO DO DESTINO", "BLEFE DOURADO"], "Anfitrião da arena de apostas. Não aceita dinheiro real, só a glória do percurso.", 120, 125, 125],
];

export const NPC_DEFS: RobotDef[] = DATA.map(([key, name, element, names, bio, hp, str, ag]) => {
  const id = `npc_${key}`;
  return { id, name, element, names, bio, rarity: "gold", ratios: { hp, mp: 130, str, def: 110, ag, mv: 15, xv: 18 },
    skills: buildKit({ id, element, names, effect: { type: "weakening", power: 15, turns: 2, chance: .6 }, vfxStrong: "/vfx/impact.png", vfxSpecial: "/vfx/explosion.png" }) };
});