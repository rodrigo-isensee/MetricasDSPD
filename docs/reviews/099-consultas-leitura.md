---
tipo: review
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: chore/consultas-leitura-098-099
commit: 1a3d8dd111036a4dafe4dbfcb015121641cce227
parecer: aprovado
revisor: tech-lead
data: 2026-11-11
---

# Code review: comando único das consultas só de leitura dos pedidos 098 e 099 (K-275, E3.3)

Diff lido: `git diff c7c3e092 1a3d8dd1` (37 arquivos, +831 −1): `scripts/consultas-leitura-098-099.sh`, o teste, os 31 `.sql` em `scripts/sql/consultas-098-099/`, `docs/engineering/demo-dado-real.md`, `.gitignore`, `package.json` e o parecer de segurança (`docs/security/099-consultas-leitura.md`, aprovado em aa8b6f20 com A1 a A4 recomendados; a volta 1 em 1a3d8dd1 trata A1, A3 e A4). Nada rodou contra base real; nenhum `.env*` foi aberto.

## O que foi conferido
- **Padrões dos outros scripts:** carga do `.env` igual ao `coleta.sh` e ao `demo-dado-real.sh` (`set -a; . .env; set +a`); `falhar` com etapa e categoria como o `demo-dado-real.sh`; PostgreSQL pelo `docker compose exec -T -e PGPASSWORD` com `psql -X` e `-U dspd_coletor`, como a etapa 10 da demo; senha só por ambiente, como o `lib-pg.sh`; data de Brasília (`TZ=America/Sao_Paulo date +%F`) como o `hoje_brasilia`; saída fora do repositório, na linha do `exigir_dir_fora_do_repo` (ver A2).
- **As 31 consultas batem com as análises:** conferido por programa, o código de cada `.sql` (sem as linhas de cabeçalho `ID`, `FONTE`, `ORIGEM`, `COLUNAS`, `NOTA`) aparece literalmente em `099-revisao-campos.md` §3.2 a §3.6 (B2-a a B6-c), `098-discovery.md` §1.1 e §1.2 (C-AC1 a C-AC4, C-BM1 a C-BM5) e `099-dado-real-operacional.md` §5 (Q-RO-1 a Q-RO-11). Q-RO-10b é a variante que a análise manda rodar em separado (troca só o `JSON_TABLE`, como a nota do arquivo diz). As colunas declaradas batem com os apelidos de cada `SELECT` (Q-RO-8 declara `count`, que é o nome que o PostgreSQL dá ao `COUNT(*)` sem apelido). Fora, com motivo escrito no documento: B1-b, B3-a, B3-b e C-AC5.
- **O teste cobre as sondas da segurança:** S1 a S7 do parecer viraram casos (linhas 141 a 147), mais `SELECT` seguido de `SET` e `INTO OUTFILE`, cada um exigindo recusa, rc 1 e banco não chamado; o corpus dos 31 `.sql` precisa passar inteiro (31 ok); A3 (`--defaults-file`, `--sandbox`, `ssl-fp` fixado, nenhuma forma de desligar a verificação) e A4 (saída na pasta pessoal quando chamado de dentro do repositório; padrão no `.gitignore`) têm caso próprio.
- **Documentação:** `docs/engineering/demo-dado-real.md` diz como rodar (três formas), onde cai a saída, o que a guarda pega e o que não pega (nome de pessoa dentro de nome de domínio: o dono confere antes de colar) e o que fica fora do comando.
- **`.gitignore`:** só a linha `consultas-098-099-*.txt`, com uma linha de comentário e uma em branco.
- **Fora da lista de arquivos do brief, mas no diff:** `package.json` ganha o script `consultas:098-099` e o teste no `test:trava`; é o que a documentação manda rodar, sem dependência nova.
- **Ferramentas:** `bash scripts/consultas-leitura-098-099.test.sh`: 43 casos `ok`, "todos os casos passaram". `shellcheck` no script e no teste: sem saída (rc 0).

## Achados
- A1 (recomendado) scripts/consultas-leitura-098-099.sh:128 · o mysql --batch não imprime cabeçalho quando o resultado é vazio; a guarda recusa "saida vazia" e sai com rc 1, e uma resposta legítima (Q-RO-10a/b sem campo de causa raiz) aparece como RECUSADA; tratar vazio do MySQL como 0 linhas e testar com o falso sem saída.
- A2 (recomendado) scripts/consultas-leitura-098-099.sh:148 · a conferência de saída dentro do repositório compara caminhos lógicos; com link simbólico ou INIT_CWD físico ela não casa (o .gitignore ainda cobre); normalizar ORIGEM e RAIZ com pwd -P, como o exigir_dir_fora_do_repo do lib-pg.sh.
- A3 (recomendado) scripts/sql/consultas-098-099/01-B2-a.sql:3 · o ORIGEM de 19 consultas cita docs/analises/099-revisao-campos.md e 098-discovery.md, que não estão versionados na develop (c7c3e092) nem nesta branch; versionar as análises para a referência valer no repositório.

## Veredito
**Aprovado** em 1a3d8dd111036a4dafe4dbfcb015121641cce227: o script segue os padrões do projeto, as 31 consultas são cópia literal das análises, o teste cobre S1 a S7 e A3/A4 da segurança, a documentação diz como rodar e o que conferir, e o `.gitignore` só ganhou a linha da saída. Sem bloqueante; A1 é o mais útil antes de o dono rodar, porque muda a leitura de uma consulta vazia.
