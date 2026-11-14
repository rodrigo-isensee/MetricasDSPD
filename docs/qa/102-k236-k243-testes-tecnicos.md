---
tipo: qa
contrato: 1
pedido: 102-forge-0460
branch: fix/k236-k243-testes-tecnicos
commit: 7e6f0b56aba5b356e7e85c2c238a7290710fd8b7
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-14
---
# QA: K-236 e K-243, testes técnicos (E1.30)

Sem especificação de UX nem contrato de API: o lote é de teste e uma constante. As obrigações são as do pedido (K-236: nenhuma coluna de pessoa ou fora da API legível pelo `dspd_api` em bm, ac e core; K-243: campos do grupo de lista conferidos contra valores escritos no teste). Sem banco local (regra do dono); a prova dos `.pg` é o CI.

## Achados

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| K-236 coluna de `COLUNAS_PESSOA`/`COLUNAS_FORA_DA_API` nunca legível | `grants-api-colunas.pg.test.ts` (7 testes) | permissão por coluna | passou no CI (job `banco`, run 43554308380, 7 tests) |
| K-236 varredura não passa por vazio; listas não ficam desatualizadas | mesmo arquivo, testes 1 e 3 | vazio | passou no CI |
| K-236 core coberto (`ref_`, `pesq_`, `vw_pesq_`) | mesmo arquivo, array com `dspd_core` (linha 32) | limite do schema | passou no CI |
| K-243 `fluxo_sha256` e `recorte_sha256` com os campos escritos no teste | `acelerato-e10-recusa.test.ts`, `it.each` novo | lista exata | passou, 11/11 local |

## Cenários e resultado real
- Local, sem banco: `npx vitest run tests/acelerato-e10-recusa.test.ts --maxWorkers=2` no head: 1 arquivo, 11 passaram.
- Mutante do K-243, à mão: em `controle.ts` troquei `fluxo_sha256: [CAMPO_ETAPA_FLUXO]` por `['etapa_fluxo_x']`. O teste `fluxo_sha256: a consulta de vigência recebe exatamente os campos do grupo...` caiu: `expected [ [ 'etapa_fluxo_x' ] ] to deeply equal [ [ 'etapa_fluxo' ] ]` (1 falhou, 10 passaram). O arquivo foi restaurado por `git show HEAD:` e a árvore voltou limpa. O teste não é tautológico: a lista esperada está escrita nele.
- Mutante do K-236, por leitura (sem banco): em `gerarGrants` (`grants.ts:79-86`), tirar o filtro `!COLUNAS_PESSOA.includes(id)` de `colunasApi`, ou gerar GRANT de tabela inteira em `dim_card`, deixa uma coluna de `COLUNAS_PESSOA` com `has_column_privilege('dspd_api', ..., 'SELECT')` verdadeiro. O teste "nenhuma coluna legível pela API está em COLUNAS_PESSOA ou COLUNAS_FORA_DA_API" monta `proibidas` com essas listas, filtra as colunas legíveis cujo id está nelas e espera `[]`, então falha listando a coluna. O teste de nome de pessoa (`colunaDePessoa`) pega a mesma liberação para colunas com nome de pessoa fora de `EXCECOES_PESSOA`. Um GRANT indevido em tabela de `TABELAS_FORA_DA_API` cai no teste dessa lista. O teste de 42501 confere o privilégio efetivo contra a leitura real.
- Vermelho antes do verde: o K-243 trocou só uma constante sem mudar valor, então o vermelho é o mutante acima. O K-236 é teste de guarda sem mudança de regra; o vermelho dele é o mutante lido, não rodado (sem banco).
- Mutantes `forge-mutante`: n/a, o pedido não toca `bin/`, `hooks/`, `.githooks/` nem `tests/catraca.py`.
- CI do mesmo sha (citado, não refeito): `banco` verde com `tests/grants-api-colunas.pg.test.ts (7 tests)`, `testes` verde.
