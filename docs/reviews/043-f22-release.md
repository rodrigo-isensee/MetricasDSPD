---
tipo: review
contrato: 1
pedido: 043-forge-f21-f22
branch: melhoria/MetricasDSPD-f22-release
commit: 0b595051930e4207d5a65eb3a5d551bf8f7b7180
parecer: aprovado
revisor: forge:tech-lead
data: 2026-10-27
---
# Review: F22, PR de release da homologação para a main (texto)

Entrega no clone de contribuição do Forge, sobre `origin/develop` 41ba611: 4 arquivos de texto, 5 linhas (`R-FLUXO.md`, `ci-cd/SKILL.md`, `agents/tech-lead.md`, fragmento). Branch empurrada (sem PR). Opção A da análise (seções 4 a 6) cumprida.

## Contra a opção A e N1 a N6
- Opção A: os três textos previstos (ci-cd, tech-lead, R-FLUXO) e o fragmento; nenhum workflow, hook ou modelo alterado. Cumpre.
- N1 (listar, conferir fork, base e autor; mais de um: parar): `R-FLUXO.md:15`, resumo em `tech-lead.md:33`. OK.
- N2 (só título e corpo, nunca `--base`/`--head`/`--add-reviewer`/estado): `R-FLUXO.md:15`. OK.
- N3 (cria ou edita e para; merge, `--auto`, push na main do usuário, por ID `R-MAIN`): OK.
- N4 (`--body-file`, nunca `--body` interpolado; sem segredo, dado pessoal, log bruto): OK.
- N5 (só com portão verde; pendente = esperar e reexecutar o mesmo sha; não recriar para limpar vermelho; não afrouxar, `R-CONFORMIDADE`): `ci-cd/SKILL.md:45`. OK.
- N6 (erro do `gh` não é "sem PR"; linha no corpo se o usuário já viu): OK.
- R-NEUTRO: nada deste projeto no texto; o único "MetricasDSPD" é o nome do fragmento, que segue a skill (`changelog.d/<branch-sem-prefixo>.md`). `tests/config.json` intocado. Cumpre.
- Critério de reversão e "por que o existente não basta": o rascunho traz a medida (2 releases, 0 vermelhos por corrida, 0 duplicados) com a saída para a opção B, e a lacuna (não havia passo documentado). Cumpre.
- Teto M14: 0 linhas de código e teste. Mudança fora de `hooks/` e de `PROTEGIDOS`.
- Rascunho do PR (`043-f22-corpo-do-pr.md`): coerente com o commit e neutro; usa `.github/pull_request_template.md`.

## Testes (`PYTHONDONTWRITEBYTECODE=1`, worktree sem `__pycache__` ao fim)
- `python3 -m unittest discover -s tests`: branch 2130 testes, 59 falhas, 27 skipped; base (`origin/develop` 41ba611, worktree descartável removida) 2130 testes, 59 falhas, 28 skipped. A lista de falhas (`FAIL`/`ERROR` ordenados) é idêntica: `diff` sem saída. O commit não acrescenta falha. Das 59, 58 são `test_atualizar` e `test_sugerir` que recusam rodar dentro do Claude (`bin/forge_versoes.py:510-521`); o rc 0 se prova na CI do PR.
- `scripts/validar-plugin.sh`: "Validation passed". `scripts/verificar-contribuicao.sh`: "nenhum segredo nem caminho pessoal no diff".
- O push só passou depois de apagar `__pycache__` que sobrara na worktree (o pre-push falhou em `Neutralidade` lendo `.pyc`, 1ª tentativa); na 2ª, os testes dirigidos do pre-push passaram.
- Segurança (E1.4) e QA (E1.5) seguem em etapas próprias; o parecer de devops do autor (`docs/devops/043-f22-release.md`) é citado, não refeito.

## Achados
- A1 (recomendado) docs/analises/043-f22-corpo-do-pr.md:23 · a linha do checklist "Rótulo `afrouxa-regra` pedido ao dono (não marcar...)" fica desmarcada e confunde: a mudança só acrescenta restrição. Reescreva como "n/a: não afrouxa regra protegida" ou remova.
- A2 (recomendado) docs/regras/R-FLUXO.md:15 · "autor esperado" não diz quem é; um PR de release do usuário ou do tech-lead é esperado. Numa próxima rodada, nomeie ("o próprio usuário ou a conta do tech-lead do projeto"). Não devolve a entrega.
