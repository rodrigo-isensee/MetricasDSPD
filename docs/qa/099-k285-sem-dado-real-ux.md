---
tipo: qa
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: fix/k285-sem-dado-real-ux
commit: 79c5cab7f9345144fbfb35a58a122e2dc1afb9e1
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-14
---
# QA: K-285, estado sem dado real (B-2 a B-4 da revisão de UX do L2b e L2c)

## Achados
- A1 (recomendado) web/src/components/ui/CartaoMetrica.tsx:269 · nenhum teste prova que selos (269) e nota (288) somem com o cartão recolhido: o mutante `{true && (` sobrevive. Lacuna herdada do L8a, nas linhas da resolução da junção. Cobrir em recolhidos.test.tsx.

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

## Revalidação incremental (junção com a develop, 79c5cab7, head 2a519c1a)
Delta (forge-check parecer delta): só CartaoMetrica.tsx no domínio de código. O remerge-diff de 79c5cab7 mostra uma única resolução: a faixa de selos (data-testid selos-<cod>, `p.base && 'min-h-6'`) ficou dentro de `{!recolhido && (...)}` do L8a, e o BlocoNota também. Resolução fiel às duas intenções.

| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| B-2, B-3, B-4 do K-285 e recolher do L8a (CA-25 a CA-32) na junção | vitest --maxWorkers=2: recolhidos.test.tsx, ui/componentes.test.tsx, resumo/componentes.test.tsx, app/painel-sem-dado-real | sem base, com base, recolhido, sem dado real | 4 arquivos, 108 testes passam |
| Acessibilidade do cartão sem dado real, aberto, claro e escuro | Playwright chromium temporário (build api, /metricas/* respondendo sem-dado-real), axe WCAG 2.2 AA no cartão O3, tema pela chave metricas-dspd:tema | zero críticas ou sérias, contraste real | claro: 0 violações; escuro: 0 violações. Faixa de selos presente, vazia e sem min-h-6 |
| Acessibilidade recolhido | vitest temporário com axe-core em jsdom (sem contraste), cartão sem dado real com e sem base, aberto e recolhido | zero violações | 2 testes, 0 violações; selos-O3 ausente quando recolhido |

Limite: no navegador o estado recolhido não é alcançável, porque ProvedorRecolhidos não é montado em nenhuma tela de produção (só definido em Recolhidos.tsx e usado em testes). Por isso o axe recolhido com contraste (claro e escuro) não pôde rodar em navegador e fica sem medição; a classe de cor text-texto-2 do resumo não mudou nesta junção. Os temporários (spec, config, teste jsdom) foram apagados; a árvore ficou limpa e dist-api é ignorado pelo git.

Mutação à mão (cada um restaurado por git show HEAD):
- M4 `p.base && 'min-h-6'` virou `'min-h-6'`: cai K-285 B-3 (1 falha, 67 passam). Morto.
- M5 data-testid selos- renomeado: cai K-285 B-3. Morto.
- M6 `{!recolhido && (` virou `{true && (` na linha 269 (selos): 68 passam. SOBREVIVENTE.
- M7 idem na linha 288 (nota): 68 passam. SOBREVIVENTE.
- M8 idem nas linhas 226 (botão de nota) e 396 (rodapé): 68 passam. Sobreviventes, fora do que a junção resolveu; mesma lacuna do L8a.
Os sobreviventes estão em linhas que o L8a já trazia; nenhum atinge o código do K-285 (B-2, B-3 e B-4 mortos). Registrado como A1 recomendado, não bloqueia; vira cartão baixo no quadro (R-QA).
