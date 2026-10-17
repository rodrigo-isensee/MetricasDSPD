## Objetivo
Revisão de UX do front do lote 1 do pedido 011 (estratégicas: E9, E6, E7 sem R$, E8) contra a especificação validada e o protótipo. Inclui propor o título da seção nova, que fala em custo, quando o E7 não mostra mais custo pela decisão D2 = A do usuário. Cartão K-109, pedido 021. Worktree `/home/rodrigoisensee/MetricasDSPD-011-front-estrategicas`, branch `feature/011-front-estrategicas` (919554b).

## Ler
- `docs/pedidos/021-front-do-011-por-nivel.md`.
- `docs/ux/metricas-tambem-disponiveis/02-especificacao.md`: §3, §4, §5 do E6, E7, E8 e E9, §6, §9 e os CAs de §10 desses quatro.
- O protótipo em `/home/rodrigoisensee/MetricasDSPD-local/prototipos/metricas-tambem-disponiveis/03-prototipo/` (parte do Estratégico).
- Na worktree: `web/src/features/complementares/estrategicas.tsx`, `web/src/features/complementares/notas.ts` e `packages/contratos/src/cartoes.ts` (seção nova).

## Entregar
- (E1) Parecer de revisão em `docs/ux/revisao-011-front-estrategicas.md` na worktree (`pedido: 011-front-estrategicas`), gravado com Write: fidelidade à especificação e ao protótipo, estados (abaixo de 20, vazio, erro, dados fictícios), microcopy, acessibilidade, e os achados com severidade.
- (E1) No mesmo parecer, a proposta de título para a seção nova sem a ideia de custo (D2 = A: o E7 mostra a participação percentual de cada sistema pelas entregas), e a correção correspondente na §4 e na §5 do E7 da especificação, gravada com Write em `docs/ux/metricas-tambem-disponiveis/02-especificacao.md` na worktree.
- Fora do escopo, outras etapas do pedido 021 (citadas de "## Etapas"; E1.1 já feita): "E1.1 (forge:react-frontend): front do lote 1 numa branch a partir da develop."; "E1.4 (forge:tech-lead): code review do front do lote 1." (em paralelo a esta revisão); "E1.3 (forge:qa-engineer): QA do front do lote 1."
- Fora do escopo: mudar código (ajuste volta ao autor); o commit (o tech-lead ou o react-frontend commita os seus arquivos); os lotes 2 e 3.

## Decisões e restrições
- Decisões do usuário (pedido 011): R-1 = B (E8 sem nomes de sistema); D2 = A (E7 sem R$, participação percentual por entregas; revê a D-1' e a Q-E7-1); métricas por nível em lotes separados.
- Regras invioláveis do `CLAUDE.md`: nada de avaliação individual nem comparação entre times.
- NÃO tocar: código, testes, `.github/`, a `main`, o diretório principal e as outras worktrees.

## Pronto quando
- PQ-1 (arquivo): `docs/ux/revisao-011-front-estrategicas.md` na worktree `/home/rodrigoisensee/MetricasDSPD-011-front-estrategicas`.
- PQ-2 (cmd): `grep -n -E "^pedido: 011-front-estrategicas" /home/rodrigoisensee/MetricasDSPD-011-front-estrategicas/docs/ux/revisao-011-front-estrategicas.md` · espera: linhas=1

## Relatório
Até 8 linhas: estado (aprovado, aprovado com ressalvas ou reprovado); o que precisa do usuário (o título novo, se ele mudar o sentido da seção); suposições (com a base); o que foi feito, com evidência; riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
