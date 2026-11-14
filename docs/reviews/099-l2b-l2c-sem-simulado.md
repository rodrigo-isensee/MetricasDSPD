---
tipo: review
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: fix/099-l2b-apaga-simulado
commit: 456e103e5556b7ff117f1762d4fffcf5ebe00fc7
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-12
---
# Review: L2b e L2c do pedido 099, a web apaga o simulador e o selo Simulado (E2.12, K-275)

## Achados

## Sondas

## Parecer
Aprovado sobre 456e103e (base develop 58882fcf). Diff: 18 arquivos, só `web/src`, +38 -1053 (1091 linhas pelo `git diff --numstat --no-renames`). O commit traz `teto: excedido, 1091 linhas, quase tudo remoção de código e testes do simulador; L2b e L2c juntos porque o selo importa o que o L2b apaga`, no formato e com motivo aceito: das 1091 linhas, 1053 são remoção, e separar L2b de L2c deixaria um commit que não compila. Um comportamento só (a web não mostra simulado); risco baixo.

- **Cumpre a ADR 0030 no recorte do L2b e L2c:** saem `FonteComSimulado.ts`, `simulado.ts`, as exportações de `data/index.ts`, `SeloSimulado.tsx` (e a exportação em `components/ui/index.ts`), `OrigemCartao.simulado`, `SemDadoRealErro.simulavel`, a leitura de `simulavel` em `HttpFonteMetricas`, os ramos simulados de `CartaoMetrica` (selo, faixa, marca-d'água, prefixo da leitura, legenda da tabela, borda tracejada, filtros só de período, ocultação de calibração e de meta), `StatusMeta`, `CartaoT3` e o `.alvo-44` de `tokens.css`. O cartão sem dado real segue pelo caminho já existente: `motivoSemDadoReal` vem de `SemDadoRealErro.motivo` ou, sem ele, de `origem.motivo` ou de `MOTIVO_FONTE_REAL_NAO_DEFINIDA` (`CartaoMetrica.tsx:145-147`, inalterado).
- **Remoção completa, sem código morto:** `git grep -i` no head por `SeloSimulado|FonteComSimulado|simulavel|podeSimular|motivoSemSigla|alvo-44|useCartaoSimulado` em `web/` não acha nada. As ocorrências restantes de "simulad" em `web/` são do simulador de estados do mock (`?mock=`, `ErroSimulado`, latência simulada, `comHoraDeCorte`, ainda usado por `nucleoMock.ts:120`), que é outro mecanismo e fica. Os imports que sobraram em `OrigemDosCartoes.tsx` (`idDeMetrica`, `MetricaId`, `Icone`, `plural`) e em `CartaoMetrica.tsx` (`MOTIVO_FONTE_REAL_NAO_DEFINIDA`, `FiltroFluxoChave`) seguem em uso; o `rapida` (lint) e o `build` do CI passaram.
- **`motivoSemSigla` fora da lista do brief:** na base, o único uso de produção era o ramo simulado de `OrigemDosCartoes` (`OrigemDosCartoes.tsx:58` em 58882fcf); o outro era o teste em `coleta/simulado.test.tsx`, apagado junto. Sem o ramo, a função ficaria morta e quebraria a cobertura de 100%; apagá-la é consequência direta do L2c, não escopo novo. O motivo do estado "Sem dado real" nunca passou por ela, então o texto mostrado ao usuário não muda.
- **Testes provam o estado sem dado real:** `composicao.test.tsx` agora usa a resposta `sem-dado-real` do contrato sem `simulavel` e exige "Sem dado real" e nenhum texto ou `data-testid` de simulado; `features/coleta/origem.test.tsx` (inalterado) cobre o estado por cartão com o motivo, a contagem do cabeçalho e os painéis Operacional, Tático e Sustentação. Os testes apagados (`components/ui/simulado`, `data/simulado`, `coleta/simulado`, o A-9 do Tático) testavam só o código removido; é o afrouxamento autorizado pelo dono (Q-099-3 A, ADR 0030).
- **E2E:** `e2e/tests-api/simulado-070-l3.spec.ts:29` e `e2e/perf/perf-api.spec.ts:181` ainda esperam `selo-simulado-*`. Já falham desde o L1, não rodam no CI e estão no A1 do QA (`docs/qa/099-l2b-l2c-sem-simulado.md`) e no G3 e R2 da varredura, para o L5. Não repito o achado aqui.
- **Regras invioláveis e segurança:** nenhum número inventado chega à tela; sem pessoa, credencial, banco nem dependência nova; sem gatilho de `R-SEGURANCA`. Nada rodou contra a base real nem `.env*`.
- **Execução:** `VITEST_MAX_WORKERS=2 npx vitest run src/app/composicao.test.tsx src/features/tatico/tatico.test.tsx src/features/coleta/origem.test.tsx` em `web/` da worktree (head da3e1219 = 456e103e mais o parecer do QA): 3 arquivos, 40 testes, 40 passaram (8,7 s).
- **CI do head (prova do pronto):** run 43143807262 (push, headSha 456e103e, conclusão success): `rapida`, `filtro`, `openapi`, `testes`, `seguranca`, `imagem`, `build` e `banco` success; `e2e`, `e2e-parte` e `perf` skipped no push. Cobertura da web no `testes`: 95 arquivos, 1470 testes; Statements 100% (5442/5442), Branches 100% (5083/5083), Functions 100% (2012/2012), Lines 100% (4652/4652). A cobertura que o pronto local não fechou fica confirmada.
- **Commits:** um commit de código, `fix(web): ...`, Conventional Commits em português, corpo que lista o que sai, `Cartão: K-275` e a linha `teto:` no formato.
