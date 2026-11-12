---
tipo: qa
contrato: 1
pedido: 097-resumo-filtro-time
branch: feature/097-l6-tipos-reais-web
commit: f335d47a0630c0d8488778c958ce10ecca45f112
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-12
---

# QA: L6 do 097, tipos e prioridades reais no web (E3.3)

Base develop 233db432. Diff `origin/develop...1ee4b7cc`: `web/src/features/filtros/{codec.ts,BarraFiltros.tsx}`, `web/src/features/complementares/taticas.tsx` e os testes `codec.test.ts`, `k039.test.ts`, `taticas.test.tsx`. Obrigação: E4 do 097 (todas as opções de filtro vêm do dado real; Tipo deixa `TIPOS_FILTRO`), plano `docs/analises/097-filtros-plano.md`, linha L6.

## Veredito

Aprovado. `TIPOS_FILTRO` não é mais fonte em `web/src` fora do mock (`nucleoMock.ts:222`, que só gera as opções, como o brief prevê).

## Critério, teste, resultado

| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Lista de Tipo vem de `opcoes.tipos` (BarraFiltros, T11) | `codec.test.ts` (leitura por opções), `taticas.test.tsx` T11 (abas esperam as opções) | vazio (sem opções: só "Todos os tipos") | passa |
| Tipo fora das opções na URL é ignorado com aviso | `codec.test.ts` "tipo do contrato que não está nas opções ... ignorado e anotado" (`invalidos = ['tipo "incidente"']`) | logo fora do limite | passa |
| Opção com id que o contrato não conhece não vira tipo | `codec.test.ts` "opções de tipo com id que o contrato não conhece" | id desconhecido | passa |
| Sem opções carregadas: ids do contrato valem, desconhecido é anotado | `codec.test.ts` "sem opções carregadas..." | estado sem opções | passa |
| Prioridades só as presentes; marcar todas colapsa só com todas as presentes | `codec.test.ts` colapsarTodos (P1,P2 de 3 não colapsa; P1..P3 colapsa; sem opções não colapsa) | parcial, completo, sem opções | passa |
| Opções vazias não colapsam (`validos.length > 0`) | `codec.test.ts` `vazias`, `k039.test.ts` | lista vazia | passa |

## Execução

- `VITEST_MAX_WORKERS=2 npx vitest run src/features/filtros src/features/complementares/taticas.test.tsx` no head: 12 arquivos, 165 testes, todos passam.
- Vermelho antes do verde (web, na cópia da árvore: `codec.ts`, `BarraFiltros.tsx`, `taticas.tsx` trazidos da base 233db432, testes do head): 4 falham, 161 passam. Caem: `codec.test.ts` "tipo do contrato que não está nas opções...", "marcar todos equivale a Todos", "colapsarTodos sem opções ... sustentação colapsa prioridade"; `k039.test.ts` "todos os tipos também colapsam". Árvore restaurada ao head (`git diff 1ee4b7cc` vazio).
- Mutação no codec (restaurado depois): (M1) `idsTipo` ignora as opções e devolve todos os ids do contrato: caem 2 testes (tipo fora das opções; marcar todos). (M2) `todos()` sem a guarda `validos.length > 0`: cai 1 teste (colapsarTodos com opções vazias). Nenhum sobrevivente.
- Playwright (`filtros.spec.ts`, `intensivo-filtros.spec.ts`, `intensivo-filtros-bordas.spec.ts`, chromium): não concluiu. O comando estourou o prazo de 420 s sem saída (o `webServer` faz build do web antes), morto por `timeout`. Sem veredito do E2E aqui; o diff não toca `e2e/` e a suíte inteira roda no check-run `bateria` do CI do PR (citar o do mesmo sha).
- Revalidação na volta 1 (head f335d47a, anterior e0a7de27): o delta é só Prettier em `BarraFiltros.tsx`, `codec.ts` e `codec.test.ts` (18 inserções, 13 remoções, quebras de linha sem mudança de lógica). `VITEST_MAX_WORKERS=2 npx vitest run src/features/filtros`: 11 arquivos, 132 testes, todos passam. Vermelho e mutação anteriores seguem válidos (lógica idêntica); A1 está em arquivo não tocado pelo delta.

## Achados

- A1 (recomendado) web/src/features/complementares/taticas.test.tsx:226 · o teste T11 só espera a aba "Melhoria" do mock e passa também na base; nenhum teste prova que as abas vêm de `opcoes.tipos` (opções com tipo faltando).
