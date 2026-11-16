---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-t10-texto
commit: a505dc99
parecer: reprovado
resultado: reprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 1
bugs_baixos: 0
data: 2026-11-16
---
# QA: texto do T10 com os motivos 11 e 14 (K-391, E7.364)

Obrigações nomeadas (fecha o A1 do parecer 105-t10-motivos): CA-1 o "Como se calcula" cita os dois motivos que o cálculo soma; CA-2 a leitura do cartão cita os dois; CA-3 o aviso de vazio cita os dois; CA-4 o texto confere com `MOTIVOS_FORNECEDOR` (`packages/contratos/src/comum.ts:127`: Aguardando fornecedor e Dependência Externa); CA-5 nenhum outro teste ou texto fica com a frase antiga.

## Achados
- A1 (bloqueante) e2e/tests-api/tatico-011-lote2.spec.ts:139 · asserção exata `toHaveText` com o texto antigo do aviso de vazio ("Nenhum bloqueio com o motivo "Aguardando fornecedor" foi encerrado no período."); o head mudou o texto (taticas.tsx:77), então o TT desse cenário falha. Atualizar para "…com os motivos "Dependência Externa" ou "Aguardando fornecedor"…" (react-frontend).

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| CA-1 | notas.ts:266 lido contra o cálculo; sem teste de unidade próprio do texto da nota | n/a | confere: "motivos "Dependência Externa" e "Aguardando fornecedor"" |
| CA-2 | web taticas.test.tsx (leitura com 20+ e com 1 bloqueio, singular e plural) | com e sem percentis | passou |
| CA-3 | web taticas.test.tsx (`t10-sem-fornecedor`, total 0) | vazio | passou |
| CA-4 | leitura de `MOTIVOS_FORNECEDOR` e t10.ts:12; texto cita os mesmos dois | n/a | confere |
| CA-5 | busca no head por "motivo Aguardando", "com o motivo" e "Aguardando fornecedor" fora de notas e taticas | n/a | falha: e2e/tests-api/tatico-011-lote2.spec.ts:139 (A1) |

## Cenários e resultado real
- Diff d999ee29..a505dc99 lido: 3 arquivos, 8 linhas (notas.ts, taticas.tsx, taticas.test.tsx); escopo confere com o brief; nenhuma mudança de lógica, só texto e comentário.
- Local (em `web/`): `vitest run src/features/complementares`: 11 arquivos, 340 testes passaram.
- Vermelho antes do verde: não rodei `forge-testes --vermelho` (o teste é só asserção de texto; na base as três asserções comparam a frase antiga e falham por construção). Não executado, não afirmo prova.
- Mutação: não aplicada (mudança só de texto, sem regra de código).
- E2E (A1): a busca textual achou a frase antiga num spec de API do Playwright (`tatico-011-lote2.spec.ts:139`, `toHaveText` exato, sem normalização). Não rodei o Playwright; a falha vem da comparação exata do texto lido de taticas.tsx:77 com a frase antiga, o que o próprio diff mostra. Severidade média: quebra a suíte E2E, contorno simples (uma linha de texto).
- Sem PR para a branch: a suíte inteira fica para o CI do PR; não afirmo CI verde e não citei PQ do autor.
- Acessibilidade: nenhum controle novo; texto de aviso sem mudança de estrutura.
- Parecer: reprovado só por A1; ao corrigir, reteste do spec e revalidação por `forge-check parecer delta`.
