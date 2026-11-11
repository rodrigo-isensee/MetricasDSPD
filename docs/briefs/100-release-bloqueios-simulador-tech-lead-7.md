## Objetivo
Release 100, degrau da homolog: a develop atual (PRs 315 a 324; PR 325, K-271, mesclado pelo dono durante a release, com review e QA próprios aprovados; PR 326, CHANGELOG e pareceres da release) vai à homolog por PR, com o portão verde. Worktree `/home/rodrigoisensee/MetricasDSPD-052h` (só para rodar o `gh` e o `forge-check` a partir do repositório).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052h/docs/engineering/fluxo-homologacao.md`, seção da promoção para a homolog.
- Os pareceres `docs/reviews/100-release.md`, `docs/security/100-release.md` e `docs/qa/100-release.md`, que o PR 326 levou à develop: ler com `git show` sobre `origin/develop` na worktree 052h.

## Entregar
- "E1.5 (tech-lead): PR da develop para a homolog, portão verde; o merge é do dono." (E1.5)
- (E1) (E1.5) Conferir que o CI da develop na ponta atual (com o PR 326) terminou verde; se ainda estiver na fila ou vermelho, espere ou relate. Abrir o PR da develop para a homolog (`--base homolog --head develop`; corpo gravado por Write num arquivo do scratchpad e passado com `--body-file`; `Cartão: K-204`; a lista dos PRs; os PRs mesclados com checks rodando, conforme os pareceres da release; o aviso ao dono para validar na homolog o Operacional sem números simulados e os bloqueios reais, e o Horas por tipo agrupado no Apontamento) e esperar o portão da homolog em laços de até 170 s por chamada, com uma leitura final de `gh pr checks`. Relatar cada check e dizer no fim se o PR está todo verde. Não mesclar: o merge é do dono. Sem commit nem push nesta delegação.
- arquivos: nenhum

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo
## Pronto quando
- PQ-1 (cmd): `gh pr list --base homolog --head develop --state all --json number` · espera: contém 'number'
## Relatório
