Agente destino: forge:devops-engineer
Pedido: 050-release-develop
Tipo: codigo
Branch: docs/050-devops-commit   Base: develop   Base-sha: d3095a71653c0ea50d5b0e6ab46b1fcc5727d7ee
Etapa: codigo   Cobre: E1.8

## Objetivo
Etapa E1.8 do pedido 050: o `forge-check pr 050-release-develop --ref origin/homolog --base origin/main` acusa o parecer de devops com `commit: 311691bace0582d80ea06ffc12f20096f1248b87` desatualizado, porque o `CHANGELOG.md` mudou depois. Sem o parecer em dia, o PR de release para a `main` (E3.1) não abre. Os pareceres de review, QA e segurança já apontam para o commit da versão `6aa0ac38c35e8298f50511077527368b53ca08f7`. Worktree `/home/rodrigoisensee/MetricasDSPD-050`, branch nova `docs/050-devops-commit` a partir da `origin/develop` (`d3095a71653c0ea50d5b0e6ab46b1fcc5727d7ee`).

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-050 show 6aa0ac38c35e8298f50511077527368b53ca08f7 --stat` e o diff desse commit (só `CHANGELOG.md` e `package.json`).
- `/home/rodrigoisensee/MetricasDSPD-050/docs/devops/050-release-develop.md` (o seu parecer, depois de criar a branch).

## Entregar
- "E1.8 (devops-engineer): volta do parecer de devops: `commit:` no commit da versão `6aa0ac38c35e8298f50511077527368b53ca08f7` (o `forge-check pr` contra a `main` o acusa desatualizado), na worktree 050, em branch nova `docs/050-devops-commit` a partir da `develop`; commit e push, sem PR." (E1.8), com:
  - (E1) Antes de tudo: `git -C /home/rodrigoisensee/MetricasDSPD-050 fetch origin` e `git -C /home/rodrigoisensee/MetricasDSPD-050 switch -c docs/050-devops-commit origin/develop`.
  - (E1) No parecer `docs/devops/050-release-develop.md`: `commit: 6aa0ac38c35e8298f50511077527368b53ca08f7` no frontmatter e uma linha curta dizendo que o commit da versão só muda `CHANGELOG.md` e `package.json` (versão), sem workflow nem dependência; o veredito muda só se você achar algo nesse diff.
  - (E1) Um commit só, `git add docs/devops/050-release-develop.md`, padrão de commits do `docs/engineering/praticas.md` (descrição no imperativo), em chamada própria do Bash; antes do push, `git -C /home/rodrigoisensee/MetricasDSPD-050 branch --show-current` deve dar `docs/050-devops-commit`; push com `git -C /home/rodrigoisensee/MetricasDSPD-050 push -u origin HEAD:refs/heads/docs/050-devops-commit`. Sem PR.
- (E2, E3) Nada a entregar aqui: não nesta delegação (tag e PR para a `main` são do tech-lead).

## Fora do escopo
- "E1.0 (tech-lead): worktree `/home/rodrigoisensee/MetricasDSPD-050` e branch `docs/promocao-2026-10-29` a partir da `develop` depois do merge do E5.3 do pedido 051; parecer de review da promoção no diretório de reviews com o nome `050-release-develop.md` (PR × review, riscos, rollback, no molde do parecer de promoção do 037); versão (E2): `package.json` raiz, `CHANGELOG.md` escrito à mão dos Conventional Commits (sem dependência nova) e commit `chore(release)`; commit e push, sem PR." · etapa de outra delegação; já entregue (89227a2 e 6aa0ac3)
- "E1.2 (qa-engineer): parecer do QA da candidata em `docs/qa/050-release-develop.md`, na worktree 050, com commit e push." · etapa de outra delegação; já entregue (3a20716)
- "E1.3 (devops-engineer): parecer de devops da promoção em `docs/devops/050-release-develop.md` (workflows e dependências do diff), na worktree 050, com commit e push." · etapa de outra delegação; já entregue (2e322ff)
- "E1.4 (security-engineer): parecer de segurança da promoção em `docs/security/050-release-develop.md`, na worktree 050 (sem Bash; o tech-lead o commita no E1.1)." · etapa de outra delegação; já entregue (83a6ca9)
- "E1.5 (tech-lead): volta do parecer de review: `commit:` no commit da versão `6aa0ac38c35e8298f50511077527368b53ca08f7` (inclui `CHANGELOG.md` e `package.json`), com a leitura desses dois arquivos no parecer; commit e push." · etapa de outra delegação; já entregue (172cd22)
- "E1.6 (qa-engineer): volta do parecer de QA: `commit:` no commit da versão `6aa0ac38c35e8298f50511077527368b53ca08f7` e a contagem da abertura corrigida (13 PRs com parecer, 7 isentos); commit e push." · etapa de outra delegação; já entregue (261a3f1)
- "E1.7 (security-engineer): volta do parecer de segurança: `commit:` no commit da versão `6aa0ac38c35e8298f50511077527368b53ca08f7`; o próprio security-engineer commita e envia o parecer (o `forge-check pr` exige que quem emitiu o parecer o commite, R-SEGURANCA)." · etapa de outra delegação; já entregue (83a6ca9)
- "E1.1 (tech-lead): depois de E1.5 a E1.7, PR da `docs/promocao-2026-10-29` para a `develop` (squash) e merge com os checks verdes; PR `develop` → `homolog` (merge commit) e merge depois do portão da CI verde." · etapa de outra delegação; já entregue (PR #165 e PR #166)
- "E1.9 (tech-lead): PR da `docs/050-devops-commit` para a `develop` (squash) e merge com os checks verdes; PR `develop` → `homolog` (merge commit) e merge depois do portão da CI verde." · etapa de outra delegação; continua no pedido
- "E2.1 (tech-lead): tag `vX.Y.Z-rc.1` no HEAD da `homolog` depois do merge (§8)." · etapa de outra delegação; continua no pedido
- "E3.1 (tech-lead): PR de release `homolog` → `main` com as notas de versão." · etapa de outra delegação; continua no pedido
- "E3.2 (dono): validar e mesclar o PR de release na `main`; tag final conforme §8." · etapa de outra delegação; continua no pedido
- Os outros pareceres; código, CHANGELOG e workflows; PR, tag e merge; as branches do 048 em andamento; o quadro e os arquivos de pedido; ler ou editar o `.env`.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-29): recibo do 050 aceito ("isso"): E1 a E3 entram; as branches do 048 em andamento e o K-178 ficam fora.
- DECISÃO DO DONO (2026-10-29): "ta suba tudo que estiver pronto na homol em uma versao nova e depois para main"
- O hook barra `$`, `$?`, crase, chaves e `?` no Bash: comandos literais, um por linha.
- R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`. R-MAIN: nada na `main`.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-050 show origin/docs/050-devops-commit:docs/devops/050-release-develop.md` · espera: contém 'commit: 6aa0ac38c35e8298f50511077527368b53ca08f7'
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-050 log --oneline origin/develop..origin/docs/050-devops-commit` · espera: linhas=1
- PQ-3 (push): `git ls-remote origin refs/heads/docs/050-devops-commit` igual ao head local

## Relatório
Até 8 linhas, resultado real: veredito (mudou ou não), sha do commit; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
