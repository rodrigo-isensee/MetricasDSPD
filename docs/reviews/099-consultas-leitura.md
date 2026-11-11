---
tipo: review
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: chore/consultas-leitura-098-099
commit: 7bf135762d25c6d7e95089128e9f69c20ca1b8cd
parecer: aprovado
revisor: tech-lead
data: 2026-11-11
---

# Code review: comando único das consultas só de leitura dos pedidos 098 e 099 (K-275, E3.3)

## Revalidação no head 7bf13576 (voltas 2 e 3)
Delta lido (`forge-check parecer delta docs/reviews/099-consultas-leitura.md`): intervalo `1a3d8dd1..c27687f2`, no domínio `docs/analises/098-discovery.md`, `docs/analises/099-revisao-campos.md`, `scripts/consultas-leitura-098-099.sh` e `scripts/consultas-leitura-098-099.test.sh`. Os pareceres de QA (790fb801) e de segurança (c27687f2) ficam com os papéis deles. Nada rodou contra base real; nenhum `.env*` foi aberto.

- **Volta 2 (f5a7d442, dcfa78f3), os três achados anteriores:** A1 resolvido (saída vazia do MySQL vira "0 linhas" e conta como ok; PostgreSQL vazio continua recusado; os dois com caso). A2 resolvido (`ORIGEM` e `RAIZ` por `pwd -P`, caso com link simbólico para dentro do repositório). A3 resolvido (as duas análises citadas no `ORIGEM` dos `.sql` agora versionadas).
- **Volta 3 (7bf13576):** o `. "$ARQUIVO_ENV"` passa a rodar com `2>/dev/null` dentro de `if !`, entre `set -a` e `set +a`, e falha pelo `falhar` com etapa e categoria, como o resto do script; nenhum trecho do `.env` chega à tela. `set_config`, `pg_read_file`, `pg_read_binary_file` e `lo_import` entram na lista de palavras proibidas; como o `grep -w` trata `_` como parte da palavra, `set` não pegava `set_config` e a palavra nova é necessária. O comentário do cabeçalho acompanha a lista.
- **Os testes novos provam o que dizem:** cada sonda nova só tem a guarda que ela nomeia para pegá-la (`\gexec` sem `INTO` nem palavra da lista: só a barra invertida; `SELECT 1; SELECT 2;`: só o limite de um ponto e vírgula; `set_config(...)`, `pg_read_file(...)` etc.: só a palavra nova). Mutantes rodados numa cópia no scratchpad, um por vez: tirar `set_config` da lista derruba o caso `set_config`; tirar `lo_import` derruba o caso `lo_import`; tirar o `2>/dev/null` do `.` derruba o caso ".env com linha ruim". Os três morreram.
- **Ferramentas:** `bash scripts/consultas-leitura-098-099.test.sh`: rc 0, 55 casos `ok`, "todos os casos passaram". `shellcheck` no script e no teste: sem saída (rc 0).

## O que foi conferido na primeira passada (1a3d8dd1)
- **Padrões dos outros scripts:** carga do `.env` como o `coleta.sh` e o `demo-dado-real.sh`; `falhar` com etapa e categoria; PostgreSQL por `docker compose exec -T -e PGPASSWORD` com `psql -X` e `-U dspd_coletor`; senha só por ambiente; data de Brasília; saída fora do repositório.
- **As 31 consultas batem com as análises:** cópia literal de `099-revisao-campos.md` §3.2 a §3.6, `098-discovery.md` §1.1 e §1.2 e `099-dado-real-operacional.md` §5; colunas declaradas batem com os apelidos de cada `SELECT`. Fora, com motivo no documento: B1-b, B3-a, B3-b e C-AC5.
- **Documentação e `.gitignore`:** `docs/engineering/demo-dado-real.md` diz como rodar, onde cai a saída e o que a guarda não pega; o `.gitignore` só ganha `consultas-098-099-*.txt`. `package.json` ganha `consultas:098-099` e o teste no `test:trava`, sem dependência nova.

## Achados

## Veredito
**Aprovado** em 7bf135762d25c6d7e95089128e9f69c20ca1b8cd, sem achado aberto (o bloco acima fica vazio de propósito: A1 a A3 da primeira passada foram resolvidos na volta 2, e a volta 3 não traz achado novo). A volta 3 segue os padrões do script, cada teste novo prova a guarda que nomeia (três mutantes mortos), o teste do script passa inteiro e o shellcheck não aponta nada.
