Agente destino: forge:react-frontend
Pedido: 070-simulado-por-cartao
Tipo: codigo
Branch: feature/070-simulado-por-cartao   Base: develop   Base-sha: 97ec7af9055f247297ecdedda910cbac54562d72
Etapa: codigo   Cobre: E1.4

## Objetivo
Volta 2 do L2 do 070 nos cartões: corrigir A-9, A-10 e A-11 da revisão de interface v1 e A1 e A2 do review 070-v1 sobre a ponta c193313e32133c8ee1283672e0cbc6cd53a804a9 (pedido 070, E1.4, K-221). Worktree `/home/rodrigoisensee/MetricasDSPD-052f`, branch `feature/070-simulado-por-cartao`.

## Ler
- Os achados: `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/ux/070-selo-simulado/revisao-v1.md` (A-9, A-10, A-11) e `/home/rodrigoisensee/MetricasDSPD-052f/docs/reviews/070-v1.md` (A1, A2).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/ux/070-selo-simulado/especificacao.md` (CA-3, CA-13) e `/home/rodrigoisensee/MetricasDSPD-052f/docs/analises/070-desenho.md` (R6).

## Entregar
- "E1.4 (react-frontend): implementação nos cartões." (E1.4)
- (E1) (E3) (E1.4) `git -C /home/rodrigoisensee/MetricasDSPD-052f pull --ff-only origin feature/070-simulado-por-cartao`; corrigir: (1) A-9: o selo "Desvio acima de 10 p.p." do T3 (`CartaoT3.tsx`) não aparece no cartão simulado, pelo mesmo contexto do cartão simulado, com teste que falha antes da correção; (2) A-10: o botão "O que é simulado?" tem alvo de 44 px também no desktop, sem mudar a regra `.alvo` de `tokens.css` para os outros componentes, com teste; (3) A-11: a marca d'água fica contida na área do gráfico (overflow escondido), sem escapar em 320 px; (4) A1 do review: a hora de corte não puxa o pacote mock inteiro para a thread principal (carga sob demanda, como o resto do simulado); (5) A2 do review: o teste de `motivoSemSigla` usa as constantes de `origem.ts`, não frases copiadas; vitest do web com cobertura 100 por cento, no máximo 2 workers; `npx eslint .` com cwd em `web/`, `pnpm exec prettier --check web packages tools` e `pnpm run docs:check` verdes; commits com `git -C /home/rodrigoisensee/MetricasDSPD-052f add <arquivos>` e `git -C /home/rodrigoisensee/MetricasDSPD-052f commit -m <mensagem> -m 'Cartão: K-221' -- <arquivos>` (sem heredoc e sem pipe); push com `git -C /home/rodrigoisensee/MetricasDSPD-052f push origin HEAD:refs/heads/feature/070-simulado-por-cartao`; sem PR.
- (E2) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "Não consigo deixar os dados reais nas que já são possíveis fazer e nas que não deixar mocado?" e, ao recibo ("vou fazer: painel com dado real só com o real; sem dado real, o simulado com o selo Simulado visível; ADR nova revendo a 0026; não vou fazer: misturar real e simulado no mesmo gráfico, misturar BusinessMap e Acelerato, simulado em métrica individual; a troca é por cartão"), respondeu "Sim": dado simulado por cartão onde ainda não há dado real, com selo visível.
- DECISÃO DO DONO (2026-11-04): "A" (validação do protótipo docs/ux/070-selo-simulado/prototipo.html): protótipo aprovado como está (selo no cabeçalho, faixa com "O que é simulado?", borda tracejada, marca d'água, prefixo "Exemplo:"); ponto de compromisso do 070.
- DECISÃO DO DONO (2026-11-04): "A" (cartão simulado no resumo): o cartão com dado simulado fica fora de "O que pede atenção agora" e da Visão geral; só aparece na própria aba, com o selo; o resumo mostra só dado real.
### ADRs citadas no Histórico deste pedido (não no registro 064)
- ADR 0026 (citada no pedido): revista pela 0028
- ADR 0028 (citada no pedido): a decisão que este lote implementa
- ADR 0021 (citada no pedido): o simulado roda no Web Worker dela, só no navegador; nada muda nela
### Do Histórico deste pedido, docs/pedidos/070-simulado-por-cartao.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-05 01:12: Volta 2 do L2 ao react-frontend: review 070-v1 aprovado (4cd1271; A1: FonteComSimulado.ts importa o pacote mock inteiro na thread principal só para a hora de corte; A2: o teste de motivoSemSigla copia as frases em vez de usar as constantes); QA 070-v1 aprovado (c193313, 0 bugs, suítes com cobertura 100%); revisão de interface v1 aprovada com ressalvas (A-9 médio e A-10 baixo pendentes). DECISÃO TÉCNICA (Jarvis): brief único ao react-frontend sobre c193313 com A-9 (o selo do T3 some no cartão simulado), A-10 (alvo de 44 px no botão "O que é simulado?" sem mexer na regra .alvo global), A-11 (marca d'água com overflow contido) e A1 e A2 do review; A-12 fica como dívida, porque o estado "Sem dado real" não é do 070 e o texto dele não muda sem o dono; depois review, QA e revisão de interface só do delta, e o PR.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*` e não chama as APIs externas.
- Regras invioláveis do CLAUDE.md: nenhuma métrica individual (nem simulada), BusinessMap e Acelerato nunca se misturam, real e simulado nunca no mesmo gráfico ou número, todo cálculo pela biblioteca compartilhada.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: `server/`, `packages/`, as ADRs, o desenho, a especificação e a revisão do UX, os pareceres, o texto validado do cabeçalho ("N cartões sem dado real"), o estado "Sem dado real" (A-12 fica como dívida), outras worktrees, o `CLAUDE.md`, os arquivos `.env*` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho de como o cartão escolhe real ou simulado (quais métricas estão sem dado real hoje, de onde vem o simulado, contrato da API) e a ADR nova que revê a 0026." · etapa de outra delegação; continua no pedido
- "E1.2 (ux-designer): especificação do selo "Simulado" e do texto de explicação, com protótipo para o dono validar." · etapa de outra delegação; continua no pedido
- "E1.3 (node-backend): implementação na API." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): code review." · etapa de outra delegação; continua no pedido
- "E1.6 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface." · etapa de outra delegação; continua no pedido
- "E1.8 (tech-lead): PR para a develop e merge." · etapa de outra delegação; continua no pedido
- "E1.9 (tech-lead): trazer a develop para a branch do 070 e resolver o conflito, sem PR, antes do review, do QA e da revisão de interface da volta 1." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (push): `git -C /home/rodrigoisensee/MetricasDSPD-052f ls-remote origin feature/070-simulado-por-cartao` · espera: contém 'refs/heads/feature/070-simulado-por-cartao'
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052f diff --name-only c193313e32133c8ee1283672e0cbc6cd53a804a9 origin/feature/070-simulado-por-cartao -- web` · espera: linhas>=1

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).