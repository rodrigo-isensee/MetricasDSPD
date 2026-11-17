---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-t10-texto
commit: df13bf90
parecer: aprovado
resultado: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-16
---
# QA: texto do T10 com os motivos 11 e 14 (K-391, E7.364)

Obrigações nomeadas (fecha o A1 do parecer 105-t10-motivos): CA-1 o "Como se calcula" cita os dois motivos que o cálculo soma; CA-2 a leitura do cartão cita os dois; CA-3 o aviso de vazio cita os dois; CA-4 o texto confere com `MOTIVOS_FORNECEDOR` (`packages/contratos/src/comum.ts:127`: Aguardando fornecedor e Dependência Externa); CA-5 nenhum outro teste ou texto fica com a frase antiga.

## Achados
- A1 (bloqueante) e2e/tests-api/tatico-011-lote2.spec.ts:139 · corrigido em df13bf90: o `toHaveText` com a frase antiga agora espera "com os motivos "Dependência Externa" ou "Aguardando fornecedor"", igual a taticas.tsx:77. Retestado, passa.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| CA-1 | notas.ts:266 lido contra o cálculo; sem teste de unidade próprio do texto da nota | n/a | confere: "motivos "Dependência Externa" e "Aguardando fornecedor"" |
| CA-2 | web taticas.test.tsx (leitura com 20+ e com 1 bloqueio, singular e plural) | com e sem percentis | passou |
| CA-3 | web taticas.test.tsx (`t10-sem-fornecedor`, total 0) | vazio | passou |
| CA-4 | taticas.test.tsx "cada motivo de MOTIVOS_FORNECEDOR aparece no aviso e na nota" (novo) | lista de motivos mudar sem o texto | passou |
| CA-5 | busca no head por "motivo Aguardando", "com o motivo" e "Aguardando fornecedor" fora de notas e taticas | n/a | passou: nenhuma frase antiga restante; TT-04 corrigido (A1) |

## Cenários e resultado real
- Diff d999ee29..a505dc99 lido: 3 arquivos, 8 linhas (notas.ts, taticas.tsx, taticas.test.tsx); escopo confere com o brief; nenhuma mudança de lógica, só texto e comentário.
- Local (em `web/`): `vitest run src/features/complementares`: 11 arquivos, 340 testes passaram.
- Vermelho antes do verde: não rodei `forge-testes --vermelho` (o teste é só asserção de texto; na base as três asserções comparam a frase antiga e falham por construção). Não executado, não afirmo prova.
- Mutação: não aplicada (mudança só de texto, sem regra de código).
- E2E (A1): a busca textual achou a frase antiga num spec de API do Playwright (`tatico-011-lote2.spec.ts:139`, `toHaveText` exato, sem normalização). Não rodei o Playwright; a falha vem da comparação exata do texto lido de taticas.tsx:77 com a frase antiga, o que o próprio diff mostra. Severidade média: quebra a suíte E2E, contorno simples (uma linha de texto).
- Sem PR para a branch: a suíte inteira fica para o CI do PR; não afirmo CI verde e não citei PQ do autor.
- Acessibilidade: nenhum controle novo; texto de aviso sem mudança de estrutura.

## Revalidação no head df13bf90 (delta a505dc99..df13bf90)
- `forge-check parecer delta` listou dois arquivos no domínio: e2e/tests-api/tatico-011-lote2.spec.ts (frase nova no TT-04) e web/src/features/complementares/taticas.test.tsx (teste novo dos motivos).
- Frase do TT-04 conferida contra taticas.tsx:77 e `MOTIVOS_FORNECEDOR` (Aguardando fornecedor, Dependência Externa): igual.
- `vitest run src/features/complementares/taticas.test.tsx`: 38 passaram.
- TT-04 no projeto chromium-api (`scripts/com-api-mock.sh`, API local semeada, `E2E_API_URL`): 1 passou.
- Vermelho antes do verde: não rodei `forge-testes --vermelho`; o teste novo percorre `MOTIVOS_FORNECEDOR` (2 itens fixos) e a falha viria de motivo ausente no texto. Não afirmo prova.
- Sem PR: a suíte inteira fica para o CI do PR; não afirmo CI verde. Parecer: aprovado, sem bugs abertos.
