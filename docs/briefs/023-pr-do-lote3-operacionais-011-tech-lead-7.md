Agente destino: forge:tech-lead
Pedido: docs/pedidos/023-pr-do-lote3-operacionais-011.md
Branch: docs/023-pareceres-promocao   Base: develop   Base-sha: ed6ba46f39ed98fa76972c9fffe12c982f223e7f

## Objetivo
Abrir e mesclar o PR só de documentação dos pareceres da promoção (branch `docs/023-pareceres-promocao`, head e099686c8e3cedb36c004e281e31dcd7685e1365), que o hook `parecer` barrou. Causa achada pelo Jarvis: o hook libera PR só de `.md`, mas compara com a branch local `develop`, que está atrasada (48b909a1d09989b03a371e64e457ff3b76e8883b, contra origin/develop ed6ba46f39ed98fa76972c9fffe12c982f223e7f); por isso o diff parecia trazer código. Etapa E1.5 do pedido 023. Worktree `/home/rodrigoisensee/MetricasDSPD-023`.

## Ler
- O código do hook, só a função `verificar` (linhas 158 a 175 de `/home/rodrigoisensee/.claude/plugins/cache/forge/forge/0.19.0/hooks/parecer.py`): o desvio para "só documentação".
- Na worktree: `git diff --name-only origin/develop...HEAD` (deve listar só os dois pareceres).

## Entregar
- (E1) Atualizar a referência local `develop` para origin/develop (`git fetch origin develop:develop`, só avanço rápido; se o git recusar por não ser avanço rápido, pare e relate). Não faça push na `develop`.
- (E1) Abrir o PR `docs/023-pareceres-promocao` → `develop` com `--base develop` (corpo: os dois pareceres da promoção, o motivo, que é a decisão do dono de 2026-10-17, e as linhas de atribuição da sessão); com os checks exigidos verdes e o PR fora de `BEHIND`, mesclar por squash usando o nome da branch no `gh pr merge`.
- (E1) Depois do merge: apagar a branch local e a remota; deixar a worktree `-023` (o Jarvis remove depois).

## Fora do escopo
- "E1.4 (forge:qa-engineer): parecer de QA da promoção em `docs/qa/023-pr-do-lote3-operacionais-011.md`, na mesma branch, com a CI da develop como prova" · etapa de outro papel, já feita.
- "E1.2 (dono): merge do release homolog → main." · etapa do dono.
- Abrir ou mesclar o PR de promoção develop → homolog (vem depois, por outro brief); mudar os pareceres (conteúdo ou frontmatter); o PR #113; o quadro (`KANBAN.md`), que é do Jarvis.

## Decisões e restrições
- DECISÃO DO DONO (pedido 023, 2026-10-17): "A regra do projeto nunca passa sobre a fábrica"; para esta promoção vale a tabela de etapas da fábrica (opção B).
- Decisão técnica do Jarvis (pedido 023, 2026-10-17): o frontmatter `branch: develop` dos dois pareceres fica como está, porque eles servem ao PR de promoção (head `develop`); o PR de documentação passa pelo desvio "só documentação" do próprio hook, com a `develop` local atualizada.
- Squash na `develop` (`CLAUDE.md` do projeto). R-MAIN: nada na `main`. R-VERIFY: sem `--no-verify` nem `--force`; sem `--admin`. R-CONFORMIDADE: bloqueio não se contorna; se o hook barrar de novo, pare e relate a mensagem.
- NÃO tocar: o diretório principal, a worktree `-011-fase2`, `.github/`.
- Teto: 2 agentes de dia, uma tarefa pesada por vez (restrição do usuário de 2026-10-17, pedido 024, "Restrições do usuário"): nenhuma tarefa pesada nesta etapa.

## Pronto quando
- PQ-1 (pr): PR `docs/023-pareceres-promocao` → `develop` aberto.
- PQ-2 (merge): PR mesclado na `develop` por squash.
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD ls-remote --heads origin docs/023-pareceres-promocao` · espera: linhas=0
- PQ-4 (arquivo): `git -C /home/rodrigoisensee/MetricasDSPD fetch -q origin` e depois `git -C /home/rodrigoisensee/MetricasDSPD show origin/develop:docs/qa/023-pr-do-lote3-operacionais-011.md` mostra o parecer de QA.

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (número do PR, checks, sha do merge); riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
