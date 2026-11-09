# Task
- Fonte clonada, catálogo de 291 personagens fixos: 256 comuns, 27 míticos, 8 NPCs.
- Aprovação: gerar todos de uma vez; galeria escura simples sem template, PNG individual/folhas/ZIP.
- FLUX Turbo Edit falhou em identidade e grade, descartado; 6 novas folhas geradas via GPT Image Flare 2k.
- Final: extrair retratos quadrados somente das ilustrações novas, nunca dos sprites-fonte; montar folhas 10×5 e última 41.
- Implementar galeria estática React, iniciar servidor; compilação obrigatória, sem suíte de testes.
- Não prometer fidelidade perfeita: variações de IA são esperadas.
- Revisão 2 aprovada: só rostos em close, mantendo pixel art, todas as folhas de uma vez.
- 6 folhas redesenhadas via Sunburst; novos PNGs/folhas/ZIPs substituídos, manifesto versão 2 e URL de retratos com cache bust.
- Nova coleção aprovada: 291 bustos anime pixel art da barriga para cima, 20 por folha, todas de uma vez; preservar rostos.
- 15 gerações concluídas via Sunburst 2k. Folha 02 inicialmente bloqueada por créditos, concluída após Continue.
- 291 PNGs 200×250 e 15 folhas 1000×1000; última com 11, distribuição esparsa normalizada. ZIP próprio e ZIPs por lote.
- Site atualizado com alternância Bustos/Rostos, folha e downloads por coleção, bustos sem recorte CSS.
- Drones aprovados: um por robô, 291, todas as 6 folhas em pixel art anime, nomes e efeitos sugeridos sem implementação.
- Primeiro lote rejeitado por parecer miniaturas; segunda versão gerada com referências SOMENTE de paleta, fuselagens/rotores/sensores, sem anatomia humanoide.
- 291 PNGs 160×160, 6 folhas 1600×800, JSON nomes/donos/papéis/efeitos e ZIP próprio. 10 arquétipos de suporte, números conceituais, não balanceados.
- Terceira aba Drones integrada; nomes/donos nos cards, efeitos e referência do dono no modal. Rostos e bustos preservados.
- Integração local no app gerenciado: jogo em `/`, galeria em `/galeria`, arquivo de 600 sprites em `/assets`; save anterior e PvP mantidos. O usuário dispensou GitHub.
- Drones 241–291 regenerados em folhas menores e reenquadrados. 873 PNGs antigos receberam alfa por segmentação automática; 600 sprites novos em PNG RGBA e folhas sólidas/translúcidas. Revisão visual mostra possíveis imperfeições em alguns bustos/recortes gerados por IA.
- Drones com construção, vínculo, melhoria e suporte limitado no combate offline/mineração; conceitos antigos da galeria não correspondem integralmente às mecânicas atuais. ZIP conjunto 1.473 PNGs em `/downloads/todos-transparentes.zip`.
- Casa-laboratório panorâmica construída e conectada à entrada do jogo, com caminhada, câmera, estações e saída/retorno à cidade. Forja real é principal interação, respeita desbloqueio existente. Verificar preview final e build antes da entrega.

## Expansão — 25/10/2026
- Casa: aceleração, corrida, pulo duplo, plataformas, controles de exploração, troca de robô e animações de heroSheet. Núcleo privado só na casa: escanear chassis, analisar amostras, fabricar scanner/projetor por 60s e selecionar iluminação. Biometria, análise, reserva de projeto e coleta de projeto terminado verificadas em navegador.
- Cidade: segundo eixo contínuo de chão, atalhos de faixa, comércio frontal e praça traseira. S/↓ vai à frente, I vai atrás; W/↑ mantém pulo. NPCs Lyra/Nara, supermercado com preço real antes da compra e museu mineral com doação única. Construção continua sendo acesso aos sistemas reais, não simulação de construção.
- Metrô: entradas com escadaria desenhada; plataforma subterrânea caminhável, corrida, pulo duplo, controles touch, trem e sete saídas gratuitas. Movimento/pulo, embarque para Mina e visitas persistidas verificados. É uma plataforma lateral pequena, não uma rede inteira de túneis exploráveis.
- Loja arcade: mercador robótico, abas, busca, filtro de saldo, quantidades e confirmação. Compra de cinco reparos debitou 600 ouro e acrescentou cinco itens. Verificada após reload.
- Mina: golpe mantido, telemetria ligada ao scanner da casa, contratos únicos, venda seletiva de brutos, elevador gratuito entre níveis abertos, três lotes em fila depois do atual, confirmação de venda total. Hold quebrou um veio; elevador sem cobrança, reserva de dois lotes, coleta única de ambos, cancelamento de venda e preservação de lingotes na venda seletiva verificados.
- Produção fracionária persiste entre ticks; cálculo puro verificou 12 unidades em 10 minutos com ticks de 5s e preenchimento da última vaga do silo. Corrigido uso errado da capacidade no painel.
- BRIEFING/PANTEÃO/retorno à casa ocultos enquanto painéis locais estiverem abertos, sem sobreposição. Sem erros de página nos dois walkthroughs.
- Arquivos de verificação em `/home/user/robot-work`: `expansion-browser-report.json`, `collection-browser-report.json` e screenshots correspondentes. Cenário de coleta simula jobs já expirados; não executa espera real de seis minutos.
- Build final com tsc e Vite passou após proteções de estado e ajustes mobile; avisos não bloqueantes de tamanho de bundle e depreciação de Node. Preview permanece na porta gerenciada 4200. Viewport de 390px verificado, troca de robô e briefing sem sobreposição.
- Galeria e downloads preservados. Recortes alpha de IA ainda podem ter imperfeições; poderes conceituais dos drones não são todos mecânicas implementadas. GitHub dispensado.
## Cidade e metrô premium (IA + assets antigos) — 2026-10-28
Feito e verificado no navegador (480×900, 390×844 com reduced-motion, 1366×768):
- Arte IA nova em `public/city-premium/` (Sunburst: skylines central/industrial + parede do metrô; Flare: atlas de 8 props + 4 texturas). Alpha dos props extraído de fundo magenta e limpo de franja; não é perfeito em todo pixel.
- Integrado em `connected-city-renderer.ts`: skylines com parallax/espelhamento e mistura por distrito, tráfego aéreo e carros do atlas antigo, texturas no plano do mundo (transform afim), laje em corte, parede IA em coordenadas de mundo, escadaria contínua calçada→plataforma, trem do atlas antigo, luz aditiva, garoa/poeira (desligadas em reduced-motion). 16 fachadas originais intactas.
- `game/connected-city.ts`: 97 props deterministas no meio-fio com colisão (portas, bocas de metrô e travessias checadas livres), estação do Portal movida para leste do prédio, distritos com mistura.
- `game/city-traffic.ts`: 16 carros flutuantes que freiam diante do robô e mantêm distância.
- `components/city-art.ts`: manifesto, pré-carga, progresso, fallback de erro, cache de padrões/brilhos.
- `connected-city.tsx`: passo físico fixo 120 Hz, pausa com aba oculta, reduced-motion em cache, véu de carregamento, banner de distrito, dicas de controle recolhem após 9 s.
- `verify-connected-city.py` passa (andar, descer, trem até Mina, subir, sem cobrança, sem erros).
Não feito: gamepad, áudio, novos NPCs andando. Hub antigo e metrô modal antigos seguem no repositório, dormentes.
