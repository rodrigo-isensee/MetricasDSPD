---
tipo: review
contrato: 1
pedido: 077-tendencias-dado-real
branch: feature/077-l5-fluxo-real
commit: e980596ee86020638853237ccb3eff63e4892b77
parecer: aprovado
revisor: tech-lead
data: 2026-11-10
---
# Code review: 077 lote 5, TENDENCIA_FLUXO no mapa real (K-211, E2.2)

Diff lido: `76be45ee...e980596e` (a base é a ponta atual da `develop`). Comparado com `## Lote 5` de `docs/analises/077-desenho.md` e com A8, A9, A11, A12 e A14 de `docs/analises/077-desenho-revisao-tech-lead.md`. Revisão incremental sobre o parecer anterior (`e751242b`), que este substitui.

## Parecer
**Aprovado.** O lote faz o que o Lote 5 pede, sem nada a mais.

- **Delta desde `e751242b`:** dois commits. `6172e7a1` é a `develop` trazida (sem conflito; o diff da branch contra a `develop` volta a ter só os arquivos do lote). `e980596e` muda só duas linhas de `packages/metricas/src/core/criterios.ts`: o `id` passa a `criterio-2026-11-10-tendencia-fluxo-dado-real` e a `data` a `2026-11-10`. O resto da constante (`afeta: ['TENDENCIA_FLUXO']`, descrição, presença em `VERSOES_DA_BIBLIOTECA`) não mudou.
- **Nenhum teste dependia do id antigo:** busca por `tendencia-fluxo-dado-real` e `criterio-2026-11-09` em `.ts`, `.tsx`, `.json` e `.md` do repositório só acha a própria constante. O teste da marca (`tendencia-fluxo-real-l5.test.ts:115-119`) confere `afeta`, não o id.
- **A1 do parecer anterior: resolvido.** Id e data estão no dia da abertura do PR (2026-11-10). O comentário da constante ainda diz "data do PR; a do merge corrige se escorregar", o que continua verdadeiro.
- **O que seguia valendo e não mudou (código idêntico ao revisado):** mapa real e simulação (A9), guarda sem carga inicial (A14, `servico.ts:275`, número pela biblioteca, ADR 0019), prova de rota com janela incompleta e publicada (A11, A12), mínimo de 20 itens, BusinessMap sem mistura com o Acelerato, `contagemParcial` do 8a e `qa-f6-painel.test.ts`.

## Ferramentas
- **CI do push em `e751242b`:** verde (run 42818122127). A CI do novo push (`e980596e`) é a que vale para o merge; não foi refeita aqui.
- **Testes dos arquivos tocados:** os do parecer anterior (server `tendencia-fluxo-real-l5.test.ts` e `qa-f6-painel.test.ts`, 12 verdes; contratos `origem.test.ts`, 17 verdes) cobrem código que não mudou; o delta é só dado de constante e não os afeta. Não reexecutados nesta passada incremental.
- **Mutações e sondas:** S1 e S2 do parecer anterior valem (guarda de `servico.ts:275` intacto no delta).

## Teto M14
Contra `origin/develop`: `origem.test.ts` 6+4, `origem.ts` 2+0, `criterios.ts` 10+0, `servico.ts` 4+1, `qa-f6-painel.test.ts` 1+1, `tendencia-fluxo-real-l5.test.ts` 121+0, ou seja 150 linhas, no limite, com um comportamento só.

## Achados
- A2 (recomendado) server/tests/tendencia-fluxo-real-l5.test.ts:96 · para `TENDENCIA_FLUXO` o serviço nem lê o Acelerato (`servico.ts:273`). O teste vale como regressão, mas não prova que o dublê foi consultado.
- A3 (recomendado) server/src/modulos/metricas/servico.ts:275 · sem carga inicial, o motivo é o genérico "fonte real ainda não definida", que não descreve o caso (a fonte existe, falta a carga). Um texto próprio é decisão de UX e do dono, para um lote futuro.

## Sondas
- S1 · guarda da A14 removido em servico.ts:275 · espera: teste de rota reprova · obtido: "sem carga inicial com sucesso responde sem-dado-real" falha, expected undefined to be 'sem-dado-real' (1 de 6)
- S2 · `this.deps.modoMock !== true` removido do guarda · espera: algum teste reprova · obtido: "TENDENCIA_FLUXO: filtros válidos = 200 no schema, ETag estável e 304" e "TENDENCIA_FLUXO: resultado idêntico" falham (2 de 19 com -t TENDENCIA)
