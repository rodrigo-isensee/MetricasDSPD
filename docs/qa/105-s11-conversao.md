---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-s11-conversao
commit: 6a9e092a
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-16
---
# QA: S11 conversão pela Avaliação de Problema (E7.140, sobre E7.101 e E7.107)

Obrigações nomeadas (decisão do dono de 16/11): CA-1 "Aberto" = Registro de Problema aberto; conversão = Aberto ÷ avaliações registradas; CA-2 "Não aplicável" só no denominador; CA-3 só fluxos do PROC, fluxo antigo e sem fluxo fora e contados em `foraDaConversao` (opcional); CA-4 abaixo de 20 = insuficiente, nunca 0; CA-5 nota no cartão "conversão pela decisão registrada no chamado, não pelo vínculo"; CA-6 versão de critério `105:S11-conversao-avaliacao`; CA-7 só Acelerato.

## Achados
- A1 (recomendado) web/src/features/complementares/estados.test.tsx:217 · resolvido na volta 1 (6a9e092a): CartaoS11 testado com foraDaConversao 0, ausente, 1 e 3 e insuficiente 13 e 1; CI verde; bug 105-002 fechado.
- A2 (recomendado) web/src/features/complementares/sustentacao.tsx:315 · gramática: com 1 avaliação sai "há 1 avaliação registradas" (plural fixo) e o teste fixa esse texto. Só quando n=1; cartão baixo, não bloqueia.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| CA-1, CA-2 | packages/metricas/src/acelerato/s11-18b.test.ts ("Aberto sobre as avaliações; Não aplicável só no denominador"; "só Não aplicável: 0 de 20") | 0 de 20 é 0%, não insuficiente | passou; vermelho na base; M1 morto (parecer anterior; biblioteca sem mudança no delta) |
| CA-3 | s11-18b.test.ts (fluxo antigo fora e contado; sem fluxo fora; sem avaliação fora do denominador); server/tests/painel-real-f6.test.ts (D6a, foraDaConversao 3) | fluxo antigo; fluxo nulo | passou; vermelho na base; M2 morto |
| CA-4 | s11-18b.test.ts (19 insuficiente sem pct, 20 publica); painel-real-f6.test.ts E7.101; estados.test.tsx (insuficiente 13 e 1: "Amostra insuficiente (13 avaliações)", sem "0 de 13", sem %) | 19 e 20; nunca 0 na tela | passou; M3 e M4 mortos |
| CA-5 | estados.test.tsx (bloco "s11-conversao": ok, insuficiente, fora 0/ausente/1/3); recolhidos.test.tsx (nota quebra parágrafo) | n=1 singular; fora 0 e ausente sem frase | passou local (12 arquivos, 373 testes); job testes do CI verde |
| CA-6 | server/tests/criterios-acelerato.test.ts (sete entradas, S11 na sétima) | ordem e métrica afetada | conferido no diff; CI verde |
| CA-7 | calcularS11 sem extensão; nenhuma leitura de BusinessMap no diff | n/a | conferido no diff |

## Revalidação (volta 1, delta 3b9ead50..6a9e092a)
- `forge-check parecer delta` lista no domínio: CHANGELOG, criterios-acelerato.test.ts, NotaMetodologica.tsx, recolhidos.test.tsx, estados.test.tsx, notas.ts e sustentacao.tsx. Reteste só desses. Biblioteca, contrato e servidor não mudaram: CA-1 a CA-4 (cálculo), CA-6, CA-7 e as mutações M1 a M4 do parecer anterior seguem valendo.
- Local: `pnpm exec vitest run src/features/complementares src/components/ui/recolhidos.test.tsx` no web: 12 arquivos, 373 testes passaram.
- Amostra insuficiente: bloco próprio sem percentual, sem "0 de 13", com "Isto não significa zero"; conferido no diff e pelo teste.
- NotaMetodologica (compartilhada, além do pedido): divide a nota na linha em branco; `key={par}` repetiria com dois parágrafos iguais, o que as notas atuais não têm. Sem regressão: recolhidos.test.tsx passa.
- CI do head 6a9e092a, run 43850739845 (push): conclusão success; testes (cobertura web), seguranca, build, imagem, openapi, filtro, rapida e banco em success; perf, e2e-parte e e2e pulados no push. O run do PR (43850749670) estava em andamento na leitura e não é citado como verde; e2e não afirmado.
- Acessibilidade: sem controle novo, só texto; axe roda no e2e do PR.
- Bug 105-002 (nota sem teste derruba cobertura): resolvido pelo teste web e pelo job testes verde.
