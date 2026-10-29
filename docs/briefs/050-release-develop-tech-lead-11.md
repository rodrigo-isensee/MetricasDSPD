Agente destino: forge:tech-lead
Pedido: 050-release-develop
Tipo: pr
Branch: homolog   Base: main   Base-sha: 7486836addd257f6f0bd358e946a5cfd7d1802b2
Etapa: pr   Cobre: E3.1

## Objetivo
Etapa E3.1 do pedido 050: abrir o PR de release `homolog` → `main` com as notas de versão, para o dono validar e mesclar (E3.2) e as operacionais O19 a O26 chegarem à `main`. A `homolog` está em `ca8710bd49f494cc33f56d1c956702071a879cab` (merge do PR #168, que trouxe o parecer de devops corrigido do PR #167); o portão da CI do push nesse sha (workflows "Homologação" e "CI") concluiu com `success`. Use a worktree `/home/rodrigoisensee/MetricasDSPD-050` só para ler a `origin/homolog`; nenhum commit nesta etapa. A tag `v0.2.0-rc.1` (E2.1) já está no remoto em `ca8710bd49f494cc33f56d1c956702071a879cab`; cite-a no corpo do PR. Retomada: o brief anterior (tech-lead-10) foi reprovado porque o `forge-check pr` contra a `main` acusava a autoria do parecer de devops; a etapa E1.11 (devops) trata disso antes desta.

## Ler
- `/home/rodrigoisensee/MetricasDSPD/docs/engineering/fluxo-homologacao.md`, só a seção 8 (Versionamento, tags e notas de versão).
- `git -C /home/rodrigoisensee/MetricasDSPD-050 show origin/homolog:CHANGELOG.md` (a seção 0.2.0).
- Na `origin/homolog`: `docs/qa/050-release-develop.md` (veredito e ressalvas), `docs/reviews/050-release-develop.md` (riscos e rollback), `docs/security/050-release-develop.md` e `docs/devops/050-release-develop.md` (só as recomendações).

## Entregar
- "E3.1 (tech-lead): PR de release `homolog` → `main` com as notas de versão." (E3.1), com:
  - (E3) Antes do PR, `forge-check pr 050-release-develop --ref origin/homolog --base origin/main`, rodado de dentro de `/home/rodrigoisensee/MetricasDSPD-050` depois de `git -C /home/rodrigoisensee/MetricasDSPD-050 fetch origin`, deve sair com rc=0; se acusar algo, pare e relate, sem PR.
  - (E3) PR `homolog` → `main`, título `release: v0.2.0`, corpo gravado com Write no caminho absoluto `/tmp/claude-1000/pr-050-release-develop.md` e passado com `--body-file`: o trecho 0.2.0 do CHANGELOG, o parecer do QA da candidata (caminho e veredito, com a ressalva da contagem 12/8 na seção Critério), os quatro pareceres (caminho e veredito), os riscos e o roteiro de rollback do parecer de review, a tag `v0.2.0-rc.1`, o merge commit como método (fluxo-homologacao §8) e a linha "o merge na `main` é do dono". Não mescle.
  - (E3) Depois de abrir o PR, acompanhe o check `homolog-aprovada` até concluir e diga no relatório o resultado.
- (E2) Nada a entregar aqui: não nesta delegação (a tag `v0.2.0-rc.1` é a etapa E2.1, já entregue).

## Fora do escopo
- "E1.0 (tech-lead): worktree `/home/rodrigoisensee/MetricasDSPD-050` e branch `docs/promocao-2026-10-29` a partir da `develop` depois do merge do E5.3 do pedido 051; parecer de review da promoção no diretório de reviews com o nome `050-release-develop.md` (PR × review, riscos, rollback, no molde do parecer de promoção do 037); versão (E2): `package.json` raiz, `CHANGELOG.md` escrito à mão dos Conventional Commits (sem dependência nova) e commit `chore(release)`; commit e push, sem PR." · etapa de outra delegação; já entregue (89227a2 e 6aa0ac3)
- "E1.1 (tech-lead): depois de E1.5 a E1.7, PR da `docs/promocao-2026-10-29` para a `develop` (squash) e merge com os checks verdes; PR `develop` → `homolog` (merge commit) e merge depois do portão da CI verde." · etapa de outra delegação; já entregue (PR #165 em d3095a7, PR #166 em 485578c, portão run 40905414149; o PR #168 depois levou a `homolog` a ca8710b)
- "E1.2 (qa-engineer): parecer do QA da candidata em `docs/qa/050-release-develop.md`, na worktree 050, com commit e push." · etapa de outra delegação; já entregue (3a20716)
- "E1.3 (devops-engineer): parecer de devops da promoção em `docs/devops/050-release-develop.md` (workflows e dependências do diff), na worktree 050, com commit e push." · etapa de outra delegação; já entregue (2e322ff)
- "E1.4 (security-engineer): parecer de segurança da promoção em `docs/security/050-release-develop.md`, na worktree 050 (sem Bash; o tech-lead o commita no E1.1)." · etapa de outra delegação; já entregue (commitado pelo autor no E1.7, 83a6ca9)
- "E1.5 (tech-lead): volta do parecer de review: `commit:` no commit da versão `6aa0ac38c35e8298f50511077527368b53ca08f7` (inclui `CHANGELOG.md` e `package.json`), com a leitura desses dois arquivos no parecer; commit e push." · etapa de outra delegação; já entregue (172cd22)
- "E1.6 (qa-engineer): volta do parecer de QA: `commit:` no commit da versão `6aa0ac38c35e8298f50511077527368b53ca08f7` e a contagem da abertura corrigida (13 PRs com parecer, 7 isentos); commit e push." · etapa de outra delegação; já entregue (261a3f1)
- "E1.7 (security-engineer): volta do parecer de segurança: `commit:` no commit da versão `6aa0ac38c35e8298f50511077527368b53ca08f7`; o próprio security-engineer commita e envia o parecer (o `forge-check pr` exige que quem emitiu o parecer o commite, R-SEGURANCA)." · etapa de outra delegação; já entregue (83a6ca9)
- "E1.8 (devops-engineer): volta do parecer de devops: `commit:` no commit da versão `6aa0ac38c35e8298f50511077527368b53ca08f7` (o `forge-check pr` contra a `main` o acusa desatualizado), na worktree 050, em branch nova `docs/050-devops-commit` a partir da `develop`; commit e push, sem PR." · etapa de outra delegação; já entregue (e42d03f)
- "E1.10 (tech-lead): parecer de review da branch `docs/050-devops-commit` em `docs/reviews/050-devops-commit.md` (`branch: docs/050-devops-commit`), commit e push na branch, sem PR; o hook de parecer exige review próprio da branch antes do PR da E1.9." · etapa de outra delegação; já entregue (6091bbc)
- "E1.9 (tech-lead): PR da `docs/050-devops-commit` para a `develop` (squash) e merge com os checks verdes; PR `develop` → `homolog` (merge commit) e merge depois do portão da CI verde." · etapa de outra delegação; já entregue (PR #167 em a6e7543, PR #168 em ca8710b)
- "E1.11 (devops-engineer): regravar com a ferramenta Write o parecer `docs/devops/050-release-develop.md` na worktree 050, com o conteúdo idêntico ao da `origin/homolog` (sha256 do texto 047afbcc46930455c0b5dd0e9cd0158be2f209974b7b605cd4e099e0e94b506b), para o registro de autoria da versão escrita na E1.8; sem mudar conteúdo, sem commit." · etapa de outra delegação; já entregue (sem commit; forge-check pr contra origin/main rc=0 às 16:02)
- "E2.1 (tech-lead): tag `vX.Y.Z-rc.1` no HEAD da `homolog` depois do merge (§8)." · etapa de outra delegação; já entregue (v0.2.0-rc.1 em ca8710b)
- "E3.2 (dono): validar e mesclar o PR de release na `main`; tag final conforme §8." · etapa de outra delegação; continua no pedido (do dono)
- Merge na `main`, tag final `v0.2.0`, commit em qualquer branch, mudar pareceres, CHANGELOG ou workflows; as branches do 048 em andamento; o quadro e os arquivos de pedido; ler ou editar o `.env`; apagar branch remota ou worktree (ação do dono depois do merge).

## Decisões e restrições
- DECISÃO DO DONO (2026-10-29): recibo do 050 aceito ("isso"): E1 a E3 entram; as branches do 048 em andamento e o K-178 ficam fora.
- DECISÃO DO DONO (2026-10-29): "ta suba tudo que estiver pronto na homol em uma versao nova e depois para main"
- DECISÃO DO DONO (2026-10-29): "A" (LACUNA R-PROVA): a checagem do Desde fica dispensada nas entregas E1.8, E1.9 e E2.1; PQs, escopo e conteúdo continuam conferidos.
- DECISÃO DO DONO (2026-10-29): "A" (LACUNA R-PROVA estendida): a mesma dispensa vale para a entrega E1.10, inclusive o arquivo do devops da E1.8 na comparação; PQs, escopo e conteúdo continuam conferidos.
- DECISÃO DO DONO (2026-10-29): "A" (LACUNA R-PROVA na tag): a entrega E2.1 fica aceita sem o escopo do intervalo (a tag não tem diff próprio) e sem a marca da E1.11, criada depois da aprovação do brief; PQ-1, portão e ausência de commit continuam conferidos.
- Erro recorrente deste destino (forge-check, 30 dias): escopo em 6 entregas · evita: cada item do Entregar cita a etapa `(E<n>)` do pedido; só corta com a marca de corte (R-BRIEF, R-DECISAO)
- Erro recorrente deste destino (forge-check, 30 dias): base em 4 entregas · evita: gere o brief de novo com `--branch`, para o Base-sha real (BRIEF-BASE-ATUAL)
- Erro recorrente deste destino (forge-check, 30 dias): etapa em 2 entregas · evita: confira a ordem das etapas do pedido e `forge-check pr <pedido>`; marque toda etapa de outra instância do mesmo agente (D-ETAPAS)
- Check vermelho não se roda de novo para ver se passa: se o `homolog-aprovada` falhar, pare, relate o check, o log resumido e a causa provável (por exemplo a corrida do K-108); nada de contornar (R-CONFORMIDADE).
- R-MAIN: a `main` é do dono; nenhum merge, push ou commit na `main`, nenhuma aprovação do PR em nome do dono.
- O alerta Dependabot 12 (dompurify) que o GitHub mostra é do K-178, fora deste pedido; cite-o no corpo do PR como risco conhecido que a release não piora.
- O hook barra `$`, `$?`, crase, chaves e `?` no Bash: comandos literais, um por linha; o corpo do PR vai por Write e `--body-file`, nunca heredoc junto do `gh pr create`.
- R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`.

## Pronto quando
- PQ-1 (pr): `gh pr list --base main --head homolog --state open --json number --jq length` · espera: igual '1'
- PQ-2 (cmd): `gh pr checks homolog` · espera: contém 'homolog-aprovada'

## Relatório
Até 8 linhas, resultado real: o número do PR, o resultado do `homolog-aprovada` e dos demais checks; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
