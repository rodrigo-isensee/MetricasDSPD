---
tipo: review
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: fix/k277-consultas-escape
commit: a73f2c4bfaee44b15b09e0003f7ce7691778a83a
parecer: aprovado
revisor: tech-lead
data: 2026-11-11
---

# Code review: K-277, o comando de consultas de leitura recusa U&, UESCAPE e os prefixos pg_ e lo_ (E3.8)

## O que foi conferido
- Diff `167f3a13..a73f2c4b`: dois arquivos, 12 linhas adicionadas (`scripts/consultas-leitura-098-099.sh:103-105`, `scripts/consultas-leitura-098-099.test.sh:161-169`). Dentro do teto de 150 linhas; um comportamento só.
- Faz o que o A5 de `docs/security/099-consultas-leitura.md` pede, nem mais nem menos: `validar_sql` recusa, sem diferença de caixa, `U&`, a palavra `UESCAPE` e identificador começado por `pg_` ou `lo_`, cada um com mensagem própria e `return 3`, como as guardas vizinhas. As fronteiras `[^[:alnum:]_]` evitam falso positivo em `stg_pg_x`; aspas duplas não protegem (`"pg_x"` é recusado). Os 31 `.sql` versionados seguem aceitos (o caso do corpus passa).
- Clareza: comentário de uma linha com a origem (A5, K-277); regex legível; sem duplicação com a lista de palavras (o `-w` de `PALAVRAS_PROIBIDAS` não pegaria `pg_advisory_lock`, por isso a guarda por prefixo é necessária).
- Commit `a73f2c4b`: Conventional Commits em português, corpo explica o porquê, trailer `Cartão: K-277`.
- Ferramentas (só as do brief): `bash scripts/consultas-leitura-098-099.test.sh` → `todos os casos passaram` (rc 0); `shellcheck` dos dois arquivos → sem saída (rc 0). Nada contra banco real; nenhum `.env*` aberto; sem `pnpm run pronto` (o CI do PR confirma).
- Mutação manual das guardas, numa cópia no scratchpad (o caso `gitignore cobre ...` falha em toda cópia por não haver `.gitignore` nela; ignorado):
  - sem `(pg|lo)_` (linha 105): morto por S10, S11, S12, `PG_` e `LO_`.
  - `(pg)_` no lugar de `(pg|lo)_`: morto por S12 e `LO_`.
  - sem a alternativa `uescape` (linha 104): morto por `UESCAPE sozinho, caixa mista`.
  - sem a alternativa `U&|` (linha 104): **sobrevive** (S8 e S9 também têm `UESCAPE`). Ver A1.

## Achados
- A1 (recomendado) scripts/consultas-leitura-098-099.test.sh:162 · a alternativa `U&` da guarda (sh:104) não tem sonda própria: S8 e S9 trazem também UESCAPE e o mutante sem `U&|` sobrevive. Impacto baixo (U& sem UESCAPE só escapa com barra invertida, já recusada); somar `SELECT U&"x"` numa próxima volta.

## Veredito
Aprovado no head `a73f2c4b`. Nenhum bloqueante: a guarda cumpre o A5, os testes provam a recusa de cada prefixo e do UESCAPE, e o A1 é só lacuna de teste sobre um ramo que a guarda de barra invertida já cobre. PR e merge ficam para a delegação seguinte (E3.8).
