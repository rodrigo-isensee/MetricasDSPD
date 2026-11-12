---
tipo: qa
contrato: 1
pedido: 097-resumo-filtro-time
branch: fix/k293-resumo-equipe-a11y
commit: 3b6bc40d3f84eef680244d29fb085675db0c116d
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-12
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

## Achados
