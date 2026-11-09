# Arquivo de Robôs — Design

## Botões IA + Modo História (aprovado: gerar todos de uma vez)
**Botões:** um atlas gerado por IA (aço navy rebitado, filete cyan, cantos âmbar, pixel art industrial) substitui as molduras de `/ui/btn_*.png` com os mesmos nomes e 9-slice; originais salvos em `/ui/legacy/`. Detalhe concentrado nos cantos para o 9-slice não borrar; centro liso para o texto PressStart continuar legível. Estados: normal, pressionado, desabilitado (cinza), primário âmbar, quadrado, fechar. Uma camada `.mc-ai-btn` aplica a mesma moldura aos botões crus (dock, cidade, controles touch, modais) sem mexer em layout, tamanho mínimo de toque ou foco visível (contorno cyan 2px).
**Modo História — “Crônicas da Primeira Luz”:** 6 capítulos depois do tutorial. Tela imersiva própria (`screens/story.tsx`), aberta pelo dock (HISTÓRIA) desde o nível 1.
- Mapa de capítulos: arte-chave IA por capítulo, estado bloqueado/disponível/concluído, nível recomendado, recompensa de primeira vitória.
- Cena: fundo IA em tela cheia com pan lento (Ken Burns), retratos que entram deslizando (falante aceso, ouvinte escurecido), caixa de diálogo com nome, texto datilografado, ▼ piscando, AUTO, PULAR, histórico (LOG). Efeitos por fala: tremor, flash, glitch, zoom; cartão de título do capítulo. Escolhas que mudam falas posteriores (salvas como flags).
- Batalhas: `BattleScreen` real com chefes `npc_*` e robôs inimigos; derrota oferece repetir ou voltar ao mapa sem perder o progresso de cena.
- Recompensa paga uma única vez por capítulo (guardada no save `story.cleared`); replay só paga o prêmio normal da luta. Nada de multiplicar ouro/poder.
- Teclado: Espaço/Enter avança, A auto, Esc pula; toque na caixa avança. `prefers-reduced-motion` remove pan, tremor e datilografia.
- Retratos humanos IA (Lyra, Nara) em pixel art; robôs usam os bustos existentes.

## Arte premium — cidade e metrô (aprovado: gerar todos os cenários de uma vez)
Manter o pixel art industrial original (aço navy, luz cyan, acentos âmbar). As 16 fachadas `/city/b_*.png` continuam intactas; arte nova de IA entra como camadas em volta delas:
- Fundo: placas `city-premium/skyline-central` e `skyline-industrial` com parallax, espelhadas a cada repetição para esconder a emenda, e mistura entre elas conforme o distrito. Tráfego aéreo antigo (`/city/traffic.png`) passa por cima.
- Chão: texturas IA (calçada, asfalto, plataforma, lastro) projetadas no mesmo plano oblíquo do mundo via transformação afim do canvas — não são texturas de tela. Padrões em cache, sem criação por quadro.
- Mobiliário IA (poste, banco, venda, terminal, floreira, caixas, semáforo) + props antigos (lixeira, placa, antena) apenas na faixa do meio-fio, fora de portas, travessias e escadarias; os sólidos têm colisão.
- Metrô: parede IA repetida em coordenadas de mundo na cota `SUBWAY_LEVEL`, laje em corte entre rua e estação, escadaria aberta que desce da calçada até a plataforma (mesmo trajeto da animação). Trem = trem do atlas antigo. Cobertura IA sobre cada boca de metrô.
- Luz: poças aditivas sob postes/portas/bocas, halos, garoa e poeira com reduced-motion; carros flutuantes do atlas antigo na avenida, freando diante do robô.
- Estrutura: manifesto de assets com pré-carga/progresso/fallback, culling, passo físico fixo, pausa quando a aba some, reduced-motion em cache, banner de distrito.

## Revisão espacial — cidade e metrô contínuos
Substituir faixas deslocadas artificialmente por um chão oblíquo coerente: avenida, duas calçadas, travessias, quarteirões com footprints sólidos, portas no plano da fachada e objetos ordenados por profundidade. Tamanho do robô constante; câmera acompanha X/Z, sem atalhos que teleportem entre faixas. WASD/setas move no chão; Espaço/Z dá pulo duplo. Preservar arte, sistemas e save.
Metrô no mesmo canvas e mapa: sete escadarias conectam superfície a um subsolo contínuo; animação de descida e subida com câmera acompanhando o mesmo personagem. Plataforma, trilhos, embarque por proximidade, viagem visual sob a cidade e desembarque subterrâneo antes de subir. Sem modal de metrô nem teleporte direto à superfície. Estilo pixel art cyan/âmbar; cenários desobstruídos, sinalização legível, controles touch existentes.

## Integração aprovada — Cidade Viva
Reutilizar o app gerenciado: jogo do novo repositório em `/`, galeria preservada em `/galeria`. Manter a cidade pixel art cyan/âmbar, fontes originais, tutorial, economia e chave de save. Acrescentar hangar de drones com vínculo por dono e upgrades limitados; integrar suporte offline, mineração e drone acompanhante. Produzir 300 sprites de mineração e 300 de cidade, folhas de 50, PNG com alpha. Cidade recebe decoração distribuída, movimento com respeito a reduced-motion e navegação rápida. Preservar infraestrutura gerenciada e PvP existente; nenhuma alteração remota no GitHub.

## Nova entrada — Casa-laboratório do piloto
Ao tocar JOGAR ou concluir tutorial, entrar sempre numa residência-laboratório 2D lateral ampla antes da cidade. Panorama industrial com quarto acolhedor, reator central, forja e baía de drones; piso contínuo e caminhada real com teclado e botões touch, câmera suave, iluminação pulsante, drones e estações clicáveis. Estações: forja (oficina do jogo, substitui acesso de ficha do personagem na rota principal), hangar, drones, mina, laboratório, arquivo/perfil secundário. Porta leva à cidade; porta própria da cidade retorna à casa. Não criar nova economia: abrir os sistemas reais já existentes. CSS/animações com reduced-motion.

## Expansão autorizada — casa, bairros e indústria
Casa usa física equivalente à cidade: aceleração, corrida, gravidade, pulo duplo, plataformas, controles multitoque, animações reais de movimento e ataque. Núcleo privado exclusivo da residência: biometria, amostras, projetos cronometrados e iluminação persistente. Cidade em 2,5D com eixo de profundidade contínuo, bairros frontal/traseiro, novos pontos de entrada, Lyra/Nara, supermercado e museu mineral. Metrô subterrâneo com sete destinos. Loja inspirada em balcão colecionável de arcade, sem copiar arte do Geometry Dash: mercador, catálogo em grade, abas, filtros e confirmação de preço. Mina recebe scanner ligado à casa, contratos únicos, venda seletiva, elevador entre camadas liberadas, fila de refino e produção fracionária persistente. Preservar preços básicos e progressão original; não multiplicar poder/ganhos literalmente por 100 ou 200.

Terceira coleção: Drones de Vínculo, 291 UAVs não humanoides, um por robô, 160×160. Hélices, sensores, rotores e fuselagens; herdar apenas paleta e detalhes temáticos do dono. 6 folhas 10×5, última 41. Aba nova por padrão; nomes, dono, papel e habilidade sugerida no modal. No jogo: construção, vínculo, upgrades e efeitos limitados reais; os poderes sugeridos no manifesto não são promessas de mecânicas. Preservar bustos e rostos.

Coleção adicional aprovada: 291 bustos anime pixel art, da barriga para cima, 200×250; 15 folhas 5×4, última com 11. Preservar rostos v2, alternar coleções na mesma galeria com downloads e ZIPs separados. Abrir bustos por padrão.

Galeria web escura aprovada, sem template visual, login ou banco adicional.
Paleta: fundo #090d10, painéis #11191d, bordas #273237, texto #edf5ef, secundário #94a69d, destaque lima #c2f970.
Poppins para corpo/títulos, monospace para índices. Cabeçalho editorial amplo, linhas finas, botões retos, grade densa de retratos quadrados.
Tela única: busca, filtros de raridade, retratos/folhas, modal de prévia e downloads PNG/ZIP.
Catálogo estático tipado; sem novas APIs ou tabelas. Assets locais em public.
291 personagens fixos incluindo NPCs. PNGs novos; sprites originais usados apenas como referências privadas de geração.

> Starter design brief. Replace this content with the app you're building before writing any UI.
> Keep it short and concrete — it's the single source of truth for palette, typography, pages,
> screens, and flows across web, mobile, and desktop.

One-line description of the app, the platforms it ships on, the visual direction (style, feel), and the core job it does for the user.

## Brand & Colors

One token set, consumed per platform:

- **Web & desktop**: CSS variables in `packages/web/src/web/styles.css` (desktop loads the web UI).
- **Mobile**: `Colors.light` / `Colors.dark` in `packages/mobile/constants/theme.ts`, read via `useColors()`; `userInterfaceStyle: "automatic"` follows the system light/dark setting.

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| primary | #1F1F1F | #E5E5E5 | Buttons, active tab, accents |
| background | #FFFFFF | #0A0A0A | Page/screen background |
| card | #FFFFFF | #1A1A1A | Cards, surfaces |
| foreground | #171717 | #FAFAFA | Primary text |
| mutedForeground | #737373 | #A3A3A3 | Secondary text |
| border | #E5E5E5 | #262626 | Hairlines |
| destructive | #DC2626 | #EF4444 | Delete / errors |

## Typography

Name the display + body pairing here. Web: set font families in `styles.css` (self-hosted files go in `packages/web/public/fonts/`). Mobile: system font by default; load custom fonts with `useFonts` from `expo-font` and reference them via `Fonts` in `constants/theme.ts`.

## Pages & Screens

List each page/screen, its route file, and what it shows. Example:

- **Web — Home** (`packages/web/src/web/pages/index.tsx`) — what the user sees first.
- **Mobile — Home** (`packages/mobile/app/(tabs)/index.tsx`) — main tab.
- Add web pages under `src/web/pages/` (+ route in `app.tsx`); mobile tabs under `app/(tabs)/`, stack/modal screens under `app/`.

## Key User Flows

1. Describe the primary flow end to end (open → action → result).
2. ...

## Architecture

- **API**: typed oRPC client (`lib/api.ts` in each package) → the backend in `@template/web`. Query/mutation hooks live in `queries/` (one file per feature); pages/screens call them with `@tanstack/react-query`.
- **State/sync**: TanStack Query with optimistic updates for instant-feel interactions.
- **Auth / payments / uploads**: see `skills/app/references/` when those features are needed.
