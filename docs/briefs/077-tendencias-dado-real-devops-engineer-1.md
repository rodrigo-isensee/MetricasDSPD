Agente destino: forge:devops-engineer
Pedido: 077-tendencias-dado-real
Tipo: codigo
Branch: —   Base: develop   Base-sha: 54f02c42b51aba3355e9f0428f058113f916c4c9
Etapa: codigo   Cobre: E2.7

## Objetivo
Achar por que o `eslint .` do `.githooks/pre-push` não termina em 20 minutos dentro do sandbox dos agentes (o guarda de lint do dono o encerra), mesmo com a máquina ociosa (carga 0,3 às 01:36), enquanto às 20:07 um push passou em 3 minutos; sem isso nenhum push do time sai e os PRs do 075 e do 077 ficam parados. Só diagnóstico, sem mudar arquivo nem commit.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052h/.githooks/pre-push` e o `eslint.config.*` da raiz dessa worktree.
- `/home/rodrigoisensee/logs-metricas/guarda-lint.log` (últimas 30 linhas).
- Do pedido `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/077-tendencias-dado-real.md`, as linhas do `## Histórico` de 2026-11-07 22:30 em diante sobre pushes presos.

## Entregar
- "E2.7 (devops-engineer): diagnóstico do pre-push preso no eslint . dentro do sandbox (só leitura, sem commit), para destravar os pushes da E2.4." (E2.7)
- (E2) (E2.7) Na worktree `/home/rodrigoisensee/MetricasDSPD-052h`, medir dentro do sandbox, com `timeout 300` em cada comando e `run_in_background: true` quando passar de 2 minutos: `pnpm exec eslint --version`; `pnpm exec eslint server/src/modulos/metricas/servico.ts` (um arquivo); `pnpm exec eslint --debug web/src/features/operacional/resumo/SerieMensal.tsx 2>&1 | tail -40` (onde para); o tempo de usuário e de sistema de cada um (`/usr/bin/time -v` se existir); e se o eslint lê pastas fora do repositório ou grandes (`node_modules/.cache`, `coverage`, `e2e/playwright-report`, `.eslintcache`). Comparar com o que o `pre-push` roda. Relatar a causa provável com a evidência e 1 ou 2 correções possíveis (no projeto ou no ambiente), sem aplicar nenhuma.
- (E1) Nada a entregar aqui: não nesta delegação.

## Decisões e restrições
- 2026-11-08 02:17: DECISÃO TÉCNICA (Jarvis): etapa E2.7 acrescentada (devops-engineer, diagnóstico do pre-push preso), porque nenhum push do time sai desde 22:04 e isso não depende do dono; brief devops-engineer-1.
- ADR 0019 (citada no pedido): cálculo das tendências; não muda nesta delegação.
- 2026-11-07 22:46: o dono escolheu "A" (pausar o guarda de lint enquanto o time envia); o guarda voltou às 2026-11-08 01:23 e encerrou o push das 01:36 (log do guarda).
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (K-211, registrada no pedido 073): as tendências do Resumo entram no mapa real, como pedido novo (077).
- 2026-11-06 12:06: DECISÃO DO DONO (literal "Faca suas recomendacoes", resposta às P-077-1 a P-077-3): as três recomendações do Jarvis.
- 2026-11-06 12:06: DECISÃO DO DONO: "A" (P-077-1, pela recomendação): ponto cuja janela de 12 semanas começa antes da primeira carga não publica e mostra janela incompleta.
- 2026-11-06 12:06: DECISÃO DO DONO: "A" (P-077-2, pela recomendação): a tendência de SLA leva a ressalva do S2 (lote L3: notas no contrato e na tela, com o ux-designer).
- 2026-11-06 12:06: DECISÃO DO DONO: "A" (P-077-3, pela recomendação): a passagem para dado real vira marca de critério (T2.6) no eixo das tendências.
- 2026-11-06 14:54: DECISÃO DO DONO: "A" (P-077-4, pela recomendação): a primeira carga é a data em que o histórico carregado começa (inicio_carga da carga inicial), não o dia em que a carga rodou. Destrava o Lote 3. PERGUNTA: P-077-5 vai ao dono; na fila: tabela P-E10-2, P-E10-5 e P-E10-6 (073).
- 2026-11-07 12:56: DECISÃO DO DONO (literal): "Isso a 1" (merge agrupado, leitura 1): cada lote segue com review, QA e conferência próprios e entra numa branch de integração; só ela vira um PR único para a develop. DECISÃO TÉCNICA (Jarvis): branch `integracao/2026-11-07` criada pelo tech-lead a partir da develop atual; cada lote, depois do QA conferido, entra nela por merge (--no-ff) feito pelo tech-lead, com o forge-check pr do lote limpo; no fim, um PR único integracao/2026-11-07 → develop (merge commit), com a lista de lotes e pareceres; os PRs 256 e 266 ficam abertos até lá e fecham com o PR único. O dono faz um update-branch e um merge só.
- 2026-11-07 19:15: DECISÃO DO DONO (literal): "A" (P-077-5, pela recomendação): mês anterior ao início do histórico não mostra a contagem (concluídos e volume); fica marcado janela incompleta com o motivo. DECISÃO TÉCNICA (Jarvis): molde aditivo do desenho (Lote 8: 8a node-backend, 8b react-frontend), antes do Lote 5, como o desenho manda. PERGUNTA: (Jarvis) 3 de 4: P-077-6.
- 2026-11-07 19:16: DECISÃO DO DONO (literal): "A" (P-077-6, opção (a), pela recomendação): o Acelerato não tem início de histórico; nenhum ponto da tendência de SLA sai janela incompleta por isso. Destrava os Lotes 3b e 7. PERGUNTA: (Jarvis) 4 de 4: QA do PR 256 (pedido 082).
- 2026-11-07 21:55: DECISÃO DO DONO (literal): "Sim foi A" (confirmação da P-077-6: o "A" é a opção (a), o Acelerato não tem início de histórico). O 3b deixa de estar segurado. PERGUNTA: (Jarvis) ao dono: confirmação da P-077-5 (contagem parcial na API com marca e escondida só na tela, ou fora da API).
- 2026-11-07 21:56: DECISÃO DO DONO (literal): "A" (confirmação da P-077-5, pergunta "O que me recomenda para 2?" respondida com a recomendação: o número parcial continua no resultado da API, marcado como contagem parcial, e só a tela o esconde; molde aditivo, Lotes 8a e 8b). O 8a deixa de estar segurado. PERGUNTA: (Jarvis) ao dono: como fechar o merge agrupado.
- 2026-11-07 21:57: DECISÃO DO DONO (literal): "A" (como fechar o merge agrupado: voltar a um PR por lote para a develop; a branch integracao/2026-11-07 é descartada). Revoga, para o que falta, a leitura 1 de 12:56. DECISÃO TÉCNICA (Jarvis): o tech-lead atualiza cada branch com a develop, abre os PRs do 4c e do 6a (075) e do 4b e do 6b (077, com os pareceres de interface commitados antes) e deixa cada um pronto pelo forge-fechar; o dono mescla, um por vez, com update-branch quando ficarem BEHIND. MELHORIA (cartão Forge): forge-check pr reconhecer os pareceres dos lotes mesclados numa branch de integração.
- 2026-11-07 22:46: DECISÃO DO DONO (literal): "A" (o dono pausa o guarda de lint enquanto o time envia). Fila: PRs do 075 (tech-lead-35) agora; depois os PRs do 4b e do 6b (tech-lead-23); o push do 3b sai com o node-backend depois do 8a.
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar; não rode nada fora do sandbox. Sem `--no-verify`, sem push, sem commit.
- NÃO tocar: nenhum arquivo do repositório, o guarda de lint do dono, as worktrees além da leitura na 052h, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1. Desenho: o que falta para TENDENCIA_FLUXO e TENDENCIA_SUST entrarem no mapa real (origem, cálculo pela biblioteca, mínimo de 20, versão de critério, BusinessMap e Acelerato separados) · `confirmado`" · etapa de outra delegação; continua no pedido
- "E2. Implementação, review, QA e PR por lote, depois do desenho · `técnico`" · etapa de outra delegação; continua no pedido
- "E1.1 (software-architect): desenho curto em docs/analises/077-desenho.md, só leitura, sem commit; regra de negócio vira pergunta ao dono." · etapa de outra delegação; continua no pedido
- "E1.2 (tech-lead): revisão do desenho docs/analises/077-desenho.md (lotes, contrato, testes, teto, ordem), parecer curto em docs/analises/077-desenho-revisao-tech-lead.md, sem commit." · etapa de outra delegação; continua no pedido
- "E2.0 (ux-designer): especificação curta da janela incompleta (P-077-1) e da ressalva do S2 na tendência de SLA (P-077-2), com acessibilidade e critérios de aceite, em docs/ux/077-tendencias.md, sem commit." · etapa de outra delegação; continua no pedido
- "E2.1 (node-backend): implementação por lote." · etapa de outra delegação; continua no pedido
- "E2.2 (tech-lead): review por lote." · etapa de outra delegação; continua no pedido
- "E2.3 (qa-engineer): QA por lote." · etapa de outra delegação; continua no pedido
- "E2.4 (tech-lead): PR por lote, depois do QA." · etapa de outra delegação; continua no pedido
- "E2.5 (react-frontend): parte de tela do lote L3 (ressalva e janela incompleta), pela especificação." · etapa de outra delegação; continua no pedido
- "E2.6 (ux-designer): revisão de interface do lote L3." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `test -e /home/rodrigoisensee/MetricasDSPD-052h/.githooks/pre-push && echo ok` · espera: igual 'ok'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
