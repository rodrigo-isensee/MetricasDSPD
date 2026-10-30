---
tipo: revisao-devops
contrato: 1
pedido: 043-forge-f21-f22
branch: melhoria/MetricasDSPD-f22-release
commit: 0b595051930e4207d5a65eb3a5d551bf8f7b7180
parecer: aprovado
revisor: forge:devops-engineer
data: 2026-10-27
---
# Review de devops: 043-forge-f21-f22 (F22, texto de release)

Branch no clone de contribuição do Forge (`~/.forge-contrib/MetricasDSPD-wt/f22`), sobre `origin/develop` 41ba611. Só texto; nenhum workflow, hook ou modelo de projeto alterado (`git diff --name-only origin/develop -- .github templates/projeto/.githooks hooks`: 0 linhas). Parecer do autor da entrega; a revisão independente é a E2.3.

## Parecer
Aprovado, com a ressalva de teste abaixo (ambiente, não defeito da entrega). Mitigações do modelo de ameaças (F22) por arquivo:linha:

| Mitigação | Onde |
|---|---|
| N1 listar com `--base main --head homolog --state open`, conferir `isCrossRepository`, `baseRefName`, autor; mais de um, fork ou autor inesperado: parar e levar ao Jarvis | `docs/regras/R-FLUXO.md:15`; resumo em `agents/tech-lead.md:33` |
| N2 edição só de título e corpo; nunca `--base`, `--head`, `--add-reviewer`, estado ou rascunho; base errada: fechar e levar ao Jarvis | `docs/regras/R-FLUXO.md:15`; `agents/tech-lead.md:33` ("nunca a base") |
| N3 cria ou edita e para; `gh pr merge`, `--auto` e push na `main` são do usuário, citando `R-MAIN` por ID | `docs/regras/R-FLUXO.md:15`; `agents/tech-lead.md:33` |
| N4 corpo por `--body-file`, nunca `--body` interpolado; só resumo e links; sem segredo, dado pessoal ou log bruto; sem dado de projeto | `docs/regras/R-FLUXO.md:15` |
| N5 abre só com portão verde; check roda de novo antes do merge no sha do candidato; pendente = esperar e reexecutar o mesmo sha; não fechar e recriar para limpar o vermelho; não afrouxar o check (`R-CONFORMIDADE`) | `skills/ci-cd/SKILL.md:45`; `docs/regras/R-FLUXO.md:15` |
| N6 erro do `gh` não é "sem PR" (cria só com listagem bem-sucedida e vazia); uma linha no corpo se o usuário já viu o PR | `docs/regras/R-FLUXO.md:15` |

Buscas no texto novo: `--no-verify`, `--force`, `--auto`, `--base` e `merge` só aparecem em proibição; nenhum dado deste projeto (R-NEUTRO; o único "MetricasDSPD" do diff é o nome do fragmento `changelog.d/MetricasDSPD-f22-release.md`, convenção de nome de branch). Fragmento criado com `bin/forge-changelog novo`; versão e `CHANGELOG.md` intocados.

## Testes (ressalva, sem bloqueio)
- `scripts/validar-plugin.sh`: "Validation passed". `scripts/verificar-contribuicao.sh`: "nenhum segredo nem caminho pessoal no diff".
- `python3 -m unittest discover -s tests`: rc=1, 76 falhas na segunda execução (71 na primeira). Quase todas são `test_atualizar`, `test_sugerir` e `test_sessao_versao_carregada`, que recusam rodar dentro do Claude (`bin/forge_versoes.py:510-521`, detecção por variável e por processo ancestral `claude`: "isto é com você, não com o Claude"); tirar as variáveis CLAUDE* do ambiente não basta por causa do ancestral. As demais eram `test_forge.Neutralidade` lendo `__pycache__` gerado pela própria suíte; apagado o cache, `tests.test_forge.Neutralidade` passa (2 testes OK). Nenhuma falha toca os arquivos alterados. Falta uma rodada limpa fora do Claude (o dono, ou o CI do PR) para fechar o rc=0.
- Lacuna: `actionlint` e `shellcheck` não se aplicam (nenhum workflow nem script alterado).

## Medida (depois do PR, nos projetos)
- 0 checks de promoção vermelhos por corrida em 2 releases seguidas: `gh run list --workflow <check de promoção> --json conclusion,createdAt,headSha` comparado ao fim do job do portão (`gh run view <id> --json jobs`); corrida = vermelho cujo run começou antes de o portão fechar.
- 0 PR de release duplicado: `gh pr list --base main --head homolog --state all` com 1 PR por release e nenhum "already exists" na retrospectiva.
- Qualquer um fora de 0: passar à opção B da análise (guarda em hook), que reabre o modelo de ameaças.

## Custo e rollback
Zero minutos de CI novos e nenhum recurso (`R-CUSTO`). Rollback: reverter o commit (3 arquivos de texto e 1 fragmento).
