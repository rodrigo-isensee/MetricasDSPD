Agente destino: forge:qa-engineer
Pedido: 065-bloqueados-sem-dado-real
Tipo: codigo
Branch: feature/065-bloqueados   Base: develop   Base-sha: 1f1da673b0fbb8210f2cd5cae5c3a4525afff901
Etapa: qa   Cobre: E1.5

## Objetivo
QA do 065 na ponta b02fd50332b54a39f3eb35973a3a81cb02b2d708 (pedido 065, E1.5, K-205). Worktree `/home/rodrigoisensee/MetricasDSPD-052d`, branch `feature/065-bloqueados`.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052d/docs/analises/065-desenho.md` (testes e E2E previstos, seção 8 com a decisão B); o review `/home/rodrigoisensee/MetricasDSPD-052d/docs/reviews/065-bloqueados.md`; o parecer de interface `/home/rodrigoisensee/MetricasDSPD-052d/docs/ux/065-revisao-bloqueados.md`.

## Entregar
- "E1.5 (qa-engineer): QA." (E1.5)
- (E1) (E2) (E1.5) `git -C /home/rodrigoisensee/MetricasDSPD-052d pull --ff-only origin feature/065-bloqueados`; testar contra o desenho e as decisões: BLOQUEADOS e O5 inteiros com Sem dado real, O1 e O2 com só a parte de bloqueio Sem dado real (nunca 0) e o resto visível, a faixa Pede atenção sem dizer nada bloqueado, e a marca da versão de critério; E2E do desenho em `e2e/`, se faltar, com playwright no máximo 2 workers, incluindo axe nas telas mudadas; o teste novo entra em commit seu antes do parecer, e o parecer cita a ponta depois dele (o review fica desatualizado e é regravado depois, pelo tech-lead); parecer `docs/qa/065-bloqueados.md` pela ferramenta Write com veredito, `commit:` = a ponta testada, o resultado real e bloco `## Achados`; commit só do parecer; push com `git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/feature/065-bloqueados`; sem PR.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "C" (bloqueados no mapa real, pedido 064): fazer A agora (tirar a tela de bloqueados do mapa real; ela mostra "Sem dado real" até a coleta gravar bloqueios) e B depois (corrigir a coleta para gravar os bloqueios), como cartão.
- DECISÃO DO DONO (2026-11-04): "isso" (recibo do 065): tirar BLOQUEADOS do mapa real e mostrar "Sem dado real" também nas partes do O1 (bloqueados), do O2 (motivo do bloqueio) e do O5 (horas bloqueadas), em vez de zero; a coleta gravar bloqueios fica no K-204.
- DECISÃO DO DONO (2026-11-04): "B" (Q-065-1, percentual de eficiência do O5): o O5 inteiro mostra "Sem dado real" até a coleta gravar bloqueios (K-204), em vez de publicar o percentual com ressalva.
- ADR 0026 (citada no pedido): métrica fora do mapa real responde Sem dado real; o texto ainda está sem commit, na worktree 052b
- 2026-11-04 10:44: conferente: voltas do back e do front não cumpriram só por escopo: docs/api/metricas.md (+2 -2, 26692ba) não estava nominado no Entregar do node-backend-2; resto ok. DECISÃO TÉCNICA (Jarvis): a documentação da API afetada pela mudança vai na mesma entrega (prática do prompt-padrão); a omissão é do brief, não do autor; gravo a conferida em ae729b2. E1.4 cumprida pelo tech-lead: parecer de interface commitado em 21fffba71a7d6e9133fdf4d97a417b0ab58d1159; review aprovado em b02fd50332b54a39f3eb35973a3a81cb02b2d708 (commit: 21fffba), sem bloqueante; mapa real com 17 ids; null nunca 0 no O1; contrato, docs/api e OpenAPI em dia; T2.6 marca O1, O2 e O5; server 1622 e web 1425 verdes; A1 e M1 do UX resolvidos pelo O5 inteiro sem dado; recomendados: JSDoc fora de lugar (origem.ts:47), quebra de linha sobrando (fluxo.tsx:64), S2 pela função pura, M2 e B1 a B3 do UX; lote com 427 linhas: o PR precisa da linha teto. Pendência: linha de revisão da ADR 0026 citando o 065. DECISÃO TÉCNICA (Jarvis): E1.5 com o QA na ponta b02fd50, com o E2E do desenho; os recomendados ficam no PR como ressalva.
- O agente não abre, lê nem edita arquivos `.env*`.
- Recursos: uma tarefa pesada por vez, vitest e playwright com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes; test:pg e pronto ficam com o dono; o Chromium do playwright precisa estar instalado.
- O pre-push e o `forge-check docs` barram frase de regra copiada (cite só o ID) e achado com mais de 300 caracteres.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`. `git add` explícito por caminho.
- NÃO tocar: código de produção, outros pareceres, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho curto: onde tirar do mapa real (origem.ts e o mapa da ADR 0026) e como O1, O2 e O5 mostram a parte sem dado." · etapa de outra delegação; continua no pedido
- "E1.2 (node-backend): implementação no server e testes." · etapa de outra delegação; continua no pedido
- "E1.3 (react-frontend): ajuste de tela, se o desenho pedir." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): code review." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR para a develop e merge." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface dos cartões O1, O2 e O5 e da tela de bloqueados com a parte Sem dado real, sem commit (o tech-lead commita no começo do review)." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-052d log --format=%H -1 origin/feature/065-bloqueados -- docs/qa/065-bloqueados.md` · espera: linhas=1

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).