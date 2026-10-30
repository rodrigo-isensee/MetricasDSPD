Agente destino: forge:tech-lead
Pedido: 055-forge-pareceres-por-branch
Tipo: codigo
Branch: docs/jarvis-2026-10-23   Base: develop   Base-sha: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8
Etapa: codigo   Cobre: E1.1

## Objetivo
Propor ao Forge a correção de dois defeitos do `bin/forge-check` vistos neste projeto (pedido 055, K-187): o `cmd_pr` escolhe o parecer do pedido sem olhar a branch (trava o PR da 048d) e o `brief mensagem --entrega` usa como `Desde:` uma conferência de outra branch (6 conferências de entrega do 052 reprovadas só pelo Desde em 2026-10-30, mais 2 no 048 e no 053). Repositório do Forge, clone `~/.forge-contrib/MetricasDSPD`, branch `melhoria/MetricasDSPD-pareceres-por-branch` a partir da `develop` do Forge (234dbe0fb90b005450d7c2eb59e6241ea9779155). O cabeçalho cita a branch e a base deste projeto, onde ficam o pedido e o brief (precedente: briefs do pedido 043).

## Ler
- Skill `contribuir-com-o-forge` do Forge (`/home/rodrigoisensee/.claude/plugins/cache/forge/forge/0.30.7/skills/contribuir-com-o-forge/SKILL.md`), seções 2 a 7.
- No clone: `bin/forge-check`, a escolha do parecer no `cmd_pr` (na 0.30.7, linhas 683 a 690: maior (data, caminho), sem olhar o campo `branch:`) e a montagem do `Desde:` no `brief mensagem --entrega` (na 0.30.7, por volta da linha 4668: última linha `conferida` do `## Histórico`, sem testar se o sha é ancestral da branch).
- `.claude/CLAUDE.md` do Forge, só as regras de contribuição e de testes.

## Entregar
- "E1.1 (tech-lead): lote por arquivo (os dois itens mexem em `bin/forge-check`): no clone de contribuição `~/.forge-contrib/MetricasDSPD` (skill `contribuir-com-o-forge`), branch `melhoria/MetricasDSPD-pareceres-por-branch` a partir da `develop` do Forge, um commit por item (E1 e E2), cada um com o seu teste, fragmento de changelog, testes do Forge, `scripts/validar-plugin.sh` e `scripts/verificar-contribuicao.sh` verdes, e um PR para a `develop` do Forge citando E1 e E2; só propõe (R-CONTRIB)." (E1.1)
- (E1) Commit 1: o `cmd_pr` escolhe o parecer de review e o de QA do pedido pela branch do PR (campo `branch:` do frontmatter ou o diff da branch); com dois pareceres do mesmo pedido e da mesma data, vale o da branch; teste que reproduz o caso (dois pareceres de QA do mesmo pedido e da mesma data, branches diferentes) e falha sem a correção.
- (E2) Commit 2: o `brief mensagem --entrega` só escreve `Desde:` quando o sha da última linha `conferida` é ancestral da branch da entrega; sem linha válida, omite o `Desde:`; teste com uma linha `conferida` de outra branch, que falha sem a correção.
- (E1.1) Clone: se `~/.forge-contrib/MetricasDSPD` não existir, `git clone git@github.com:rodrigo-isensee/Forge.git ~/.forge-contrib/MetricasDSPD` e `git config core.hooksPath .githooks`; branch criada com `git switch --no-track -c melhoria/MetricasDSPD-pareceres-por-branch origin/develop`; não usar `~/.forge-contrib/wt/*` nem `~/.forge-contrib/forge` (são de sessões do Forge).
- (E1.1) Fragmento em `changelog.d/` pelo `bin/forge-changelog novo Corrigido "<texto>"`; `python3 -m unittest discover -s tests -v`, `scripts/validar-plugin.sh` e `scripts/verificar-contribuicao.sh` verdes antes do PR.
- (E1.1) PR com `gh pr create --base develop --title "fix(forge-check): parecer e Desde pela branch (pr e brief mensagem)" --body-file <arquivo>` pelo modelo `.github/pull_request_template.md`: projeto de origem MetricasDSPD, situação observada sem dados do projeto, o que muda, como medir (conferências reprovadas só pelo Desde por pedido; PRs travados por parecer de outra branch), o lote (um commit por item, revert de um sai sem o outro) e o checklist. Depois do PR, pare (R-CONTRIB).
- (E1.1) Commits no padrão do Forge, `git add` por caminho, mensagem gravada antes pela ferramenta Write em `/tmp/claude-1000/commit-055-e1.txt` e `/tmp/claude-1000/commit-055-e2.txt`, usadas com `git commit -F <arquivo>`; push com `git push origin melhoria/MetricasDSPD-pareceres-por-branch`, sem `--force`.
- (E2) Nada além do commit 2 acima: o item E2 vai no mesmo lote, com o seu commit e o seu teste.

## Fora do escopo
- "E3.1 (dono): mesclar no Forge até a `main`, publicar a versão e atualizar o plugin no projeto (`forge atualizar`)." · etapa de outra delegação; do dono, depois desta
- Mesclar o PR, mexer em PR alheio ou em outra branch do Forge; enviar para `develop`, `homolog` ou `main` do Forge; editar o cache do plugin; tocar este projeto (MetricasDSPD), o quadro e o arquivo do pedido; o PR da 048d.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-30): "A" (pedido 048, PR da 048d): corrigir na fábrica; o PR da 048d espera a correção chegar ao projeto pela main do Forge e a atualização do plugin; sem exceção pontual.
- DECISÃO DO DONO (2026-10-30): "sim" (recibo do 055 aceito).
- DECISÃO TÉCNICA (Jarvis, 2026-10-30, registrada no Histórico do pedido): E1 e E2 viram um lote por arquivo (uma branch, um commit por item com o seu teste, um PR que cita os dois).
- R-CONTRIB: sessão de projeto só propõe; R-NEUTRO: nada do sistema MetricasDSPD no PR; R-COPIA: não copiar agentes e skills para o projeto.
- R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`; recusa de hook ou teste vermelho: pare e relate a mensagem literal.
- O hook barra cifrão, crase, chaves e interrogação no Bash: comandos literais, um por linha; texto grande vai para arquivo.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/.forge-contrib/MetricasDSPD log --format=%s origin/develop..melhoria/MetricasDSPD-pareceres-por-branch` · espera: linhas>=2
- PQ-2 (push): `git -C /home/rodrigoisensee/.forge-contrib/MetricasDSPD ls-remote origin refs/heads/melhoria/MetricasDSPD-pareceres-por-branch` igual ao `git -C /home/rodrigoisensee/.forge-contrib/MetricasDSPD rev-parse melhoria/MetricasDSPD-pareceres-por-branch`
- PQ-3 (pr): `gh pr list -R rodrigo-isensee/Forge --head melhoria/MetricasDSPD-pareceres-por-branch --json number,state,baseRefName` · espera: contém 'develop'
- PQ-4 (cmd): `python3 -m unittest discover -s tests`, rodado na raiz do clone antes do PR · espera: rc=0

## Relatório
Até 8 linhas, resultado real, na ordem: estado; o que precisa do dono; suposições com a base; o que foi feito, com evidência (shas, nomes dos testes, link do PR); riscos. Depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
