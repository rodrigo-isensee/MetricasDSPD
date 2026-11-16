---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-motivos-bm
commit: 95050bda55b746b3f1095a1e6bebd2a54037585e
parecer: aprovado
resultado: aprovado na revalidação do merge da develop (95050bda); hash da base mock regravado conferido pelo gate; CI do head verde (runs 43909728275 e 43909714343); A3 segue como cartão
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-16
---
# QA: motivos de bloqueio do BusinessMap (pedido 105, E7.184 e E7.210, revalidação E7.251)

Revalidação do delta e0fb925f..89e421e4 (`forge-check parecer delta`: CHANGELOG, decisão do arquiteto, `businessmap-dominio.json`, briefing, `t12.ts` e `t12.test.ts`, `criterios.ts`, `dominio-businessmap.pg.test.ts`). Código testado: 89e421e4; o QA acrescentou o commit 3c83af10 (só o hash da base mock e a nota). Os commits seguintes (cdd7558c, 8f9a0315, bd840edc) tocam só `docs/reviews/`.

## Revalidação E7.258 (merge da develop, 95050bda)

`forge-check parecer delta` (89e421e4..95050bda, sem o que veio da base) lista no domínio: `businessmap-dominio.json` (campos 48 e 49 por value_id, régua 63), `dominio-businessmap.ts`, `mapa.ts`, mock do BusinessMap, testes de domínio da união (incl. `dominio-businessmap.pg.test.ts`), `operacionais.test.tsx`, CHANGELOG e `openapi.json`.

- Hash da base mock (regravado pelo tech-lead no merge, `hash-base-fase-a.json`): `node scripts/gate.mjs` em e2e no head: `## hash da base mock (vs fase A): APROVADO`, `OK: base mock idêntica à linha de base`, `GATE DO AUTOR: APROVADO`.
- CI do head 95050bda, run 43909728275 (push): `build`, `banco`, `openapi`, `rapida`, `seguranca`, `imagem`, `filtro`, `testes`, `e2e-parte (1/2)` e `(2/2)` ✓; `perf` não roda em push. Run 43909714343 (push): ✓. Sem PR, não há `bateria`; a suíte do PR fica para o CI dele.
- Testes de domínio na união (pg 469) rodam no job `banco` ✓. Sem teste novo do QA neste delta; o vermelho antes do verde abaixo segue válido.

## Critério → teste → resultado

| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| MOTIVOS_BLOQUEIO com os 11 habilitados | `motivo-nao-classificado.test.ts`, `dominio-motivo-bloqueio.test.ts` | enum fechado | passou local (335 de 335 nos 18 arquivos do delta e do mock) |
| Mapa `motivo_bloqueio` (ids 1-3, 6, 7, 9-14) | `dominio-businessmap.pg.test.ts:66` (381) | contagem de linhas | passou no CI, job `banco` ✓ (A1 fechado) |
| "não classificado" para id sem mapa ou nulo | `projetor-bloqueio.pg.test.ts`, `projetor-businessmap.test.ts` | id ausente, nulo | passou (banco ✓; local ✓) |
| id 14 → Aguardando fornecedor | `projetor-bloqueio.pg.test.ts`, caso `E7.210` | id 14 | passou no CI, `banco` ✓ |
| MOTIVOS_FORNECEDOR = Aguardando fornecedor + Dependência Externa | `bloqueios.test.ts`, mock | lista única | passou local |
| Versão de critério e texto com 11 motivos | `criterios.ts:142`, CHANGELOG, briefing, `businessmap-dominio.json` | texto datado igual ao enum | conferido no diff (A4 fechado) |
| T12 sem motivo de ida e volta (ReadonlySet, motivo por parâmetro) | `t12.test.ts` | (a) não conta nada, só (b) vale; conjunto não mutável | passou local, 15 de 15 |
| Hash da base mock | gate do e2e (`gate.mjs`) | base determinística | `GATE DO AUTOR: APROVADO`; CI do 3c83af10, job `build` ✓ (A2 fechado) |
| Decisão do arquiteto versionada | `docs/architecture/decisoes/105-motivos-bm-contrato.md` | contrato INCOMPATÍVEL | presente |

## Execução

- Local (`--maxWorkers=2`, 89e421e4): `t12`, `bloqueios`, `motivo-nao-classificado`, `dominio-motivo-bloqueio`, `projetor-businessmap` e `packages/mock`: 335 de 335 testes; o arquivo `packages/mock/src/coletas.test.ts` não carrega com a raiz do vitest (`describe is not defined`, sem `globals`; arquivo fora do diff, roda pela configuração do pacote no CI) e não é falha do delta.
- A2: `node scripts/hash-base-mock.mjs --salvar ../docs/qa/evidencias/hash-base-fase-a.json` (em e2e): hashBase b6a3c384 → 88a5c095, hashBusinessMap 8d47d431 → 08e2b5e2, Acelerato intacto; nota em `hash-base-fase-a.nota.md`; commit separado 3c83af10, enviado. Depois, `node scripts/gate.mjs`: `OK: base mock idêntica à linha de base`, `GATE DO AUTOR: APROVADO`.
- CI do 3c83af10, run 43905753639: `build`, `banco`, `openapi`, `rapida`, `seguranca`, `imagem`, `filtro` ✓; `testes` cancelado no passo `cobertura` pelo push seguinte (bd840edc, só docs); `e2e` e `perf` não rodam em push. Sem PR, não há `bateria`: este parecer não afirma CI verde da suíte inteira, que fica para o CI do PR.
- Vermelho antes do verde: `t12.ts` de e0fb925f com o `t12.test.ts` do head: 5 de 15 falham (CA-39 (a) duas vezes, taxa n >= 20, e dois casos sobre o mock), 10 passam; com o head, 15 de 15. O caso `E7.210` do pg foi visto vermelho no CI do e0fb925f (job `banco`) e verde agora. `forge-testes --vermelho` não rodado.
- Mutação: sem ferramenta rodada nesta revalidação; o delta de lógica é a injeção do parâmetro `motivos` em `t12.ts`, coberta pelos 5 testes acima.

## Achados

- A3 (recomendado) packages/metricas/src/businessmap/t10.ts:13 · o T10 segue por fornecedor informado, e `MOTIVOS_FORNECEDOR` só o mock lê; consumo fica para o PR 487. Vira cartão (sem bloqueio, R-QA).

## Bugs

- Sem arquivo em `docs/qa/bugs/`: A1 e A2 eram defeito de teste e de referência e estão fechados.
