---
tipo: review
contrato: 1
pedido: 102-forge-0460
branch: fix/k317-k309-prepush
commit: 23a8d56e40300954850020c39f69c27b6862623f
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-13
---
# Code review: K-317, lint dos alterados com o server, árvore de trabalho e bit de execução (E1.11)

Diff lido: `git diff 0c9cf759...23a8d56e` (1 commit, `23a8d56e`; o `3a98be19` é o parecer de devops, citado e não refeito): `scripts/lint-alterados.sh`, `scripts/typecheck-alterados.sh`, os dois testes deles, `scripts/pre-push.test.sh` (novo) e a linha `test:trava` do `package.json`. O K-309 (hook do dono) fica fora, como manda o pedido.

## Ferramentas (citadas, não refeitas)
- CI do head da branch `3a98be19` (só um `.md` acima do `23a8d56e`): `rapida`, `testes`, `banco`, `build`, `openapi`, `seguranca`, `imagem` e `filtro` verdes; `e2e` e `perf` pulados pelo filtro.
- Testes do diff rodados aqui (git e pnpm falsos, repositório descartável sob `node_modules/.cache`): `lint-alterados.test.sh` 13/13, `typecheck-alterados.test.sh` 14/14 (com `node` no PATH; sem ele o caso 6 cai, o que é do ambiente do sandbox, não do diff), `pre-push.test.sh` 2/2.
- `shellcheck` nos dois scripts: limpo. Nos testes, só SC2319 (estilo `$?`), o mesmo dos testes que já existiam.
- Mutantes no `lint-alterados.sh` (cópia fora da branch): sem `|| rc=1` no server (morre: 2 casos), sem `|| rc=1` na raiz (morre: 2), sem `ls-files --others` (morre: 1), diff contra `HEAD` em vez da árvore (morre: 1), sem o roteamento `server/*` (morre: 5). A guarda de merge-base sobrevive (A1).
- Tamanho (M14): 190 linhas de código e teste (`git diff --numstat --no-renames`), acima das 150 (A2).

## Conferência
- **Faz o que o cartão pede:** `server/**` deixa de passar em silêncio (vai ao eslint do pacote, com caminho relativo a ele, já que o `eslint.config.js` da raiz ignora `server/**`); a base vira o merge-base contra a árvore de trabalho mais os não rastreados, nos dois scripts; o bit 100755 entra nos dois arquivos que faltavam; o `pre-push.test.sh` roda o hook real com a entrada que o git entrega e prova a recusa com erro plantado no server.
- **Hook e árvore suja:** comparar com a árvore não muda o contrato do hook: com árvore suja ele já só avisava (`.githooks/pre-push`, ramo `git status --porcelain`), e com árvore limpa a árvore é o `HEAD`, então o que se confere é o commit enviado.
- **Cache:** o eslint do server grava em `server/node_modules/.cache/eslint` (o `exec` roda na pasta do pacote), separado do da raiz; sem colisão.
- **Arquivo ignorado pelo server:** o eslint do pacote roda sem `--no-warn-ignored`; arquivo ignorado vira aviso, não erro, e o comando não usa `--max-warnings`. Correto.
- **Regras invioláveis:** só ferramental de pre-push; nada de métrica, fonte nem dado de pessoa.

## Achados
- A1 (recomendado) scripts/lint-alterados.sh:16 · guarda "sem merge-base" (e a de scripts/typecheck-alterados.sh:14) sem teste do ramo de falha: o mutante sobrevive 13/13 e dá verde em branco (S2). Sugestão: caso `git switch --orphan` em cada teste.
- A2 (recomendado) scripts/lint-alterados.test.sh:1 · 190 linhas de código e teste, acima de 150 (M14), um comportamento só: o corpo do PR traz a linha `teto: excedido`.

## Detalhe dos achados
A1: o mutante é `if ! mb=... && false`; sem a guarda, branch órfã com `origin/develop` presente dá `fatal: bad revision ''` e "lint pulado", rc=0. A guarda está certa (S1, S3) e o CI roda o lint inteiro, por isso não bloqueia; o caso esperaria `pnpm run lint` / `pnpm run typecheck`. Linha sugerida para o A2: `teto: excedido, 190 linhas, três scripts do mesmo pre-push com os testes de cada um`.

## Sondas
- S1 · branch órfã com `origin/develop` presente, script do `23a8d56e` · espera: fallback para o lint inteiro · obtido: "sem merge-base com origin/develop; fallback para o lint inteiro", `pnpm run lint`
- S2 · a mesma entrada com o mutante da guarda · espera: verde em branco se a guarda some · obtido: `fatal: bad revision ''`, "lint pulado", rc=0
- S3 · branch órfã no `typecheck-alterados.sh` do `23a8d56e` · espera: typecheck inteiro · obtido: "sem merge-base ...; fallback para o typecheck inteiro", `pnpm run typecheck`

## Conclusão
Parecer: aprovado no `23a8d56e`. A1 e A2 são recomendados e não seguram o QA (E1.3) nem o merge.
