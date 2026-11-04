# Retrospectiva do pedido 064: levantamento das lacunas de dado real (2026-11-04)

Fontes: `docs/pedidos/064-lacunas-dado-real.md` (Histórico inteiro), `docs/kanban/conferencias.md` (10 linhas do 064, linhas 1646 a 1653, 1656 e 1660), `docs/kanban/historico.md` (K-202, 2 movimentos), `docs/analises/064-lacunas-dado-real.md` (seção "Lacunas confirmadas"). Horas do Histórico do pedido são as da escrita do Jarvis, não as do evento. `forge-check esperas` e `forge-check transcricao custo` não foram rodados nesta etapa: espera medida só pelo Histórico, custo **não medido**. Métricas do processo, nunca de pessoa ou de agente. Amostra de 1 cartão: valores brutos, sem percentil.

## 1. Dados do fluxo
| Marco (2026-11-04, -03:00) | Hora | Intervalo |
|---|---|---|
| Pedido aberto pela escolha "A" do dono; K-202 Entrada -> Em andamento | 04:27 (04:27:53 no histórico) | |
| E1.1 não cumprida: sandbox não cria a pasta 052e | 04:30 | 3 min |
| Brief do arquiteto reprovado 2 vezes (04:34 e 04:36), aprovado | 04:48 (E1.2 cumprida, mapa) | 14 min de rodadas |
| E1.1 cumprida na worktree 056d | 04:51 | |
| Brief do QA reprovado 2 vezes (04:51 e 04:53), aprovado | 04:58 (E1.3 cumprida: código conferido, 32 consultas escritas) | 7 min de rodadas |
| K-202 Em andamento -> Aguardando o dono | 04:58:54 | |
| Decisão do dono "C" (bloqueados no mapa real) | 08:04 | 3h05 de espera do dono |
| E1.4 cumprida pelo dono (32 consultas, só a Q20 falhou) | 08:05 | |
| Brief do QA da E1.5 reprovado (08:09, escopo), aprovado | 08:17 (E1.5 cumprida: mapa fechado, K-206 a K-216) | 12 min |
| E1.6 delegada | 08:18 | |

- Lead time até a E1.6 ser delegada: 3h51 (04:27 a 08:18). Cartão ainda aberto; cycle time, vazão e DORA não se aplicam (sem código, sem PR): **não medidos**. O retorno de "Aguardando o dono" para "Em andamento" ainda não está no `historico.md`: o tempo exato de espera sai quando o Jarvis lançar o movimento.
- Espera do dono: cerca de 3h05 de 3h51, 80% do tempo total, ligada à falta de acesso do agente à base (ver melhoria 2). Trabalho ativo do time: cerca de 46 min.
- Retrabalho de cartão (volta de Code review, QA ou UX): 0, pois o pedido é de análise, sem esses portões. Escapes: nenhum registrado para o 064.
- Brief: 5 briefs, 10 conferências, 5 reprovações (50% das conferências); 3 dos 5 briefs passaram só na 2a ou 3a rodada (arquiteto 3 rodadas, QA da E1.3 3 rodadas, QA da E1.5 2 rodadas); os 2 primeiros (qa-engineer-1 e qa-engineer-2) passaram de primeira.

### Reprovações de brief por classe de causa
| Classe | Qtd | Linhas (conferencias.md) | Causa resumida |
|---|---|---|---|
| decisao | 2 | 1648 (04:34 arquiteto r1), 1652 (04:53 QA r2) | destino do mapa contraditório e decisões das dependências (r1); texto da ADR 0026 colado como se fosse do pedido (r2) |
| citacao | 2 | 1649 (04:36 arquiteto r2), 1651 (04:51 QA r1) | ADR 0026 citada mas fora da develop; L1 a L9 contra L1 a L12 |
| escopo | 1 | 1656 (08:09 QA E1.5 r1) | prioridade das lacunas além do pedido |
| outras | 0 | | |

A ADR 0026 sem commit é causa direta de 2 das 5 reprovações (linhas 1649 e 1652).

## 2. O que funcionou
- Conferência de brief barrou 5 briefs antes de custar uma execução de agente: o texto da ADR 0026 não foi para a saída e a contagem de lacunas (L1 a L12) foi corrigida antes do QA trabalhar (04:51 e 04:53).
- Mapa do arquiteto sem Bash saiu em 21 min desde a abertura e já apontava L1 (bloqueios só pelo seed) com risco de produto; a "Melhoria vista" do arquiteto virou pergunta ao dono (R-DECISAO) e a decisão veio com o resultado (08:04).
- Divisão de papéis sem violar a regra do `.env`: o QA não leu a base, escreveu 32 consultas só SELECT, sem coluna de pessoa na saída (Q19 agrupa por pessoa só por dentro), o dono as rodou em transação só de leitura (08:05) e o QA interpretou a saída em 12 min (08:17).
- Dado medido separou lacuna de código (L1, L2, L3, L9) de regra do briefing (abaixo de 20 itens, L10, L11), de configuração por pessoas (M2, M3, M4, L5, L7, M6) e de risco latente (L8 não confirmada: valores coincidem com o texto). Saíram 11 cartões (K-206 a K-216) e o pedido 065 sem nova rodada de análise.
- Substituição rápida de E1.1: o Jarvis decidiu usar a worktree 056d no mesmo intervalo da falha (04:30 a 04:34, novo brief).

## 3. O que atrapalhou (fatos)
- **Sandbox sem pasta de worktree.** A decisão inicial (04:27) escolheu `/home/rodrigoisensee/MetricasDSPD-052e`, pasta que "já não existia"; o QA tentou criá-la e recebeu "Read-only file system" (04:30). A lista de gravação do sandbox só tem pastas já criadas (052b a 052h, 056, 056d, 041 e 041b); criar pasta nova nunca é possível. A E1.1 custou 21 min (04:30 a 04:51) até a worktree 056d ficar pronta, e o brief de qa-engineer-1, aprovado às 04:30, foi gasto à toa.
- **Agentes sem acesso à base.** O agente não lê `.env*`, então nenhuma consulta rodou no sandbox (E1.3: "sem psql e sem API local"). O QA escreveu 32 consultas e o dono as rodou: 3h05 de espera (04:58 a 08:04), 80% do lead time. A Q20 voltou com erro (migração 0034 não aplicada na base local) e só o dono pôde ver isso.
- **Mapa real aceitou métrica sem gravador (L1).** `fato_bloqueio` e `evt_bloqueio` só são gravadas pelo seed: a tela BLOQUEADOS do mapa real mostraria "nenhum bloqueado" (Q01: 0 em 18175 cards; Q02: 0 eventos), afetando O1, O2, O5, O19 e o Resumo. A lacuna só apareceu no levantamento do 064 (04:48), com a web e a API já só com dado real (pedido 060). Custo: pedido 065 e cartão K-204.
- **Briefs por citação de ADR sem commit.** A ADR 0026 estava só na branch `docs/060-triagem-dependabot`, fora da develop: o brief do arquiteto foi reprovado "tardio" (04:36) e o do QA reprovado por colar o texto dela (04:53). Cada brief precisou de 2 a 3 rodadas, 21 min no total (14 + 7).
- **Suspeita sobre `eh_subtarefa` fica sem dono claro:** o QA encontrou o campo nunca gravado (04:58) e passou "para o arquiteto"; no fechamento (08:17) a lacuna L2 o inclui, sem cartão próprio distinto.
- **Escopo de brief:** o brief da E1.5 trouxe prioridade das lacunas fora do pedido (08:09); a prioridade acabou sendo decisão técnica do Jarvis às 08:17.

## 4. Ações (até 3) e melhorias
Ações com responsável, mudança exata e medida:
1. Jarvis (projeto): antes de escolher pasta de worktree de leitura, `ls -d` na pasta e escrever no brief a pasta existente e gravável; o brief de E1.1 cita a prova. Medida: falhas "Read-only file system" ao criar pasta em pedidos novos = 0 nos próximos 3 pedidos com worktree.
2. Jarvis com o dono (projeto): decidir a forma de o QA conferir a base sem ler o `.env` (ver melhoria 2). Medida: espera do dono por conferência de base em `forge-check esperas` abaixo de 30 min.
3. Software-architect e qa-engineer (projeto): item "gravador" obrigatório em todo mapa de métrica (job e tabela que escrevem o dado, com prova por busca no código). Medida: lacunas "métrica sem gravador" achadas depois do mapa real = 0.

| Classe de R-DECISAO | Linha | Onde |
|---|---|---|
| Melhoria vista (dono decide) | MELHORIA 2 (acesso do QA à base) | abaixo |
| Melhoria vista (entrada direta) | MELHORIA 1, 3 e 4 | abaixo |

MELHORIA: Sandbox impede criar pasta de worktree de leitura; a E1.1 foi delegada para uma pasta (052e) que não existia e falhou. Evidência: `docs/pedidos/064-lacunas-dado-real.md`, Histórico de 2026-11-04 04:27 e 04:30 ("Read-only file system ao criar a 052e, que já não existia"); `docs/kanban/conferencias.md` linha 1646 (brief qa-engineer-1 aprovado às 04:30 sem checar a pasta). Medida do efeito: pedidos que usam worktree de leitura com falha ao criar pasta = 0 em 3 pedidos; E1.1 em 1 rodada. Forge (checagem de pasta existente e gravável na conferência de brief de worktree; também considerar listar as pastas gravadas no sandbox da conferência).

MELHORIA: Agentes sem acesso à base; toda conferência de dado real vira consulta para o dono, que custou 3h05 (80% do lead time) e uma consulta (Q20) que só falhou no retorno. Evidência: `docs/pedidos/064-lacunas-dado-real.md`, Histórico de 2026-11-04 04:58 (E1.3, "sem psql e sem API local no sandbox") e 08:05 (E1.4, 32 consultas, saída em `/home/rodrigoisensee/logs-metricas/064-consultas-saida-20261104-0803.txt`); `docs/analises/064-lacunas-dado-real.md`, seção "Lacunas confirmadas" (Q20 falhou, migração 0034). Medida do efeito: espera do dono por conferência de base (`forge-check esperas`) abaixo de 30 min; consultas que falham por pré-requisito de ambiente = 0 no retorno. Projeto (decisão do dono, R-DECISAO: exige papel de leitura da base sem passar por `.env*` do agente, por exemplo comando do dono que roda o arquivo de consultas e devolve a saída; antes, o QA confere no `psql` do dono se as tabelas das consultas existem).

MELHORIA: Mapa real aceitou métrica sem gravador (L1): `fato_bloqueio` e `evt_bloqueio` só são escritas pelo seed, e a tela BLOQUEADOS mostraria "nenhum bloqueado". Evidência: `docs/analises/064-lacunas-dado-real.md`, seção "Lacunas confirmadas", linha L1 (Q01: 0 em 18175 cards; Q02: 0 eventos); `docs/pedidos/064-lacunas-dado-real.md`, Histórico de 2026-11-04 04:48 e 08:04 (decisão "C": pedido 065 e K-204). Medida do efeito: no próximo mapa de métricas, coluna "gravador" preenchida em 100% das linhas com prova por busca no código, e lacunas "métrica sem gravador" achadas só pela base = 0. Projeto (checklist em `docs/engineering/` do portão do mapa real, com o software-architect como dono).

MELHORIA: Rodadas de brief por citação de ADR sem commit (a ADR 0026 estava só em `docs/060-triagem-dependabot`): 2 reprovações por "citacao" e 2 por "decisao" ligadas a ela, 21 min de rodadas. Evidência: `docs/kanban/conferencias.md` linhas 1649 (04:36, "tardio: ADR 0026 fora da develop") e 1652 (04:53, "texto da ADR 0026 não é do pedido"); `docs/pedidos/064-lacunas-dado-real.md`, Histórico de 2026-11-04 04:48 ("ADR 0026 ainda sem commit"). Medida do efeito: reprovações de brief por citação de documento fora da develop = 0 em 3 pedidos seguintes. Forge (regra de brief: citar só o que existe na `Base-sha` do cabeçalho do pedido; o documento só em branch de outro pedido entra como "ainda sem commit" no Histórico, sem texto colado; checar na conferência com `git cat-file -e <base-sha>:<caminho>`).

## 5. Revisão das ações da retrospectiva anterior (063)
A retrospectiva `docs/retrospectivas/2026-11-04-063-worklog-teto.md` não foi relida nesta etapa além do cabeçalho de dados; a revisão das ações dela fica **não medida** aqui (ler quando o Jarvis fechar o 063, evitando opinião sem dado).
