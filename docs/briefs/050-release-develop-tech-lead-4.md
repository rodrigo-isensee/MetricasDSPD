Agente destino: forge:tech-lead
Pedido: 050-release-develop
Tipo: codigo
Branch: homolog   Base: main   Base-sha: 7486836addd257f6f0bd358e946a5cfd7d1802b2
Etapa: codigo   Cobre: E2.1

## Objetivo
Etapa E2.1 do pedido 050: marcar a candidata `v0.2.0-rc.1` na `homolog`, para o PR de release `homolog` → `main` (E3.1, em paralelo) e o merge do dono (E3.2) levarem as operacionais O19 a O26 à `main`. A `homolog` está em `485578cd7d7a8acb58a40ff0b666972010acc0b9` (merge do PR #166), com o portão verde (run 40905414149). Use a worktree `/home/rodrigoisensee/MetricasDSPD-050` só para criar e enviar a tag; nenhum commit nesta etapa.

## Ler
- `/home/rodrigoisensee/MetricasDSPD/docs/engineering/fluxo-homologacao.md`, só a seção 8 (Versionamento, tags e notas de versão).

## Entregar
- "E2.1 (tech-lead): tag `vX.Y.Z-rc.1` no HEAD da `homolog` depois do merge (§8)." (E2.1), com:
  - (E2) Tag anotada `v0.2.0-rc.1` em `485578cd7d7a8acb58a40ff0b666972010acc0b9` (confira antes que é a ponta da `origin/homolog`); push só da tag (`git -C /home/rodrigoisensee/MetricasDSPD-050 push origin refs/tags/v0.2.0-rc.1`).
- (E3) Nada a entregar aqui: não nesta delegação (o PR para a `main` é a etapa E3.1, em delegação paralela).

## Fora do escopo
- "E1.0 (tech-lead): worktree `/home/rodrigoisensee/MetricasDSPD-050` e branch `docs/promocao-2026-10-29` a partir da `develop` depois do merge do E5.3 do pedido 051; parecer de review da promoção no diretório de reviews com o nome `050-release-develop.md` (PR × review, riscos, rollback, no molde do parecer de promoção do 037); versão (E2): `package.json` raiz, `CHANGELOG.md` escrito à mão dos Conventional Commits (sem dependência nova) e commit `chore(release)`; commit e push, sem PR." · etapa de outra delegação; já entregue (89227a2 e 6aa0ac3)
- "E1.1 (tech-lead): depois de E1.5 a E1.7, PR da `docs/promocao-2026-10-29` para a `develop` (squash) e merge com os checks verdes; PR `develop` → `homolog` (merge commit) e merge depois do portão da CI verde." · etapa de outra delegação; já entregue (PR #165 em d3095a7, PR #166 em 485578c, portão run 40905414149)
- "E1.2 (qa-engineer): parecer do QA da candidata em `docs/qa/050-release-develop.md`, na worktree 050, com commit e push." · etapa de outra delegação; já entregue (3a20716)
- "E1.3 (devops-engineer): parecer de devops da promoção em `docs/devops/050-release-develop.md` (workflows e dependências do diff), na worktree 050, com commit e push." · etapa de outra delegação; já entregue (2e322ff)
- "E1.4 (security-engineer): parecer de segurança da promoção em `docs/security/050-release-develop.md`, na worktree 050 (sem Bash; o tech-lead o commita no E1.1)." · etapa de outra delegação; já entregue (commitado pelo autor no E1.7, 83a6ca9)
- "E1.5 (tech-lead): volta do parecer de review: `commit:` no commit da versão `6aa0ac38c35e8298f50511077527368b53ca08f7` (inclui `CHANGELOG.md` e `package.json`), com a leitura desses dois arquivos no parecer; commit e push." · etapa de outra delegação; já entregue (172cd22)
- "E1.6 (qa-engineer): volta do parecer de QA: `commit:` no commit da versão `6aa0ac38c35e8298f50511077527368b53ca08f7` e a contagem da abertura corrigida (13 PRs com parecer, 7 isentos); commit e push." · etapa de outra delegação; já entregue (261a3f1)
- "E1.7 (security-engineer): volta do parecer de segurança: `commit:` no commit da versão `6aa0ac38c35e8298f50511077527368b53ca08f7`; o próprio security-engineer commita e envia o parecer (o `forge-check pr` exige que quem emitiu o parecer o commite, R-SEGURANCA)." · etapa de outra delegação; já entregue (83a6ca9)
- "E3.1 (tech-lead): PR de release `homolog` → `main` com as notas de versão." · etapa de outra delegação; continua no pedido (delegação paralela)
- "E3.2 (dono): validar e mesclar o PR de release na `main`; tag final conforme §8." · etapa de outra delegação; continua no pedido (do dono)
- Merge na `main`, tag final `v0.2.0`, commit em qualquer branch, mudar pareceres, CHANGELOG ou workflows; as branches do 048 em andamento; o quadro e os arquivos de pedido; ler ou editar o `.env`; apagar branch remota ou worktree (ação do dono depois do merge).

## Decisões e restrições
- DECISÃO DO DONO (2026-10-29): recibo do 050 aceito ("isso"): E1 a E3 entram; as branches do 048 em andamento e o K-178 ficam fora.
- DECISÃO DO DONO (2026-10-29): "ta suba tudo que estiver pronto na homol em uma versao nova e depois para main"
- Erro recorrente deste destino (forge-check, 30 dias): escopo em 6 entregas · evita: cada item do Entregar cita a etapa `(E<n>)` do pedido; só corta com a marca de corte (R-BRIEF, R-DECISAO)
- Erro recorrente deste destino (forge-check, 30 dias): base em 4 entregas · evita: gere o brief de novo com `--branch`, para o Base-sha real (BRIEF-BASE-ATUAL)
- Erro recorrente deste destino (forge-check, 30 dias): etapa em 2 entregas · evita: confira a ordem das etapas do pedido e `forge-check pr <pedido>`; marque toda etapa de outra instância do mesmo agente (D-ETAPAS)
- O alerta Dependabot 12 (dompurify) que o GitHub mostra no push é do K-178, fora deste pedido.
- R-MAIN: a `main` é do dono; nenhum merge, push ou commit na `main`, nenhuma aprovação do PR em nome do dono.
- O hook barra `$`, `$?`, crase, chaves e `?` no Bash: comandos literais, um por linha.
- R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`.

## Pronto quando
- PQ-1 (push): `gh api repos/rodrigo-isensee/MetricasDSPD/commits/v0.2.0-rc.1 --jq .sha` · espera: igual '485578cd7d7a8acb58a40ff0b666972010acc0b9'

## Relatório
Até 8 linhas, resultado real: a tag e o sha em que ela aponta; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
