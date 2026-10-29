Agente destino: forge:security-engineer
Pedido: 050-release-develop
Tipo: codigo
Branch: docs/promocao-2026-10-29   Base: develop   Base-sha: 311691bace0582d80ea06ffc12f20096f1248b87
Etapa: codigo   Cobre: E1.4

## Objetivo
Etapa E1.4 do pedido 050: parecer de segurança da promoção da `develop` (`311691bace0582d80ea06ffc12f20096f1248b87`) à `homolog` (R-SEGURANCA: o diff toca CI/CD, dependências e o pacote do servidor), para a release que leva as operacionais O19 a O26 à `main`. Worktree `/home/rodrigoisensee/MetricasDSPD-050`, branch `docs/promocao-2026-10-29` (criadas pelo E1.0).

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD diff --name-only origin/homolog origin/develop -- .github server packages package.json pnpm-lock.yaml` e, desses, só o diff de `.github/workflows/`, `package.json`, `server/package.json` e `pnpm-lock.yaml` (nomes e versões).
- Os pareceres de segurança já existentes desses PRs em `/home/rodrigoisensee/MetricasDSPD-050/docs/security/` (030 e 025-t14), só frontmatter e achados.
- `/home/rodrigoisensee/MetricasDSPD/CLAUDE.md`, só a seção "Regras invioláveis" (credenciais, allow-list do Acelerato, GRANT por coluna).

## Entregar
- "E1.4 (security-engineer): parecer de segurança da promoção em `docs/security/050-release-develop.md`, na worktree 050 (sem Bash; o tech-lead o commita no E1.1)." (E1.4), com:
  - (E1) Parecer `docs/security/050-release-develop.md` (frontmatter com `pedido: 050-release-develop`, `commit: 311691bace0582d80ea06ffc12f20096f1248b87`, `parecer`; seção `## Achados` com severidade): permissões e segredos dos workflows novos ou alterados (`homolog-reavalia.yml` novo, `homolog-aprovada.yml`, `homolog.yml`, `ci.yml`), dependências que mudaram (Dependabot, alertas abertos conhecidos), se algum dado de pessoa ou texto livre do Acelerato passa a sair na API ou no mock, e se as T14 e Fase 2 mantêm o que os pareceres 025-t14 já aprovaram. Estático, sem rodar workflow, suíte nem `pnpm audit` de rede.
  - (E1.4) Gravar o arquivo na worktree com Write; sem `git add`, commit nem push (o tech-lead o commita no E1.1): o "sem Bash" da etapa quer dizer nada escrito no git por esta delegação; os comandos de Ler são só de leitura.
- (E2, E3) Nada a entregar aqui: não nesta delegação (versão e tag são do tech-lead; o PR para a `main` é a etapa E3.1).

## Fora do escopo
- "E1.0 (tech-lead): worktree `/home/rodrigoisensee/MetricasDSPD-050` e branch `docs/promocao-2026-10-29` a partir da `develop` depois do merge do E5.3 do pedido 051; parecer de review da promoção no diretório de reviews com o nome `050-release-develop.md` (PR × review, riscos, rollback, no molde do parecer de promoção do 037); versão (E2): `package.json` raiz, `CHANGELOG.md` escrito à mão dos Conventional Commits (sem dependência nova) e commit `chore(release)`; commit e push, sem PR." · etapa de outra delegação; em curso (tech-lead-1, cria a worktree e a branch antes desta)
- "E1.1 (tech-lead): commit do parecer de segurança, PR da `docs/promocao-2026-10-29` para a `develop` (squash) e merge com os checks verdes; PR `develop` → `homolog` (merge commit) e merge depois do portão da CI verde." · etapa de outra delegação; continua no pedido
- "E1.2 (qa-engineer): parecer do QA da candidata em `docs/qa/050-release-develop.md`, na worktree 050, com commit e push." · etapa de outra delegação; continua no pedido
- "E1.3 (devops-engineer): parecer de devops da promoção em `docs/devops/050-release-develop.md` (workflows e dependências do diff), na worktree 050, com commit e push." · etapa de outra delegação; continua no pedido
- "E2.1 (tech-lead): tag `vX.Y.Z-rc.1` no HEAD da `homolog` depois do merge (§8)." · etapa de outra delegação; continua no pedido
- "E3.1 (tech-lead): PR de release `homolog` → `main` com as notas de versão." · etapa de outra delegação; continua no pedido
- "E3.2 (dono): validar e mesclar o PR de release na `main`; tag final conforme §8." · etapa de outra delegação; continua no pedido
- Os outros pareceres da promoção; código; tag, PR e merge; as branches do 048 em andamento; o quadro e os arquivos de pedido; ler ou editar o `.env`.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-29): recibo do 050 aceito ("isso"): E1 a E3 entram; as branches do 048 em andamento e o K-178 ficam fora.
- DECISÃO DO DONO (2026-10-29): "ta suba tudo que estiver pronto na homol em uma versao nova e depois para main"
- O alerta do dompurify (K-178) está fora do 050 por decisão do dono; se ele aparecer, cite-o como conhecido e fora desta promoção, sem bloquear por ele.
- A candidata é a `develop` em `311691bace0582d80ea06ffc12f20096f1248b87`; os pareceres de review (tech-lead), QA, devops e segurança saem em paralelo na mesma worktree, cada um no seu arquivo; se o git acusar `index.lock`, espere alguns segundos e repita o comando uma vez.
- Sem reler código já revisado (regra 5 da economia de tokens); dúvida de regra de negócio vira pergunta ao dono no relatório, nunca decisão.
- R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`. R-MAIN: nada na `main`.

## Pronto quando
- PQ-1 (cmd): `grep -c '^commit: 311691bace0582d80ea06ffc12f20096f1248b87' /home/rodrigoisensee/MetricasDSPD-050/docs/security/050-release-develop.md` · espera: igual '1'
- PQ-2 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-050/docs/security/050-release-develop.md`

## Relatório
Até 8 linhas, resultado real: veredito, achados com severidade e o que pede decisão do dono; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
