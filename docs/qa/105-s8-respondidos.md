---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-s8-respondidos
commit: e1b617d54df9c857f2e445677e18d84b2d4fe7b6
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-16
---
# QA: S8 só com incidentes respondidos (105, E7.237, E7.307)

Decisão S8 A do dono: o tempo/taxa do S8 usa só os incidentes com o campo respondido (sim ou não); o cartão mostra a contagem dos sem resposta; só Acelerato; percentis pela biblioteca; abaixo de 20 não publica. Sem relatório do autor: conferi o diff do commit `6dcd705e` contra a decisão.

## Achados

## Critério → teste → resultado
| Critério (decisão S8 A) | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Sem resposta fora do denominador, contado em `semResposta` (total menos n) | `complementares.test.ts` "sem resposta sai do denominador..." (25 respondidos) | denominador = respondidos | passou |
| Abaixo de 20 não publica | `complementares.test.ts` "borda: 19 respondidos não publica; 20 publica" | 19 insuficiente, 20 ok | passou |
| Nunca 0% sem respondidos; sem extensão `semResposta` = 0 | `complementares.test.ts` "ninguém respondido..." e "sem extensão..." | vazio | passou |
| Cartão mostra a contagem, singular e plural | `web ramos.test.tsx` (20 e 1 incidente) | singular/plural | passou |
| Campo opcional ausente: cartão calcula total menos n | `web ramos.test.tsx` "sem o campo semResposta" | compatibilidade do contrato | passou |
| Só Acelerato, cálculo pela biblioteca | `calcularS8` usa `taxa` de `core/estatistica`, só `ctx.ac`; nenhum cálculo próprio no diff | n/a | conferido no diff |
| Critério versionado e marcado (T2.6) | `server/tests/criterios-acelerato.test.ts` (oito entradas, `105:S8-so-respondidos` afeta S8) | n/a | conferido no diff |

## Cenários e resultado real
- Rodei no head `6dcd705e`: `packages/metricas` `src/complementares.test.ts` = 28 passaram; `web` `src/features/complementares/ramos.test.tsx` = 36 passaram.
- Vermelho antes do verde (cópia local da `s8.ts` sem a linha `semResposta`, restaurada depois; árvore limpa): `Tests 4 failed | 24 passed (28)`, caindo os 3 testes novos e a asserção de "sem extensão".
- Mutação no diff (`n - informados` trocado por `n - informados + 1`): `Tests 3 failed | 25 passed (28)`; o mutante morreu.
- Contrato: `semResposta` opcional, inteiro >= 0, aditivo (compatível); snapshot, OpenAPI e `docs/contratos/metricas/S8.md` atualizados no mesmo commit.
- CI do head (consulta feita no fim da rodada): o check `testes` e o `banco` ainda estavam `in_progress`; `build`, `openapi`, `seguranca` e `imagem` com sucesso. Não afirmo CI verde: a suíte inteira fica para o CI do PR (PQ do autor não enviado).
- Sem gatilho de segurança, sem interface nova além de uma linha no cartão (texto, mesma classe de aviso existente); acessibilidade: o texto entra no parágrafo já lido como `text-atencao`, sem controle novo.
- Não testei na base real (195 incidentes, 186 sem resposta, 9 "não", amostra insuficiente): o dado vem do CHANGELOG do autor, não conferido por mim.

## Revalidação no head e1b617d5 (delta)
- Mudança desde `6dcd705e`: só a integração da `develop` (conflito no CHANGELOG). `forge-check parecer delta` lista no domínio CHANGELOG, `docs/api/*`, `complementares.test.ts` e `notas.ts`; conferi que vêm da base: as linhas de código, contratos e testes do patch do S8 contra a `develop` (`git diff origin/develop...HEAD`) têm o mesmo hash que as do commit `6dcd705e` contra o pai (`d02f6495...` nos dois). Patch idêntico ao testado.
- Reexecutei no head: `packages/metricas` `complementares.test.ts` = 28 passaram; `web` `ramos.test.tsx` = 36 passaram. Vermelho e mutação da rodada anterior valem (código do S8 inalterado).
- CI do head `e1b617d5`: `build`, `openapi`, `imagem`, `rapida` e `filtro` com sucesso; `testes` e `e2e-parte` ainda `in_progress` na consulta. Não afirmo CI verde; a suíte inteira fica para o CI do PR.
- Parecer mantido: aprovado, sem achados.
