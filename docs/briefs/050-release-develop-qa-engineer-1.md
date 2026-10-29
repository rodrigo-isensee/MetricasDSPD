Agente destino: forge:qa-engineer
Pedido: 050-release-develop
Tipo: qa
Branch: docs/promocao-2026-10-29   Base: develop   Base-sha: 311691bace0582d80ea06ffc12f20096f1248b87
Etapa: qa   Cobre: E1.2

## Objetivo
Etapa E1.2 do pedido 050: parecer de QA da candidata `develop` (`311691bace0582d80ea06ffc12f20096f1248b87`) à `homolog`, critério de `docs/engineering/fluxo-homologacao.md` §4, para a release que leva as operacionais O19 a O26 à `main`. Worktree `/home/rodrigoisensee/MetricasDSPD-050`, branch `docs/promocao-2026-10-29` (criadas pelo E1.0).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-050/docs/qa/037-promocao-2026-10-23.md` (o molde; só a forma).
- `git -C /home/rodrigoisensee/MetricasDSPD log --oneline origin/homolog..origin/develop` (20 PRs, #145 a #164) e os pareceres de QA citados por esses PRs em `/home/rodrigoisensee/MetricasDSPD-050/docs/qa/`, só frontmatter e ressalvas.
- `gh run list --branch develop --limit 5` (CI do push na `develop` no head `311691bace0582d80ea06ffc12f20096f1248b87`).

## Entregar
- "E1.2 (qa-engineer): parecer do QA da candidata em `docs/qa/050-release-develop.md`, na worktree 050, com commit e push." (E1.2), com:
  - (E1) Parecer `docs/qa/050-release-develop.md` no molde do 037: frontmatter (`pedido: 050-release-develop`, `branch: develop`, `commit: 311691bace0582d80ea06ffc12f20096f1248b87`, `parecer`, contagem de bugs, `escopo`, `data`), conteúdo da promoção, tabela PR × parecer de QA × ressalvas (PR do Dependabot, de registro do Forge ou só de documentação isento de QA pelo R-QA: dizer por quê), resultado da CI da `develop` no head da candidata. Sem rodar suíte local (a CI do PR de promoção e o portão da `homolog` rodam a suíte completa, o E2E e o `perf`). PR com bug crítico, alto ou médio aberto, ou CI da `develop` vermelha: parecer reprovado, relate.
- (E1.2) Um commit só, `git add docs/qa/050-release-develop.md`, padrão de commits do `docs/engineering/praticas.md`, em chamada própria do Bash (o hook recusa heredoc junto de outros comandos; o hook barra `$`, `$?`, crase, chaves e `?`: comandos literais, um por linha); antes do push, `git -C /home/rodrigoisensee/MetricasDSPD-050 branch --show-current` deve dar `docs/promocao-2026-10-29`; push com `git -C /home/rodrigoisensee/MetricasDSPD-050 push origin HEAD:refs/heads/docs/promocao-2026-10-29` (se recusado por estar atrás, `git -C /home/rodrigoisensee/MetricasDSPD-050 pull --rebase origin docs/promocao-2026-10-29` e push de novo). Sem PR.
- (E2, E3) Nada a entregar aqui: não nesta delegação (versão e tag são do tech-lead; o PR para a `main` é a etapa E3.1).

## Fora do escopo
- "E1.0 (tech-lead): worktree `/home/rodrigoisensee/MetricasDSPD-050` e branch `docs/promocao-2026-10-29` a partir da `develop` depois do merge do E5.3 do pedido 051; parecer de review da promoção no diretório de reviews com o nome `050-release-develop.md` (PR × review, riscos, rollback, no molde do parecer de promoção do 037); versão (E2): `package.json` raiz, `CHANGELOG.md` escrito à mão dos Conventional Commits (sem dependência nova) e commit `chore(release)`; commit e push, sem PR." · etapa de outra delegação; já entregue (review 89227a2 e versão 0.2.0 em 6aa0ac3, no origin)
- "E1.1 (tech-lead): commit do parecer de segurança, PR da `docs/promocao-2026-10-29` para a `develop` (squash) e merge com os checks verdes; PR `develop` → `homolog` (merge commit) e merge depois do portão da CI verde." · etapa de outra delegação; continua no pedido
- "E1.3 (devops-engineer): parecer de devops da promoção em `docs/devops/050-release-develop.md` (workflows e dependências do diff), na worktree 050, com commit e push." · etapa de outra delegação; continua no pedido
- "E1.4 (security-engineer): parecer de segurança da promoção em `docs/security/050-release-develop.md`, na worktree 050 (sem Bash; o tech-lead o commita no E1.1)." · etapa de outra delegação; continua no pedido
- "E2.1 (tech-lead): tag `vX.Y.Z-rc.1` no HEAD da `homolog` depois do merge (§8)." · etapa de outra delegação; continua no pedido
- "E3.1 (tech-lead): PR de release `homolog` → `main` com as notas de versão." · etapa de outra delegação; continua no pedido
- "E3.2 (dono): validar e mesclar o PR de release na `main`; tag final conforme §8." · etapa de outra delegação; continua no pedido
- Os outros pareceres da promoção; código; tag, PR e merge; as branches do 048 em andamento; o quadro e os arquivos de pedido; ler ou editar o `.env`.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-29): recibo do 050 aceito ("isso"): E1 a E3 entram; as branches do 048 em andamento e o K-178 ficam fora.
- DECISÃO DO DONO (2026-10-29): "ta suba tudo que estiver pronto na homol em uma versao nova e depois para main"
- Regra do dono (pedido 041): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." Esta etapa não roda suíte.
- Erro recorrente deste destino (forge-check, 30 dias): escopo em 3 entregas · evita: cada item do Entregar cita a etapa `(E<n>)` do pedido; só corta com a marca de corte (R-BRIEF, R-DECISAO)
- Erro recorrente deste destino (forge-check, 30 dias): decisao em 2 entregas · evita: grave a decisão no pedido antes do brief; o `brief gerar` copia as linhas de decisão do dono (R-BRIEF)
- A candidata é a `develop` em `311691bace0582d80ea06ffc12f20096f1248b87`; os pareceres de review (tech-lead), QA, devops e segurança saem em paralelo na mesma worktree, cada um no seu arquivo; se o git acusar `index.lock`, espere alguns segundos e repita o comando uma vez.
- Sem reler código já revisado (regra 5 da economia de tokens); dúvida de regra de negócio vira pergunta ao dono no relatório, nunca decisão.
- R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`. R-MAIN: nada na `main`.

## Pronto quando
- PQ-1 (cmd): `grep -c '^commit: 311691bace0582d80ea06ffc12f20096f1248b87' /home/rodrigoisensee/MetricasDSPD-050/docs/qa/050-release-develop.md` · espera: igual '1'
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-050 log --oneline -1 -- docs/qa/050-release-develop.md` · espera: linhas=1
- PQ-3 (push): `git ls-remote origin refs/heads/docs/promocao-2026-10-29` igual ao head local

## Relatório
Até 8 linhas, resultado real: veredito, achados e o que pede decisão do dono; sha do commit; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
