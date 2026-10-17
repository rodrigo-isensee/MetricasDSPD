## Objetivo
Corrigir o achado A-5 do review rodada 1 do pedido 024 (parecer em d2295e8): a linha 301 do plano do 011 escreve `participacao: taxaSchema` sem anulável, mas o contrato e a linha 331 do próprio plano dizem anulável (`null` abaixo de 20 entregas no sistema). Cartão K-114. Worktree `/home/rodrigoisensee/MetricasDSPD-024`, branch `feature/024-e7-sem-reais`.

## Ler
- O parecer de review `024-e7-sem-reais.md` na pasta de pareceres de review da worktree: só o achado A-5.
- Na worktree: `docs/architecture/features/metricas-tambem-disponiveis.md`, linhas 295 a 335.
- Na worktree: `packages/contratos/src/tambem.ts`, o schema do E7 (o campo `participacao`).

## Entregar
- (E2) A linha 301 do plano passa a descrever `participacao` como anulável, coerente com o contrato e com a linha 331; nada mais no plano muda.
- (E2) ADR: nenhuma muda; nenhuma ADR guarda o custo do E7 (registrado no pedido 024, "Andamento", 2026-10-17); não mexa em ADR.
- (E2) Gravar a mudança no arquivo da worktree, sem commit (você não tem Bash): pela decisão técnica do time de 2026-10-17 (pedido 024, "Decisões técnicas do time"), o review do tech-lead (rodada 2) commita o plano num commit próprio.
- Fora do escopo, outras etapas do pedido 024 (citadas de "## Etapas"; E1.1, E3.1, E4.1 e E1.2 rodada 1 já feitas): "E1.1 (forge:node-backend): E7 sem R$, com participação percentual." (os achados A-1 a A-4 e A-6 voltam a ele, em paralelo); "E3.1 (forge:node-backend): contrato do E8 e do E9 alinhado à janela do cálculo."; "E4.1 (forge:node-backend): `concluidoEm` no contrato do E6."; "E1.4 (forge:react-frontend): ajustar o teste do front que lê `custoConfigurado`, depois de trazer a develop com o #108 (acrescentada em 2026-10-17, risco do review rodada 1)."; "E1.2 (forge:tech-lead): review."; "E1.3 (forge:qa-engineer): QA."; "E2.2 (forge:ux-designer): CA do E7 na especificação."
- Fora do escopo: código, testes, `docs/api`, `docs/tecnica`, `regras-metricas.md`; o PR; o nome do E7.

## Decisões e restrições
- Decisão do usuário D2 = A (pedido 011, 2026-10-17): o E7 mostra a participação percentual de cada sistema pelas entregas do período, sem R$; abaixo de 20 entregas no sistema, sem percentual (regra inviolável do `CLAUDE.md`).
- Decisões técnicas do time (pedido 024, 2026-10-17): os achados de documentação voltam ao node-backend (A-1 a A-4, A-6) e ao arquiteto (A-5), em paralelo.
- NÃO tocar: qualquer arquivo fora do plano do 011; código e testes; a `main`, a develop direto, o diretório principal e as outras worktrees.
- Teto: 2 agentes de dia e 3 à noite (agora, noite: 3), uma tarefa pesada por vez (restrição do usuário de 2026-10-17, pedido 024, "Restrições do usuário"): nada pesado nesta etapa.

## Pronto quando
- PQ-1 (cmd): `sed -n 301p /home/rodrigoisensee/MetricasDSPD-024/docs/architecture/features/metricas-tambem-disponiveis.md` · espera: contém 'participacao: taxaSchema | null'
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-024 diff --stat -- docs/architecture/features/metricas-tambem-disponiveis.md` · espera: contém '1 file changed'

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (a linha antes e depois; escreva a forma `participacao: taxaSchema | null`, como o A-5 sugere); riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
