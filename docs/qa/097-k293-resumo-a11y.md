---
tipo: qa
contrato: 1
pedido: 097-resumo-filtro-time
branch: fix/k293-resumo-equipe-a11y
commit: b475e3f836aac8e593844f4f1de341e567d6fc8b
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-14
---

# QA: K-293, ajustes do Resumo depois do L5 (097, E3.3)

Base develop 41394b18. Diff `origin/develop...3b6bc40d`: `FiltroEquipeBloco.tsx`, `equipe.test.tsx`, `e2e/tests/resumo-equipe.spec.ts`. Obrigação: achados A2 a A4 de `docs/ux/097-revisao-l5.md` (A1 é pergunta ao dono, fora deste cartão).

## Veredito
**Aprovado.** Os três ajustes cumprem A2, A3 e A4; Vitest e e2e verdes; a mutação na região viva cai num teste. Nenhum bug.

## Critério → teste → resultado
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| A2 um data-testid por bloco (`aviso-consolidado-fluxo`/`-sustentacao`) | `equipe.test.tsx` (aviso com 2 equipes, só no bloco dela) e e2e CA-4/CA-5 | aviso ausente no outro bloco | passou |
| A3 carregando e vazio numa só região viva | `equipe.test.tsx` carregando (1 `role=status` contendo o botão) e vazio (1 `role=status` com a frase) | exatamente 1 região, sem anúncio duplo | passou |
| A4 "Limpar" com o nome do bloco no nome acessível, texto visível mantido | `equipe.test.tsx` (nomes "...do bloco Fluxo" e "...Sustentação"; `toHaveTextContent('Limpar filtros')`) | dois botões com nomes distintos | passou |
| CA-6 menos de 20 itens | Vitest (inalterado) | n<20 sem número | passou; e2e PULADO de forma visível (semente sem equipe pequena, cartão K-298), nunca verde em branco |
| Acessibilidade (axe, dois blocos) | e2e "sem violação grave de acessibilidade" | zero críticas/sérias | passou |

## Execução
- Vitest `web/src/features/operacional/resumo`: 4 arquivos, 87 testes, todos passaram.
- e2e `resumo`, chromium: 5 passaram, 1 pulado (CA-6, declarado), 0 falhas.
- Mutação (restaurada, árvore limpa depois): tirei `role="status"` do ramo vazio de `FiltroEquipeBloco.tsx`; `equipe.test.tsx` caiu em "vazio: botão desabilitado 'sem opções' e a frase que explica" (1 falhou, 11 passaram).
- Vermelho antes do verde: ajustes de a11y e rótulo sobre testes alterados; a mutação acima prova que o teste novo detecta a ausência da região viva.
- A suíte inteira roda no CI do PR; não executada localmente.

## Revalidação (E4.57, junção com a develop 62823ca0, head c9d05584)
Delta (`forge-check parecer delta`): no domínio do QA só `equipe.test.tsx`, import de `MockFonteMetricas` trocado de `@/data` para `@/data/mock/MockFonteMetricas`; o código do K-293 não mudou. Nenhum `CA-n` novo nem escopo alterado.
- Vitest `resumo` e `filtros`, `--maxWorkers=2`: 15 arquivos, 220 testes, todos passaram.
- e2e `resumo-equipe.spec.ts`, chromium, `--workers=1`: 5 passaram, 1 pulado (CA-6, K-298, declarado), 0 falhas.
- axe no Resumo com 2 equipes marcadas em cada bloco, com o diálogo aberto e fechado, tema claro e escuro (spec provisório, removido; árvore limpa): 2 passaram, zero violações críticas ou sérias.
- Mutação (restaurada pelo `git show HEAD:`): aviso consolidado `>= 2` para `>= 3` em `FiltroEquipeBloco.tsx`; `equipe.test.tsx` caiu em "CA-4 e CA-5 ... aviso consolidado" (1 falhou, 11 passaram).
- Suíte inteira: check-run `bateria` do CI do PR 393, não rerrodada aqui.

## Achados
