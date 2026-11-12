---
tipo: qa
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: fix/k285-sem-dado-real-ux
commit: 5dcf0e4da462c35e2f338d763980124eb40c1d5f
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-12
---
# QA: K-285, estado sem dado real (B-2 a B-4 da revisão de UX do L2b e L2c)

## Achados

## Escopo
Diff `origin/develop...5dcf0e4d`: `CartaoMetrica.tsx` (faixa de selos), `EstadoSemDadoReal.tsx`, `NumeroChave.tsx` e dois arquivos de teste. Obrigações: B-2, B-3 e B-4 de `docs/ux/099-revisao-l2b-l2c.md`. Suíte completa e check-run `bateria` ficam com o CI do PR. Nada rodou contra banco real nem leu `.env*`. Worktree na branch certa, árvore limpa antes e depois (as mutações foram revertidas por cópia).

## Critério → teste → resultado
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| B-2 motivo a 14 px (`text-sm`, não `text-xs`) no NumeroChave | `K-285 B-2` em `operacional/resumo/componentes.test.tsx` | tamanho mínimo do texto do motivo | passa |
| B-3 sem base a faixa de selos não reserva `min-h-6`; com base reserva | `K-285 B-3` em `ui/componentes.test.tsx` | cartão sem base (faixa vazia) e com base (sem salto) | passa |
| B-4 estado sem dado real com `role="status"` | `K-285 B-4` em `ui/componentes.test.tsx` | anúncio por leitor de tela | passa |
| Sem regressão nas telas vizinhas | Vitest de `features/coleta`, `features/operacional`, `features/apontamento` e `app/painel-sem-dado-real` | n/a | 29 arquivos, 414 testes passam |
| Acessibilidade (axe AA) | e2e chromium `a11y.spec.ts` e `lacuna-de-valor.spec.ts` | zero violações críticas ou sérias | 49 passam |

## Vitest tocados
`vitest run src/components/ui/componentes.test.tsx src/features/operacional/resumo/componentes.test.tsx`: 2 arquivos, 84 testes passam.

## Mutação no diff (cada ajuste revertido, teste novo cai)
- M1 `p.base && 'min-h-6'` virou `'min-h-6'`: cai só `K-285 B-3` (83 de 84 passam).
- M2 remoção de `role="status"`: cai só `K-285 B-4`.
- M3 `text-sm` virou `text-xs`: cai só `K-285 B-2`.
Os três mutantes morreram; nenhum sobrevivente. Arquivos restaurados.

## Limites
- O e2e chromium roda a web em `VITE_FONTE=mock`, onde o cartão sem dado real aparece pouco; o axe do estado sem dado real em si é coberto pelo teste `role="status"` e pelos Vitest, não por uma varredura axe dessa tela. Não bloqueia: `role="status"` em `div` não cria violação axe.
- B-3: a ausência da faixa vazia é provada pela classe, não por captura da tela renderizada (sem medição de pixel).
- Contraste do `text-texto-2` no motivo não foi medido; a classe de cor não mudou neste diff.
