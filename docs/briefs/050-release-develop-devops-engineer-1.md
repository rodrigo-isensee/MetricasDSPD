Agente destino: forge:devops-engineer
Pedido: 050-release-develop
Tipo: codigo
Branch: docs/promocao-2026-10-29   Base: develop   Base-sha: 311691bace0582d80ea06ffc12f20096f1248b87
Etapa: codigo   Cobre: E1.3

## Objetivo
Etapa E1.3 do pedido 050: parecer de devops da promoção da `develop` (`311691bace0582d80ea06ffc12f20096f1248b87`) à `homolog`: os workflows e as dependências que mudaram desde a última promoção, para a release que leva as operacionais O19 a O26 à `main`. Worktree `/home/rodrigoisensee/MetricasDSPD-050`, branch `docs/promocao-2026-10-29` (criadas pelo E1.0).

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD diff --stat origin/homolog origin/develop -- .github package.json pnpm-lock.yaml` (hoje: `ci.yml`, `homolog-aprovada.yml`, `homolog-reavalia.yml` novo, `homolog.yml`, `package.json`, `pnpm-lock.yaml`).
- `/home/rodrigoisensee/MetricasDSPD-050/docs/engineering/fluxo-homologacao.md`, só §4, §5 e §10.
- Os pareceres de devops já existentes desses PRs em `/home/rodrigoisensee/MetricasDSPD-050/docs/devops/`, só frontmatter e achados.

## Entregar
- "E1.3 (devops-engineer): parecer de devops da promoção em `docs/devops/050-release-develop.md` (workflows e dependências do diff), na worktree 050, com commit e push." (E1.3), com:
  - (E1) Parecer `docs/devops/050-release-develop.md` (frontmatter com `pedido: 050-release-develop`, `commit: 311691bace0582d80ea06ffc12f20096f1248b87`, `parecer`; seção `## Achados`): o que muda nos workflows (#153 homolog-aprovada e reavaliação, #154 e #159 E2E em 2 partes com agregador) e nas dependências (#145, #146, #147, Dependabot), se os checks obrigatórios do ruleset continuam com os mesmos nomes (§10), se o portão da `homolog` roda como §4 descreve, riscos e rollback. Sem rodar workflow nem suíte.
- (E1.3) Um commit só, `git add docs/devops/050-release-develop.md`, padrão de commits do `docs/engineering/praticas.md`, em chamada própria do Bash (o hook recusa heredoc junto de outros comandos; o hook barra `$`, `$?`, crase, chaves e `?`: comandos literais, um por linha); antes do push, `git -C /home/rodrigoisensee/MetricasDSPD-050 branch --show-current` deve dar `docs/promocao-2026-10-29`; push com `git -C /home/rodrigoisensee/MetricasDSPD-050 push origin HEAD:refs/heads/docs/promocao-2026-10-29` (se recusado por estar atrás, `git -C /home/rodrigoisensee/MetricasDSPD-050 pull --rebase origin docs/promocao-2026-10-29` e push de novo). Sem PR.
- (E2, E3) Nada a entregar aqui: não nesta delegação (versão e tag são do tech-lead; o PR para a `main` é a etapa E3.1).

## Fora do escopo
- "E1.0 (tech-lead): worktree `/home/rodrigoisensee/MetricasDSPD-050` e branch `docs/promocao-2026-10-29` a partir da `develop` depois do merge do E5.3 do pedido 051; parecer de review da promoção no diretório de reviews com o nome `050-release-develop.md` (PR × review, riscos, rollback, no molde do parecer de promoção do 037); versão (E2): `package.json` raiz, `CHANGELOG.md` escrito à mão dos Conventional Commits (sem dependência nova) e commit `chore(release)`; commit e push, sem PR." · etapa de outra delegação; em curso (tech-lead-1, cria a worktree e a branch antes desta)
- "E1.1 (tech-lead): commit do parecer de segurança, PR da `docs/promocao-2026-10-29` para a `develop` (squash) e merge com os checks verdes; PR `develop` → `homolog` (merge commit) e merge depois do portão da CI verde." · etapa de outra delegação; continua no pedido
- "E1.2 (qa-engineer): parecer do QA da candidata em `docs/qa/050-release-develop.md`, na worktree 050, com commit e push." · etapa de outra delegação; continua no pedido
- "E1.4 (security-engineer): parecer de segurança da promoção em `docs/security/050-release-develop.md`, na worktree 050 (sem Bash; o tech-lead o commita no E1.1)." · etapa de outra delegação; continua no pedido
- "E2.1 (tech-lead): tag `vX.Y.Z-rc.1` no HEAD da `homolog` depois do merge (§8)." · etapa de outra delegação; continua no pedido
- "E3.1 (tech-lead): PR de release `homolog` → `main` com as notas de versão." · etapa de outra delegação; continua no pedido
- "E3.2 (dono): validar e mesclar o PR de release na `main`; tag final conforme §8." · etapa de outra delegação; continua no pedido
- Os outros pareceres da promoção; código; tag, PR e merge; as branches do 048 em andamento; o quadro e os arquivos de pedido; ler ou editar o `.env`.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-29): recibo do 050 aceito ("isso"): E1 a E3 entram; as branches do 048 em andamento e o K-178 ficam fora.
- DECISÃO DO DONO (2026-10-29): "ta suba tudo que estiver pronto na homol em uma versao nova e depois para main"
- A candidata é a `develop` em `311691bace0582d80ea06ffc12f20096f1248b87`; os pareceres de review (tech-lead), QA, devops e segurança saem em paralelo na mesma worktree, cada um no seu arquivo; se o git acusar `index.lock`, espere alguns segundos e repita o comando uma vez.
- Sem reler código já revisado (regra 5 da economia de tokens); dúvida de regra de negócio vira pergunta ao dono no relatório, nunca decisão.
- R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`. R-MAIN: nada na `main`.

## Pronto quando
- PQ-1 (cmd): `grep -c '^commit: 311691bace0582d80ea06ffc12f20096f1248b87' /home/rodrigoisensee/MetricasDSPD-050/docs/devops/050-release-develop.md` · espera: igual '1'
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-050 log --oneline -1 -- docs/devops/050-release-develop.md` · espera: linhas=1
- PQ-3 (push): `git ls-remote origin refs/heads/docs/promocao-2026-10-29` igual ao head local

## Relatório
Até 8 linhas, resultado real: veredito, achados e o que pede decisão do dono; sha do commit; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
