/**
 * Modo História — “Crônicas da Primeira Luz”.
 * Dados tipados (cenas, falas, escolhas, batalhas) + transações de recompensa à prova de repetição.
 */
import { fightReward, grantXP } from "./engine";
import { ROBOT_MAP } from "./robots";
import { addGold, addPlayerXP, applyPetRewards, getState, incBattlesWon, setState, updateRobots } from "./save";

export type SpeakerId =
  | "lyra" | "nara" | "aurorion" | "narrador" | "sistema"
  | "scavenger" | "scrapking" | "siegetank" | "mirrorduelist" | "chronoguard" | "voidarchon"
  | "lyra_orbit" | "voidnavigator";

export interface Speaker { name: string; portrait?: string; side: "left" | "right"; tone: string }

export const SPEAKERS: Record<SpeakerId, Speaker> = {
  lyra: { name: "COMANDANTE LYRA", portrait: "/story/lyra.png", side: "left", tone: "#35e2f0" },
  nara: { name: "ENGENHEIRA NARA", portrait: "/story/nara.png", side: "left", tone: "#ffb21a" },
  aurorion: { name: "AURORION", portrait: "/busts/aurorion_bust.png", side: "right", tone: "#ffe08a" },
  narrador: { name: "", side: "left", tone: "#9fc3d6" },
  sistema: { name: "SISTEMA · LINHA AURORA", side: "left", tone: "#7dff8a" },
  scavenger: { name: "CATADOR ÓPTICO", portrait: "/busts/npc_mirrorduelist_bust.png", side: "right", tone: "#7dff8a" },
  scrapking: { name: "REI DA SUCATA", portrait: "/busts/npc_chronoguard_bust.png", side: "right", tone: "#ff8a3d" },
  siegetank: { name: "BASTIÃO DE CERCO", portrait: "/busts/npc_siegetank_bust.png", side: "right", tone: "#ff5b4d" },
  mirrorduelist: { name: "DUELISTA PRISMÁTICO", portrait: "/busts/npc_mirrorduelist_bust.png", side: "right", tone: "#c9a7ff" },
  chronoguard: { name: "GUARDIÃO CRONAL", portrait: "/busts/npc_chronoguard_bust.png", side: "right", tone: "#8fd8ff" },
  voidarchon: { name: "ARCONTE DO VAZIO", portrait: "/busts/npc_voidarchon_bust.png", side: "right", tone: "#b46bff" },
  lyra_orbit: { name: "LYRA · TRAJE ORBITAL", portrait: "/story/lyra-s2.webp", side: "left", tone: "#63f2ff" },
  voidnavigator: { name: "NAVEGANTE DO VAZIO", portrait: "/story/npc-s2-voidnavigator.webp", side: "right", tone: "#d28cff" },
};

export type StoryFx = "shake" | "flash" | "glitch" | "zoom" | "alarm" | "quake";

export interface StoryLine {
  kind: "line";
  who: SpeakerId;
  text: string;
  fx?: StoryFx;
  /** mostra a fala só se a flag tiver esse valor. */
  when?: [string, string];
}
export interface StoryChoice {
  kind: "choice";
  flag: string;
  prompt: string;
  options: { value: string; label: string; reply: StoryLine[] }[];
}
export interface StoryEnemy { id: string; level: number; trained: number; statScale?: number }
export interface StoryBattle {
  kind: "battle";
  id: string;
  label: string;
  arena: string;
  enemies: StoryEnemy[];
}
export interface StoryBackdrop { kind: "bg"; art: string }
export type StoryBeat = StoryLine | StoryChoice | StoryBattle | StoryBackdrop;

export interface StoryChapter {
  id: string;
  num: number;
  title: string;
  subtitle: string;
  synopsis: string;
  art: string;
  thumb: string;
  recommended: number;
  reward: { gold: number; xp: number; item: string; qty: number };
  beats: StoryBeat[];
  /** Posição no mapa panorâmico vertical da campanha. Ausente nos capítulos antigos = legado. */
  map?: { x: number; y: number; region: string };
}

const L = (who: SpeakerId, text: string, fx?: StoryFx, when?: [string, string]): StoryLine => ({ kind: "line", who, text, fx, when });
const art = (n: string) => `/story/${n}.webp`;

export const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: "ferrugem", num: 1, title: "FERRUGEM NA LINHA", subtitle: "Plataforma Aurora · 23:40",
    synopsis: "Os trens pararam. Algo está devorando os cabos do metrô.",
    art: art("ch1"), thumb: art("ch1-thumb"), recommended: 1,
    reward: { gold: 250, xp: 50, item: "repair_kit", qty: 2 }, map: { x: 24, y: 92, region: "LINHA AURORA" },
    beats: [
      L("narrador", "Três noites depois da Primeira Luz, a cidade voltou a dormir tranquila. Quase."),
      L("sistema", "ALERTA: LINHA AURORA SEM ENERGIA. SETE COMPOSIÇÕES PARADAS.", "alarm"),
      L("lyra", "Piloto, preciso de você no subsolo. As câmeras da plataforma mostram movimento… pequeno, rápido e em grupo."),
      L("aurorion", "Sinto cheiro de cobre queimado. Alguém está arrancando os cabos de força com as garras."),
      L("scavenger", "Krrr… peças. Peças boas. O REI quer todas.", "glitch"),
      L("lyra", "‘O Rei’? Ótimo. Um enxame com hierarquia. Tire esses catadores da linha antes que derrubem a ponte de energia."),
      { kind: "battle", id: "ferrugem-1", label: "PLATAFORMA AURORA · ENXAME", arena: "undercity", enemies: [{ id: "npc_mirrorduelist", level: 2, trained: 1, statScale: 0.75 }] },
      L("aurorion", "O enxame recuou pelo túnel norte. Levaram um núcleo de reator inteiro.", "shake"),
      L("nara", "Um núcleo inteiro?! Aquilo pesa duas toneladas. Ninguém carrega isso a pé — eles têm um guindaste lá fora."),
      L("lyra", "O túnel norte sai no ferro-velho do distrito industrial. Descanse, piloto. Amanhã vamos conhecer esse rei."),
    ],
  },
  {
    id: "trono", num: 2, title: "O TRONO DE SUCATA", subtitle: "Ferro-velho Industrial · Pôr do sol",
    synopsis: "Um soberano feito de refugo reivindica a cidade.",
    art: art("ch2"), thumb: art("ch2-thumb"), recommended: 3,
    reward: { gold: 500, xp: 100, item: "energy_cell", qty: 2 }, map: { x: 68, y: 82, region: "FERRO-VELHO" },
    beats: [
      L("nara", "Olha esse lugar. Cada pilha de sucata aqui já foi um robô de alguém."),
      L("scrapking", "BEM-VINDOS AO MEU REINO! Tudo que a cidade joga fora, eu coroo.", "quake"),
      L("aurorion", "Você roubou o núcleo do metrô. Milhares de pessoas dependem daquela linha."),
      L("scrapking", "Roubei? Eu RESGATEI. Alguém lá em cima me ofereceu um preço… e prometeu que o céu vai escurecer.", "glitch"),
      L("lyra", "Quem te contratou? Responda e a gente conversa."),
      L("scrapking", "Só respondo a quem derruba a coroa. GUARDA, ÀS GARRAS!", "shake"),
      { kind: "battle", id: "trono-1", label: "FERRO-VELHO · GUARDA REAL", arena: "foundry", enemies: [{ id: "npc_mirrorduelist", level: 3, trained: 2, statScale: 0.8 }, { id: "npc_chronoguard", level: 3, trained: 2, statScale: 0.75 }] },
      L("scrapking", "Hngh… a fornalha… está apagando…", "flash"),
      L("nara", "O núcleo do metrô está na caldeira dele. Se eu tirar agora, a fornalha dele morre junto."),
      {
        kind: "choice", flag: "rei", prompt: "O que fazer com o Rei da Sucata?",
        options: [
          { value: "poupou", label: "Poupar — trocar uma bateria pelo núcleo", reply: [L("nara", "Fechado. Uma célula reserva no lugar do núcleo. Ele vive, a linha volta."), L("scrapking", "…Ninguém nunca me devolveu nada. Eu não esqueço dívidas, piloto.")] },
          { value: "desmontou", label: "Desligar — recuperar o núcleo agora", reply: [L("nara", "Núcleo recuperado. A fornalha apagou, mas ele ainda pisca."), L("scrapking", "Frio… tão frio… ELE vai fazer a cidade inteira sentir isso.", "glitch")] },
        ],
      },
      L("lyra", "Ele falou do céu escurecendo. Nara, cruze isso com os registros da usina."),
      L("nara", "Já cruzei. A usina está recebendo pedidos de carga de um endereço que não existe."),
    ],
  },
  {
    id: "cerco", num: 3, title: "CERCO À USINA", subtitle: "Usina Central · Tempestade",
    synopsis: "Uma máquina de invasão marcha contra o coração elétrico da cidade.",
    art: art("ch3"), thumb: art("ch3-thumb"), recommended: 6,
    reward: { gold: 900, xp: 180, item: "shield_chip", qty: 2 }, map: { x: 28, y: 70, region: "USINA CENTRAL" },
    beats: [
      L("sistema", "MURALHA EXTERNA DA USINA ROMPIDA. INTEGRIDADE 41%.", "alarm"),
      L("lyra", "Aquilo é um Bastião de Cerco. Máquina de guerra autônoma. Ninguém fabrica isso há quarenta anos."),
      L("siegetank", "ORDEM RECEBIDA: DRENAR O NÚCLEO. OBSTÁCULOS SERÃO CONVERTIDOS EM ENTULHO.", "quake"),
      L("aurorion", "Ele não pensa. Só obedece. Então vamos quebrar a ordem junto com a blindagem."),
      L("scrapking", "Ei, latão! Meus catadores abriram uma brecha no flanco esquerdo dele. Estamos quites.", undefined, ["rei", "poupou"]),
      L("nara", "Sem ajuda dessa vez. Acerte as juntas das esteiras — é onde a couraça é mais fina.", undefined, ["rei", "desmontou"]),
      { kind: "battle", id: "cerco-1", label: "USINA CENTRAL · BASTIÃO", arena: "reactor", enemies: [{ id: "npc_mirrorduelist", level: 5, trained: 3, statScale: 0.85 }, { id: "npc_siegetank", level: 6, trained: 4, statScale: 0.85 }] },
      L("siegetank", "ORDEM… INTERROMPIDA… ORIGEM DA ORDEM: SALÃO… DOS… ESPELHOS…", "glitch"),
      L("lyra", "Salão dos Espelhos? Isso fica embaixo do museu. Interditado desde a fundação da cidade."),
      L("aurorion", "Então alguém tem a chave de um lugar que não deveria ter porta."),
    ],
  },
  {
    id: "espelhos", num: 4, title: "SALÃO DOS ESPELHOS", subtitle: "Cofre sob o Museu · Silêncio",
    synopsis: "Um duelista de vidro mostra ao piloto o que ele poderia se tornar.",
    art: art("ch4"), thumb: art("ch4-thumb"), recommended: 9,
    reward: { gold: 1500, xp: 300, item: "mega_repair", qty: 1 }, map: { x: 66, y: 58, region: "MUSEU SUBTERRÂNEO" },
    beats: [
      L("narrador", "Cada espelho devolve um Aurorion diferente. Uns coroados. Uns quebrados. Uns que nunca saíram do hangar."),
      L("mirrorduelist", "Bem-vindo, campeão. Aqui guardamos os futuros que a cidade descartou.", "flash"),
      L("mirrorduelist", "Meu mestre me mostrou o seu: você cai no dia do eclipse. A menos que lute ao lado dele."),
      {
        kind: "choice", flag: "espelho", prompt: "Como responder ao Duelista?",
        options: [
          { value: "confiar", label: "Ouvir — perguntar quem é o mestre", reply: [L("mirrorduelist", "O Arconte do Vazio. Ele não quer destruir a cidade. Quer desligá-la… para sempre ficar em paz."), L("aurorion", "Paz sem ninguém para senti-la é só escuridão.")] },
          { value: "quebrar", label: "Recusar — futuro se escolhe lutando", reply: [L("aurorion", "Eu não aceito futuro emprestado."), L("mirrorduelist", "Então vou te mostrar o reflexo de cada erro seu.", "shake")] },
        ],
      },
      { kind: "battle", id: "espelhos-1", label: "SALÃO DOS ESPELHOS · DUELO", arena: "crystal", enemies: [{ id: "npc_mirrorduelist", level: 9, trained: 6, statScale: 0.9 }] },
      L("mirrorduelist", "Os reflexos… racharam. Talvez o seu futuro não estivesse escrito.", "flash"),
      L("mirrorduelist", "Corra ao Observatório. O Guardião Cronal está segurando a hora do eclipse. Se ele soltar, o portal abre.", undefined, ["espelho", "confiar"]),
      L("lyra", "Os sensores do Observatório pararam às 03:00:00. Faz uma hora que eles marcam o mesmo segundo.", undefined, ["espelho", "quebrar"]),
      L("nara", "Tempo parado. Claro. Por que seria um problema simples?"),
    ],
  },
  {
    id: "segundos", num: 5, title: "ENTRE DOIS SEGUNDOS", subtitle: "Observatório · 03:00:00",
    synopsis: "No alto da cidade, o tempo parou — e alguém guarda a ampulheta.",
    art: art("ch5"), thumb: art("ch5-thumb"), recommended: 12,
    reward: { gold: 2400, xp: 480, item: "energy_cell", qty: 3 }, map: { x: 32, y: 46, region: "OBSERVATÓRIO" },
    beats: [
      L("narrador", "A chuva não cai. O raio não termina. Só os passos de Aurorion fazem barulho."),
      L("chronoguard", "Tique. Você chegou entre um segundo e o próximo. Ninguém deveria caminhar aqui.", "zoom"),
      L("aurorion", "Você está prendendo a cidade nesse instante. Por quê?"),
      L("chronoguard", "Enquanto este segundo durar, o eclipse não chega. Eu protejo vocês do Arconte… do único jeito que sei.", "glitch"),
      L("lyra", "Ninguém vive dentro de um segundo, Guardião. Solte o tempo e nos deixe lutar."),
      L("chronoguard", "Prove que consegue vencer o amanhã. Vença primeiro o agora.", "shake"),
      { kind: "battle", id: "segundos-1", label: "OBSERVATÓRIO · HORA ZERO", arena: "archive", enemies: [{ id: "npc_chronoguard", level: 12, trained: 8, statScale: 0.9 }] },
      L("narrador", "A chuva desaba de uma vez. O trovão completa o rugido que começou uma hora atrás.", "flash"),
      L("chronoguard", "O tempo é seu de novo. Use bem. Ele já está aqui.", "quake"),
      L("sistema", "ANOMALIA SOBRE A PRAÇA DO PORTAL. LUMINOSIDADE DA CIDADE CAINDO.", "alarm"),
    ],
  },
  {
    id: "eclipse", num: 6, title: "ECLIPSE DA PRIMEIRA LUZ", subtitle: "Praça do Portal · O fim da noite",
    synopsis: "O Arconte do Vazio abre o céu. A última luz é a sua.",
    art: art("ch6"), thumb: art("ch6-thumb"), recommended: 15,
    reward: { gold: 3600, xp: 750, item: "revive_core", qty: 2 }, map: { x: 60, y: 36, region: "PRAÇA DO PORTAL" },
    beats: [
      L("narrador", "O sol negro se abre sobre a praça. As janelas da cidade apagam uma a uma.", "quake"),
      L("voidarchon", "Pequena luz. Vim apagar o cansaço deste mundo. Ninguém mais precisará lutar.", "glitch"),
      L("aurorion", "Lutar é o que nos faz levantar de novo. Você não vai tirar isso de ninguém."),
      L("scrapking", "E O REI TAMBÉM VEIO! Meus catadores religaram os postes da praça!", "shake", ["rei", "poupou"]),
      L("mirrorduelist", "Eu vi todos os futuros. Em nenhum deles você recua. Lute — eu desvio os reflexos dele.", undefined, ["espelho", "confiar"]),
      L("lyra", "Todos os canais da cidade estão com você, piloto. Primeira Luz: LANÇAR!"),
      { kind: "battle", id: "eclipse-1", label: "PORTAL · ARAUTOS DO VAZIO", arena: "rift", enemies: [{ id: "npc_chronoguard", level: 14, trained: 9, statScale: 0.85 }, { id: "npc_voidarchon", level: 14, trained: 9, statScale: 0.85 }] },
      L("voidarchon", "Interessante. Então vou mostrar a escuridão inteira.", "quake"),
      L("nara", "A energia dele dobrou! Aurorion, o seu reator aguenta mais um minuto. UM.", "alarm"),
      { kind: "battle", id: "eclipse-2", label: "ECLIPSE · ARCONTE DESPERTO", arena: "genesis", enemies: [{ id: "npc_voidarchon", level: 16, trained: 11, statScale: 0.95 }] },
      L("narrador", "Uma linha dourada corta o sol negro. Depois outra. Depois a manhã inteira.", "flash"),
      L("voidarchon", "Então… a luz… também cansa de perder.", "glitch"),
      L("lyra", "A cidade está acordando. Bom trabalho, piloto. De verdade."),
      L("aurorion", "Não foi só meu reator. Foi cada pessoa que acendeu uma luz esta noite."),
      L("sistema", "CRÔNICAS DA PRIMEIRA LUZ — CONCLUÍDAS. NOVAS AMEAÇAS SERÃO REGISTRADAS."),
    ],
  },
  {
    id: "orbital", num: 7, title: "A CIDADE ACIMA DO CÉU", subtitle: "Porto Aurora · Órbita baixa",
    synopsis: "O sinal que guiou o Arconte veio de uma estação esquecida acima das nuvens.",
    art: art("ch7"), thumb: art("ch7-thumb"), recommended: 18,
    reward: { gold: 4800, xp: 950, item: "mega_repair", qty: 2 }, map: { x: 76, y: 25, region: "PORTO AURORA" },
    beats: [
      L("lyra_orbit", "Vista o traje orbital, piloto. A estação está sem gravidade e sem leis há quinze anos."),
      L("nara", "O pedido de carga que não existia… vinha daqui. Alguém continuou alimentando a estação depois do eclipse."),
      L("voidnavigator", "Vocês chegaram tarde. A cidade abaixo é apenas o primeiro mapa que o Vazio vai apagar.", "glitch"),
      L("lyra_orbit", "Navegante, entregue o núcleo cartográfico e ninguém precisa cair hoje."),
      { kind: "choice", flag: "orbital", prompt: "Como atravessar a estação em colapso?", options: [
        { value: "resgate", label: "Resgatar os trabalhadores presos", reply: [L("lyra_orbit", "Primeiro vidas. O mapa pode esperar."), L("voidnavigator", "Ainda escolhem pessoas. Interessante.")] },
        { value: "atalho", label: "Cortar caminho pelo reator", reply: [L("nara", "Se o reator romper, perdemos a estação inteira."), L("voidnavigator", "Um piloto que escolhe velocidade. Eu conheço esse tipo de coragem.")] },
      ] },
      { kind: "battle", id: "orbital-1", label: "PORTO AURORA · DRONES SEM GRAVIDADE", arena: "orbit", enemies: [{ id: "npc_siegetank", level: 18, trained: 12, statScale: 0.9 }, { id: "npc_mirrorduelist", level: 18, trained: 11, statScale: 0.88 }] },
      L("voidnavigator", "O núcleo não guarda coordenadas. Guarda destinos. E o próximo está no Jardim do Anel.", "zoom"),
      L("lyra_orbit", "Então subimos mais uma vez. Primeira Luz, em formação."),
    ],
  },
  {
    id: "anel", num: 8, title: "O JARDIM DO ANEL", subtitle: "Estação Helix · Noite artificial",
    synopsis: "Uma floresta orbital conserva mapas de mundos que ainda não nasceram.",
    art: art("ch8"), thumb: art("ch8-thumb"), recommended: 21,
    reward: { gold: 6200, xp: 1250, item: "revive_core", qty: 2 }, map: { x: 38, y: 14, region: "JARDIM HELIX" },
    beats: [
      L("narrador", "O jardim gira sem vento. Cada folha mostra um lugar diferente quando a luz passa por ela."),
      L("voidnavigator", "Este anel desenhou a primeira cidade. Também desenhou o fim dela."),
      L("aurorion", "Você fala como se tivesse visto tudo."),
      L("voidnavigator", "Eu naveguei entre os segundos que vocês chamam de futuro. Em alguns, vocês vencem."),
      { kind: "choice", flag: "anel", prompt: "Qual mapa levar para a cidade?", options: [
        { value: "origem", label: "O mapa da origem — entender a Primeira Luz", reply: [L("nara", "Se descobrirmos quem ligou o primeiro reator, talvez desliguemos o Vazio sem destruí-lo.")] },
        { value: "futuro", label: "O mapa do futuro — encontrar a próxima ameaça", reply: [L("lyra_orbit", "Informação primeiro. A cidade precisa sobreviver à próxima onda.")] },
      ] },
      { kind: "battle", id: "anel-1", label: "JARDIM HELIX · RAÍZES DE CRISTAL", arena: "jungle", enemies: [{ id: "npc_chronoguard", level: 21, trained: 14, statScale: 0.92 }, { id: "npc_voidarchon", level: 21, trained: 13, statScale: 0.9 }] },
      L("narrador", "A raiz central abre uma janela para a lua quebrada. O mapa aponta para o outro lado da órbita.", "flash"),
      L("voidnavigator", "O último ponto não é um lugar. É uma decisão."),
    ],
  },
  {
    id: "fronteira", num: 9, title: "A ÚLTIMA COORDENADA", subtitle: "Lua partida · Depois do eclipse",
    synopsis: "No limite do mapa, o piloto encontra o lugar onde a luz foi inventada.",
    art: art("ch9"), thumb: art("ch9-thumb"), recommended: 25,
    reward: { gold: 9000, xp: 1900, item: "energy_cell", qty: 5 }, map: { x: 78, y: 4, region: "LUA PARTIDA" },
    beats: [
      L("sistema", "COORDENADA FORA DO CATÁLOGO. ORIGEM: ANTES DA PRIMEIRA LUZ.", "alarm"),
      L("lyra_orbit", "A cidade inteira está olhando para nós. Não importa o que exista do outro lado: voltamos juntos."),
      L("voidnavigator", "Eu fui criado para mapear o silêncio. Vocês me deram uma rota de volta.", "glitch"),
      L("aurorion", "Então escolha: ser o caminho ou ser o fim dele."),
      { kind: "battle", id: "fronteira-1", label: "LUA PARTIDA · O MAPA VIVO", arena: "rift", enemies: [{ id: "npc_voidarchon", level: 25, trained: 16, statScale: 0.95 }, { id: "npc_chronoguard", level: 25, trained: 15, statScale: 0.92 }] },
      L("voidnavigator", "O mapa está aberto. Não para o Vazio — para todos os lugares que ainda podemos construir.", "flash"),
      L("lyra_orbit", "Crônicas da Primeira Luz: segunda rota concluída. A próxima história começa onde a nossa termina."),
      L("sistema", "NOVA ROTA REGISTRADA. O HORIZONTE NÃO É MAIS UM LIMITE."),
    ],
  },
  {
    id: "arquivo", num: 10, title: "O ARQUIVO QUE RESPIRA", subtitle: "Subsolo Aurora · Memória profunda",
    synopsis: "A origem da Primeira Luz está viva sob a cidade — e não quer ser encontrada.",
    art: art("ch10"), thumb: art("ch10-thumb"), recommended: 28,
    reward: { gold: 11000, xp: 2400, item: "mega_repair", qty: 3 }, map: { x: 26, y: 6, region: "ARQUIVO AURORA" },
    beats: [
      L("narrador", "As portas abaixo da cidade não guardam armas. Guardam versões dela que nunca chegaram a existir."),
      L("voidnavigator", "Cada registro é uma rota descartada. O arquivo aprendeu a sonhar com elas.", "glitch"),
      L("lyra_orbit", "Se a memória tem medo, é porque alguém tentou apagá-la. Vamos ouvir antes de atirar."),
      { kind: "choice", flag: "arquivo", prompt: "O que salvar do Arquivo Aurora?", options: [
        { value: "pessoas", label: "Resgatar as consciências presas", reply: [L("aurorion", "Uma cidade é feita de quem lembra dela. Não deixamos ninguém para trás.")] },
        { value: "mapas", label: "Copiar os mapas de todas as rotas", reply: [L("voidnavigator", "Mil futuros em um só núcleo. Perigoso. Exatamente o que precisamos.")] },
      ] },
      { kind: "battle", id: "arquivo-1", label: "ARQUIVO AURORA · GUARDAS DE MEMÓRIA", arena: "archive", enemies: [{ id: "npc_mirrorduelist", level: 28, trained: 18, statScale: 0.94 }, { id: "npc_chronoguard", level: 28, trained: 18, statScale: 0.92 }] },
      L("nara", "Achei o primeiro registro. A Primeira Luz não foi construída para iluminar a cidade — foi construída para acordá-la."),
      L("sistema", "MEMÓRIA RESTAURADA: O NÚCLEO ESCOLHE QUEM PODE CONTINUAR."),
      L("lyra_orbit", "Então levamos a escolha conosco. O deserto de vidro está chamando."),
    ],
  },
  {
    id: "vidro", num: 11, title: "O DESERTO DE VIDRO", subtitle: "Fronteira oeste · Duas luas",
    synopsis: "Uma tempestade de areia cristalina esconde a máquina que escreveu o primeiro mapa.",
    art: art("ch11"), thumb: art("ch11-thumb"), recommended: 32,
    reward: { gold: 14000, xp: 3100, item: "revive_core", qty: 3 }, map: { x: 72, y: 3, region: "DESERTO DE VIDRO" },
    beats: [
      L("narrador", "O deserto reflete duas luas. Em cada fragmento, o piloto vê uma estrada diferente."),
      L("voidnavigator", "A tempestade não é clima. É o sistema de defesa de uma máquina que nunca recebeu um nome."),
      L("lyra_orbit", "Toda máquina pode receber uma ordem nova. A nossa é atravessar."),
      L("aurorion", "E se a ordem original ainda estiver funcionando?"),
      { kind: "battle", id: "vidro-1", label: "DESERTO · COLOSSOS DE CRISTAL", arena: "foundry", enemies: [{ id: "npc_siegetank", level: 32, trained: 20, statScale: 0.96 }, { id: "npc_voidarchon", level: 32, trained: 20, statScale: 0.94 }] },
      L("voidnavigator", "A máquina viu nossa luta. Agora ela conhece nossos nomes."),
      L("nara", "E abriu uma ponte direto para o núcleo. Isso é convite ou armadilha?"),
      L("lyra_orbit", "As duas coisas. Vamos escolher o que fazer com ela."),
    ],
  },
  {
    id: "primeira", num: 12, title: "A PRIMEIRA LUZ", subtitle: "Núcleo fundador · Além do horizonte",
    synopsis: "A última porta revela quem acordou a cidade — e por que ela escolheu você.",
    art: art("ch12"), thumb: art("ch12-thumb"), recommended: 36,
    reward: { gold: 20000, xp: 5000, item: "energy_cell", qty: 8 }, map: { x: 48, y: 1, region: "NÚCLEO FUNDADOR" },
    beats: [
      L("sistema", "ACESSO CONCEDIDO. PILOTO RECONHECIDO COMO VARIÁVEL DE FUTURO.", "alarm"),
      L("narrador", "No centro do anel, um planeta pequeno gira dentro de uma máquina maior que a noite."),
      L("voidnavigator", "Eu fui enviado para apagar este núcleo. Mas cada rota que percorri terminou em vocês."),
      L("lyra_orbit", "Não somos um destino. Somos uma escolha que se repete toda vez que alguém acende uma luz."),
      { kind: "choice", flag: "primeira", prompt: "Qual ordem dar ao Núcleo Fundador?", options: [
        { value: "acordar", label: "Acordar todas as cidades possíveis", reply: [L("aurorion", "Que o universo saiba que ainda estamos aqui."), L("voidnavigator", "Milhões de rotas. Pela primeira vez, nenhuma precisa terminar em silêncio.")] },
        { value: "guardar", label: "Guardar a luz para a próxima geração", reply: [L("lyra_orbit", "Não precisamos controlar o futuro. Só não vamos entregá-lo ao medo."), L("nara", "Vou construir uma chave que qualquer criança possa usar.")] },
      ] },
      { kind: "battle", id: "primeira-1", label: "NÚCLEO FUNDADOR · A ÚLTIMA SENTINELA", arena: "genesis", enemies: [{ id: "npc_voidarchon", level: 36, trained: 24, statScale: 0.98 }, { id: "npc_chronoguard", level: 36, trained: 23, statScale: 0.96 }] },
      L("voidnavigator", "A primeira luz não era um lugar. Era a coragem de continuar procurando."),
      L("lyra_orbit", "Piloto, a rota está aberta. Desta vez, nós escolhemos para onde ela vai."),
      L("sistema", "CRÔNICAS DA PRIMEIRA LUZ — TRILOGIA CONCLUÍDA. NOVOS HORIZONTES DISPONÍVEIS."),
    ],
  },
  {
    id: "retorno", num: 13, title: "A CIDADE DEPOIS", subtitle: "Aurora · Primeiro amanhecer",
    synopsis: "Voltar para casa é mais difícil quando a cidade inteira mudou enquanto você estava fora.",
    art: art("ch10"), thumb: art("ch10-thumb"), recommended: 38, reward: { gold: 22000, xp: 5600, item: "mega_repair", qty: 3 }, map: { x: 20, y: 55, region: "AURORA RENOVADA" },
    beats: [L("narrador", "A cidade acende três sóis artificiais. Pessoas que nunca se conheceram apontam para o mesmo céu."), L("lyra_orbit", "A luz resolveu uma coisa: agora todo mundo sabe que existe um lado de fora."), { kind: "battle", id: "retorno-1", label: "AURORA · OS PRIMEIROS REBELDES", arena: "aurora", enemies: [{ id: "npc_mirrorduelist", level: 38, trained: 25, statScale: 0.98 }, { id: "npc_chronoguard", level: 38, trained: 25, statScale: 0.95 }] }, L("aurorion", "Não vencemos o medo destruindo-o. Vencemos ensinando-o a caminhar."), L("sistema", "CIDADE ESTÁVEL. NOVA AMEAÇA: HORIZONTE EXTERNO.")],
  },
  {
    id: "embaixada", num: 14, title: "EMBAIXADA DO VAZIO", subtitle: "Distrito zero · Sem fronteiras",
    synopsis: "Visitantes de uma rota impossível chegam pedindo abrigo — e trazendo uma guerra atrás deles.",
    art: art("ch11"), thumb: art("ch11-thumb"), recommended: 41, reward: { gold: 25000, xp: 6200, item: "revive_core", qty: 4 }, map: { x: 75, y: 48, region: "DISTRITO ZERO" },
    beats: [L("voidnavigator", "Eles chamam o silêncio de lar. Não vieram conquistar. Vieram fugir."), L("nara", "Se abrirmos os portões, a cidade muda para sempre."), { kind: "choice", flag: "embaixada", prompt: "Como receber os visitantes?", options: [{ value: "abrigo", label: "Abrir os portões", reply: [L("lyra_orbit", "Uma cidade viva não mede valor pela origem.")] }, { value: "prova", label: "Exigir uma prova de paz", reply: [L("aurorion", "Confiança também pode ser construída peça por peça.")] }] }, { kind: "battle", id: "embaixada-1", label: "PORTÕES · A GUERRA QUE SEGUIU", arena: "rift", enemies: [{ id: "npc_mirrorduelist", level: 41, trained: 27, statScale: 0.98 }, { id: "npc_siegetank", level: 41, trained: 27, statScale: 0.98 }] }, L("voidnavigator", "Pela primeira vez, o Vazio tem endereço. E uma porta aberta.")],
  },
  {
    id: "tempestade", num: 15, title: "A TEMPESTADE DE NOMES", subtitle: "Órbita Helix · Todas as rotas",
    synopsis: "Uma tempestade apaga identidades; até os robôs esquecem por que lutam.",
    art: art("ch12"), thumb: art("ch12-thumb"), recommended: 44, reward: { gold: 28000, xp: 7000, item: "energy_cell", qty: 10 }, map: { x: 35, y: 42, region: "ÓRBITA HELIX" },
    beats: [L("sistema", "ALERTA: NOMES DE CHASSIS AUSENTES. MEMÓRIA DE COMBATE INSTÁVEL.", "glitch"), L("aurorion", "Eu não preciso lembrar cada batalha. Só preciso lembrar quem estava ao meu lado."), { kind: "battle", id: "tempestade-1", label: "HELIX · SOMBRAS SEM NOME", arena: "orbit", enemies: [{ id: "npc_chronoguard", level: 44, trained: 29, statScale: 1 }, { id: "npc_voidarchon", level: 44, trained: 29, statScale: 0.98 }] }, L("lyra_orbit", "O arquivo voltou. Desta vez, ele escreveu nossos nomes por vontade própria."), L("narrador", "Quando a tempestade passou, cada piloto chamou seu robô pelo nome certo.")],
  },
  {
    id: "farol", num: 16, title: "O FAROL IMPOSSÍVEL", subtitle: "Borda do mapa · Sinal fraco",
    synopsis: "Uma luz distante pede socorro usando a assinatura da Primeira Luz.",
    art: art("ch10"), thumb: art("ch10-thumb"), recommended: 47, reward: { gold: 32000, xp: 7800, item: "mega_repair", qty: 4 }, map: { x: 68, y: 35, region: "BORDA DO MAPA" },
    beats: [L("nara", "O sinal veio de além da última coordenada. Não devia existir nada lá."), L("voidnavigator", "Toda rota começa como uma impossibilidade."), { kind: "battle", id: "farol-1", label: "BORDA · SENTINELA DO FAROL", arena: "skyfall", enemies: [{ id: "npc_siegetank", level: 47, trained: 31, statScale: 1 }, { id: "npc_voidarchon", level: 47, trained: 31, statScale: 1 }] }, L("lyra_orbit", "A luz não está chamando a gente para lutar. Está chamando para testemunhar."), L("sistema", "FAROL ALINHADO. DESTINO: CASA.", "flash")],
  },
  {
    id: "herdeiros", num: 17, title: "OS HERDEIROS", subtitle: "Cidade Aurora · Sete gerações depois",
    synopsis: "A próxima geração assume os mechas e descobre que legado também pode ser uma escolha.",
    art: art("ch11"), thumb: art("ch11-thumb"), recommended: 50, reward: { gold: 36000, xp: 8800, item: "revive_core", qty: 5 }, map: { x: 28, y: 28, region: "NOVA AURORA" },
    beats: [L("narrador", "Sete gerações passaram em uma única noite para o Núcleo. A cidade aprendeu a olhar para cima."), L("lyra_orbit", "Não entreguem nosso caminho pronto. Construam outro."), { kind: "choice", flag: "herdeiros", prompt: "O que ensinar aos novos pilotos?", options: [{ value: "coragem", label: "Ensinar a coragem de falhar", reply: [L("aurorion", "É assim que todo primeiro salto começa.")] }, { value: "cuidado", label: "Ensinar a responsabilidade da força", reply: [L("nara", "Um reator forte precisa de mãos cuidadosas.")] }] }, { kind: "battle", id: "herdeiros-1", label: "NOVA AURORA · PROVA DE PASSAGEM", arena: "genesis", enemies: [{ id: "npc_mirrorduelist", level: 50, trained: 34, statScale: 1 }, { id: "npc_chronoguard", level: 50, trained: 34, statScale: 1 }] }, L("sistema", "HERDEIROS APROVADOS. A LUZ CONTINUA.")],
  },
  {
    id: "horizonte", num: 18, title: "HORIZONTE ABERTO", subtitle: "Todas as cidades · Um mesmo céu",
    synopsis: "A trilogia termina, mas a história se recusa a fechar a porta.",
    art: art("ch12"), thumb: art("ch12-thumb"), recommended: 54, reward: { gold: 50000, xp: 12000, item: "energy_cell", qty: 15 }, map: { x: 50, y: 20, region: "HORIZONTE ABERTO" },
    beats: [L("voidnavigator", "Eu mapeei o silêncio inteiro. Agora quero mapear o que vocês fazem com a liberdade."), L("lyra_orbit", "Então não termine a rota. Deixe uma coordenada em branco."), { kind: "battle", id: "horizonte-1", label: "HORIZONTE · ÚLTIMA SENTINELA", arena: "genesis", enemies: [{ id: "npc_voidarchon", level: 54, trained: 38, statScale: 1 }, { id: "npc_chronoguard", level: 54, trained: 38, statScale: 1 }] }, L("aurorion", "A primeira luz nos acordou. As próximas serão nossas."), L("sistema", "CRÔNICAS DA PRIMEIRA LUZ — HORIZONTE ABERTO. AVENTURAS FUTURAS REGISTRADAS.", "flash")],
  },
];

export const STORY_MAP = Object.fromEntries(STORY_CHAPTERS.map((c) => [c.id, c])) as Record<string, StoryChapter>;

export function chapterUnlocked(cleared: string[], index: number): boolean {
  return index === 0 || cleared.includes(STORY_CHAPTERS[index - 1].id);
}

export function storyEnemies(b: StoryBattle) {
  return b.enemies.map((e) => ({ id: e.id, level: e.level, xp: 0, trained: { str: e.trained, def: e.trained, agl: e.trained }, statScale: e.statScale }));
}

/** Recompensa normal de uma luta da história (como qualquer batalha). Paga ouro/XP à equipe. */
export function payStoryFight(b: StoryBattle, won: boolean): { gold: number; xp: number; levelUps: { name: string; level: number }[] } {
  const raw = b.enemies.reduce((acc, e) => {
    const r = fightReward(ROBOT_MAP[e.id].ratios, e.level);
    return { gold: acc.gold + r.gold, xp: acc.xp + r.xp };
  }, { gold: 0, xp: 0 });
  const earned = applyPetRewards(won ? raw : { gold: Math.round(raw.gold / 4), xp: Math.round(raw.xp / 4) });
  const levelUps = distribute(earned.gold, earned.xp);
  if (won) incBattlesWon();
  return { ...earned, levelUps };
}

function distribute(gold: number, xp: number) {
  const g = getState();
  addGold(gold);
  addPlayerXP(xp);
  const levelUps: { name: string; level: number }[] = [];
  const team = new Set(g.team);
  updateRobots(g.robots.map((r) => {
    if (!team.has(r.id)) return r;
    const res = grantXP(r, xp);
    if (res.levelsGained > 0) levelUps.push({ name: ROBOT_MAP[r.id]?.name ?? r.id, level: res.save.level });
    return res.save;
  }));
  return levelUps;
}

export function setStoryFlag(flag: string, value: string) {
  setState((s) => ({ ...s, story: { ...s.story, flags: { ...s.story.flags, [flag]: value } } }));
}
export function markStoryOpened(id: string) {
  setState((s) => (s.story.last === id ? s : { ...s, story: { ...s.story, last: id } }));
}

/**
 * Conclui um capítulo. A recompensa de estreia é paga uma única vez: a checagem e a marcação
 * acontecem na mesma transação de estado, então replays, cliques duplos e recargas não duplicam.
 */
export function completeStoryChapter(id: string): { first: boolean; gold: number; xp: number; item?: string; qty?: number } {
  const ch = STORY_MAP[id];
  if (!ch) return { first: false, gold: 0, xp: 0 };
  let first = false;
  setState((s) => {
    if (s.story.cleared.includes(id)) return s;
    first = true;
    return {
      ...s,
      gold: s.gold + ch.reward.gold,
      items: { ...s.items, [ch.reward.item]: (s.items[ch.reward.item] ?? 0) + ch.reward.qty },
      story: { ...s.story, cleared: [...s.story.cleared, id] },
    };
  });
  if (!first) return { first: false, gold: 0, xp: 0 };
  addPlayerXP(ch.reward.xp);
  return { first: true, gold: ch.reward.gold, xp: ch.reward.xp, item: ch.reward.item, qty: ch.reward.qty };
}
