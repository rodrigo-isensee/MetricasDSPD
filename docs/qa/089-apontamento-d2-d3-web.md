---
tipo: qa
contrato: 1
pedido: 089-apontamento-qualidade-d2-d3
branch: feature/089-apontamento-d2-d3-web
commit: dafb325a214bdb6bd7a9dc287e02faf846b11ea2
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-10
---

# QA: aba Apontamento, rótulo "Sem comentário" e nota de execução técnica (pedido 089, E1.6)

Links: pedido `docs/pedidos/089-apontamento-qualidade-d2-d3.md`, revisão de UX `docs/ux/089-revisao-apontamento.md`, textos `docs/ux/059-aba-apontamento-textos.md`.

## Escopo
Diff `129fc3d5...dafb325a` (10 arquivos: `textos.ts`, `CartoesQualidade.tsx`, `CartaoDistribuicao.tsx`, `fixture.ts`, testes de `web/src/features/apontamento`, fixture e spec do E2E). O head da branch (1b1ecee8) só soma pareceres de UX e review sobre dafb325a (conferido por `git diff dafb325a HEAD --stat`: 2 arquivos em `docs/`). Sem base real, sem `.env`. Fora: servidor e biblioteca de métricas (E1.2, outra delegação).

## Obrigações, testes e resultado
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Subgrupo e achado usam o rótulo "Sem comentário" (e o atalho "Ver apontamentos do subgrupo Sem comentário" filtra `subgrupo=nao-classificado`) | `barra-e-ramos.test.tsx` "o cartão de subgrupo oferece o atalho para os sem comentário"; `apontamento.test.tsx` CA-11 (atalho do achado); E2E CT achado (texto "estão em 'Sem comentário' e sem regra por tipo de card") | rótulo antigo não volta | passou |
| A explicação que o diferencia da marca de qualidade fica à vista no cartão de subgrupo | `o cartão de subgrupo explica, à vista, a diferença para o Sem comentário da Qualidade` (`data-testid=explicacao-sem-comentario`) | explicação fora de nota recolhida | passou |
| Nota de execução técnica fora da lista de flags, com contagem e % das horas lidos de `distribuicao.porSubgrupo`; atalho filtra `?subgrupo=execucao-tecnica` | `o cartão de Qualidade mostra a execução técnica à parte...` (região por nome, sem "Sem vínculo claro" dentro, clique no botão) | nada calculado no front | passou |
| Piso de 20: com menos de 20 a nota mostra a contagem sem percentual | `com menos de 20 apontamentos ... sem percentual` (7; sem "%") | n abaixo de 20 | passou |
| Singular com 1 apontamento | `com 1 apontamento ... singular` | n = 1 | passou |
| Sem execução técnica na distribuição, a nota some sem erro | `sem execução técnica na distribuição, a nota não aparece` | ausência do dado | passou |
| Acessibilidade: `section` com `aria-labelledby`, h4 sob h3, botão nativo | leitura por papel nos testes acima (região por nome, botão por nome); axe E2E CT-65 (49 de 49) | zero violações críticas ou sérias | passou, com a ressalva do A1 |
| Nenhum texto de avaliação individual, meta ou semáforo | leitura dos textos novos (`SUBGRUPO_SEM_COMENTARIO`, `EXECUCAO_TECNICA`) | regra inviolável | conferido na leitura |

## Execução
- `web`, `npx vitest run src/features/apontamento --maxWorkers=2`: 11 arquivos, 168 de 168 passaram.
- E2E `e2e/tests/apontamento-qa.spec.ts`, chromium, `--workers=2`: 49 de 49 passaram (inclui axe CT-65 em 1280 e 375 px, tema escuro, teclado/alvos de toque).
- Mutação 1 (tirar `<NotaExecucaoTecnica r={r} />` do cartão): `Tests 3 failed | 165 passed (168)` (nota, piso, singular). Morta.
- Mutação 2 (atalho do subgrupo volta a "Ver apontamentos não classificados"): `Tests 2 failed | 166 passed (168)` (CA-11 e atalho do subgrupo). Morta.
- Mutação 3 (singular removido na contagem): `Tests 1 failed | 167 passed (168)`. Morta.
- Todas restauradas com `git checkout --` antes do parecer; `git status` limpo de código.
- Vermelho antes do verde: os testes novos são de interface e as mutações acima provam que caem sem o código; `forge-testes` não se aplica ao projeto.
- A suíte inteira roda no CI do PR (check-run `bateria` do mesmo sha, a citar pelo tech-lead no PR).

## Observações
- A revisão de UX (`7a9b5055`, aprovado com ressalvas) apontou M-1, M-2, M-3 e B-1 a B-3; o commit `dafb325a` aplicou a desambiguação visível, o atalho em `textos.ts`, o singular e a frase da nota. Os itens B-4 (anúncio de filtro aplicado) e B-5 (tokens de cor) ficam como melhoria de consistência, sem defeito provado.
- Q2 do plano (fundir os dois achados ou manter) segue decisão do dono, fora deste parecer.

## Achados
- A1 (recomendado) e2e/fixtures/apontamento-respostas.json:1 · a fixture do E2E não tem o subgrupo `execucao-tecnica`, então a nota nunca renderiza no axe (CT-65); a acessibilidade da nota só é lida por papel nos testes de componente. Incluir a linha e rodar o axe.
