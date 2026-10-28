# Quadro Kanban

> Máquina nova (2026-10-27, plugin Forge 0.30.3, projeto ainda em 0.28.0): repositório em /home/rodrigoisensee/MetricasDSPD, branch do Jarvis docs/jarvis-2026-10-23. Sem Node, Docker, `.env` e dependências: K-140 (versão, dono roda `forge-upgrade`) e K-141 (ambiente, dono) bloqueiam a fila do 041. Pedido 042.
> Atualizado em: 2026-10-27 12:55 (estado da retomada no Histórico do pedido 042) · Mantido pelo Jarvis; políticas do `agile-coach` (skill `kanban-scrum` do Forge).
> WIP: plugin Forge 0.30.3; WSL com 7 GB visíveis nesta máquina: uma suíte de teste por vez e poucos agentes em paralelo (dono, 2026-10-23) · Bloqueados: 2 (K-140, K-141)
> Retomada de 2026-10-17: pedidos 011 (seção "Retomada"), 012 (K-102), 013 (limpeza e docs), 014 (#101), 015 (montecarlo) e 016 (homolog-aprovada). Até 2026-10-16 o quadro ficou desatualizado; o registro daquele período está em `docs/kanban/estado-2026-10-14-noite.md` e no histórico.

# Upstream — descoberta (Design Thinking)

## Entrada (backlog: cartões com dependência aberta)
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|
| K-154 | [ux] Textos da especificação do lote 3: mínimo de 20 do O26 vale sobre as entregas do tipo, não a faixa (A12 do review = A7 do QA); tabela de decisões da §11 (A13); vazio junto de "Amostra insuficiente: 0 de 20" em mock=vazio (A6 do QA, padrão anterior ao lote 3) | 026 | forge:ux-designer | 2026-10-27 | 2026-10-27 21:03 | Recomendados do review c72b955 e do QA 6199302; entra depois do PR do lote 3 |
| K-150 | [teste] "reprova: SELECT *" em server/tests/plataforma2.test.ts:269 estoura o timeout de 30 s quando outra suíte pesada roda junto e quebra o pronto | 026 | forge:node-backend | 2026-10-27 | 2026-10-27 17:31 | Melhoria vista do react-frontend na volta do 026 (Test timed out in 30000ms); mesma família do K-123; entra depois do 041 |
| K-147 | [forge] Melhorias de fábrica: Desde por branch quando o pedido tem duas branches; brief gerar propõe PQ cmd a agente sem Bash; --desde cai na base inteira com merge da develop; hook barra caminho em texto de Bash; volta exige Fora do escopo idêntico mesmo com etapa nova (ESCOPO+) | 041 | forge:tech-lead | 2026-10-27 | 2026-10-27 14:12 | Vai para o Forge (contribuir-com-o-forge), PR na develop do Forge; aberto na auditoria de itens perdidos. Mais (042, 14:36): o forge-check brief não avisa que review e seguranca pedem a branch no remoto quando o brief proíbe push; o conferente lê item "não nesta delegação" do Entregar como pendente; devops-engineer recebeu brief de aplicar proteção de branch (R-CONFORMIDADE) sem aviso do forge-check; vigia marca "contorno" em GET de leitura da proteção depois de bloqueio (conferente e devops, 2026-10-27 14:40-14:42; registro de violações do vigia): possível alarme falso |
| K-146 | [deps] eslint 10 com @eslint/js 10 e TypeScript 6/7 como cartões próprios | 033 | forge:tech-lead | 2026-10-27 | 2026-10-27 14:12 | Decisões do dono de 2026-10-17 (033) e 2026-10-21 (035); aberto na auditoria de itens perdidos |
| K-145 | [deps] react-router 7 → 8 como cartão próprio (PR #147 do Dependabot) | 033 | forge:react-frontend | 2026-10-27 | 2026-10-27 14:12 | Decisão do dono de 2026-10-17 (033, opção B); aberto na auditoria de itens perdidos |
| K-144 | [ci] E2E completo no portão (K-131) e religar a rodada noturna da homolog (EXIGIR_NOTURNA) | 041 | forge:devops-engineer | 2026-10-27 | 2026-10-27 14:12 | Decisão do dono de 2026-10-23: depois do 041 entregue; aberto na auditoria de itens perdidos |
| K-143 | [infra] 1º db:migrate depois do db:up falha por socket: o healthcheck do postgres olha metricas_test antes do banco principal | 042 | forge:devops-engineer | 2026-10-27 | 2026-10-27 14:12 | MELHORIA da E2.3 do 042; aberto na auditoria de itens perdidos |
| K-142 | [docs] README manda instalar o Chromium na raiz; o Playwright só existe em e2e/ (comando certo: pnpm --filter ./e2e exec playwright install chromium) | 042 | forge:tech-lead | 2026-10-27 | 2026-10-27 14:12 | MELHORIA da E2.2 do 042; aberto na auditoria de itens perdidos |
| K-112 | Cadastro de membros por time (Q-T14-10 = B): ADR 0020 e plano §9.5 | 011 | forge:software-architect | 2026-10-17 | 2026-10-17 10:00 | Com o security-engineer. Antes da fase 3 |
| K-126 | [037 review A1/A2] Worker do mock: pedido pendente para sempre se o postMessage lançar; guarda para pedido antes do iniciar | 037 | forge:react-frontend | 2026-10-21 | 2026-10-21 | Recomendado (não bloqueante) no review 037 |
| K-127 | [037 review A3/A4] F9 soma os chunks do Worker e do fallback (nunca baixados juntos); ADR 0021 ainda "proposta" | 037 | forge:software-architect | 2026-10-21 | 2026-10-21 | Recomendado no review 037; A3 com o devops/tech-lead no size.mjs |
| K-128 | [025 review A1] COM_TAMBEM da MockFonteMetricas sem T11, T13 e T14 (no mock, T13/T14 sem vínculo e sem time); depois do 037 (arquivo agora em nucleoMock.ts) | 025 | forge:react-frontend | 2026-10-21 | 2026-10-21 | Limite do mock, não fere a ficha (review 025) |
| K-129 | [025 review A2] T11: meses de pico da frase da ficha não vêm no DTO (back põe no DTO ou UX ajusta a ficha) | 025 | forge:node-backend | 2026-10-21 | 2026-10-21 | Recomendado no review 025 |
| K-130 | [025 segurança] API da T14 envia total, semTime, meuTime.n e agregado do projeto oculto (n − k pela aba de rede): M-1/M-1a antes de dado real | 025 | forge:node-backend | 2026-10-21 | 2026-10-21 | Condição antes da fase 3; parecer docs/security/025-t14-reidentificacao.md |
| K-137 | [docs] Checklist de "computador novo" no README do projeto: Docker, `.env`, `pnpm install`, `playwright install-deps` (sudo, dono), grupo docker antes de abrir o Claude Code | 040 | forge:tech-lead | 2026-10-22 | 2026-10-22 21:35 | MELHORIA da retrospectiva do 040 (parte do projeto; a parte da fábrica é o F13) |
| K-132 | [teste] D2 (baixa): 9 E2E instáveis com 8 workers (passam com 2 a 3); suíte E2E regrava docs/qa/evidencias a cada execução | 037 | forge:qa-engineer | 2026-10-21 | 2026-10-21 | QA do 037 |
| K-133 | [bug] L2T-003 (baixa): CLS de 0,073 a 0,100 em /tatico com equipe na API (herdado; reproduz com a seção do lote 2 fechada) | 025 | forge:react-frontend | 2026-10-21 | 2026-10-21 | Pendência do PR do 025 por decisão do dono (A) |
| K-134 | [teste] `pnpm run pronto` não roda o typecheck do e2e; o pre-push deixa passar falha com árvore suja (um erro TS em e2e/tests-api chegou à branch do 025) | 025 | forge:tech-lead | 2026-10-21 | 2026-10-21 | Melhoria vista do QA do 025; parte do pre-push pode ir ao Forge |
| K-125 | Avaliar se as branches feature/011-metricas-tambem-back (3 commits de revalidação depois do #92) e feature/011-fase2-back (2) ainda devem ir à develop; depois apagar | 039 | forge:tech-lead | 2026-10-21 | 2026-10-21 | Decisão A do dono no pedido 039 |
| K-108 | homolog-aprovada espera o portão terminar (E1) | 016 | forge:devops-engineer | 2026-10-17 | 2026-10-17 06:30 | Corrida vista no #90 e no #96 |
| K-092 | [teste] IF-U-operacional instável sob carga (timeout de 30 s) | qa-intensivo | forge:react-frontend | 2026-10-15 | 2026-10-15 02:00 | 1 falha em 2 rodadas no QA do K-083 |
| K-093 | [bug] SNO-005: primeira consulta depois de subir a API passa de 300 ms | sust-no-operacional | forge:node-backend | 2026-10-15 | 2026-10-15 02:00 | Baixo, já existia antes. Decisão do usuário de 2026-10-16: corrigir (SNO = C) |
| K-086 | [segurança] Erro e log sem valor do payload (B-4) | 011 | forge:node-backend | 2026-10-14 | 2026-10-14 22:00 | ADR 0020 |
| K-087 | Spike B-5: tipo do campo Time responsável e domínio fechado | 011 | forge:node-backend | 2026-10-14 | 2026-10-14 22:00 | ADR 0020; junto com a integração |
| K-088 | [segurança] Lint do coletor resistente a contorno (B-2) | 011 | forge:tech-lead | 2026-10-14 | 2026-10-14 22:00 | ADR 0020 |
| K-089 | [segurança] Teste da allow-list com a lista de campos proibidos escrita no próprio teste (B-1) | 011 | forge:qa-engineer | 2026-10-14 | 2026-10-14 22:00 | ADR 0020 |
| K-074 | Revisão geral de usabilidade: U1–U5, catálogo na Ajuda e topo enxuto | usabilidade | forge:react-frontend | 2026-10-14 | 2026-10-14 08:10 | Validado (`docs/ux/revisao-geral-usabilidade/04-decisoes.md`). Entra depois de K-073 (mesmas telas). O protótipo HTML vai junto com a feature |
| K-075 | Compatibilidade com celular, iPad e tablet (3 fatias, MOB-CA-1 a 27) | 010 | forge:react-frontend | 2026-10-14 | 2026-10-14 08:10 | O discovery está pronto. O usuário delegou as decisões ao time (D1 = B). Entra depois de K-074; o software-architect inclui o orçamento móvel na ADR 0003 |

## Empatizar e definir (WIP 2)
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|

## Idear e prototipar (WIP 2)
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|

## Validação do usuário
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|

---

**▶ Ponto de compromisso: protótipo validado pelo usuário**

# Downstream — entrega

## Pronto para fazer (WIP 5)
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|
| K-138 | [teste] Diagnóstico medido das instabilidades (unidade, E2E com 1/2/8 workers e sob carga): taxa de falha e causa raiz por teste | 041 | forge:qa-engineer | 2026-10-22 | 2026-10-23 20:29 | Pedido 041, E1.1; depois do merge do 025 na develop (código atual). Cobre K-092, K-107, K-115, K-123, K-132, K-135. Diagnóstico entregue e conferido (8d8bdfd); correções E2/E3 em curso |
| K-121 | [docs] 10 documentos antigos de docs/qa e docs/architecture sem frontmatter (ADR 0004) poluem o forge-check docs e escondem achados novos | 036 | forge:tech-lead | 2026-10-20 | 2026-10-20 22:25 | Melhoria vista no review do 036 e no QA do 035 |
| K-120 | [teste] Preview órfão de outra worktree na porta 4173 bloqueia ou serve build errado no test:perf (playwright.config.ts, reuseExistingServer) | 036 | forge:tech-lead | 2026-10-20 | 2026-10-20 21:58 | Melhoria vista do QA no reteste do FA-006 |
| K-115 | [teste] E2E instável sob carga local: IF-U-operacional e CA-19 axe (sustentação no operacional) estouram 30 s na suíte completa | 021 | forge:qa-engineer | 2026-10-18 | 2026-10-18 02:10 | Pré-existentes; passam sozinhos e na CI. Depois da homolog, junto do K-107 |

## Em andamento (WIP 1 por agente)
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|
| K-149 | [front] 3 falhas determinísticas da E2E completa (iguais na base e342a2c): axe target-size no botão "Sobre a janela fixa" (COMP-01 sustentação, 1280 px) e CLS 0,115 contra 0,1 a 375 px em /operacional e no Resumo | 041 | forge:react-frontend | 2026-10-27 | 2026-10-27 17:31 | 041 E6.1, decisão do dono = A (17:21); parecer de QA 8715162 A1 e A2 (worktree: MetricasDSPD-041) |
| K-135 | [teste] Helper único de "painel pronto" em e2e/pages (a espera estava duplicada em 4 lugares e deixou passar o W037-001) | 037 | forge:qa-engineer | 2026-10-21 | 2026-10-27 14:07 | 041 E2.1 com o qa-engineer (K-092, K-115, K-132 e F4 juntos); worktree: MetricasDSPD-041 |
| K-111 | Front do 011, lote 3 (operacionais): O19, O20, O21, O23, O24, O25, O22, O26 | 011 | forge:react-frontend | 2026-10-17 | 2026-10-27 21:03 | 026 QA reprovado (6199302): volta do A1 (Leia junto O19/O20, L3-001) com o react-frontend; depois merge da develop com o 041 (A2 a A5), re-review e reteste (worktree: MetricasDSPD-026) |
| K-104 | Docs da R-1 = B: ADR 0020 e plano (E3) | 011 | forge:software-architect | 2026-10-17 | 2026-10-17 10:00 | Na develop (#102). CAs da especificação (ux-designer, E3.2) pendentes |

## Code review (WIP 2)
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|
| K-139 | [docs] T14-1 = A: ajustar a ficha da T14 ao que a tela mostra (só "Meu time: k" com o projeto oculto) | 025 | forge:ux-designer | 2026-10-23 | 2026-10-23 20:40 | Decisão do dono de 2026-10-23; sem mudança de tela; ficha ajustada sem commit, vai no PR de docs do Jarvis com review do tech-lead |

## QA (WIP 2)
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|
| K-107 | [teste] montecarlo.test.ts instável por semente aleatória (E1) | 015 | forge:qa-engineer | 2026-10-17 | 2026-10-27 15:51 | Falhou no #96 (parecer de devops de 2026-10-16) e de novo no push do #108 em 2026-10-17 (semente 1324607460, contraexemplo [[2,0,6,5,0,7,0,8],29], 12 >= 12.15; passou ao rerrodar). Depois do K-103 ou numa vaga; 041 E2.2 entregue; prova de estabilidade E4.1 do 041 (worktree: MetricasDSPD-041) |
| K-123 | [teste] "gerador < 1,5 s" em packages/mock/src/mock.test.ts falha sob carga (1786 ms com load ~10) e quebra o pronto | 037 | forge:qa-engineer | 2026-10-21 | 2026-10-27 15:51 | Melhoria vista do react-frontend no E2.2 do 037; limite fixo, os outros testes já têm 90 s; 041 E2.2 entregue; prova de estabilidade E4.1 do 041 (worktree: MetricasDSPD-041) |

## Aguardando sua validação (WIP 2 PRs)
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|

## Pronto
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|
| K-151 | [ci] develop vermelha depois dos PRs do Dependabot #145 a #147: lint no-deprecated em web/src/test/setup.ts:47-48 e teste percepcao.test.tsx (PV1) | 042 | forge:tech-lead | 2026-10-27 | 2026-10-27 20:19 | 042 E3.5: PR #149 mesclado por squash (7b5732d); develop verde; branch e worktree removidas |
| K-148 | [ci] A develop exige os checks da CI verdes para aceitar merge (proteção da branch) | 042 | forge:devops-engineer | 2026-10-27 | 2026-10-27 16:47 | 042 E4.1, decisão 3 do dono = A; dono aplica (decisão A, 14:37); PR #148 mesclado (16e2617) 15:38; dono incluiu os 5 checks (E4.4); ruleset 25003880 com 9 checks, lido por GET às 16:47 |
| K-110 | Front do 011, lote 2 (táticas): T10, T11, T12, T13, T14 | 025 | forge:qa-engineer | 2026-10-17 | 2026-10-27 14:12 | #140 na develop e na main pelo #144 (auditoria de 2026-10-27) |
| K-117 | Promoção develop → homolog (#128) com review e QA próprios, e PR de release homolog → main (E4) | 035 | forge:tech-lead | 2026-10-20 | 2026-10-27 14:12 | #128 mesclado na develop; release saiu depois pelo #144 (auditoria de 2026-10-27) |
| K-113 | C6 do /operacional: Web Worker (ADR 0021) | 037 | forge:tech-lead | 2026-10-17 | 2026-10-23 14:40 | Na main pelo #144 (mesclado pelo dono em 2026-10-23 17:28Z), com o 025 e o Forge 0.28.0; retrospectiva 1d0b8ed (aceita 2026-10-23 20:42) |
| K-136 | Banco local no computador novo: Docker, `.env`, dependências, PostgreSQL, migrações e seed | 040 | forge:devops-engineer | 2026-10-22 | 2026-10-22 15:33 | healthy, 15 migrações, seed; retrospectiva 7049751 |
| K-131 | [bug] D1 (média): 100 E2E defasados na develop (W037-001) | 037 | forge:qa-engineer | 2026-10-21 | 2026-10-22 15:02 | Corrigido no #139 (2bb9f68), e2e verde; condição do D1 cumprida |
| K-124 | Limpar as branches já mescladas na develop (remota, local e worktree) | 039 | forge:tech-lead | 2026-10-21 | 2026-10-21 13:22 | Pedido 039 encerrado |
| K-122 | Registrar o Forge 0.27.0 no repositório | 038 | forge:tech-lead | 2026-10-21 | 2026-10-21 | #134 na develop (794b982) |
| K-091 | [teste] IFA-001: o IF-A verifica cartão em /estrategico (parte do /operacional fica para o lote 3) | 036 | forge:qa-engineer | 2026-10-15 | 2026-10-20 23:16 | #133 na develop (568ea48) |
| K-119 | E7 no catálogo: "Qual a participação de cada sistema nas nossas entregas?" (decisão do dono, A) | 036 | forge:qa-engineer | 2026-10-20 | 2026-10-20 23:16 | #133 na develop (568ea48); review, QA e UX aprovados |
| K-116 | PR de documentação do Jarvis e parecer de segurança do #130 na develop (E3) | 035 | forge:tech-lead | 2026-10-20 | 2026-10-20 22:20 | #132 mesclado na develop (bbbc70c), com review e QA; branch apagada |
| K-118 | [bug] FA-006: CLS de /estrategico em api 0,113 (limite 0,1, ADR 0003 F2): medir de novo e corrigir | 036 | forge:qa-engineer | 2026-10-20 | 2026-10-20 22:00 | Não reproduz: CLS 0,021 (api) e 0,001 (mock) em 12018de; reteste f3a2995, conferido |
| K-103 | Back da fase 2 do 011: E6, E7 R$, E8, T13, T14, O22, O26 (E1, E2) | 011 | forge:tech-lead | 2026-10-17 | 2026-10-20 21:32 | Os 3 lotes na develop e na main (#105, #107, #109; promoção #117/#122) |
| K-114 | E7 sem R$ (participação por entregas) e nome "Entregas por sistema" | 024/029 | forge:tech-lead | 2026-10-17 | 2026-10-17 12:45 | #114 (ed6ba46) na develop; R-1 aceita pelo dono; pergunta do catálogo do E7 com o dono |
| K-077 | Melhoria do Forge: autoria do parecer gravado pelo Bash | processo | usuário | 2026-10-14 | 2026-10-17 09:59 | Repassada à fábrica pelo usuário (prompt de melhorias, A4) |
| K-081 | Registro da versão 0.13.0 do Forge na develop | processo | usuário | 2026-10-14 | 2026-10-17 09:59 | Obsoleto: substituído pelo PR #113 (0.19.0) |
| K-105 | Limpeza de worktrees e docs da retomada | 013/017/019 | usuário | 2026-10-17 | 2026-10-17 09:52 | -qa removida; docs na develop (#102) |
| K-109 | Front do 011, lote 1 (estratégicas): E9, E6, E7, E8 | 011/021/028 | forge:tech-lead | 2026-10-17 | 2026-10-17 09:45 | #108 (d83024b) na develop; ressalvas baixas da UX: "Demais 1 sistema" e teste manual com leitor de tela |
| K-084 | [segurança] Coletor: allow-list (M-1, M-2, M-3) | 011 | forge:node-backend | 2026-10-14 | 2026-10-17 08:26 | #77 (0fe209a) na develop |
| K-085 | [segurança] GRANT por coluna (M-4, B-3) | 011 | forge:node-backend | 2026-10-14 | 2026-10-17 08:26 | #80 (f9d1079) na develop |
| K-102 | perf da visão semanal (fila de montagem dos gráficos) | 012/018 | forge:tech-lead | 2026-10-17 | 2026-10-17 12:05 | #103 mesclado na develop (48b909a). TBT da semanal a confirmar no perf-homolog; 4 itens manuais para a validação do usuário |
| K-106 | Checks do #101 (homolog → main) | 014 | usuário | 2026-10-17 | 2026-10-17 09:50 | #101 mesclado na main pelo usuário |
| K-083 | [bug] E2E IF-A vermelho na CI da develop (intensivo-filtros.spec.ts:401) | qa-intensivo | forge:tech-lead | 2026-10-14 | 2026-10-15 09:20 | #75 mesclado na develop (b5ac4f5) |
| K-082 | PR de docs: orçamento móvel na ADR 0003 (K-075) | 010 | forge:tech-lead | 2026-10-14 | 2026-10-15 09:20 | #74 mesclado na develop |
| K-090 | Alinhar data-model §3.1/§9 e businessmap-api-configuracao à ADR 0020 | 011 | forge:software-architect | 2026-10-14 | 2026-10-14 22:20 | Entregue no #76 (4b933ac) |
| K-076 | Documentação do discovery (.md) para a develop | usabilidade/sust/010 | forge:tech-lead | 2026-10-14 | 2026-10-14 15:30 | #66 na develop |
| K-071 | [bug] IS-007: teste C5 imprime NaN e anota ok | qa-intensivo | forge:qa-engineer | 2026-10-14 | 2026-10-14 15:30 | No lote #70 (develop), #71 (homolog) e release #72 na main |
| K-070 | [bug] IS-002: teste de desempenho C3 instável sob carga | qa-intensivo | forge:node-backend | 2026-10-14 | 2026-10-14 15:30 | No lote #70 (develop), #71 (homolog) e release #72 na main |
| K-069 | [bug] Lote dos testes intensivos (IF-001 a 007; IS-001, 003, 004, 005 e 006) + testes novos do QA | qa-intensivo | forge:react-frontend | 2026-10-14 | 2026-10-14 15:30 | No lote #70 (develop), #71 (homolog) e release #72 na main |
| K-065 | Espera invisível dentro de cada painel | espera-invisivel | forge:react-frontend | 2026-10-13 | 2026-10-14 07:00 | #64 (376d997) na develop e #65 na homolog; segue no PR #63 |
| K-066 | Front via API (HttpFonteMetricas, VITE_FONTE) | — | forge:react-frontend | 2026-10-13 | 2026-10-13 22:44 | #59 e #61 na homolog; segue no PR #63 |
| K-067 | QA intensivo de filtros na main (IF-001 a 007) | qa-intensivo | forge:qa-engineer | 2026-10-13 | 2026-10-13 | Parecer em `docs/qa/intensivo-filtros.md`; os testes vão com K-069 |
| K-068 | QA intensivo sistêmico na main (IS-001 a 007) | qa-intensivo | forge:qa-engineer | 2026-10-13 | 2026-10-13 | Aprovado com ressalvas, sem bugs críticos nem altos; os testes vão com K-069 |

## Bloqueado
| ID | Cartão | Pedido | Responsável | Entrou | Na coluna desde | Obs. |
|---|---|---|---|---|---|---|
| K-140 | Registrar o Forge 0.30.3 no projeto (branch forge/upgrade-0.30.3, PR para a develop) | 042 | forge:tech-lead | 2026-10-27 | 2026-10-27 12:26 | Aguardando o dono: `forge-upgrade` no terminal (E1.1) |
| K-141 | Ambiente da máquina nova: Docker, `.env`, Node 24, Chromium, doutor; depois pnpm install e banco | 042 | forge:devops-engineer | 2026-10-27 | 2026-10-27 12:26 | Aguardando o dono (E2.1); depois tech-lead (E2.2) e devops (E2.3) |
| K-152 | [forge] F21: worktree nova sem dependências não quebra o pre-push | 043 | forge:tech-lead | 2026-10-27 | 2026-10-27 20:18 | Aguardando o dono: aplicar docs/analises/043-f21-pre-push.patch no clone (docs/analises/043-f21-instrucoes-ao-dono.md); resto do F21 pronto sem commit |
| K-153 | [forge] F22: PR de release não nasce antes do portão; homolog-aprovada sem corrida | 043 | forge:tech-lead | 2026-10-27 | 2026-10-27 22:11 | Aguardando o dono: review, segurança e QA aprovados (0b59505 empurrado), mas o `forge-check pr` não lê o clone do Forge e barra o PR (043, 22:10); decisão de como passar o portão |

## Políticas locais (acrescentadas na auditoria K-021)
- **Entrada é o backlog:** cartão com dependência aberta de outro cartão fica em Entrada; só entra em "Pronto para fazer" o que pode ser puxado agora (a espera por ata de reunião em andamento é a única exceção, e deve constar em Obs.).
- **Code review, QA e revisão de UX são colunas, não cartões:** não criar cartão para revisar outro cartão. K-009, K-010 e K-011 são trabalho próprio (automação E2E, revisão de UX, pré-entrega) e não duplicam as colunas.
- **Um cartão em "Em andamento" por agente**, salvo reunião e o lote de retrabalho do mesmo autor (K-027..K-029, ver política de bugs). Ver pedido 006.
- **Reunião de melhoria a cada entrega (M-011):** ao fim de cada entrega ao usuário, o Jarvis convoca reunião de melhoria e registra ata e experimentos em `melhorias.md`.
- **Tamanho:** um cartão por conjunto coeso de métricas ou por uma entrega revisável de uma vez; se o review não cabe numa sessão, dividir.
- **Documentação faz parte da entrega (pedido do usuário, 2026-10-10):** um cartão só sai de Em andamento com a documentação técnica atualizada (`docs/tecnica/` para front e biblioteca; `docs/architecture/` + `docs/api/` para o back) e a de UX (`docs/ux/`) coerente com a tela. O tech-lead verifica no code review (`praticas.md` seções 7 e 8); sem doc, volta ao autor.
- **Aguardando sua validação:** limite 2 **PRs** (não cartões); os cartões de um mesmo PR contam como 1 unidade de validação. Esclarecimento proposto na retro 001 (M-013), pendente de aprovação do Jarvis.

## Políticas locais: bugs e retrabalho (K-027 a K-029)
Processo completo na skill `kanban-scrum`, seção "Bugs e retrabalho". Em resumo:
- **Achado vira cartão** `[bug]` ou `[ajuste]`, agrupado por origem, área e severidade; Obs. com origem, pai, severidade, link do parecer e voltas.
- **Fluxo:** Em andamento (autor original) -> Code review -> QA -> UX se houver interface. Conta como retrabalho.
- **Pai aguardando bugs** fica em Bloqueado e **não conta no WIP** (exceção registrada); os cartões de bug contam. Cartões de retrabalho do mesmo autor podem ocupar a vaga cheia (3), em ordem de severidade.
- **Bloqueante, crítico e alto** puxam antes de trabalho novo; médio e baixo só seguem abertos com aprovação do usuário. Limite de 3 voltas por bug, depois vai ao usuário.
- **Limites:** QA 2 e Aguardando sua validação 2 (M-001, ata D14).
