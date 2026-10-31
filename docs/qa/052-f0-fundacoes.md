---
tipo: qa
contrato: 1
pedido: 052-integracao-businessmap
branch: feature/052-f0-fundacoes
commit: f24c3a9b98722b2bf62961ef3ea8cf75e11de291
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-10-31
---
# QA: 052-integracao-businessmap (E2.5, F0 do coletor do BusinessMap, K-182)

Veredito: aprovado, com 2 recomendações que não devolvem. Testado o head `ba3ddff` (ponta da branch, árvore limpa; o código é o de `051c46e`, depois só o parecer de segurança). Obrigações lidas do Entregar da E2.5 e do plano da F0; sem especificação de UX nem contrato de API novo (cliente interno e migrações). Review (c15c1ab) e segurança (ba3ddff) aprovados, lidos só por veredito e achados. Nada chamou o BusinessMap real, e o `.env` não foi lido nem editado.

## Execução (uma suíte por vez, `nice -n 19`)
- `pnpm run pronto`: rc=0. server: 33 arquivos passaram, 16 pulados (são os `.pg`, sem `PG_TESTE_URL` neste comando), 673 testes passaram e 96 pulados; cobertura do server 100% (1667/1667 instruções, 1047/1047 ramos, 408/408 funções, 1362/1362 linhas). Demais pacotes: web 1228, metricas 1092, mock 258, contratos 161, docs-contratos 102, homolog 73, pesquisa 33, spec-check 14, todos aprovados. Orçamento de bundle e `docs:check` ok (803 páginas Markdown, 69 métricas, 2 eventos).
- `pnpm run test:pg` (PostgreSQL local do Compose): rc=0, 16 arquivos e 96 testes aprovados, 0 pulados.

Mutação manual (cópia in loco, restaurada por `git checkout`, árvore limpa ao fim), só `server/src/plataforma/http.ts`, rodando `tests/http.test.ts`:

| Mutante | Resultado |
|---|---|
| `redirect: 'manual'` trocado por `'follow'` | morreu (teste de redirect) |
| 403 deixa de interromper | morreu (teste do 403) |
| teto de `retry_after` 120 s removido | morreu (2 testes) |
| teto de bytes na leitura em blocos ampliado 1000x | morreu |
| limite horário padrão 550 trocado por 5000 | morreu |
| checagem de `content-length` removida | sobreviveu (A1) |

## Achados
- A1 (recomendado) server/tests/http.test.ts:393 · o mutante que remove a checagem de `content-length` (http.ts:228) sobrevive: a leitura em blocos dá o mesmo erro, então o caso "com cabeçalho" não prova que a recusa vem antes de ler o corpo. Afirmar que o corpo não foi consumido.
- A2 (recomendado) server/tests/http.test.ts:1 · o vermelho antes do verde não foi rodado por commit: o `forge-testes --vermelho` não é do projeto e os testes dos achados da volta E2.7 foram vistos só pelo mutante acima, não contra `746aae5`. Aceito pela cobertura de 100% e pelos 5 mutantes mortos; sem efeito no veredito.

## Revalidação por delta (E2.22, depois da E2.19)
Veredito: aprovado, mantido. O código testado é o de `f24c3a9` (merge da develop `4e7a180` e renumeração das migrações da F0); a ponta `0e59e8c` só soma pareceres de segurança e review depois dele (4 arquivos em `docs/`, conferido por `git diff --stat f24c3a9..HEAD`). Obrigações e fronteiras da tabela abaixo não mudaram. O `.env` não foi lido, e nada chamou o BusinessMap real.

Delta lido (`e86e8d5..f24c3a9`): as migrações `0016_ac_stg_chamado_recorte` e `0017_ac_projecao_f2` (Acelerato, da develop) entram antes; `0016` e `0017` da F0 viram `0018_bm_referencia_workflow_tipo_times` e `0019_bm_carga_inicial_times` por renomeação pura (`git diff` entre as duas versões: 0 linhas; os dois checksums do `checksums.json` são idênticos aos de antes). Testes que acompanham: índice de migrações, `CARGA_INICIAL`, contagem de colunas (436 para 446: 10 colunas das duas dimensões do chamado, do Acelerato) e o `down` da pesquisa (de 5 para 7 migrações). BusinessMap e Acelerato continuam em esquemas e arquivos separados; `.env.example` traz os dois blocos lado a lado (BusinessMap nas linhas 25 a 32, Acelerato nas 33 a 44), lido pela ferramenta Read.

Execução (única suíte por vez, `nice -n 19`, árvore limpa):
- `pnpm --dir /home/rodrigoisensee/MetricasDSPD-052c run pronto`: rc=0. Server: 44 arquivos passaram e 18 pulados (os `.pg`, sem `PG_TESTE_URL` neste comando), 869 testes passaram e 106 pulados; cobertura do server 100% (2409/2409 instruções, 1483/1483 ramos, 562/562 funções, 1933/1933 linhas). Web 1228, metricas 1092, mock 258, contratos 161, docs-contratos 102, homolog 73, pesquisa 33, spec-check 14, todos aprovados. `docs:check` ok (813 páginas Markdown, 69 métricas, 2 eventos).
- `pnpm run test:pg` (PostgreSQL local do Compose, `PG_TESTE_URL` do `.env` carregado só pelo script): rc=0, 18 arquivos e 106 testes aprovados, 0 pulados. Cobre as migrações 0018 e 0019 aplicadas sobre 0016 e 0017 do Acelerato (`referencia-times.pg.test.ts`, `acelerato.pg.test.ts`, `acelerato-projetor.pg.test.ts`) e o `down` até a 0013 (`pesquisa.pg.test.ts`, 7 migrações revertidas na ordem 0019, 0018, 0017, 0016, 0015, 0014, 0013).

Vermelho antes do verde e mutação: o delta não traz teste novo de regra da F0; só renomeia referências, e os testes da F0 seguem os mesmos (mutantes de `http.ts` do parecer anterior não se aplicam: o arquivo não mudou no delta). O teste novo do delta, vindo da develop, é o do chamado sem prioridade (`seed.estatico.test.ts`), de outro pedido, fora do meu escopo. Sem `forge-testes` neste projeto, como já registrado em A2.

## Critério → teste → resultado
Obrigação = item do Entregar da E2.5 e do plano da F0. Resultado da revalidação: todas as linhas continuam passando no head `f24c3a9`.

| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Cliente só GET, recusado antes da rede | `http.test.ts` (só `get` e `listarPaginas`; todo pedido sai GET) | método fora de GET | passou |
| Lista fechada de caminhos | `http.test.ts` (caminho fora da lista; host próprio ou `//host`) | caminho de escrita ou de chave, URL completa | passou |
| Lista fechada de parâmetros | `http.test.ts` (parâmetro fora da lista ou fora do formato) | nome e valor fora do formato | passou |
| `/users` só com `fields=user_id,realname` e `user_ids`; lotes de 200 | `http.test.ts` (casos de `/users` e de lotes) | `page`, `per_page`, `expand` e `fields` em outro caminho; lote acima de 200 | passou |
| Redirect não seguido | `http.test.ts` (segundo servidor); mutante M1 morreu | chave a outro host | passou |
| Apikey fora de log e de erro | `http.test.ts`, `log.test.ts`, `config-businessmap.test.ts` | mensagem, stack, JSON, log, `cause` | passou |
| 401 e 403 interrompem | `http.test.ts`; mutante M2 morreu | nenhuma nova chamada em outro caminho | passou |
| Teto horário e `retry_after` acima de 120 s | `http.test.ts`; mutantes M3 e M6 morreram | janela de 1 h; 121 s no corpo e no cabeçalho | passou |
| Teto de bytes (com e sem `content-length`) | `http.test.ts`; mutante M4 morreu, M5 sobreviveu | corpo acima de 10 MB | passou (A1) |
| Teto de páginas por execução | `http.test.ts` | página acima do teto | passou |
| Base só https (http só em loopback) | `http.test.ts`, `config-businessmap.test.ts` | credencial, consulta e fragmento na URL | passou |
| Migrações 0018 e 0019 (ex-0016 e 0017): vigência só por INSERT e UPDATE de `vigente_ate` | `referencia-times.pg.test.ts` (imutabilidade; vigência; down) | UPDATE de campo, DELETE, TRUNCATE, down com vigência posterior | passou |
| Carga dos 63 workflows: 3 próprios, 47 provisórios, 6 fora de todo cálculo, 7 fora do operacional | `referencia-times.pg.test.ts` (50 times, 6 + 7 + 50; ids dos 13 fora; 3 próprios) | contagem exata e ids | passou |
| `registrado_por` fora da API | `referencia-times.pg.test.ts` (grants, 42501) e `guarda-api.pg.test.ts` | coluna nas duas tabelas de times | passou |
| Versão de partida fora de `/criterios` e de `versaoCriterio` | `referencia-times.pg.test.ts` (último caso), `coletas.test.ts` | versão sem métrica | passou |
| Times só como filtro, sem comparação | `times-sem-comparacao.test.ts`, caso das views no `.pg` | view que use as tabelas | passou |
| Regras invioláveis (sem pessoa na carga, BusinessMap sem Acelerato) | `conferencia.test.ts`, `referencia-times.pg.test.ts` | nome de pessoa em carga e conferência | passou |

Notas de conferência: a contagem "47 com nome provisório" é a diferença entre os 50 times e os 3 próprios, que o teste afirma (50 times, nomes dos 3 próprios); o texto `Workflow <id>` do nome provisório não tem asserção própria, e fica de fora por ser coberto pelo review e pela F2, que o troca. Os achados A6 a A10 do review ficam para F1, F3 e F4, como ele registrou.
