# IS-003 - Filtro de seleção múltipla ainda perde uma marcação em cliques rápidos (sob carga)
- Severidade: média (a seleção do usuário some sem aviso; o chip mostra o que ficou, contorno é marcar de novo)
- Responsável sugerido: react-frontend (`web/src/features/filtros/FiltroMulti.tsx`)
- Ambiente: main 0af552a (cópia limpa), build de produção (`vite preview`), Chromium do Playwright 1.64, estação com load 1 min 6,7 a 13,7
- Relação: continuação do bug 004 e do PR #47 ("FiltroMulti acumula cliques em sequência"). Pode coincidir com achado da QA de filtros que trabalha em paralelo.

## Passos para reproduzir
1. `cd e2e && pnpm exec playwright test --project=chromium tests/filtros.spec.ts -g FIL-04` com a máquina ocupada (ou repetir com `--repeat-each=20`).
2. O teste abre `/operacional`, abre "Equipe" e clica nas 6 equipes em sequência, depois Esc.

## Resultado esperado
As 6 equipes marcadas = "Todas" (o parâmetro `equipe` sai da URL).

## Resultado obtido
Na 1a rodada completa da suíte (de 3), ficaram 5 de 6: `Senior` (3o clique) se perdeu. O contexto do erro mostra `button "Equipe: 5 selecionadas"`, chips de ERP Protheus, Fluig, Marketing e Vendas, Dados e Plataforma 5G e a URL `/operacional?equipe=erp-protheus,fluig,marketing-e-vendas,dados,plataforma-5g`.

Causa provável (leitura do código, não corrigido pelo QA): o `useEffect` que ressincroniza `atual.current` a partir da prop (`chaveProp`) roda quando chega uma prop ATRASADA (a URL de um clique anterior) e sobrescreve a seleção local mais nova. Sequência: clique A (`atual=[A]`), clique B (`atual=[A,B]`), chega a prop `[A]` e o efeito faz `atual=[A]`, clique C (`atual=[A,C]`): B some. Sem carga a prop chega antes do próximo clique e o defeito não aparece.

## Evidência
- Saída da execução: `Error: expect(received).toBe(expected) ... Expected: false Received: true` em `tests/filtros.spec.ts:47`.
- `error-context.md` e `trace.zip` em `e2e-out-1/filtros-FIL-04-marcar-todos-os-valores-remove-o-parâmetro-chromium/` (pasta temporária da execução, não versionada).
