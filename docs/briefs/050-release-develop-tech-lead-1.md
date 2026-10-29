Agente destino: forge:tech-lead
Pedido: 050-release-develop
Tipo: codigo
Branch: docs/promocao-2026-10-29   Base: develop   Base-sha: 311691bace0582d80ea06ffc12f20096f1248b87
Etapa: codigo   Cobre: E1.0

## Objetivo
Etapa E1.0 do pedido 050: preparar a release que leva à `homolog`, e depois à `main`, tudo o que já está mesclado na `develop`, com as operacionais O19 a O26 e o contrato da O23 fechado (prioridade do dono). Esta etapa cria a branch de promoção com o parecer de review da promoção, a versão nova e o CHANGELOG; os pareceres de QA, devops e segurança saem em paralelo na mesma worktree, em outras delegações.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-050/docs/engineering/fluxo-homologacao.md`, só §4 (gates e checks) e §8 (versionamento, tags e notas de versão).
- `/home/rodrigoisensee/MetricasDSPD-050/docs/reviews/037-promocao-2026-10-23.md`, depois de criar a worktree (o molde do parecer de promoção; só a forma; o arquivo está na `develop`, não na cópia principal).
- `git -C /home/rodrigoisensee/MetricasDSPD log --oneline origin/homolog..origin/develop` (20 PRs, #145 a #164).

## Entregar
- "E1.0 (tech-lead): worktree `/home/rodrigoisensee/MetricasDSPD-050` e branch `docs/promocao-2026-10-29` a partir da `develop` depois do merge do E5.3 do pedido 051; parecer de review da promoção no diretório de reviews com o nome `050-release-develop.md` (PR × review, riscos, rollback, no molde do parecer de promoção do 037); versão (E2): `package.json` raiz, `CHANGELOG.md` escrito à mão dos Conventional Commits (sem dependência nova) e commit `chore(release)`; commit e push, sem PR." (E1.0), com:
  - (E1) Worktree: `git -C /home/rodrigoisensee/MetricasDSPD fetch origin develop`, depois `git -C /home/rodrigoisensee/MetricasDSPD worktree add -b docs/promocao-2026-10-29 /home/rodrigoisensee/MetricasDSPD-050 311691bace0582d80ea06ffc12f20096f1248b87`; sem `pnpm install` nesta etapa.
  - (E1) Parecer `docs/reviews/050-release-develop.md` no molde do 037: frontmatter com `pedido: 050-release-develop`, `branch: docs/promocao-2026-10-29`, `commit: 311691bace0582d80ea06ffc12f20096f1248b87` (a candidata), `parecer`, `revisor: forge:tech-lead`; tabela PR × review com cada PR de `origin/homolog..origin/develop` e o parecer de review dele (arquivo e head revisado; PR do Dependabot ou de registro de versão do Forge sem parecer próprio: diff lido por este parecer, como no 037); riscos; rollback (§9). Sem reler código já revisado e sem rodar suíte. PR sem review aprovado: parecer reprovado, pare e relate.
  - (E2) Versão: número pelo SemVer de §8 (há `feat` no intervalo; o projeto está em `0.x` e não tem tag); `package.json` raiz com a versão nova; `CHANGELOG.md` na raiz escrito à mão a partir dos Conventional Commits de `origin/homolog..origin/develop`, com as seções de §8 (Adicionado, Corrigido, Desempenho, Mudanças que quebram, Mudanças de critério de cálculo com data, conforme T2.6); sem dependência nova.
  - (E1, E2) Dois commits, `git add` por caminho, padrão de commits do `docs/engineering/praticas.md`, cada commit em chamada própria do Bash (o hook recusa heredoc junto de outros comandos): um do parecer (`docs(review): ...`) e um `chore(release): vX.Y.Z` com `package.json` e `CHANGELOG.md`; antes do push, `git branch --show-current` deve dar `docs/promocao-2026-10-29`; push com `git -C /home/rodrigoisensee/MetricasDSPD-050 push origin HEAD:refs/heads/docs/promocao-2026-10-29`. Sem PR.
- (E3) Nada a entregar aqui: não nesta delegação (PR de release para a `main` é a etapa E3.1).

## Fora do escopo
- "E1.1 (tech-lead): commit do parecer de segurança, PR da `docs/promocao-2026-10-29` para a `develop` (squash) e merge com os checks verdes; PR `develop` → `homolog` (merge commit) e merge depois do portão da CI verde." · etapa de outra delegação; continua no pedido
- "E1.2 (qa-engineer): parecer do QA da candidata em `docs/qa/050-release-develop.md`, na worktree 050, com commit e push." · etapa de outra delegação; continua no pedido
- "E1.3 (devops-engineer): parecer de devops da promoção em `docs/devops/050-release-develop.md` (workflows e dependências do diff), na worktree 050, com commit e push." · etapa de outra delegação; continua no pedido
- "E1.4 (security-engineer): parecer de segurança da promoção em `docs/security/050-release-develop.md`, na worktree 050 (sem Bash; o tech-lead o commita no E1.1)." · etapa de outra delegação; continua no pedido
- "E2.1 (tech-lead): tag `vX.Y.Z-rc.1` no HEAD da `homolog` depois do merge (§8)." · etapa de outra delegação; continua no pedido
- "E3.1 (tech-lead): PR de release `homolog` → `main` com as notas de versão." · etapa de outra delegação; continua no pedido
- "E3.2 (dono): validar e mesclar o PR de release na `main`; tag final conforme §8." · etapa de outra delegação; continua no pedido
- Tag, PR, merge; os pareceres de QA, devops e segurança; código; as branches do 048 em andamento; o quadro e os arquivos de pedido; ler ou editar o `.env`.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-29): recibo do 050 aceito ("isso"): E1 a E3 entram; as branches do 048 em andamento e o K-178 ficam fora.
- DECISÃO DO DONO (2026-10-29): "ta suba tudo que estiver pronto na homol em uma versao nova e depois para main"
- Erro recorrente deste destino (forge-check, 30 dias): escopo em 5 entregas · evita: cada item do Entregar cita a etapa `(E<n>)` do pedido; só corta com a marca de corte (R-BRIEF, R-DECISAO)
- Erro recorrente deste destino (forge-check, 30 dias): base em 4 entregas · evita: gere o brief de novo com `--branch`, para o Base-sha real (BRIEF-BASE-ATUAL)
- Erro recorrente deste destino (forge-check, 30 dias): etapa em 2 entregas · evita: confira a ordem das etapas do pedido e `forge-check pr <pedido>`; marque toda etapa de outra instância do mesmo agente (D-ETAPAS)
- A `main` e a `homolog` não recebem commit direto; o CHANGELOG chega à `homolog` pela promoção (decisão técnica registrada no Histórico do pedido 050, 10:17).
- O hook barra `$`, `$?`, crase, chaves e `?` no Bash: comandos literais, um por linha.
- R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`. R-MAIN: nada na `main`.

## Pronto quando
- PQ-1 (cmd): `grep -c '^commit: 311691bace0582d80ea06ffc12f20096f1248b87' /home/rodrigoisensee/MetricasDSPD-050/docs/reviews/050-release-develop.md` · espera: igual '1'
- PQ-2 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-050/CHANGELOG.md`
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-050 log --oneline -2` · espera: contém 'chore(release)'
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-050 diff --name-only 311691bace0582d80ea06ffc12f20096f1248b87 HEAD` · espera: linhas=3
- PQ-5 (push): `git ls-remote origin refs/heads/docs/promocao-2026-10-29` igual ao head local

## Relatório
Até 8 linhas, resultado real: veredito do parecer, versão escolhida e por quê, sha dos dois commits; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
