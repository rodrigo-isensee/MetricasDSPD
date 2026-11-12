---
tipo: qa
contrato: 1
pedido: 097-resumo-filtro-time
branch: feature/097-l1-busca
commit: d5083317568496c30d23815f8f36996bbe315061
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-11
---

# QA: busca digitando nos filtros de lista (097 L1, E3.3, K-273), revalidação 3

Links: especificação `docs/ux/097-filtros-time-busca.md` (CA-10 a CA-16), pedido `docs/pedidos/097-resumo-filtro-time.md`, review `docs/reviews/097-l1-busca.md` (aprovado em 277ff083), base develop f4c122f1. Revalida o parecer aprovado em b5d206ef; diff `8e1edc5a..d5083317` em `BarraFiltros.tsx`, `FiltroMulti.tsx`, `filtros-componentes.test.tsx` e `docs/tecnica/arquitetura-front.md` (mais o parecer do review).

## Veredito
**Aprovado.** Os CA-10 a CA-16 seguem cobertos e passam no head. O Esc na folha mobile agora decide pela lista focada (`escLimpaBuscaFocada`): texto num filtro e foco em outro, ou foco em "Ver resultados", fecha a folha; texto na lista focada só limpa o texto. Cada campo de busca tem nome acessível próprio ("Buscar em {rótulo}"). O Popover do desktop não regrediu. Sem bugs abertos; um achado recomendado de teste (A1). Ressalva: a cobertura completa do web não pôde ser concluída sob carga da máquina (seção Execução); a suíte inteira é a do check-run `bateria` do mesmo sha no PR.

## Execução
- `cd web && npx vitest run src/features/filtros --maxWorkers=2` em d5083317: 11 arquivos, 116 testes passaram, 0 pulados.
- Cobertura dos arquivos do pedido (`--coverage --coverage.include='src/features/filtros/**'`, só os testes de filtros): Statements 100% (544/544), Functions 100% (140/140), Lines 100% (463/463), Branches 99,79% (480/481). O único ramo descoberto é `parametroLocal.ts:28`, arquivo que este diff não toca e que os testes de outras pastas cobrem na suíte inteira; `FiltroMulti.tsx` e `BarraFiltros.tsx` estão em 100% nas quatro métricas.
- Cobertura completa do web (`pnpm --filter @metricas-dspd/web exec vitest run --coverage --maxWorkers=2`), 2 tentativas completas com a máquina sob carga (load average 10 a 17; a rodada de b5d206ef levou 443 s, estas 1573 s e 1606 s): a 1ª teve 2 testes e 3 arquivos por timeout de hook de 60 s e de teste de 90 s (`simulado.test.tsx`, `filtros-url.test.tsx`, `useFiltros.test.tsx`, `painel.test.tsx`); a 2ª, 1 teste (`coletas.sistemico.test.tsx`, 90 s). Os arquivos que falharam mudam a cada rodada e passam sozinhos (`simulado`, `filtros/`, `painel.test.tsx`: 13 arquivos, 137 testes; `coletas.sistemico`: 7 testes), o que aponta carga e não defeito. Sem a rodada verde, a cobertura global de 100% não está provada neste head: o código de produção do delta está nos dois arquivos acima, em 100%, e a prova final é o check-run `bateria` do sha no PR. `visoes.test.tsx` e `preferencias.test.tsx` (os do autor) passaram nestas rodadas.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| CA-10 campo com rótulo e foco ao abrir | "CA-10: abre com o campo Buscar focado, mesmo com lista curta"; "A4: na folha, cada campo de busca tem nome acessível próprio" | lista curta; dois campos na mesma folha (nome distinto) | passou |
| CA-11 sem maiúsculas e acentos, contagem anunciada | "CA-11: ignora maiúsculas e acentos e anuncia a contagem" | acento, caixa, singular/plural | passou |
| CA-12 lista vazia | "CA-12: sem resultado mostra a mensagem e anuncia" | zero resultados | passou |
| CA-13 seleção fora da busca mantida e contada | "CA-13: a seleção fora da busca continua aplicada e é contada" | seleção oculta | passou |
| CA-14 teclado, Esc | 2 testes "CA-14" (Popover); "CA-16: Esc com o foco numa opção limpa a busca e mantém o popover aberto" | uma opção, várias, nenhuma; Esc com e sem texto; Esc com o foco numa caixa | passou |
| CA-15 fechar zera o texto | "CA-15: fechar zera o texto" | fechar o Popover | passou |
| CA-16 folha mobile, mesmas regras | "CA-16: a variante lista...", "CA-16/CA-14: na folha, Esc com texto só limpa o texto...", "CA-16: na folha, Esc com o foco numa opção limpa a busca", "S1", "S2" | Esc com texto na lista focada; texto em outro filtro (S1); foco em "Ver resultados" (S2); foco numa opção | passou |
| Sem regressão do Popover (desktop) | os testes de Popover acima, no mesmo arquivo | Esc com texto limpa e mantém aberto; sem texto fecha e devolve o foco | passou |

## Mutação no código alterado
- Mutante 1: `FiltroMulti.tsx`, `escLimpaBuscaFocada` com `return true` (Esc sempre segura a folha). Morto por 3 testes: "CA-16/CA-14: na folha, Esc com texto só limpa...", S1, S2 (3 falharam, 30 passaram).
- Mutante 2: o mesmo retorno trocado por `return false` (Esc nunca limpa em vez de fechar). Morto por "CA-16/CA-14: na folha, Esc com texto só limpa..." (1 falhou, 32 passaram).
- Restaurados por `git checkout`; árvore limpa (`git status --short` vazio) antes do commit.
- Vermelho antes do verde: S1 e S2 são as provas do A1 do review; o mutante 1 (que reproduz a decisão errada: segurar o Esc sem olhar o foco) as derruba.

## Bug
Nenhum aberto.

## Achados
- A1 (recomendado) web/src/features/filtros/filtros-componentes.test.tsx:502 · `queryByLabelText('Buscar')` exato não acha mais nada desde o nome "Buscar em {rótulo}"; a ausência passa vazia. Trocar por `/^Buscar/`. É o A5 do review; o `toHaveFocus` seguinte ainda guarda o fechamento.
