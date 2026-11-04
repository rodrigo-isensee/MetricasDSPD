---
tipo: qa
contrato: 1
pedido: 067-dia-atipico-10h
branch: feature/067-dia-atipico
commit: 4181b56a1c8be5f07f03383a0b0ac29818ebb270
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-04
---
# QA: 067, dia atípico acima de 10 h (E1.3, K-218)

Links: decisão do dono no pedido (2026-11-04, "Atipico acima de 10 horas"), contrato `docs/api/apontamento.md`, plano `docs/architecture/features/059-aba-apontamento.md`, review `docs/reviews/067-dia-atipico.md`.

**Parecer: aprovado**, sem bug aberto. Testado na ponta 4181b56; a HEAD da worktree (41d4ba7) só soma o parecer de review (um arquivo de docs), sem mudança de código. Diff `origin/develop...4181b56` (13 arquivos) conferido: só o limite (16 h para 10 h), a versão de critério `067:limite-dia-atipico`, a doc, a fixture e os testes; nenhum escopo novo. Os outros cinco limites provisórios seguem como estão (decisão do dono).

## Execução (resultado real, no máximo 2 workers)
- packages/metricas `TZ=UTC vitest run --coverage --maxWorkers=2`: 42 arquivos, 1258 testes passaram; cobertura 100% (instruções, ramos, funções, linhas).
- server `vitest run --coverage --maxWorkers=2`: 80 arquivos passaram, 33 pulados (os `.pg`, do dono); 1615 testes passaram, 232 pulados; cobertura 100%.
- web `TZ=UTC vitest run --maxWorkers=2`: 93 arquivos, 1420 testes passaram.
- `pnpm run docs:check`: ok (919 páginas, 69 métricas, 2 eventos).
- Não rodei: `test:pg` e `criterios-apontamento 2026-11-04` (do dono, depois do deploy; o teste com banco foi ajustado pelo autor e não executou); E2E (a tela só lê o valor da API, sem mudança de interface).

## Fronteira e leitura pela tela
- Fronteira: o teste `pedido 067` em `apontamento.test.ts` afirma `LIMITE_ATIPICO_SEGUNDOS_PADRAO === 36000`, 10 h e 1 min atípico e 10 h exatas não (comparação estrita); o teste anterior da soma do dia (18 h sim, 10 h não, linha sem pessoa fora) segue verde.
- Única fonte: `servico.ts` lê a constante da biblioteca; a busca por `16 * 3600`, `16 * H` e `57600` em `packages/*/src`, `server/src` e `web/src` só acha fixtures de schema do contrato (`packages/contratos/src/apontamento.test.ts`), que não calculam nada.
- Tela: `CartaoDiario.tsx:99,274,281` deriva legenda e dica de `diario.limiteAtipicoSegundos / 3600` (valor da API, sem constante no web); a fixture do web passou a 10 h e o teste do web verde.
- Vermelho antes do verde: a base não tem `LIMITE_ATIPICO_SEGUNDOS_PADRAO`, então o teste novo não passa sem a implementação. Mutante manual (constante 10 trocada por 16 em `achados.ts`, só o módulo do apontamento): 1 falhou (o teste do 067) e 64 passaram; mutante morto, arquivo restaurado, árvore limpa.

## Achados
- A1 (recomendado) packages/contratos/src/apontamento.ts:304 · o comentário ainda diz "16 h por pessoa e dia (P-4 do UX)"; o valor agora é 10 h. Só texto, sem efeito no cálculo.

## Critério → teste → resultado
| Critério (decisão do dono) | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Dia da pessoa acima de 10 h é atípico | `apontamento.test.ts` (pedido 067; soma do dia estrita) | 10 h exatas não, 10 h e 1 min sim | passou |
| Marca, nunca descarta; outra-area e sem pessoa fora | `apontamento.test.ts` (outra-area, filtros, qualidade) | 3 x 6 h de outra-area não é atípico | passou |
| Server usa o limite único da biblioteca | `criterios-apontamento.test.ts` e testes do serviço | limite = constante da biblioteca | passou |
| Versão de critério 067 com data | `criterios-apontamento.test.ts` | referência `067:limite-dia-atipico`, vigência só ao rodar o comando | passou |
| Achado `dias-atipicos` e mapa diário com limite 10 | `apontamento.test.ts` (achados, diário) | `limite: 10`, `limiteAtipicoSegundos` 36000 | passou |
| Tela mostra o limite vindo da API | `web/.../apontamento.test.tsx` e `CartaoDiario.tsx` | sem constante local | passou |
