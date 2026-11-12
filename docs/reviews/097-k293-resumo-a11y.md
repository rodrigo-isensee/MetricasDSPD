---
tipo: review
contrato: 1
pedido: 097-resumo-filtro-time
branch: fix/k293-resumo-equipe-a11y
commit: 3b6bc40d3f84eef680244d29fb085675db0c116d
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-12
---
# Review: K-293, ajustes do Resumo depois do L5 (097, E3.2)

Diff lido: `origin/develop...3b6bc40d` (3 arquivos, +49 −14: `FiltroEquipeBloco.tsx`, `equipe.test.tsx`, `e2e/tests/resumo-equipe.spec.ts`). O `ae398e72` acima do head é só o parecer do QA (código em `web/` e `e2e/` idêntico ao `3b6bc40d`). Obrigação: A2 a A4 de `docs/ux/097-revisao-l5.md`; o A1 é pergunta ao dono, fora deste cartão.

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
