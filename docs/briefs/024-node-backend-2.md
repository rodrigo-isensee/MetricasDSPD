## Objetivo
Corrigir a documentação que o review rodada 1 do pedido 024 (parecer em d2295e8, sobre 2de5d80) reprovou: o código está aprovado, mas documentos ainda descrevem o E7 com R$ (`praticas.md` §8 item 10: documentação faltando bloqueia). Cartão K-114. Worktree `/home/rodrigoisensee/MetricasDSPD-024`, branch `feature/024-e7-sem-reais` (d2295e8).

## Ler
- O parecer de review `024-e7-sem-reais.md` na pasta de pareceres de review da worktree: os achados A-1 a A-4 e A-6.
- `docs/architecture/regras-metricas.md` perto da linha 143; `docs/tecnica/biblioteca-de-calculo.md` perto das linhas 153, 188 e 265; `docs/api/metricas.md` perto da linha 268.

## Entregar
- (E1) A-1: `docs/architecture/regras-metricas.md:143` deixa de dizer "E7 com R$ por fixture".
- (E1) A-2 a A-4: `docs/tecnica/biblioteca-de-calculo.md:153`, `:188` e `:265` deixam de citar `custoDoPeriodo`, o custo do E7 e a Q-E7-1 como vigentes (podem ficar como histórico revisto pela D2 = A, com data).
- (E3) A-6 (recomendado): `docs/api/metricas.md:268` deixa de listar "E8: período".
- (E4) Nada a corrigir: o `concluidoEm` do E6 foi entregue em beb71c6 e aprovado no review rodada 1; não mexa nele.
- (E1, E3) `pnpm run docs:check` da raiz da worktree; commit só desses três documentos, `git add` por caminho, conforme `docs/engineering/praticas.md`, e push.
- Fora do escopo, outras etapas do pedido 024 (citadas de "## Etapas"; E1.1, E3.1, E4.1, E2.1 e E1.2 rodada 1 já feitas): "E1.4 (forge:react-frontend): ajustar o teste do front que lê `custoConfigurado`, depois de trazer a develop com o #108 (acrescentada em 2026-10-17, risco do review rodada 1)."; "E1.2 (forge:tech-lead): review." (rodada 2, depois desta); "E1.3 (forge:qa-engineer): QA."; "E2.1 (forge:software-architect): plano §2 E7 e ADR." (o A-5, linha 301 do plano, é do arquiteto, em paralelo); "E2.2 (forge:ux-designer): CA do E7 na especificação."
- Fora do escopo: o plano do 011 (`docs/architecture/features/metricas-tambem-disponiveis.md`, do arquiteto); código e testes (aprovados); o PR; o nome do E7.

## Decisões e restrições
- Decisão do usuário D2 = A (pedido 011, 2026-10-17): o E7 mostra a participação percentual de cada sistema pelas entregas do período, sem R$; a D-1' e a Q-E7-1 deixam de valer. Horas apontadas não entram (seção 7.1 do briefing).
- Decisões técnicas do time (pedido 024, 2026-10-17): os achados de documentação voltam ao node-backend (A-1 a A-4, A-6) e ao arquiteto (A-5), em paralelo.
- NÃO tocar: código, testes, `web/`, `e2e/`, `.github/`, o plano do 011 (o arquiteto edita em paralelo, sem commit: não o inclua no seu commit), o parecer de review, a `main`, a develop direto, o diretório principal e as outras worktrees. Sem `--no-verify` nem `--force`.
- Teto: 2 agentes de dia e 3 à noite (agora, noite: 3), uma tarefa pesada por vez (restrição do usuário de 2026-10-17, pedido 024, "Restrições do usuário"): só o `docs:check`.

## Pronto quando
- PQ-1 (push): commit das correções de documentação em `feature/024-e7-sem-reais` no origin.
- PQ-2 (cmd): `pnpm run docs:check` da raiz de `/home/rodrigoisensee/MetricasDSPD-024` · espera: rc=0
- PQ-3 (cmd): `grep -n -E "custoDoPeriodo|Q-E7-1|R\\$ por fixture" /home/rodrigoisensee/MetricasDSPD-024/docs/architecture/regras-metricas.md /home/rodrigoisensee/MetricasDSPD-024/docs/tecnica/biblioteca-de-calculo.md | grep -v -E "D2 = A|revist"` · espera: linhas=0

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (sha); riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
