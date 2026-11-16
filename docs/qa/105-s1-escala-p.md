---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-s1-escala-p1-p5
commit: 744e5a36e23676f9edc0cf6af88ef7b3e891890a
parecer: reprovado
resultado: reprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 2
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-16
---
# QA: S1 só com a escala P1 a P5 (E7.238, decisão S1 B do dono)

Obrigações nomeadas (decisão S1 B, pedido 105): CA-1 migração 0040 do zero (`dim_chamado.escala_p boolean NULL`, só em `dim_chamado`); CA-2 migração sobre base com dados (linhas intactas, coluna nasce nula); CA-3 normalizador e projetor gravam `escala_p`; CA-4 `ac:reprojetar-escala` preenche só onde nula, pelo staging, e é idempotente; CA-5 o S1 conta só `escala_p` diferente de false e informa `foraDaMatriz {outrasEscalas, semPrazo}`; CA-6 sem escala projetada o S1 real responde sem dado real, com motivo; CA-7 critério `105:S1-escala-p` registrado; CA-8 cartão mostra a contagem de fora da conta.

Código testado: `744e5a36` (o `Revisar-sha:`). O tip da branch hoje é `21ab8e20`, que só soma `docs/security/105-s1-escala-p.md` (fast-forward feito antes deste commit). Sem PR: a suíte inteira fica para o CI do PR.

## Achados

- A1 (bloqueante) server/tests/acelerato-l9c.pg.test.ts:25 · a 0040 faz o teste "migração: linhas nulas seguem nulas" falhar: `linhas()` tira só `fluxo` do `to_jsonb(d)`; `escala_p` nasce na subida depois do down até a 0035 e a comparação difere. Tirar também `escala_p`. Check `banco` vermelho no CI do head.
- A2 (bloqueante) server/tests/pg/esquema.snapshot.json:79 · falta a linha `dspd_ac.dim_chamado.escala_p boolean NULL`: o "snapshot de esquema" do catalogo.pg.test.ts falha (768 colunas recebidas contra 767). Regravar com ATUALIZAR_SNAPSHOT=1 e conferir que só essa linha entra.
- A3 (recomendado) packages/metricas/src/acelerato/s1.ts:87 · mutante que troca `fechados.filter(naMatriz).length - apuraveis.length` por `fechados.length - apuraveis.length` sobreviveu: nenhum teste fixa `excecoesForaDaApuracao` com chamado de outra escala fechado na janela.
- A4 (recomendado) web/src/features/sustentacao/components/CartaoS1.tsx:189 · mutante que mostra `outrasEscalas` no lugar de `semPrazo` sobreviveu: nenhum teste de cartão afirma os dois números da frase "Fora da conta" com valores diferentes.
- A5 (recomendado) deploy:1 · o brief cita `pnpm run db:sql` e `deploy/sql` (SQL do DBA da VM) como não regenerados; neste head não existe script `db:sql` nem `deploy/sql` (só `deploy/systemd`). Não verifiquei; o dono do SQL da VM confirma onde ele vive e se a 0040 entra.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| CA-1 | meu `acelerato-reprojecao-escala.qa.pg.test.ts` caso 1 (PostgreSQL 17 real, banco `qa105`): `information_schema` boolean, nullable YES; ausente em `dim_chamado_versao`; `dspd_api` lê a coluna | coluna só na dimensão; leitura pelo papel da API | passou |
| CA-2 | mesmo arquivo, caso 2: down até a 0039 (`quantasDesde(40)`), 3 linhas (P, família mapeada, sem prioridade), up duas vezes; `to_jsonb - escala_p` igual antes e depois; todos nulos | base com dados; subida repetida | passou |
| CA-3 | mesmo arquivo, caso 3 (coleta e projeção reais pelo `dspd_coletor`): `P2 - Alta` true, `SSSC - INCIDENTE - BAIXA` false, fora do mapa e vazio nulos; unitário `acelerato-normalizador.test.ts` (7 entradas) | P, família, fora do mapa, vazio | passou |
| CA-4 | mesmo arquivo, casos 4 e 5: 9 chamados (nulo, já true, já false, sem prioridade, sem staging, fora do mapa, sem hífen, duas versões de staging); só os nulos mudam, última versão vale, `stg_chamado`, `dim_chamado_versao`, `fato_etapa_chamado`, `stg_etapa` com hash igual; 2ª execução lidos 3, preenchidos 0, hash de `dim_chamado` igual; 2600 linhas (2 lotes) preenchidas | nulo x preenchido; idempotência; mais de um lote | passou |
| CA-4 (entrada) | `reprojetar-escala-ac-entrada.test.ts` e `acelerato-reprojecao-escala.test.ts` do autor (banco falso) | falha sem texto do banco; transação | passou |
| CA-5 | `acelerato.test.ts` (S1): 20 de outras escalas e 8 sem prazo, 0 e 0 sem marca, contagem independente do filtro, abaixo de 20 não publica | 19 x 20; filtro de prioridade | passou (ressalva A3) |
| CA-6 | `painel-real-f6.test.ts`: prioridade presente e `escala_p` ausente = sem dado real com `MOTIVO_ESCALA_NAO_PROJETADA`; mutantes U6 e U7 mortos | base real sem a coluna projetada | passou |
| CA-7 | `criterios-acelerato.test.ts`: nove entradas, `105:S1-escala-p` com `S1` | histórico preservado | passou |
| CA-8 | `sustentacao.test.tsx` (com e sem `foraDaMatriz`) | contrato opcional | passou (ressalva A4) |
| Migração no CI (pg) | `acelerato-l9c.pg.test.ts` e `catalogo.pg.test.ts` | down/up e snapshot | falhou (A1, A2) |

## Vermelho antes do verde
Código de produção da base (`57989aa0`) trazido sobre os testes do head, numa worktree minha, e restaurado depois (árvore limpa):

- `packages/metricas` `src/acelerato`: 4 falhas nos 4 testes novos do S1 (52 testes, 48 passam).
- server unit (`acelerato-normalizador`, `painel-real-f6`, `criterios-acelerato`): cai a entrada do critério e as 7 entradas de `escalaPDaPrioridade`.
- web `src/features/sustentacao`: 2 falhas (aviso sem `foraDaMatriz` e cartão do S1).
- A reprojeção e a 0040 não existem na base: o `import` novo cai, e conta como "herdada da base", não como prova; a prova delas é o meu teste em PostgreSQL real e o mutante M2/M4 abaixo.

## Mutação no diff (manual, restaurada a cada um)
| Mutante | Resultado |
|---|---|
| M1 tirar `AND d.escala_p IS NULL` do UPDATE | sobreviveu: equivalente observável, o SELECT já filtra nulos na mesma transação; é só defesa contra corrida; aceito |
| M2 tirar `escala_p IS NULL` do SELECT | morto |
| M3 `ESCALA_P` devolver false | morto (3 testes) |
| M4 tirar `escala_p` de `ATRIBUTOS_DIM` (projetor) | morto (2 testes) |
| U1 `naMatriz` sem `escala_p !== false` | morto |
| U2 `naMatriz` sem `prioridade !== undefined` | morto |
| U3 `outrasEscalas` com `!== true` | morto |
| U4 contagem sem `semPrioridade: true` | morto |
| U5 `excecoesForaDaApuracao` com `fechados.length` | sobreviveu (A3) |
| U6 `escala_p === undefined` do serviço trocado por `=== null` | morto |
| U7 `mapa.ts` passar `null` adiante | morto |
| U8 cartão com `outrasEscalas` no lugar de `semPrazo` | sobreviveu (A4) |

## Cenários e resultado real
Ambiente: worktree `MetricasDSPD-052h`, PostgreSQL 17 do Compose, banco descartável `qa105` criado e removido por mim (o `metricas_test` compartilhado tem os esquemas sem prefixo `dspd_ac`, `dspd_bm` e `dspd_core` de outra execução, que derrubam o teste "nada foi criado fora dos schemas prefixados"; não é desta entrega). Rodei por pacote, direto, sem a trava `suite-unica` (rodadas curtas, uma por vez).

- `pg` no `qa105`: meu arquivo (5 testes), `migracoes.pg`, `acelerato-projetor.pg`, `acelerato-reprojecao-fluxo.pg`, `grants-api-colunas.pg`, `bloqueio-colunas-grant.pg`: 26 passam. `acelerato-l9c.pg` e `catalogo.pg`: 2 falhas (A1, A2), reproduzidas aqui e no CI.
- Unitários: `packages/metricas/src/acelerato` 52 passam; `packages/contratos` 239; server (6 arquivos do S1) 152; web `src/features/sustentacao` 37.
- CI do head `744e5a36`: check-run `banco` falhou (2 testes, os mesmos A1 e A2); `testes` cancelado (run superada pelo push do commit de segurança); `rapida`, `openapi`, `build`, `imagem`, `seguranca` verdes. Sem check-run `bateria` e sem PR: não afirmo CI verde.
- Meu arquivo de teste (5 casos, PostgreSQL real) não foi commitado, por restrição do brief (só o parecer); ele fica a pedido do autor ou do tech-lead para entrar num commit de teste.
- Acessibilidade: nenhuma tela nova, só um parágrafo `text-sm text-texto-2` no cartão existente; não medi em navegador.
- Sem gatilho de segurança tratado aqui (a coluna é booleano derivado, sem pessoa nem texto livre; o parecer de segurança está em `docs/security/105-s1-escala-p.md`).
- Defeitos: A1 e A2 (alta, de teste e snapshot; o código de produção está certo). Sem arquivos em `docs/qa/bugs/` por restrição do brief.

## Revalidação
Corrigidos A1 e A2: rodar `acelerato-l9c.pg.test.ts` e `catalogo.pg.test.ts` e conferir o `banco` verde no mesmo sha; depois `forge-check parecer delta docs/qa/105-s1-escala-p.md`.
