---
tipo: review
contrato: 1
pedido: 042-forge-0-30-3-e-retomada
branch: feature/042-protecao-develop
commit: 90e8dcc704bc96e4f76e1ccc119e11abcef40d44
parecer: reprovado
revisor: tech-lead
data: 2026-10-27
---

# Code review: checks obrigatórios da CI na develop (042, K-148, E4.3)

**Veredito: reprovado.** A causa é um único achado bloqueante (A1): a seção 15 está correta, mas o mesmo documento ainda traz três especificações antigas e diferentes da proteção da `develop` (seções 4, 5 e 14). O ajuste é pequeno e só de texto. O resto da entrega está certo.

Escopo lido: `git diff e342a2c..90e8dcc`, com dois arquivos `.md`: `docs/engineering/fluxo-homologacao.md` (seção 15 nova) e `docs/devops/042-protecao-develop.md`. Também li os nomes e as condições `if:` dos jobs de `.github/workflows/ci.yml`. Fiz duas leituras no GitHub, só com GET: a proteção atual da `develop` (`gh api .../branches/develop/protection`) e os checks do PR #142 (`gh pr checks 142`). Não fiz nenhuma chamada que altere o GitHub.

## Conferência da seção 15

- **Lista de checks.** Ela é igual aos jobs que rodam em `pull_request` para a `develop`: `rapida`, `testes`, `filtro`, `banco`, `openapi`, `imagem`, `build`, `e2e` e `seguranca`. Todos têm `name:` igual ao id do job, e os nove aparecem nos checks do #142. `perf` fica fora com razão: o `if:` dele só o roda para `homolog`/`main`, no schedule e no dispatch. `banco`, quando pulado pelo `if:`, conta como sucesso.
- **Comando PUT.** Comparei o corpo com a proteção atual lida pelo GET. `enforce_admins`, `required_linear_history`, `allow_force_pushes`, `allow_deletions`, `block_creations`, `required_conversation_resolution`, `lock_branch` e `allow_fork_syncing` repetem o estado atual. `required_pull_request_reviews: null` e `restrictions: null` também batem com o estado atual, em que essas regras não existem. `required_signatures` tem endpoint próprio e o PUT não o altera. Nenhuma regra atual fica mais fraca: o comando só acrescenta `required_status_checks`. As chaves obrigatórias do endpoint estão todas presentes.
- **Rollback e conferência.** `DELETE .../protection/required_status_checks` é o endpoint certo e remove só os checks. O GET com `--jq` serve de prova.
- **Parecer de devops.** Tem a forma do projeto: frontmatter `tipo: revisao-devops`, `contrato`, `pedido`, `branch`, `commit`, `parecer`, `revisor` e `data`, igual a `docs/devops/030-dependabot-develop.md`, mais as seções "Parecer" e "Custo e rollback". O campo `commit` aponta a base (`e342a2c`), já que o parecer está no próprio commit que entrega. A `R-CUSTO` está tratada. A pendência de segurança está declarada, e a de aplicação foi passada ao dono (`R-CONFORMIDADE`).

## Regras de ferramenta

`forge-check docs`: nenhuma linha sobre os dois arquivos do diff. O código de saída é 1 por erros de frontmatter que já existiam em outros arquivos (`docs/qa/*.md`, `docs/reviews/front-via-api.md`, `docs/architecture/features/front-via-api.md`), fora desta entrega. Não há código nem teste no diff: o teto M14 não se aplica (0 linhas) e, pela `R-QA`, a entrega está isenta de QA. O parecer de segurança (E4.2) é do `security-engineer` e não é refeito aqui.

## Achados

- A1 (bloqueante) docs/engineering/fluxo-homologacao.md:181 · Três trechos do mesmo documento ainda descrevem outra proteção da `develop`. Na seção 14, a linha 180 exige PR, e a linha 181 lista só `rapida`, `testes`, `build`, `e2e` e `banco` e manda marcar "Require branches to be up to date" (`strict`). Na seção 5, a linha 68 diz "PR obrigatório; checks do gate 1". Na seção 4, a linha 48 lista o gate 1 sem `filtro`, `openapi`, `imagem` e `seguranca`, e a linha 44 diz que esses ficam como estão, ou seja, não obrigatórios. A seção 15 diz o contrário: `strict` desligado, nenhum PR obrigatório e nove checks. O dono pode aplicar pela seção 14 (Settings) e configurar outra regra. Isso fere o requisito "correta e completa" do brief. Correção: alinhar as linhas 44, 48, 68, 180 e 181 com a seção 15, ou marcar nelas que a seção 15 substitui a parte da `develop`.
- A2 (recomendado) docs/engineering/fluxo-homologacao.md:230 · O `ci.yml` roda em `push` e em `pull_request`. Por isso o mesmo SHA recebe dois check runs com o mesmo nome. No #142 isso aparece assim: `e2e` foi pulado no run de push e passou no de PR; `banco` passou no run de push e foi pulado no de PR. Se o GitHub aceitar o check pulado do run de push enquanto o `e2e` do run de PR ainda roda, a regra não segura o caso do #133. Não está provado. Sugestão: na conferência depois da aplicação, abrir um PR e ver que o merge fica bloqueado enquanto o `e2e` do PR está em curso.
- A3 (recomendado) docs/devops/042-protecao-develop.md:16 · A frase "No #142, `banco` saiu skipping" vale só para o run de PR, porque no run de push o `banco` rodou e passou. Vale deixar isso explícito junto com A2.
- A4 (recomendado) .github/workflows/ci.yml:281 · O `seguranca` tem `continue-on-error: true` e o comentário "Informativo: nunca bloqueia". Como check obrigatório, ele só exige que o job tenha rodado. Não muda o comportamento, mas vale uma linha na seção 15 dizendo que o `seguranca` continua informativo. O workflow fica fora do escopo desta entrega.

## Revalidação

A volta é por delta: rodar `forge-check delta --parecer docs/reviews/042-protecao-develop-r1.md` e ler só as linhas que mudaram para A1, mais o que o autor fizer com os itens recomendados.
