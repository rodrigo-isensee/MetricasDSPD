---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-t10-develop
commit: a71f4c0f
parecer: aprovado
resultado: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 1
data: 2026-11-16
---
# QA: T10 de volta na develop com os motivos 11 e 14 (E7.285)

Obrigações nomeadas (decisão do dono de 2026-11-16: o T10 soma o tempo dos bloqueios com motivo em `MOTIVOS_FORNECEDOR`, Aguardando fornecedor (14) e Dependência Externa (11); versão de critério datada): CA-1 só bloqueio encerrado com motivo 11 ou 14 entra (outro motivo e aberto ficam fora); CA-2 P50/P85/P95 só com n >= 20, contando os dois motivos juntos; contagem e soma sempre; CA-3 `fornecedores` vazio e sem nome de fornecedor; CA-4 contrato com campos opcionais coerentes; CA-5 versão de critério datada, só do T10; CA-6 T10 no mapa de origem real; CA-7 cartão e texto "Como se calcula" fiéis ao cálculo.

## Achados
- A1 (recomendado) web/src/features/complementares/notas.ts:267 · o "Como se calcula" diz "motivo Aguardando fornecedor" e a tela repete (taticas.tsx:53 e :77), mas o cálculo soma também Dependência Externa (11). Na base real (10 com motivo 11, nenhum com 14) todo o número do cartão é do 11 e o texto o nega. Citar os dois motivos (react-frontend).

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| CA-1 | packages/metricas/src/businessmap/bloqueios.test.ts ("E7.77: entra o bloqueio encerrado com motivo … (14) ou … (11)…") | outro motivo com fornecedor; aberto de 11 e de 14 | passou; vermelho na base; M1 e M2 mortos |
| CA-2 | bloqueios.test.ts ("E7.264: os dois motivos somam; 11 sozinho com 19 não publica e 14 + 11 chegam a 20"; "fronteira: 19 … 20") | 19 só do 11; 19 + 1 | passou; vermelho na base; M4 morto |
| CA-3 | bloqueios.test.ts (chaves fechadas, `fornecedores` `[]`) | nome no JSON | passou |
| CA-4 | `SCHEMAS_RESULTADO.T10` no teste acima; packages/contratos (motivo-nao-classificado.test.ts: lista `MOTIVOS_FORNECEDOR` com os dois) ; docs/contratos/metricas/T10.md regerado | campo opcional ausente; lista do contrato | passou; M3 morto |
| CA-5 | bloqueios.test.ts ("a versão de critério … marca só o T10 …") | 15/11 fora, 16/11 dentro, O19 fora | passou; as duas versões do T10 (tempo total e motivos) registradas em criterios.ts |
| CA-6 | packages/contratos/src/origem.test.ts; server/tests/qa-f6-painel.test.ts | mapa de origem | passou |
| CA-7 | web taticas.test.tsx (37) e notas.ts | motivo no texto | testes passam; texto do cartão desatualizado (A1) |

## Cenários e resultado real
- Diff 655029ad..a71f4c0f lido nos arquivos do T10 (t10.ts, criterios.ts, regras.ts, tambem.ts, origem.ts, notas.ts, taticas.tsx e testes); o escopo confere com o brief.
- Local: bloqueios.test.ts + motivo-nao-classificado.test.ts: 28 passaram; qa011-fase1, contratos/origem e server qa-f6-painel: 75 passaram; web taticas.test.tsx (rodado de `web/`): 37 passaram.
- Base real: 10 bloqueios com motivo 11 e nenhum com 14 (do brief; não consultei a base): com 10 o T10 mostra contagem e soma e não publica percentis (limite de 20). Coberto pelo teste "19 não publica".
- Vermelho antes do verde (à mão, cópia descartável; `forge-testes --vermelho` sem estar na árvore deste projeto): com o filtro de t10.ts voltado ao motivo único 14, 3 falharam em bloqueios.test.ts ("E7.77…", "E7.264…", "T10 sobre o mock"); com o head, passam. Provado.
- Mutação em t10.ts e comum.ts (4 mutantes, cópia descartável): M1 filtro só do motivo 14 (acima): 3 falharam; M2 motivo extra no filtro: 2 falharam; M3 `MOTIVOS_FORNECEDOR` sem o 11: 5 falharam; M4 n da janela trocado pelo do período: 1 falhou. Nenhum sobrevivente.
- Texto "Como se calcula": engana. Diz só Aguardando fornecedor, e o leitor entenderia que Dependência Externa fica fora, o oposto do cálculo e do que a base real traz. Não é perda de dado nem número errado, só texto: severidade baixa (A1, recomendado; vira cartão, R-QA). O cartão de leitura da tela (taticas.tsx:53, :77) tem o mesmo texto.
- CI do head: run 43951834597 em andamento ao fechar este parecer; não afirmo verde. A suíte inteira vale pelo check `testes` do sha no PR; sem PR nesta etapa. O run anterior (43936871179, outro head) falhou e está fora do meu escopo.
- Acessibilidade: nenhum controle novo neste delta; axe só no CI do PR.
- Parecer: aprovado; A1 é recomendado e não bloqueia.
