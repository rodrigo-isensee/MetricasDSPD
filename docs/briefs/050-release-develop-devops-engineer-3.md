Agente destino: forge:devops-engineer
Pedido: 050-release-develop
Tipo: codigo
Branch: docs/050-devops-commit   Base: develop   Base-sha: d3095a71653c0ea50d5b0e6ab46b1fcc5727d7ee
Etapa: codigo   Cobre: E1.11

## Objetivo
Etapa E1.11 do pedido 050: o `forge-check pr 050-release-develop --ref origin/homolog --base origin/main` sai com rc=1 e acusa `docs/devops/050-release-develop.md: autoria: sem registro de que o papel devops gravou esta versão; o devops deve escrevê-lo (R-REVIEW)`. O registro de autoria (`/home/rodrigoisensee/MetricasDSPD/.forge/run/autoria.jsonl`) só tem a versão do seu parecer de 2e322ff; a versão que você escreveu na E1.8 (e42d03f, levada à `origin/homolog` pelo squash a6e75433716727edc3256419740f384775290a66 do PR #167 com o mesmo conteúdo, sha256 do texto `047afbcc46930455c0b5dd0e9cd0158be2f209974b7b605cd4e099e0e94b506b`) não ficou registrada. Sem isso, o PR de release das operacionais O19 a O26 para a `main` (E3.1) não abre. Worktree `/home/rodrigoisensee/MetricasDSPD-050`, branch `docs/050-devops-commit` (já mesclada pelo PR #167; o arquivo nela é igual ao da `origin/homolog`).

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-050 show origin/homolog:docs/devops/050-release-develop.md` (o seu parecer, a versão a regravar).

## Entregar
- "E1.11 (devops-engineer): regravar com a ferramenta Write o parecer `docs/devops/050-release-develop.md` na worktree 050, com o conteúdo idêntico ao da `origin/homolog` (sha256 do texto 047afbcc46930455c0b5dd0e9cd0158be2f209974b7b605cd4e099e0e94b506b), para o registro de autoria da versão escrita na E1.8; sem mudar conteúdo, sem commit." (E1.11), com:
  - (E1) Leia `/home/rodrigoisensee/MetricasDSPD-050/docs/devops/050-release-develop.md` com a ferramenta Read e regrave-o com a ferramenta Write (não Bash, não sed) com exatamente o mesmo conteúdo; nenhuma mudança de texto.
  - (E1) Depois, `git -C /home/rodrigoisensee/MetricasDSPD-050 status --short` não deve listar o arquivo (conteúdo idêntico), e `forge-check pr 050-release-develop --ref origin/homolog --base origin/main`, rodado de dentro da worktree, deve sair com rc=0; se acusar algo, pare e relate.
- (E2, E3) Nada a entregar aqui: não nesta delegação (tag e PR para a `main` são do tech-lead).

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
- "E1.10 (tech-lead): parecer de review da branch `docs/050-devops-commit` em `docs/reviews/050-devops-commit.md` (`branch: docs/050-devops-commit`), commit e push na branch, sem PR; o hook de parecer exige review próprio da branch antes do PR da E1.9." · etapa de outra delegação; já entregue (6091bbc)
- "E1.9 (tech-lead): PR da `docs/050-devops-commit` para a `develop` (squash) e merge com os checks verdes; PR `develop` → `homolog` (merge commit) e merge depois do portão da CI verde." · etapa de outra delegação; já entregue (PR #167 em a6e7543, PR #168 em ca8710b)
- "E2.1 (tech-lead): tag `vX.Y.Z-rc.1` no HEAD da `homolog` depois do merge (§8)." · etapa de outra delegação; já entregue (v0.2.0-rc.1 em ca8710b)
- "E3.1 (tech-lead): PR de release `homolog` → `main` com as notas de versão." · etapa de outra delegação; continua no pedido
- "E3.2 (dono): validar e mesclar o PR de release na `main`; tag final conforme §8." · etapa de outra delegação; continua no pedido
- Mudar o texto de qualquer parecer; commit, push, PR, tag e merge; código, CHANGELOG e workflows; as branches do 048 em andamento; o quadro e os arquivos de pedido; ler ou editar o `.env`; editar `.forge/` à mão.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-29): recibo do 050 aceito ("isso"): E1 a E3 entram; as branches do 048 em andamento e o K-178 ficam fora.
- DECISÃO DO DONO (2026-10-29): "ta suba tudo que estiver pronto na homol em uma versao nova e depois para main"
- DECISÃO DO DONO (2026-10-29): "A" (LACUNA R-PROVA): a checagem do Desde fica dispensada nas entregas E1.8, E1.9 e E2.1; PQs, escopo e conteúdo continuam conferidos.
- DECISÃO DO DONO (2026-10-29): "A" (LACUNA R-PROVA estendida): a mesma dispensa vale para a entrega E1.10, inclusive o arquivo do devops da E1.8 na comparação; PQs, escopo e conteúdo continuam conferidos.
- DECISÃO DO DONO (2026-10-29): "A" (LACUNA R-PROVA na tag): a entrega E2.1 fica aceita sem o escopo do intervalo (a tag não tem diff próprio) e sem a marca da E1.11, criada depois da aprovação do brief; PQ-1, portão e ausência de commit continuam conferidos.
- O registro de autoria é feito pelo hook do Forge quando o papel devops grava o arquivo com Write ou Edit; não escreva em `.forge/run/autoria.jsonl` nem o contorne (R-CONFORMIDADE).
- O hook barra `$`, `$?`, crase, chaves e `?` no Bash: comandos literais, um por linha.
- R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`. R-MAIN: nada na `main`.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-050 status --short docs/devops/050-release-develop.md` · espera: linhas=0
- PQ-2 (cmd): `forge-check pr 050-release-develop --ref origin/homolog --base origin/main` (de dentro de `/home/rodrigoisensee/MetricasDSPD-050`) · espera: rc=0

## Relatório
Até 8 linhas, resultado real: se o arquivo ficou idêntico e a saída do `forge-check pr`; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
