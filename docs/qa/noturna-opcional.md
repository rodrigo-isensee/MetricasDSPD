# Parecer de QA - rodada noturna opcional (commit fbea23d)

Branch `chore/noturna-opcional` contra `origin/develop`. Review técnico curto + QA incremental. Sem E2E (mudança sem interface).

## Review
- `EXIGIR_NOTURNA = false` é o padrão de `decidirAprovacao(api, pedido, exigirNoturna = EXIGIR_NOTURNA)`. O retorno antecipado vem depois da checagem do portão; só o ramo da noturna é pulado. Hotfix e fork não mudam.
- Nenhum job obrigatório renomeado (`rapida`, `testes`, `banco`, `build`, `e2e`); o diff em `.github/` é só comentário do `homolog-aprovada.yml`.
- `main.ts` chama com o padrão, então religar é de fato uma linha.

## Mutação
| Mutação | Resultado |
|---|---|
| `EXIGIR_NOTURNA = true` | 1 teste falha (o que fixa o padrão desligado); 17 passam. Restaurado. |
| Portão desligado (`if (!portao)` -> `if (false)`) | 3 testes falham (portão dispensado, ausente, job não fechado). Restaurado. |

## Textos
CLAUDE.md, fluxo-homologacao.md, praticas.md, alinhamento e comentário do workflow dizem "noturna informativa, religável via `EXIGIR_NOTURNA`", sem contradição. A noturna segue agendada.

## Execução
- `pnpm --filter ./tools/homolog run pronto`: 64/64 testes, cobertura 100%.
- `pnpm run docs:check`: ok.

## Observações (sem bug aberto)
- Baixa, texto: `praticas.md` linha 130 ainda fala em "publicando `homolog-noturna`", mas `fluxo-homologacao.md` diz que esses status de commit não existem mais. É anterior a esta mudança. Responsável: tech-lead (doc).
- Baixa, estilo: o comentário de cabeçalho do `homolog-aprovada.yml` ficou com uma linha longa.

## Parecer
Aprovado para envio. Nenhum bug crítico ou alto.
