---
tipo: review
contrato: 1
pedido: 097-resumo-filtro-time
branch: fix/k293-resumo-equipe-a11y
commit: b475e3f836aac8e593844f4f1de341e567d6fc8b
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-14
---
# Review: K-293, ajustes do Resumo depois do L5 (097, E3.2)

Diff lido: `origin/develop...3b6bc40d` (3 arquivos, +49 −14: `FiltroEquipeBloco.tsx`, `equipe.test.tsx`, `e2e/tests/resumo-equipe.spec.ts`). O `ae398e72` acima do head é só o parecer do QA (código em `web/` e `e2e/` idêntico ao `3b6bc40d`). Obrigação: A2 a A4 de `docs/ux/097-revisao-l5.md`; o A1 é pergunta ao dono, fora deste cartão.

## Revalidação (junção com a develop, E4.56)
- Delta lido: `forge-check parecer delta docs/reviews/097-k293-resumo-a11y.md` (intervalo `3b6bc40d..b475e3f8`, sem o que veio da base): no domínio só `equipe.test.tsx`, uma linha, o import de `MockFonteMetricas` passa de `@/data` para `@/data/mock/MockFonteMetricas`. Essa linha veio da develop (`ea826a9c`, 099 L2d, PR 351), não da branch.
- `git show --remerge-diff b475e3f8`: vazio, junção sem conflito e sem resolução manual.
- K-293 igual ao aprovado: as linhas `+/-` de `git diff 41394b18 3b6bc40d` e de `git diff 62823ca0 b475e3f8` nos três arquivos (`FiltroEquipeBloco.tsx`, `equipe.test.tsx`, `resumo-equipe.spec.ts`) são idênticas.
- Nada da develop perdido: `git diff --stat 62823ca0 b475e3f8` toca só os três arquivos do K-293 e os dois pareceres; Resumo, filtro Equipe, recolher do L8a e L8b e K-295 ficam como na develop `62823ca0`.
- Testes: `TZ=UTC npx vitest run --maxWorkers=2 src/features/operacional/resumo src/features/filtros`: 15 arquivos, 220 testes, todos passam. `npx playwright test tests/resumo-equipe.spec.ts --project=chromium --workers=1`: 5 passam, 1 pulado (o CA-6, skip registrado no K-298).
- CI do PR 393 no head `b475e3f8` (`gh pr checks 393`): banco, build, filtro, imagem, openapi, rapida, seguranca e testes do run 43549177556 verdes; `testes` e `e2e-parte` do run 43549182114 pendentes na leitura. O merge espera esses checks.
- Os achados A1 e A2 seguem como estavam (recomendados; as linhas citadas não mudaram).

## Achados
- A1 (recomendado) web/src/features/operacional/resumo/FiltroEquipeBloco.tsx:42 · o `role="status"` nasce junto com o conteúdo e é outro nó em cada estado (carregando, vazio); região viva montada já preenchida costuma não ser lida. Se o anúncio importar, um contêiner `status` estável que troca só o texto. Lido, não medido.
- A2 (recomendado) e2e/tests/resumo-equipe.spec.ts:95 · o `test.skip` vem antes de `expect(problemas).toEqual([])` (linha 96), e a fixture `problemas` não afirma no teardown: pulado, o teste perde a checagem de erro de console da parte `zzz-inexistente`. Mover a linha 96 para antes do skip.

## Parecer
Aprovado. O diff faz o que A2 a A4 pedem, nem mais nem menos.

- **A2:** `aviso-consolidado-${bloco}`; os testes Vitest e e2e passam a usar o id do bloco. O `aviso-consolidado` que sobra no repositório é da `BarraFiltros` (outro componente), fora deste escopo.
- **A3:** uma região `role="status"` no carregando e no vazio; os testes afirmam exatamente uma por bloco, e o QA registrou a mutação (sem `role` no vazio) caindo. O erro segue com `role="alert"`, sem anúncio duplo. Ver A1 acima sobre a eficácia do anúncio.
- **A4:** `aria-label` "Limpar filtros de Equipe do bloco Fluxo|Sustentação" começa pelo texto visível (WCAG 2.5.3, rótulo no nome); o teste confere os dois nomes e que o texto visível continua "Limpar filtros".
- **e2e CA-6:** a espera troca `numero-p85` visível por "carregando sumiu e há valor ou motivo", que tira a leitura do estado intermediário. O skip visível em vez de verde em branco é a decisão registrada no K-298; o CA-6 segue provado no Vitest.
- **Regras invioláveis:** nada de comparação entre equipes nem número por equipe; o aviso consolidado é o mesmo texto.
- **Verificação:** `TZ=UTC VITEST_MAX_WORKERS=2 npx vitest run src/features/operacional/resumo/equipe.test.tsx`: 12 testes verdes. `eslint` nos três arquivos: limpo. `prettier --check` limpo nos dois de `web/`; o `resumo-equipe.spec.ts` acusa estilo, mas a versão da `develop` acusa o mesmo (o e2e não está sob o prettier), não é deste diff.
- **Commit:** `fix(web)` único, mensagem clara. Tamanho: 63 linhas de código e teste, um comportamento.
- `docs/engineering/praticas.md` não tem linhas "decidida por"; o checklist da skill foi aplicado por leitura.
