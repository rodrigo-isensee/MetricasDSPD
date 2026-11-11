---
tipo: qa
contrato: 1
pedido: 097-resumo-filtro-time
branch: feature/097-l1-busca
commit: b5d206efc8fe4ab6bd38b19147d26c95bcceaf28
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-11
---

# QA: busca digitando nos filtros de lista (097 L1, E3.3), revalidação 2

Links: especificação `docs/ux/097-filtros-time-busca.md` (CA-10 a CA-16), pedido `docs/pedidos/097-resumo-filtro-time.md`, base develop f4c122f1. Revalida o parecer reprovado em 86a6c85e; diff `86a6c85e..b5d206ef` só em `web/src/features/filtros/filtros-componentes.test.tsx` (+23 linhas, 2 testes; nenhum código de produção mudou).

## Veredito
**Aprovado.** O A1 está resolvido: os dois testes novos exercitam o `setBusca('')` do Esc com o foco numa opção (Popover e folha mobile) e a cobertura do web voltou a 100% nas quatro métricas. Sem bugs abertos.

## Execução
- `cd web && npx vitest run src/features/filtros --maxWorkers=2`: 113 testes passaram (111 + 2 novos), 0 pulados.
- `pnpm --filter @metricas-dspd/web exec vitest run --coverage --maxWorkers=2` (suíte inteira do web): 98 arquivos, 1512 testes passaram, 443 s, rc 0. Cobertura: Statements 100% (5620/5620), Branches 100% (5220/5220), Functions 100% (2056/2056), Lines 100% (4809/4809). Antes, 99,98% (5619/5620 e 5219/5220).
- A suíte inteira no CI do PR segue sendo a prova final (check-run `bateria` do mesmo sha, a citar no PR).

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| CA-10 campo com rótulo e foco ao abrir | "CA-10: abre com o campo Buscar focado, mesmo com lista curta" | lista curta | passou |
| CA-11 sem maiúsculas e acentos, contagem anunciada | "CA-11: ignora maiúsculas e acentos e anuncia a contagem" | acento, caixa, singular/plural | passou |
| CA-12 lista vazia | "CA-12: sem resultado mostra a mensagem e anuncia" | zero resultados | passou |
| CA-13 seleção fora da busca mantida e contada | "CA-13: a seleção fora da busca continua aplicada e é contada" | seleção oculta | passou |
| CA-14 teclado, Esc | 2 testes "CA-14" (popover) | uma opção, várias, nenhuma, Esc com e sem texto | passou |
| CA-15 fechar zera o texto, fora da URL | "CA-15: fechar zera o texto" | fechar o popover | passou |
| CA-16 folha mobile, mesmas regras | "CA-16: a variante lista...", "CA-16/CA-14: na folha, Esc com texto só limpa o texto...", "CA-16: Esc com o foco numa opção limpa a busca e mantém o popover aberto", "CA-16: na folha, Esc com o foco numa opção limpa a busca" | variante `lista`, Esc com e sem texto, Esc com o foco numa caixa, foco devolvido | passou |

## A1 resolvido
- Teste do Popover: digita "beta", ArrowDown leva o foco à opção Beta, Esc zera o campo Buscar e o popover segue aberto.
- Teste da folha: digita "gestao", ArrowDown leva o foco a Gestão, Esc zera o campo e a lista completa volta.

## Mutação no código alterado
- Mutante: `FiltroMulti.tsx:101`, `setBusca('')` trocado por `void 0` (Esc na caixa deixa de limpar). Resultado: o teste "CA-16: na folha, Esc com o foco numa opção limpa a busca" falhou (1 falhou, 112 passaram). Mutante morto; restaurado por `git checkout`, árvore limpa.
- Observação: o teste do Popover não morre nesse mutante, porque o `onEscapeKeyDown` do Popover já limpa o texto; ele guarda o comportamento do Popover (texto zerado, popover aberto) e a linha 101 fica provada pelo teste da folha. Sem redundância que bloqueie.
- Mutantes dos pareceres anteriores (acentos em `normalizarBusca`, `preventDefault` do Dialog) seguem mortos: código de produção inalterado.
- Vermelho antes do verde: o furo era a cobertura 99,98% do parecer anterior; o teste da folha cai sem a linha 101 (mutação acima).

## Bug
Nenhum aberto.

## Achados
