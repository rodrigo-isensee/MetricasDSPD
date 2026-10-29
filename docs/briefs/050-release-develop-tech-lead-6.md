Agente destino: forge:tech-lead
Pedido: 050-release-develop
Tipo: codigo
Branch: docs/050-devops-commit   Base: develop   Base-sha: d3095a71653c0ea50d5b0e6ab46b1fcc5727d7ee
Etapa: merge-integracao   Cobre: E1.9

## Objetivo
Etapa E1.9 do pedido 050: levar à `develop` e à `homolog` o parecer de devops atualizado para o commit da versão (E1.8), para que o `forge-check pr` contra a `main` passe e o PR de release das operacionais O19 a O26 (E3.1) possa abrir. Worktree `/home/rodrigoisensee/MetricasDSPD-050`, branch `docs/050-devops-commit` (um commit sobre `d3095a71653c0ea50d5b0e6ab46b1fcc5727d7ee`).

## Ler
- `/home/rodrigoisensee/MetricasDSPD/docs/engineering/fluxo-homologacao.md`, só as seções 3 (Quem mescla) e 4 (Gates e checks por branch).

## Entregar
- "E1.9 (tech-lead): PR da `docs/050-devops-commit` para a `develop` (squash) e merge com os checks verdes; PR `develop` → `homolog` (merge commit) e merge depois do portão da CI verde." (E1.9), com:
  - (E1) Antes do PR, `forge-check pr 050-release-develop` rodado de dentro da worktree `/home/rodrigoisensee/MetricasDSPD-050`, na branch `docs/050-devops-commit`, deve sair com rc=0; se acusar algo, pare e relate, sem PR.
  - (E1) PR da `docs/050-devops-commit` para a `develop`, título no padrão de commits do `docs/engineering/praticas.md` com a descrição no imperativo (o título do PR #165 saiu sem o imperativo), corpo curto citando o motivo (o `forge-check pr` contra a `main` acusou o `commit:` do parecer de devops); espere os checks obrigatórios verdes e mescle com squash pelo nome da branch (`gh pr merge docs/050-devops-commit --squash`).
  - (E1) PR `develop` → `homolog` com merge commit (corpo: o PR acima e o motivo); espere os checks do PR verdes e mescle pelo nome da branch (`gh pr merge develop --merge`); depois acompanhe o portão da CI disparado pelo push na `homolog` até concluir.
  - (E1) Depois do portão, `forge-check pr 050-release-develop --ref origin/homolog --base origin/main` (de dentro da worktree, depois de `git -C /home/rodrigoisensee/MetricasDSPD-050 fetch origin`) deve sair com rc=0; diga no relatório a saída.
- (E2, E3) Nada a entregar aqui: não nesta delegação (tag na etapa E2.1; o PR para a `main` é a etapa E3.1).

## Fora do escopo
- "E1.0 (tech-lead): worktree `/home/rodrigoisensee/MetricasDSPD-050` e branch `docs/promocao-2026-10-29` a partir da `develop` depois do merge do E5.3 do pedido 051; parecer de review da promoção no diretório de reviews com o nome `050-release-develop.md` (PR × review, riscos, rollback, no molde do parecer de promoção do 037); versão (E2): `package.json` raiz, `CHANGELOG.md` escrito à mão dos Conventional Commits (sem dependência nova) e commit `chore(release)`; commit e push, sem PR." · etapa de outra delegação; já entregue (89227a2 e 6aa0ac3)
- "E1.1 (tech-lead): depois de E1.5 a E1.7, PR da `docs/promocao-2026-10-29` para a `develop` (squash) e merge com os checks verdes; PR `develop` → `homolog` (merge commit) e merge depois do portão da CI verde." · etapa de outra delegação; já entregue (PR #165 e PR #166)
- "E1.2 (qa-engineer): parecer do QA da candidata em `docs/qa/050-release-develop.md`, na worktree 050, com commit e push." · etapa de outra delegação; já entregue (3a20716)
- "E1.3 (devops-engineer): parecer de devops da promoção em `docs/devops/050-release-develop.md` (workflows e dependências do diff), na worktree 050, com commit e push." · etapa de outra delegação; já entregue (2e322ff)
- "E1.4 (security-engineer): parecer de segurança da promoção em `docs/security/050-release-develop.md`, na worktree 050 (sem Bash; o tech-lead o commita no E1.1)." · etapa de outra delegação; já entregue (83a6ca9)
- "E1.5 (tech-lead): volta do parecer de review: `commit:` no commit da versão `6aa0ac38c35e8298f50511077527368b53ca08f7` (inclui `CHANGELOG.md` e `package.json`), com a leitura desses dois arquivos no parecer; commit e push." · etapa de outra delegação; já entregue (172cd22)
- "E1.6 (qa-engineer): volta do parecer de QA: `commit:` no commit da versão `6aa0ac38c35e8298f50511077527368b53ca08f7` e a contagem da abertura corrigida (13 PRs com parecer, 7 isentos); commit e push." · etapa de outra delegação; já entregue (261a3f1)
- "E1.7 (security-engineer): volta do parecer de segurança: `commit:` no commit da versão `6aa0ac38c35e8298f50511077527368b53ca08f7`; o próprio security-engineer commita e envia o parecer (o `forge-check pr` exige que quem emitiu o parecer o commite, R-SEGURANCA)." · etapa de outra delegação; já entregue (83a6ca9)
- "E1.8 (devops-engineer): volta do parecer de devops: `commit:` no commit da versão `6aa0ac38c35e8298f50511077527368b53ca08f7` (o `forge-check pr` contra a `main` o acusa desatualizado), na worktree 050, em branch nova `docs/050-devops-commit` a partir da `develop`; commit e push, sem PR." · etapa de outra delegação; já entregue (e42d03f)
- "E2.1 (tech-lead): tag `vX.Y.Z-rc.1` no HEAD da `homolog` depois do merge (§8)." · etapa de outra delegação; continua no pedido
- "E3.1 (tech-lead): PR de release `homolog` → `main` com as notas de versão." · etapa de outra delegação; continua no pedido
- "E3.2 (dono): validar e mesclar o PR de release na `main`; tag final conforme §8." · etapa de outra delegação; continua no pedido
- Mudar pareceres, código, CHANGELOG ou workflows; tag; PR para a `main`; as branches do 048 em andamento; o quadro e os arquivos de pedido; ler ou editar o `.env`; apagar branch remota (ação do dono).

## Decisões e restrições
- DECISÃO DO DONO (2026-10-29): recibo do 050 aceito ("isso"): E1 a E3 entram; as branches do 048 em andamento e o K-178 ficam fora.
- DECISÃO DO DONO (2026-10-29): "ta suba tudo que estiver pronto na homol em uma versao nova e depois para main"
- Check vermelho não se roda de novo para ver se passa: pare, relate o check, o log resumido e a causa provável; nada de contornar (R-CONFORMIDADE).
- O alerta Dependabot 12 (dompurify) que o GitHub mostra no push é do K-178, fora deste pedido.
- O hook barra `$`, `$?`, crase, chaves e `?` no Bash: comandos literais, um por linha; corpo de PR por Write e `--body-file` (arquivo no `$TMPDIR` com o pedido no nome), nunca heredoc junto do `gh pr create`.
- R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`. R-MAIN: nada na `main`; nenhum PR para a `main` nesta etapa.

## Pronto quando
- PQ-1 (merge): `gh pr list --head docs/050-devops-commit --base develop --state merged --json number --jq length` · espera: igual '1'
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-050 merge-base --is-ancestor origin/develop origin/homolog` (depois de `git -C /home/rodrigoisensee/MetricasDSPD-050 fetch origin`) · espera: rc=0
- PQ-3 (run): `gh run list --branch homolog --event push --limit 1 --json conclusion --jq '.[0].conclusion'` · espera: igual 'success'

## Relatório
Até 8 linhas, resultado real: números e shas dos dois PRs e dos merges, o run do portão, a saída do `forge-check pr` contra a `main`; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
