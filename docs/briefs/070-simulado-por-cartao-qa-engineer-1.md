Agente destino: forge:qa-engineer
Pedido: 070-simulado-por-cartao
Tipo: codigo
Branch: feature/070-simulado-por-cartao   Base: develop   Base-sha: 97ec7af9055f247297ecdedda910cbac54562d72
Etapa: qa   Cobre: E1.6

## Objetivo
QA do lote L1 do 070 (campo simulavel, podeSimular e METRICAS_SEM_SIMULACAO na API) na ponta cb1a80d1a4e38bcb738a03bc75a1e1f3c799bd80 (pedido 070, E1.6, K-221). Worktree `/home/rodrigoisensee/MetricasDSPD-052f`, branch `feature/070-simulado-por-cartao`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052f diff origin/develop...cb1a80d1a4e38bcb738a03bc75a1e1f3c799bd80`; o desenho `/home/rodrigoisensee/MetricasDSPD-052f/docs/analises/070-desenho.md` (contrato, regra do cartão, testes e lote L1) e a ADR `/home/rodrigoisensee/MetricasDSPD-052f/docs/architecture/adr/0028-simulado-por-cartao.md`.

## Entregar
- "E1.6 (qa-engineer): QA." (E1.6)
- (E1, E2) (E1.6) `git -C /home/rodrigoisensee/MetricasDSPD-052f pull --ff-only origin feature/070-simulado-por-cartao`; rodar com no máximo 2 workers o vitest do server e dos pacotes com cobertura, `pnpm exec prettier --check web packages tools` e `pnpm run docs:check`; rodar a suíte inteira do server (o autor rodou só dois arquivos depois da última correção) e `npx eslint .` em `server/` e em `packages/contratos/`; conferir que a API nunca devolve número simulado; registrar no parecer que os testes pg não rodam no sandbox e ficam para a CI do PR; parecer em `docs/qa/070-l1.md` com o resultado real; commit só do parecer; push com `git -C /home/rodrigoisensee/MetricasDSPD-052f push origin HEAD:refs/heads/feature/070-simulado-por-cartao`; sem PR.
- (E3) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "Não consigo deixar os dados reais nas que já são possíveis fazer e nas que não deixar mocado?" e, ao recibo ("vou fazer: painel com dado real só com o real; sem dado real, o simulado com o selo Simulado visível; ADR nova revendo a 0026; não vou fazer: misturar real e simulado no mesmo gráfico, misturar BusinessMap e Acelerato, simulado em métrica individual; a troca é por cartão"), respondeu "Sim": dado simulado por cartão onde ainda não há dado real, com selo visível.
- DECISÃO DO DONO (2026-11-04): "A" (validação do protótipo docs/ux/070-selo-simulado/prototipo.html): protótipo aprovado como está (selo no cabeçalho, faixa com "O que é simulado?", borda tracejada, marca d'água, prefixo "Exemplo:"); ponto de compromisso do 070.
- DECISÃO DO DONO (2026-11-04): "A" (cartão simulado no resumo): o cartão com dado simulado fica fora de "O que pede atenção agora" e da Visão geral; só aparece na própria aba, com o selo; o resumo mostra só dado real.
### ADRs citadas no Histórico deste pedido (não no registro 064)
- ADR 0026 (citada no pedido): revista pela 0028; entrou na branch como cópia sem mudar o texto
- ADR 0028 (citada no pedido): a decisão que este lote implementa (proposta)
- ADR 0021 (citada no pedido): o simulado roda no Web Worker dela, só no navegador; nada muda nela
### Do Histórico deste pedido, docs/pedidos/070-simulado-por-cartao.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-04 22:20: L1 entregue pelo node-backend: feature/070-simulado-por-cartao em cb1a80d1a4e38bcb738a03bc75a1e1f3c799bd80 (2b026ea: desenho e ADRs 0026 e 0028 copiados sem mudar o texto; cb1a80d: simulavel opcional, METRICAS_SEM_SIMULACAO, podeSimular, corpoSemDadoReal, docs/api/metricas.md, testes T-C1, T-C2, T-S1; servico.ts sem edição porque o portão já usa corpoSemDadoReal); contratos, metricas e mock com cobertura 100%; server com a falha da linha 167 corrigida e só os dois arquivos rodados de novo; pnpm install com --store-dir na scratchpad (store somente leitura no sandbox). DECISÃO TÉCNICA (Jarvis): conferência da entrega; depois review e QA do L1 ao mesmo tempo, com o QA rodando a suíte inteira do server; o L2 do react-frontend começa na mesma branch depois do review do L1. MELHORIA: o store do pnpm é somente leitura no sandbox; o brief manda --store-dir em $TMPDIR.
- 2026-11-04 22:24: Entrega do L1 conferida como não cumprida só pela base: o brief manda avançar a branch até a develop (merge --ff-only), e a develop andou para 97ec7af (PR 220) depois do Base-sha d2ec79d do brief; de 97ec7af até cb1a80d só há os 7 arquivos do Entregar, cópias do desenho e das ADRs iguais byte a byte. DECISÃO TÉCNICA (Jarvis): sem volta ao autor; a base do L1 passa a ser 97ec7af9055f247297ecdedda910cbac54562d72 nos briefs seguintes; review e QA do L1 seguem. Aviso do conferente anotado: a aba Apontamento fica fora pela rota, como o desenho diz, e não pela lista METRICAS_SEM_SIMULACAO.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*`, não chama as APIs externas e não roda nada contra a base real.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- O parecer é gravado inteiro pela ferramenta Write, com `pedido: 070-simulado-por-cartao`, `branch: feature/070-simulado-por-cartao`, `commit: cb1a80d1a4e38bcb738a03bc75a1e1f3c799bd80`, veredito e bloco `## Achados` (até 300 caracteres por achado, severidade só entre parênteses, regra citada só pelo ID); o pre-push e o forge-check docs barram frase de regra copiada.
- Outros pareceres são gravados ao mesmo tempo nesta worktree: `git -C /home/rodrigoisensee/MetricasDSPD-052f pull --ff-only origin feature/070-simulado-por-cartao` antes do commit; `git -C /home/rodrigoisensee/MetricasDSPD-052f add <parecer>` e `git -C /home/rodrigoisensee/MetricasDSPD-052f commit -m <mensagem> -m 'Cartão: K-221' -- <parecer>` (sem heredoc e sem pipe); se der index.lock ou push recusado por estar atrás, espere uns segundos, faça o pull e repita; se o push disser cannot lock ref, confira o `git ls-remote` antes de repetir.
- NÃO tocar: código, testes, os outros pareceres, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho de como o cartão escolhe real ou simulado (quais métricas estão sem dado real hoje, de onde vem o simulado, contrato da API) e a ADR nova que revê a 0026." · etapa de outra delegação; continua no pedido
- "E1.2 (ux-designer): especificação do selo "Simulado" e do texto de explicação, com protótipo para o dono validar." · etapa de outra delegação; continua no pedido
- "E1.3 (node-backend): implementação na API." · etapa de outra delegação; continua no pedido
- "E1.4 (react-frontend): implementação nos cartões." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): code review." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface." · etapa de outra delegação; continua no pedido
- "E1.8 (tech-lead): PR para a develop e merge." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052f show origin/feature/070-simulado-por-cartao:docs/qa/070-l1.md` · espera: contém 'commit: cb1a80d1a4e38bcb738a03bc75a1e1f3c799bd80'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).