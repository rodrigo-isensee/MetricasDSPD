Agente destino: forge:tech-lead
Pedido: 050-release-develop
Tipo: codigo
Branch: docs/promocao-2026-10-29   Base: develop   Base-sha: 311691bace0582d80ea06ffc12f20096f1248b87
Etapa: merge-integracao   Cobre: E1.1

## Objetivo
Etapa E1.1 do pedido 050: levar a promoção (pareceres de review, QA, devops e segurança, mais a versão 0.2.0) para a `develop` e a `develop` para a `homolog`, para a release das operacionais O19 a O26 chegar à `main` (E3). Worktree `/home/rodrigoisensee/MetricasDSPD-050`, branch `docs/promocao-2026-10-29` (ponta `261a3f13e2b671cac23afc6035e60d979a43befb` no origin).

## Ler
- `/home/rodrigoisensee/MetricasDSPD/docs/engineering/fluxo-homologacao.md`, só as seções 3 (Quem mescla) e 4 (Gates e checks por branch).
- `/home/rodrigoisensee/MetricasDSPD-050/docs/security/050-release-develop.md` e `/home/rodrigoisensee/MetricasDSPD-050/docs/devops/050-release-develop.md`, só as recomendações (A1 e A2 da segurança; as do devops).

## Entregar
- "E1.1 (tech-lead): depois de E1.5 a E1.7, PR da `docs/promocao-2026-10-29` para a `develop` (squash) e merge com os checks verdes; PR `develop` → `homolog` (merge commit) e merge depois do portão da CI verde." (E1.1), com:
  - (E1.1) Antes do PR, `forge-check pr 050-release-develop` rodado de dentro da worktree `/home/rodrigoisensee/MetricasDSPD-050` deve sair com rc=0; se acusar algo, pare e relate, sem PR.
  - (E1.1) PR da `docs/promocao-2026-10-29` para a `develop`, título no padrão de commits do `docs/engineering/praticas.md`, corpo com a tabela dos quatro pareceres (caminho e veredito) e a versão 0.2.0; espere os checks obrigatórios verdes e mescle com squash pelo nome da branch (`gh pr merge docs/promocao-2026-10-29 --squash`; o merge pelo número foi recusado pelo hook em entregas anteriores).
  - (E1) PR `develop` → `homolog` com merge commit (corpo: os PRs #145 a #164 e o PR da promoção, citando os pareceres); espere os checks do PR verdes e mescle pelo nome da branch (`gh pr merge develop --merge`); depois acompanhe o portão da CI disparado pelo push na `homolog` até concluir.
  - (E1) Na recomendação A1 da segurança: confirme no log do portão a versão do `react-router` instalada (8.5.0) e diga no relatório o que viu.
- (E2, E3) Nada a entregar aqui: não nesta delegação (tag na etapa E2.1; o PR para a `main` é a etapa E3.1).

## Fora do escopo
- "E1.0 (tech-lead): worktree `/home/rodrigoisensee/MetricasDSPD-050` e branch `docs/promocao-2026-10-29` a partir da `develop` depois do merge do E5.3 do pedido 051; parecer de review da promoção no diretório de reviews com o nome `050-release-develop.md` (PR × review, riscos, rollback, no molde do parecer de promoção do 037); versão (E2): `package.json` raiz, `CHANGELOG.md` escrito à mão dos Conventional Commits (sem dependência nova) e commit `chore(release)`; commit e push, sem PR." · etapa de outra delegação; já entregue (89227a2 e 6aa0ac3, entrega conferida 6aa0ac3)
- "E1.2 (qa-engineer): parecer do QA da candidata em `docs/qa/050-release-develop.md`, na worktree 050, com commit e push." · etapa de outra delegação; já entregue (3a20716)
- "E1.3 (devops-engineer): parecer de devops da promoção em `docs/devops/050-release-develop.md` (workflows e dependências do diff), na worktree 050, com commit e push." · etapa de outra delegação; já entregue (2e322ff)
- "E1.4 (security-engineer): parecer de segurança da promoção em `docs/security/050-release-develop.md`, na worktree 050 (sem Bash; o tech-lead o commita no E1.1)." · etapa de outra delegação; já entregue (o próprio autor o commitou no E1.7, 83a6ca9)
- "E1.5 (tech-lead): volta do parecer de review: `commit:` no commit da versão `6aa0ac38c35e8298f50511077527368b53ca08f7` (inclui `CHANGELOG.md` e `package.json`), com a leitura desses dois arquivos no parecer; commit e push." · etapa de outra delegação; já entregue (172cd22)
- "E1.6 (qa-engineer): volta do parecer de QA: `commit:` no commit da versão `6aa0ac38c35e8298f50511077527368b53ca08f7` e a contagem da abertura corrigida (13 PRs com parecer, 7 isentos); commit e push." · etapa de outra delegação; já entregue (261a3f1)
- "E1.7 (security-engineer): volta do parecer de segurança: `commit:` no commit da versão `6aa0ac38c35e8298f50511077527368b53ca08f7`; o próprio security-engineer commita e envia o parecer (o `forge-check pr` exige que quem emitiu o parecer o commite, R-SEGURANCA)." · etapa de outra delegação; já entregue (83a6ca9)
- "E2.1 (tech-lead): tag `vX.Y.Z-rc.1` no HEAD da `homolog` depois do merge (§8)." · etapa de outra delegação; continua no pedido
- "E3.1 (tech-lead): PR de release `homolog` → `main` com as notas de versão." · etapa de outra delegação; continua no pedido
- "E3.2 (dono): validar e mesclar o PR de release na `main`; tag final conforme §8." · etapa de outra delegação; continua no pedido
- Mudar pareceres, código, CHANGELOG ou workflows; re-run do `homolog-aprovada` (é da E3.1); as branches do 048 em andamento; o quadro e os arquivos de pedido; ler ou editar o `.env`; apagar branch remota (ação do dono).

## Decisões e restrições
- DECISÃO DO DONO (2026-10-29): recibo do 050 aceito ("isso"): E1 a E3 entram; as branches do 048 em andamento e o K-178 ficam fora.
- DECISÃO DO DONO (2026-10-29): "ta suba tudo que estiver pronto na homol em uma versao nova e depois para main"
- Erro recorrente deste destino (forge-check, 30 dias): escopo em 6 entregas · evita: cada item do Entregar cita a etapa `(E<n>)` do pedido; só corta com a marca de corte (R-BRIEF, R-DECISAO)
- Erro recorrente deste destino (forge-check, 30 dias): base em 4 entregas · evita: gere o brief de novo com `--branch`, para o Base-sha real (BRIEF-BASE-ATUAL)
- Erro recorrente deste destino (forge-check, 30 dias): etapa em 2 entregas · evita: confira a ordem das etapas do pedido e `forge-check pr <pedido>`; marque toda etapa de outra instância do mesmo agente (D-ETAPAS)
- Check vermelho não se roda de novo para ver se passa: pare, relate o check, o log resumido e a causa provável; nada de contornar (R-CONFORMIDADE).
- O alerta Dependabot 12 (dompurify) que o GitHub mostra no push é do K-178, fora deste pedido.
- O hook barra `$`, `$?`, crase, chaves e `?` no Bash: comandos literais, um por linha.
- R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`. R-MAIN: nada na `main`; nenhum PR para a `main` nesta etapa.

## Pronto quando
- PQ-1 (merge): `gh pr list --head docs/promocao-2026-10-29 --base develop --state merged --json number --jq length` · espera: igual '1'
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-050 merge-base --is-ancestor origin/develop origin/homolog` (depois de `git -C /home/rodrigoisensee/MetricasDSPD-050 fetch origin`) · espera: rc=0
- PQ-3 (run): `gh run list --branch homolog --event push --limit 1 --json conclusion --jq '.[0].conclusion'` · espera: igual 'success'

## Relatório
Até 8 linhas, resultado real: números e shas dos dois PRs e dos merges, o run do portão e a versão do `react-router` vista no log; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
